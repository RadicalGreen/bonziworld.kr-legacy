import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { sanitizeUnicode } from "./utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(path.join(__dirname, "bonziworld.db"));

export function normalizeCookieKey(cookie) {
	if (typeof cookie !== "string") return "";
	return cookie.replace(/\0/g, "�");
}

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS unlocked_hats (cookie TEXT, hat TEXT, PRIMARY KEY (cookie, hat))`);
	db.run(`CREATE TABLE IF NOT EXISTS active_asn_bans (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	asn TEXT NOT NULL UNIQUE,
	reason TEXT NOT NULL
)`);
	db.run(`CREATE TABLE IF NOT EXISTS admin_logins (cookie TEXT PRIMARY KEY, godword TEXT)`);
	db.run(`CREATE TABLE IF NOT EXISTS blocked_images (image TEXT PRIMARY KEY, reason TEXT)`);
	db.run(`CREATE TABLE IF NOT EXISTS user_joins (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, name TEXT, guid TEXT, cookie TEXT, headers TEXT)`);
	db.run(`CREATE TABLE IF NOT EXISTS message_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, name TEXT, type TEXT, ip TEXT, data TEXT)`);
	db.run(`CREATE INDEX IF NOT EXISTS idx_message_logs_ip ON message_logs(ip)`);
	db.run(`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, time DATETIME DEFAULT CURRENT_TIMESTAMP)`);
	db.run(`CREATE TABLE IF NOT EXISTS ip_blocks (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_range TEXT UNIQUE, type TEXT, reason TEXT)`);
	db.run(`CREATE VIEW IF NOT EXISTS ip_block_view AS SELECT ip_range, type, reason FROM ip_blocks`);
	db.run(`CREATE TABLE IF NOT EXISTS active_bans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		ip TEXT NOT NULL UNIQUE,
		type TEXT NOT NULL,
		reason TEXT NOT NULL,
		expires_at INTEGER
	)`);
});

function urlFilename(url) {
	try {
		return decodeURIComponent(new URL(url).pathname).replace(/^.+\//, "/");
	} catch {
		return "-1";
	}
}

export async function getUnlockedHats(cookie) {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT hat FROM unlocked_hats WHERE cookie = ?`,
			[sanitizeUnicode(cookie)],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows.map(row => row.hat));
			}
		);
	});
}

let tmdbSchemaReady = false;
let tmdbSchemaPromise = null;

function withTimeout(promise, ms, fallback) {
	return Promise.race([
		promise,
		new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
	]);
}

async function ensureTmdbSchema() {
	if (tmdbSchemaReady) return true;
	if (tmdbSchemaPromise) return tmdbSchemaPromise;
	tmdbSchemaPromise = withTimeout(client.query(`
		CREATE TABLE IF NOT EXISTS tmdb_events (
			id bigserial PRIMARY KEY,
			time timestamp NOT NULL DEFAULT now(),
			room text NOT NULL,
			guid text NOT NULL,
			name text NOT NULL DEFAULT '',
			type text NOT NULL,
			payload jsonb NOT NULL DEFAULT '{}'::jsonb
		);
		CREATE INDEX IF NOT EXISTS tmdb_events_time_idx ON tmdb_events (time);
		CREATE INDEX IF NOT EXISTS tmdb_events_room_time_idx ON tmdb_events (room, time);
		CREATE INDEX IF NOT EXISTS tmdb_events_guid_time_idx ON tmdb_events (guid, time);
	`).then(() => true).catch((e) => {
		console.error("[db] tmdb schema:", e?.message);
		return false;
	}), 1500, false).then((ok) => {
		tmdbSchemaReady = ok;
		return ok;
	}).finally(() => {
		tmdbSchemaPromise = null;
	});
	return tmdbSchemaPromise;
}
// fuck you stop logging me ut  you fucking pidor 
export async function logTmdbEvent(room, guid, name, type, payload) {
	if (!(await ensureTmdbSchema())) return;
	await client.query(`
		INSERT INTO tmdb_events (room, guid, name, type, payload)
		VALUES ($1, $2, $3, $4, $5::jsonb)
	`, [
		sanitizeUnicode(room || "default"),
		sanitizeUnicode(guid || ""),
		sanitizeUnicode(name || ""),
		sanitizeUnicode(type || ""),
		JSON.stringify(payload ?? {}),
	]).catch((e) => {
		console.error("[db] logTmdbEvent:", e?.message);
	});
}

export async function hasHat(cookie, hat) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT 1 FROM unlocked_hats WHERE cookie = ? AND hat = ?`,
			[sanitizeUnicode(cookie), hat],
			(err, row) => {
				if (err) return reject(err);
				resolve(!!row);
			}
		);
	});
}

export async function unlockHat(cookie, hat) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO unlocked_hats (cookie, hat) VALUES (?, ?) 
			 ON CONFLICT(cookie, hat) DO NOTHING`,
			[sanitizeUnicode(cookie), hat],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function setGodword(cookie, godword) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO admin_logins (cookie, godword) VALUES (?, ?) 
			 ON CONFLICT(cookie) DO UPDATE SET godword = excluded.godword`,
			[sanitizeUnicode(cookie), godword],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function deleteGodword(cookie) {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM admin_logins WHERE cookie = ?`,
			[sanitizeUnicode(cookie)],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function getImageBlockReason(url) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT reason FROM blocked_images WHERE image = ?`,
			[sanitizeUnicode(urlFilename(url))],
			(err, row) => {
				if (err) return reject(err);
				resolve(row?.reason ?? null);
			}
		);
	});
}

export async function blockImage(url, reason) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO blocked_images (image, reason) VALUES (?, ?) 
			 ON CONFLICT(image) DO UPDATE SET reason = excluded.reason`,
			[sanitizeUnicode(urlFilename(url)), sanitizeUnicode(reason)],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function unblockImage(url) {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM blocked_images WHERE image = ?`,
			[sanitizeUnicode(urlFilename(url))],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function getMessageIdsFromIp(ip) {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT m.id FROM message_logs m
			 JOIN user_joins u ON m.user_id = u.id
			 WHERE u.ip = ?
			 ORDER BY m.id DESC
			 LIMIT 50`,
			[ip],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows.map(row => row.id));
			}
		);
	});
}

export async function blockInfo(ip) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT type, reason FROM ip_block_view 
			 WHERE ? LIKE ip_range || '%' 
			 ORDER BY type DESC LIMIT 1`,
			[ip],
			(err, row) => {
				if (err) return reject(err);
				resolve(row || null);
			}
		);
	});
}

export async function saveAsnBan(asn, reason) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO active_asn_bans (asn, reason)
			 VALUES (?, ?)
			 ON CONFLICT(asn) DO UPDATE SET reason = excluded.reason`,
			[asn, sanitizeUnicode(reason)],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function removeAsnBan(asn) {
	return new Promise((resolve, reject) => {
		db.run(`DELETE FROM active_asn_bans WHERE asn = ?`, [asn], (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

export async function getActiveAsnBans() {
	return new Promise((resolve, reject) => {
		db.all(`SELECT asn, reason FROM active_asn_bans`, [], (err, rows) => {
			if (err) return reject(err);
			resolve(rows || []);
		});
	});
}

export async function getAsnFromIp(ip) {
	if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
		return "This IP is local, This might be a bug.";
	}

	try {
		const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
		if (res.ok) {
			const data = await res.json();
			if (data && data.success && data.connection && data.connection.asn) {
				let asnStr = String(data.connection.asn).trim().toUpperCase();
				return asnStr.startsWith("AS") ? asnStr : "AS" + asnStr;
			}
		}
	} catch (err) {}

	try {
		const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/asn/`);
		if (res.ok) {
			const asn = await res.text();
			if (asn && asn.trim() && !asn.includes("<html")) {
				let cleanAsn = asn.trim().toUpperCase();
				return cleanAsn.startsWith("AS") ? cleanAsn : "AS" + cleanAsn;
			}
		}
	} catch (err) {}

	return null;
}

export async function saveBan(ip, reason, expiresAt = null) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO active_bans (ip, type, reason, expires_at)
			 VALUES (?, ?, ?, ?)
			 ON CONFLICT(ip) DO UPDATE SET
			 type = excluded.type,
			 reason = excluded.reason,
			 expires_at = excluded.expires_at`,
			[ip, expiresAt ? "temp" : "perm", sanitizeUnicode(reason), expiresAt ?? null],
			(err) => {
				if (err) return reject(err);
				resolve();
			}
		);
	});
}

export async function removeBan(ip) {
	return new Promise((resolve, reject) => {
		db.run(`DELETE FROM active_bans WHERE ip = ?`, [ip], (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

export async function loadActiveBans() {
	return new Promise((resolve, reject) => {
		db.run(`DELETE FROM active_bans WHERE expires_at IS NOT NULL AND expires_at <= ?`, [Date.now()], (err) => {
			if (err) return reject(err);
			db.all(`SELECT ip, type, reason, expires_at FROM active_bans`, [], (err2, rows) => {
				if (err2) return reject(err2);
				resolve(rows || []);
			});
		});
	});
}

export async function getActiveBans() {
	return new Promise((resolve, reject) => {
		db.all(`SELECT ip, type, reason, expires_at FROM active_bans`, [], (err, rows) => {
			if (err) return reject(err);
			resolve(rows || []);
		});
	});
}

export async function logJoin(ip, name, guid, cookie, headers) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO user_joins (ip, name, guid, cookie, headers) VALUES (?, ?, ?, ?, ?)`,
			[ip, sanitizeUnicode(name), guid, sanitizeUnicode(cookie), sanitizeUnicode(headers)],
			function(err) {
				if (err) return reject(err);
				resolve(this.lastID.toString());
			}
		);
	});
}

export async function logMessage(databaseId, name, type, data) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO message_logs (user_id, name, type, data) VALUES (?, ?, ?, ?)`,
			[databaseId, sanitizeUnicode(name), type, sanitizeUnicode(data)],
			function(err) {
				if (err) return reject(err);
				resolve(this.lastID.toString());
			}
		);
	});
}

export async function getGodword(cookie) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT godword FROM admin_logins WHERE cookie = ?`,
			[cookie],
			(err, row) => {
				if (err) return reject(err);
				resolve(row?.godword ?? null);
			}
		);
	});
}

export async function getIpFromMessageId(msgId) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT ip FROM message_logs WHERE id = ?`,
			[msgId],
			(err, row) => {
				if (err) return reject(err);
				resolve(row?.ip ?? null);
			}
		);
	});
}
