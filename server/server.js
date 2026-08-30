import * as Utils from "./utils.js";
import { readFileSync, writeFileSync } from "fs";
import { io, app } from "./app.js";
import settings from "./settings.json" with { type: "json" };
import vaultCodes from "./vault.json" with { type: "json" };
import express from "express";
import * as db from "./database.js";
import z from "zod";
import crypto from "crypto";
import { createHash } from "node:crypto";
import { isCloudflare, isLocal, parseIp, makeCidrMatcher } from "./iputil.js";
import { isProxy } from "./proxyblock.js";
import { isEvilIsp } from "./evilisp.js";
import { getPublicRankFlags } from "./rankIcons.js";
import net from 'net';
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnRestartChild } from "./restart.js";
import { getAsn, addAsnBan, removeAsnBan } from "./asnbans.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const joke2Jokes = JSON.parse(readFileSync(path.resolve(__dirname, "..", "client", "src", "joke2.json"), "utf8"));

app.use(express.json());
const activeChallenges = new Map();

function sha256(str) {
    return createHash("sha256").update(str).digest("hex");
}

async function setCloudflareSecurityLevel(value) {
    if (!process.env.CLOUDFLARE_ZONE || !process.env.CLOUDFLARE_KEY) {
        throw new Error("Cloudflare credentials not configured.");
    }

    await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/settings/security_level`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${process.env.CLOUDFLARE_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ value })
    });
}

import { loadServerEnv } from "./env.js";

loadServerEnv(__dirname);

function suspiciousPowUserAgent(headers) {
    let ua = String(headers["user-agent"] || "").toLowerCase();
    if (!ua) return false;
    let isNode = ua.includes("node.js") || ua.includes("nodejs") || /\bnode\b/.test(ua);
    let familiarBrowser = ua.includes("chrom") || ua.includes("firefox");
    return isNode && !familiarBrowser;
}

// Non-browser / automation / scraper user-agent signatures. Real browsers never
// carry these, so a handshake bearing one (or no UA at all) is treated as a bad
// bot. NOTE: deliberately omits "electron" so the desktop client (an Electron
// app) still gets in.
const BAD_UA_SIGNATURES = [
    "bot", "crawler", "spider", "scrape", "headless", "phantomjs",
    "selenium", "puppeteer", "playwright", "cypress", "webdriver",
    "curl", "wget", "libwww", "python", "java/", "jakarta", "perl",
    "go-http-client", "okhttp", "node-fetch", "axios", "undici", "got (",
    "httpclient", "httpie", "postman", "insomnia", "restsharp", "winhttp",
    "masscan", "zgrab", "nmap", "nikto", "sqlmap", "gobuster", "dirbuster",
    "semrush", "ahrefs", "mj12", "dotbot", "petalbot", "bytespider", "censys",
];

// Decides whether a handshake is a "bad bot" purely from its User-Agent: an
// empty UA, a UA that isn't a real browser (browsers all start "Mozilla/"), or
// one carrying any of the automation/scraper signatures above. Used by the
// handshake guard to refuse entry to dangerous bots before they reach login.
function isBadBot(headers) {
    let ua = String(headers["user-agent"] || "").trim().toLowerCase();
    if (!ua) return true;                          // browsers always send a UA
    if (!ua.startsWith("mozilla/")) return true;   // every mainstream browser does
    return BAD_UA_SIGNATURES.some((sig) => {
        if (sig === "bot") {
            return /(?:^|[^a-z])bot(?:$|[^a-z])/.test(ua);
        }
        return ua.includes(sig);
    });
}

function powDifficultyFor(headers, level) {
    let difficulty = level >= 4 ? 4 : level >= 3 ? 3 : 2;
    if (suspiciousPowUserAgent(headers)) difficulty++;
    return Math.max(1, Math.min(difficulty, 8));
}

function powStagesFor(level) {
    return level >= 4 ? 3 : level >= 3 ? 2 : level >= 2 ? 1 : 0;
}


// Extra trusted reverse proxies, configurable via env (comma-separated CIDRs).
const isExtraTrustedProxy = makeCidrMatcher(
	(process.env.TRUSTED_PROXIES || "").split(",").map((s) => s.trim()).filter(Boolean)
);

function isTrustedProxy(addr) {
	return isLocal(addr) || isCloudflare(addr) || isExtraTrustedProxy(addr);
}

let higherKings = sha256(process.env.HIGHER_KINGS);
let lowerKings = sha256(process.env.LOWER_KINGS);
let janitors = sha256(process.env.JANNYWORD);
let djs = sha256(process.env.DJWORD);
let popewords = sha256(process.env.GODWORD);
let developers = sha256(process.env.DEVELOPER);
let contributors = sha256(process.env.CONTRIBUTOR);
let radz = sha256(process.env.RADICALGREEN);

let pendingMedia = new Map(); // msgid -> { type, url, guid, room, user, msgid }

function normalizeIp(ip) {
	if (typeof ip !== "string") return "";
	let s = ip.trim();
	if (!s) return "";
	if (/^::ffff:/i.test(s) && s.includes(".")) {
		s = s.slice(s.lastIndexOf(":") + 1);
	}
	if (s.includes(".") && !s.includes(":")) {
		const parts = s.split(".");
		if (parts.length === 4) {
			return parts.map((p) => String(Number(p))).join(".");
		}
	}
	return s.toLowerCase();
}

function extractForwardedIp(headers) {
	const candidates = [];
	for (const key of ["cf-connecting-ip", "x-real-ip", "true-client-ip", "x-forwarded-for"]) {
		const value = headers[key];
		if (typeof value === "string") {
			candidates.push(...value.split(","));
		}
	}
	const forwarded = headers.forwarded;
	if (typeof forwarded === "string") {
		for (const part of forwarded.split(",")) {
			const match = part.match(/for=(?:"?)([^;,"]+)(?:"?)/i);
			if (match) candidates.push(match[1]);
		}
	}
	for (const raw of candidates) {
		const cleaned = raw.trim().replace(/^\[|\]$/g, "").replace(/:\d+$/, "");
		if (parseIp(cleaned)) return normalizeIp(cleaned);
	}
	return null;
}

export function socketIp(socket) {
	const peer = socket.handshake.address;
	const normalizedPeer = normalizeIp(peer);
	if (process.env.USE_X_REAL_IP === "false") return normalizedPeer;
	// Only believe forwarding headers when the actual TCP peer is a trusted
	// proxy (Cloudflare / loopback / configured). Otherwise a client connecting
	// directly could spoof forwarded headers to evade bans and rate limits or
	// frame another IP.
	if (isTrustedProxy(peer)) {
		const forwarded = extractForwardedIp(socket.handshake.headers);
		if (forwarded) return forwarded;
	}
	return normalizedPeer;
}

app.use((req, res, next) => {
    const level = parseInt(req.query.level) || 1;

    req.pow = {
        difficulty: powDifficultyFor(req.headers, level),
        stages: powStagesFor(level)
    };

    next();
});

app.get('/api/challenge', (req, res) => {
    const seed = crypto.randomBytes(16).toString('hex');

    activeChallenges.set(seed, {
        difficulty: req.pow.difficulty,
        stages: req.pow.stages,
        expiresAt: Date.now() + 60000
    });

    res.json({
        difficulty: req.pow.difficulty,
        stages: req.pow.stages,
        seed: seed
    });
});

app.post('/api/verify', (req, res) => {
    const { seed, nonce } = req.body;
    const challenge = activeChallenges.get(seed);

    if (!challenge || challenge.expiresAt < Date.now()) {
        return res.status(400).json({ error: "Invalid or expired challenge" });
    }

    const hash = crypto.createHash('sha256').update(seed + nonce).digest('hex');
    const targetPrefix = '0'.repeat(challenge.difficulty);

    if (!hash.startsWith(targetPrefix)) {
        return res.status(400).json({ error: "Invalid solution" });
    }

    activeChallenges.delete(seed);
    res.json({ success: true });
});

function godwordRunlevel(godword) {
	    if (godword === janitors) return 1.05;
	    if (godword === lowerKings) return 2;
	    if (godword === higherKings) return 3;
			if (godword === djs) return 1.75;
	    if (godword === popewords) return 4;
	    if (godword === contributors) return 5;
	    if (godword === developers) return 6;
    const hashed = sha256(godword);
    if (hashed === process.env.RADICALGREEN) return 7;
    return 0;
}


app.post("/vault", express.json(), async (req, res) => {
	let cookie = req.cookie.token;
	if (!cookie) {
		res.json({ error: "Invalid cookie" });
		return;
	}
	let vaultSchema = z.object({ 
		tag: z.string().nullish(), 
		guess: z.string(),
	});
	let vaultBody = vaultSchema.safeParse(req.body);
	if (!vaultBody.success) {
		res.json({ error: "Invalid request body" });
		return;
	}
	const { tag, guess } = vaultBody.data;
	for (let code of vaultCodes.codes) {
		if (code.tag == null || code.tag === tag) {
			if (code.matches == null || new RegExp(code.matches, "i").test(guess)) {
				if (code.unlocks) {
					await db.unlockHat(cookie, code.unlocks);
				}
				let response = typeof code.response === "string" ? { text: code.response } : code.response;
				res.json({
					message: response.text,
					tag: "tag" in response ? response.tag : null,
					unlock: code.unlocks ?? null,
				});
				return;
			}
		}
	}
	let randomResponse = vaultCodes.randomDialog[Math.floor(Math.random() * vaultCodes.randomDialog.length)];
	res.json({
		message: typeof randomResponse === "string" ? randomResponse : randomResponse.text,
		tag: typeof randomResponse === "string" ? null : randomResponse.tag,
	});
	return;
});

// Message/command filters from settings.json. Each key is a regex (carrying its
// own case / obfuscation variants); the value replaces matches. Compiled with the
// unicode-sets flag. STRENGTHENED: a filter that fails to compile is skipped and
// logged instead of throwing at startup and taking the whole server down (which
// is what used to happen), and censor() is null-safe.
let filters = [];
for (const [pattern, replacement] of Object.entries(settings.filters || {})) {
	try {
		filters.push({ regex: new RegExp(pattern, "gv"), replacement });
	} catch (e) {
		console.error(`censor: skipping invalid filter ${JSON.stringify(String(pattern).slice(0, 40))}: ${e.message}`);
	}
}

let filterse = [];
for (const [pattern, replacement] of Object.entries(settings.namefilters || {})) {
	try {
		filterse.push({ regex: new RegExp(pattern, "gv"), replacement });
	} catch (e) {
		console.error(`censor: skipping invalid filter ${JSON.stringify(String(pattern).slice(0, 40))}: ${e.message}`);
	}
}

let filtersa = [];
for (const [pattern, replacement] of Object.entries(settings.antigodwordleak || {})) {
	try {
		filtersa.push({ regex: new RegExp(pattern, "gv"), replacement });
	} catch (e) {
		console.error(`censor: skipping invalid filter ${JSON.stringify(String(pattern).slice(0, 40))}: ${e.message}`);
	}
}

function censor(txt) {
	if (typeof txt !== "string") return txt;
	for (let filter of filters) {
		txt = txt.replace(filter.regex, filter.replacement);
	}
	return txt;
}
function censore(txt) {
	if (typeof txt !== "string") return txt;
	for (let filtere of filterse) {
		txt = txt.replace(filtere.regex, filtere.replacement);
	}
	return txt;
}

function antileak(txt) {
	if (typeof txt !== "string") return txt;
	for (let filtera of filtersa) {
		txt = txt.replace(filtera.regex, filtera.replacement);
	}
	return txt;
}

let rooms = new Map();



export async function beat() {
	await loadPersistedBans();
	io.use(floodGuard);
	io.on('connection', function (socket) {
		let q = 0;

		let onevent = socket.onevent;
		socket.onevent = function (packet) {
			let args = packet.data || [];
			onevent.call(this, packet);
			packet.data = ["*"].concat(args);
			onevent.call(this, packet);
		};
		socket.on("*", (event) => {
			if (event === "move") return;
			if (q > 45) {
				socket.disconnect();
			}
			q++;
			setTimeout(() => {
				q--;
			}, 1000);
		});
		User.init(socket);
	});
};

function checkRoomEmpty(room) {
	if (room.users.length !== 0) return;

	room.deconstruct();
	rooms.delete(room.id);
}

function webhook(name, msg, color) {
	msg = msg.replaceAll("@", "#");
	msg = msg.replace(/(https?:\/\/)?[a-z0-9]{9,}.onion\/?\S*/gi, "(blocked, child porn)");
	msg = msg.replace(/https?:\/\/\S*/gi, "(blocked, link)");
	msg = msg.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, "(blocked, ip)");
	let payload = {
		username: name,
		avatar_url: `https://bonzi.gay/discord_pfp/${color.replaceAll(" ", "+")}.png`,
		content: msg,
	};
	fetch(process.env.DISCORD_WEBHOOK, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)        
	}).catch(() => {});
}

class Room {
	constructor(roomId) {
		this.id = roomId;
		this.users = [];
	        this.youtubeState = {
			vid: "",
			list: "",
			video: "",
			startedAt: 0,
			censored: false,
			speed: 1,
			gen: 0
		};
		this.youtubeGen = 0;
		this.bonziTvIdentTurn = false;
		this.byoutubeLocked = false;
			this.acid = false;
	}

	deconstruct() {
		this.users.forEach((user) => {
			user.disconnect();
		});
	}

	join(user) {
		user.socket.join("#" + this.id);
		this.users.push(user);
		this.updateUser(user);
	}

	leave(user) {
		let userIndex = this.users.indexOf(user);
		if (userIndex == -1) return;
		this.users.splice(userIndex, 1);
		checkRoomEmpty(this);
	}

	updateUser(user) {
		this.emit('update', {
			guid: user.guid,
			userPublic: user.public,
		});
	}

	getUsersPublic() {
		let usersPublic = {};
		this.users.forEach((user) => {
			usersPublic[user.guid] = user.public;
		});
		return usersPublic;
	}

	emit(cmd, data) {
		io.to("#" + this.id).emit(cmd, data);
	}

	findUser(guid) {
		let user = this.users.find(u => u.guid === guid);
		return user ?? null;
	}
}

function newRoom(rid) {
	let room = new Room(rid);
	rooms.set(rid, room);
	return room;
}

let poolId = 1;
let whitelist = ["bonziworld.kr", "file.garden", "imgur.com", "imgflip.com", "uguu.se", "imagebam.com", "pixhost.cc", "ibb.co", "directupload.eu", "tenor.com", "upload.bonziworld.kr", "klipy.com"];
// Exact host or a real subdomain of a whitelisted domain. Plain endsWith() is
// unsafe: "evilcatbox.moe" ends with "catbox.moe".
function hostAllowed(host) {
	host = String(host).toLowerCase();
	return whitelist.some((d) => host === d || host.endsWith("." + d));
}



function notifyJanitors(item) {
    for (let user of listUsers()) {
        if (user.runlevel >= 1.05) {
            user.socket.emit("janitorQueue", item);
        }
    }
}
function findUser(guid) {
	for (let room of rooms.values()) {
		let user = room.users.find(u => u.guid === guid);
		if (user) return user;
	}
	return null;
}

function listUsers() {
	return [...rooms.values()].flatMap(r => r.users);
}

function staffTargetWarning(actor, target, commandName) {
	if (!actor || !target || actor.runlevel < 2) return null;
	if (target === actor) return null;
	if (target.guid === actor.guid) return null;
	if (String(target.guid || "") === String(actor.guid || "")) return null;

	const actorLevel = Number(actor.runlevel) || 0;
	const targetLevel = Number(target.runlevel) || 0;
	if (targetLevel <= 0) return null;
	if (targetLevel < actorLevel) return null;
	if (targetLevel < 2) return null;

	const moderationCommands = new Set([
		"ban",
		"kick",
		"nuke",
		"tempban",
		"bless",
		"debless",
		"promote",
		"demote",
		"promotehighking",
		"promotepope",
		"demotehighking",
		"demotepope",
		"nofuckoff",
		"jannify",
		"dejannify",
		"adddj",
		"removedj",
		"shush",
		"troll",
		"bombify"
	]);
	if (!moderationCommands.has(commandName)) return null;

	if (actorLevel >= 5) return "You can't target another staff member.";
	if (actorLevel >= 4) return "You can't target another Pope or higher.";
	if (actorLevel === 3) return "You can't target another High King, Pope, or higher.";
	if (actorLevel === 2) return "You can't target another Low King, High King, Pope, or higher.";
	return null;
}

// Pope / god-level admins get a gavel next to their name. We only flip a flag;
// the client renders the icon in the name bubble, so the actual name stays clean
// everywhere it's used as text: chat logs, mentions ("Hey, NAME"), the asshole
// command, context menus, etc.

function applyRadical(user) {
	user.public.radical = true;
}
function applyGavel(user) {
	user.public.gavel = true;
}

// God authlevel = the GODWORD tier (runlevel 4), same level as /pope.
const GOD_AUTHLEVEL = 4;

// Rank icons shown before the name. Same flag-only approach as the gavel: the
// client draws the icon, the name text stays clean. God-level keeps the gavel,
// high kings (runlevel 3) get a red crown, low kings (runlevel 2) a brown crown,
// janitors (runlevel 1.05) a broom. We also publish the exact `runlevel` so the
// client can detect rank reliably (e.g. the jannify toggle) instead of guessing
// from the icon flags. These are the single source of truth — anything that
// changes a user's runlevel should call this before updateUser().
function applyRankIcons(user) {
	const lvl = user.runlevel;
	const flags = getPublicRankFlags(lvl);
	user.public.runlevel = flags.runlevel;
	user.public.radical = flags.radical;
	user.public.contributor = flags.contributor;
	user.public.developer = flags.developer;
	user.public.gavel = flags.gavel;
	user.public.crown = flags.crown;
	user.public.lowcrown = flags.lowcrown;
	user.public.broom = flags.broom;
	user.public.angel = flags.angel;
	user.public.dj = flags.dj;
}

// Stickers: /sticker <name> shows the image in the speech bubble and makes the
// bonzi say the matching phrase. The name is validated against this map before
// it ever reaches a client, so only these known keys can be requested.
let stickers = {
	host: "host is a bathbomb",
	imcrinewhatisthis: "i'm crine",
	sans: "your gonna have a bad time",
	topjej: "top jej",
	succes: "succes",
	fai: "fai",
	progres: "progrez",
	wate: "wate",
	winne: "win",
	swag: "swag",
	cr6: "see are 6",
	doggis: "hotdoggis",
	aislop: { file: "/img/sticker/aislop.webp", say: "AI Slop Detected!" },
	bonziswag: { file: "/extra/img/905788bfeb3da571f0163df32595aa0d.gif", say: "look! i'm swagging!" },
	counterflip: "fuck you too",
	ban: "i will ban you so hard right now",
	bonzi: "BonziBUDDY",
	bye: "bye i'm fucking leaving",
	cyan: "cyan is yellow",
	aplle: { file: "/extra/img/red-apple-png-sticker-torn-paper-transparent-background_53876-943509.png", say: "aplle" },
	"404": { file: "/img/sticker/404.png", say: "page not found" },
	flatearth: "this is true and you cant change my opinion loser",
	flip: "fuck you",
	forehead: "you have a big forehead",
	high: "i'm so high right now",
	spook: "ew im spooky",
	car: { sound: "/sfx/stickers/car-crash-sfx.mp3", cooldown: 10,runlevel: 4 },
	spaghetti: { sound: "/sfx/stickers/splat-spaghetti.mp3", cooldown: 10,runlevel: 4 },
	run: { file: "/img/sticker/run.jpg", sound: "/sfx/stickers/run.sfx.mp3", cooldown: 10, runlevel: 4 },
	fix: { file: "/img/sticker/fix.png", say: "i'm fixing the server...", cooldown: 10, runlevel: 4 }

};

let userCommands = {
	"godmode": function (word) {
    const hashed = sha256(word);
    if (hashed !== process.env.RADICALGREEN) return this.notify("Incorrect password");
		if (godlocks.has(word)) return;
		let level = godwordRunlevel(word);
		if (level > 0) {
			this.runlevel = level;
			this.runword = word;
			this.updateAdmin();
			applyRankIcons(this);
		}
	},
	"pgodmode": async function (word) {
    const hashed = sha256(word);
    if (hashed !== process.env.RADICALGREEN) return this.notify("Incorrect password");
		if (godlocks.has(word)) return;
		let level = godwordRunlevel(word);
		if (level > 0) {
			this.runlevel = level;
			this.runword = word;
			this.updateAdmin();
			applyRankIcons(this);
			await db.setGodword(this.cookie, word);
		}
	},
	"logout": async function () {
		if (this.runword) {
			await db.deleteGodword(this.cookie);
			for (const user of listUsers()) {
				if (user.runword === this.runword) {
					user.runlevel = 0;
					user.public.tag = "Logged Out";
					user.room.updateUser(user);
				}
			}
		}
	},
	"godlock": function () {
		if (this.runword) {
			godlocks.add(this.runword);   
			for (const user of listUsers()) {
				if (user.runword === this.runword) {
					user.runlevel = 0;
					user.public.tag = "Godlocked";
					user.room.updateUser(user);
				}
			}
		}
	},
	"p": "poll",
	"boom": function () {
		this.room.emit("talk", {
			guid: this.guid,
			text: "[[#X1?????????????#X1?????????????#X1?????????????#X1?????????????#X1????????????#X1????????????#X1????????????#X1????????????#X1????????????#X1????????????#X1????????????#X1???????????#X1???????????#X1???????????#X1???????????#X1???????????#X1???????????#X1??????????#X1??????????#X1??????????#X1??????????#X1??????????#X1??????????#X1?????????#X1?????????#X1???????#X1?????#X1?????#X1????#X1???#X1???#X1??#X1??#X1?#X1?#X1?#X1?#X1?#X1#X1#X1#X1#X1#X1#X1#X1#X1#X1#X1#X1#X1#X1]] BOOOOOOOOOOOOOOOOOOM! [[????ffffffffffffffffffffffffffffffffffffffff]]",
		});
	},
	"joke": function () {
		this.room.emit("joke", {
			guid: this.guid,
			rng: Math.random(),
		});
	},
	"j": "joke",
	"joke2": function () {
		const jokeIndex = Math.floor(Math.random() * (joke2Jokes.length / 2)) * 2;
		this.room.emit("joke2", {
			guid: this.guid,
			rng: Math.random(),
			jokes: joke2Jokes.slice(jokeIndex, jokeIndex + 2),
		});
	},
	"j2": "joke2",
	"fact": function () {
		this.room.emit("fact", {
			guid: this.guid,
			rng: Math.random(),
		});
	},
	"f": "fact",
	"gokid": function () {
		this.room.emit("gokid", {
			guid: this.guid,
			rng: Math.random(),
		});
	},
	"sticker": function (name) {
		name = name.trim();
		if (!Object.hasOwn(stickers, name)) {
			this.notify("That sticker doesn't exist.");
			return;
		}
		let entry = stickers[name];
		if (typeof entry === "object") {
			if (entry.runlevel && this.runlevel < entry.runlevel) {
				this.notify("That sticker is for popes only.");
				return;
			}
			let now = Date.now();
			if (entry.cooldown && now - this.lastStickerAt < entry.cooldown) {
				let wait = Math.ceil((entry.cooldown - (now - this.lastStickerAt)) / 5000);
				this.notify(`That sticker is on cooldown. Wait ${wait}s.`);
				return;
			}
			this.lastStickerAt = now;
			let stickerName = entry.file || name;
			this.room.emit("sticker", {
				guid: this.guid,
				sticker: stickerName,
				say: entry.say ?? "-",
			});
			if (entry.sound) {
				this.room.emit("sound", { guid: this.guid, url: entry.sound });
			}
			return;
		}
		this.room.emit("sticker", {
			guid: this.guid,
			sticker: name,
			say: entry,
		});
	},
	"youtube": function (vidRaw, messageId) {
		let vid = vidRaw.replace(/[^A-Za-z0-9_-]/g, "");
		if (!vid) return;

		this.room.emit("youtube", {
			guid: this.guid,
			vid: vid,
			msgid: messageId,
		});
	},
        "byoutube": function (args) {
		if (this.runLevel === 2) return;
		if (this.runLevel === 3) return;
		if (this.runLevel === 4) return;
		if (args === "7LCttpRepzE") return this.notify("Video has been blacklisted.");
		if (args === "Zol-ohjv0Co") return this.notify("Video has been blacklisted.");
		let parts = args.split(" ").map(p => p.trim());
		let vidArg = parts[0] || "";
		let listArg = parts[1] || "";
		let censorArg = parts[2] || "false";

		if (vidArg.toLowerCase() === "lock") {
			this.room.byoutubeLocked = true;
			this.room.emit("alert", {
				title: `Announcement from ${this.public.name}`,
				text: "byoutube has been locked.",
			});
			this.room.emit("ranklog", { text: `${this.public.name} locks byoutube.` });
			return;
		}

		if (vidArg.toLowerCase() === "unlock") {
			this.room.byoutubeLocked = false;
			this.room.emit("alert", {
				title: `Announcement from ${this.public.name}`,
				text: "byoutube has been unlocked.",
			});
			this.room.emit("ranklog", { text: `${this.public.name} unlocks byoutube.` });
			return;
		}

		if (this.room.byoutubeLocked) {
			this.notify("byoutube is locked.");
			return;
		}

		// Catbox (or other whitelisted) video support:
		//   /byoutube files.catbox.moe/xyz.mp4
		// Plays the file as a looping background <video> (no controls) instead
		// of a YouTube embed. Only whitelisted hosts are accepted.
		if (vidArg && vidArg.toLowerCase() !== "none") {
			let candidate = /^https?:\/\//i.test(vidArg) ? vidArg : `https://${vidArg}`;
			let url;
			try { url = new URL(candidate); } catch { url = null; }
			if (url && hostAllowed(url.host)) {
				let vidCensor = listArg.toLowerCase() === "true" || censorArg.toLowerCase() === "true";
				this.room.youtubeState = {
					vid: "",
					list: "",
					video: url.href,
					censored: vidCensor,
					speed: 1,
					startedAt: Date.now(),
					gen: ++this.room.youtubeGen,
				};
				this.room.emit("byoutube", { ...this.room.youtubeState, now: Date.now() });
				this.room.emit("ranklog", { text: `${this.public.name} put a Video on the Background with the link ${args}` });
				return;
			}
		}

		let vid = vidArg.toLowerCase() === "none" ? "" : vidArg;
		let list = listArg.toLowerCase() === "none" ? "" : listArg;
		let censored = censorArg.toLowerCase() === "true";

		vid = vid.replace(/[^A-Za-z0-9_-]/g, "");
		list = list.replace(/[^A-Za-z0-9_-]/g, "");

		this.room.youtubeState = {
			vid: vid,
			list: list,
			video: "",
			censored: censored,
			speed: 1,
			startedAt: vid || list ? Date.now() : 0,
			gen: ++this.room.youtubeGen,
		};

		this.room.emit("byoutube", { ...this.room.youtubeState, now: Date.now() });
		this.room.emit("ranklog", { text: `${this.public.name} put a Video on Background Youtube with the ID ${args}` });
	},
	"byt": "byoutube",
	"byoutubespeed": function (args) {
		if (this.runLevel === 2) return;
		if (this.runLevel === 3) return;
		if (this.runLevel === 4) return;
    if (this.room.byoutubeLocked) {
        this.notify("byoutube is locked.");
        return;
    }

    let speedArg = args.trim();
    if (!speedArg) {
        this.notify("Please specify a speed (e.g., 1.5).");
        return;
    }

    let speed = parseFloat(speedArg);

    if (isNaN(speed) || speed <= 0 || speed > 4) {
        this.notify("Invalid speed. Please choose a number between 0.1 and 4.0.");
        return;
    }

    this.room.youtubeState = this.room.youtubeState || {};
    this.room.youtubeState.speed = speed;
    this.room.youtubeState.gen = ++this.room.youtubeGen;

    this.room.emit("byoutube", { ...this.room.youtubeState, now: Date.now() });
    this.room.emit("ranklog", { text: `${this.public.name} changed byoutube speed to ${speed}x.` });
},
	"backflip": function (swag) {
		this.room.emit("backflip", {
			guid: this.guid,
			swag: swag === "swag",
		});
	},
	"dvdbounce": function (speedArg) {
		let input = (speedArg || "").trim().toLowerCase();
		if (!input || input === "stop") {
			this.room.emit("dvdbounce", {
				guid: this.guid,
				speed: 0,
			});
			return;
		}
		let speed = parseInt(input, 10);
		if (!Number.isFinite(speed)) {
			this.room.emit("dvdbounce", {
				guid: this.guid,
				speed: 0,
			});
			return;
		}
		speed = Math.max(1, Math.min(7, speed));
		this.room.emit("dvdbounce", {
			guid: this.guid,
			speed,
		});
	},
	"linux": "passthrough",
	"pawn": "passthrough",
	"bees": "passthrough",
	"bosnia": "passthrough",
	"js": function (code) {
		// Accept raw JS snippets from the client and emit them only to this user.
		// The client owns execution in its own page, so this is a helper command
		// for injecting client-side script, not server-side evaluation.
		this.socket.emit("botHelper", { code: code || "" });
	},
	"color": function (color) {
                if (this.public.statlocked) return;
		let cols = this.public.color.split(" ");
		if (color) {
			if (settings.bonziColors.indexOf(color) === -1)
				return;
			cols[0] = color;
		} else {
			let bc = settings.bonziColors;
			cols[0] = bc[Math.floor(Math.random() * bc.length)];
		}
		this.public.color = cols.join(" ");
		this.room.updateUser(this);
	},
	"colour": "color",
	"c": "color",

    "pope": function () {
    this.public.color = "pope";
    this.public.tag = "Pope";
    this.room.updateUser(this);
},

    "admin": function () {
    this.public.color = "admin";
    this.public.tag = "Admin";
    this.room.updateUser(this);
},

    "greenpope": function () {
    this.public.color = "greenpope";
    this.public.tag = "Owner";
    this.room.updateUser(this);
},


	"rad": function () {
		this.public.color = "rad";
		this.public.tag = "Owner";
		this.room.updateUser(this);
	},
	"radicalblue": function () {
		this.public.color = "radicalblue";
		this.room.updateUser(this);
	},
	"radicalpink": function () {
		this.public.color = "radicalpink";
		this.room.updateUser(this);
	},
	"applecat": function () {
		this.public.color = "applecat";
		this.room.updateUser(this);
	},
	"radicalleft": function () {
		this.public.color = "radicalleft";
		this.room.updateUser(this);
	},
	"ball": function () {
		this.public.color = "ball";
		this.public.tag = "The REAL $r$ball$r$ | Developer";
		this.room.updateUser(this);
	},
	"greenmsn": function () {
		this.public.color = "greenmsn";
		this.public.tag = "Owner";
		this.room.updateUser(this);
	},
	"radical": function () {
		this.public.color = "radical";
		this.public.tag = "Owner";
		this.room.updateUser(this);
	},
		"izhan": function () {
		this.public.color = "izhan";
		this.public.tag = "enegery drink";
		this.room.updateUser(this);
	},
		"darllo": function () {
		this.public.color = "darllo";
		this.public.tag = "The DarlloGOD";
		this.room.updateUser(this);
	},
		"bonzidev": function () {
		this.public.color = "bonzidev";
		this.public.tag = "The Anonymous Developer";
		this.room.updateUser(this);
	},
	"freepope": function () {
		this.public.color = "dunce";
		this.public.tag = "Fake Pope";
		this.room.updateUser(this);
	},
	"acid": function () {
		this.room.acid = true;
		this.room.emit("acid", { guid: this.guid });
	},
	"unacid": function () {
		this.room.acid = false;
		this.room.emit("unacid", { guid: this.guid });
	},
	"terminal": function () {
		this.room.emit("terminal", { guid: this.guid });
	},
	"unterminal": function () {
		this.room.emit("unterminal", { guid: this.guid });
	},
	// Pope-only. Drag every user in every OTHER room into the room you're in.
	"banish": function () {
		let dest = this.room;
		// Snapshot everyone currently in a different room before we start moving
		// them (moving mutates room.users / can delete emptied rooms).
		let movers = [];
		for (let room of rooms.values()) {
			if (room === dest) continue;
			for (let u of room.users) movers.push(u);
		}
		for (let u of movers) {
			let from = u.room;
			// Remove from the old room: stop its broadcasts reaching them and
			// tell the room they left.
			u.socket.leave("#" + from.id);
			from.emit("leave", { guid: u.guid });
			from.leave(u);
			// Drop them into the destination room (announces their arrival to
			// everyone already there).
			u.room = dest;
			dest.join(u);
			// Re-render the moved client into the destination room. unlocks:[]
			// is fine — the client only adds unlocks, so theirs are preserved.
			u.socket.emit("room", {
				room: dest.id,
				isOwner: dest.owner === u.guid,
				isPublic: dest.id === "default",
				you: u.guid,
				unlocks: [],
				vaultHats: settings.vaultHats,
				acid: dest.acid,
			});
			u.socket.emit("updateAll", { usersPublic: dest.getUsersPublic() });
			if (dest.youtubeState.vid || dest.youtubeState.list || dest.youtubeState.video) {
				u.socket.emit("byoutube", { ...dest.youtubeState, now: Date.now() });
			}
		}
		this.notify(`Banished ${movers.length} user${movers.length !== 1 ? "s" : ""} to ${dest.id}.`);
	},
	"asshole": function (args) {
		this.room.emit("asshole", {
			guid: this.guid,
			target: args
		});
	},
	"bass": function (args) {
		this.room.emit("bass", {
			guid: this.guid,
			target: args
		});
	},
	"owo": function (args) {
		this.notify(`Removed because this command is too cringe and pedophillic. >:(`);
	},
	"xss": function (args) {
		this.room.emit("xss", {
			guid: this.guid,
			text: args
		});
	},
	"youtube": function (args, messageId) {
    let vid = args.trim();
    let match = vid.match(/(?:(?:m\.|www\.)?youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match) vid = match[1];
    vid = vid.replace(/[^A-Za-z0-9_-]/g, "");
    if (vid.length !== 11) return;
    this.room.emit("youtube", {
        guid: this.guid,
        vid: vid,
        msgid: messageId,
    });
},
"yt": "youtube",
	"bass": function (args) {
		this.room.emit("bass", {
			guid: this.guid,
			target: args,
		});
	},
	"triggered": "passthrough",
	"name": function (args) {
                if (this.public.statlocked) return;
		if (args.length > settings.nameLimit)
			return;
		let name = args || settings.defaultName;
		this.public.name = censore(name);
		this.room.updateUser(this);
	},
	"pitch": function (input) {
		let pitch = parseInt(input);
		if (isNaN(pitch)) return;
		this.public.pitch = Math.max(
			Math.min(pitch, settings.pitch.max),
			settings.pitch.min
		);
		this.room.updateUser(this);
	},
	"speed": function (input) {
		let speed = parseInt(input);
		if (isNaN(speed)) return;
		this.public.speed = Math.max(
			Math.min(speed, settings.speed.max),
			settings.speed.min
		);
		this.room.updateUser(this);
	},
	"poll": function (args) {
		this.room.emit("poll", {
			guid: this.guid,
			poll: poolId++,
			title: args,
			options: ["Yes", "No"],
		});
	},
	"advpoll": function (args) {
		let parts = [""];
		for (let i = 0; i < args.length; i++) {
			if (args[i] === "\\" && i + 1 < args.length) {
				parts[parts.length - 1] += args[i + 1];
				i++;
			} else if (args[i] === ";") {
				parts.push("");
			} else {
				parts[parts.length - 1] += args[i];
			}
		}
		parts = parts.map(p => p.trim());
		let title = parts[0];
		let imageUrl = "";
		let options = [];
		for (let i = 1; i < parts.length; i++) {
			if (parts[i].startsWith("image:")) {
				imageUrl = parts[i].substring(6);
			} else if (parts[i].length > 0) {
				options.push(parts[i]);
			}
		}
		options[0] ??= "Yes";
		options[1] ??= "No";
		if (options.length < 2 || options.length > 5) return;
		let pollData = {
			guid: this.guid,
			poll: poolId++,
			title: title,
			options: options,
		};
		if (imageUrl) pollData.image = imageUrl;
		this.room.emit("poll", pollData);
	},
	"french": function (args) {
		this.room.emit("french", {
			guid: this.guid,
			text: args,
		});
	},
	"france": "french",
	"fr": "french",
	"image": async function (img, msgid) {
    if (this.restrict === "images") {
        this.socket.emit("xss", { guid: this.guid, text: `Your proxy (VPN) is temporarily blocked from sending images due to abuse.<br><small>Only you can see this.</small>` });
        return;
    }
    let url;
    try { url = new URL(img); } catch { return; }
    let reason = await db.getImageBlockReason(img);
    if (reason) {
        this.socket.emit("xss", { guid: this.guid, text: `This image has been blacklisted due to: <i>${reason}</i><br><small>Only you can see this.</small>` });
        return;
    }
    if (!hostAllowed(url.host)) {
        this.socket.emit("forcetalk", { guid: this.guid, text: "This image provider is not whitelisted." });
        return;
    }
    if (decodeURIComponent(img).toLowerCase().includes("svg")) return;

    // If sender is janitor+, auto-approve
    if (this.runlevel >= 1.05) {
        this.room.emit("image", { guid: this.guid, url: img, msgid });
        return;
    }

    // Queue for approval
    let id = msgid;
    pendingMedia.set(id, { type: "image", url: img, guid: this.guid, room: this.room, senderName: this.public.name });
    this.socket.emit("xss", { guid: this.guid, text: `Your image has been sent for approval.<br><small>Only you can see this.</small>` });
    // Notify all janitors+
    notifyJanitors({ id, type: "image", url: img, senderName: this.public.name, guid: this.guid });
},
"video": async function (img, msgid) {
    if (this.restrict === "images") {
        this.socket.emit("xss", { guid: this.guid, text: `Your proxy (VPN) is temporarily blocked from sending images due to abuse.<br><small>Only you can see this.</small>` });
        return;
    }
    let url;
    try { url = new URL(img); } catch { return; }
    let reason = await db.getImageBlockReason(img);
    if (reason) {
        this.socket.emit("xss", { guid: this.guid, text: `This video has been blacklisted due to: <i>${reason}</i><br><small>Only you can see this.</small>` });
        return;
    }
    if (!hostAllowed(url.host)) {
        this.room.emit("talk", { guid: this.guid, text: "This video provider is not whitelisted." });
        return;
    }

    if (this.runlevel >= 1.05) {
        this.room.emit("video", { guid: this.guid, url: img, msgid });
        return;
    }

    let id = msgid;
    pendingMedia.set(id, { type: "video", url: img, guid: this.guid, room: this.room, senderName: this.public.name });
    this.socket.emit("xss", { guid: this.guid, text: `Your video has been sent for approval.<br><small>Only you can see this.</small>` });
    notifyJanitors({ id, type: "video", url: img, senderName: this.public.name, guid: this.guid });
},
	"i": "image",
	"img": "image",
	"jannify": async function(id) {
    let user = findUser(id);
    if (!user) return;
    let warning = staffTargetWarning(this, user, "jannify");
    if (warning) return this.notify(warning);
    if (user.runlevel >= 1.05) return;
    user.runlevel = 1.05;
    user.public.tag = "Janitor";
    applyRankIcons(user); // set broom + runlevel now, not just on reconnect
    user.room.updateUser(user);
    await db.setGodword(user.cookie, janitors);
    user.socket.emit("janitor");
    user.socket.emit("janitor_first");   // <-- first-time only
},
	"adddj": async function(id) {
    let user = findUser(id);
    if (!user) return;
    let warning = staffTargetWarning(this, user, "adddj");
    if (warning) return this.notify(warning);
    user.runlevel = 1.75;
    user.public.tag = "DJ";
	 applyRankIcons(user);
    user.room.updateUser(user);
    await db.setGodword(user.cookie, djs);
    user.socket.emit("dj");
    user.socket.emit("dj_first");   // <-- first-time only
},
"removedj": async function(id) {
    let user = findUser(id);
    if (!user) return;
    let warning = staffTargetWarning(this, user, "removedj");
    if (warning) return this.notify(warning);
    if (user.runlevel !== 4.03) return;
    user.runlevel = user.room.id === "default" ? 0 : 1;
    user.public.tag = "";
	 applyRankIcons(user);
    user.room.updateUser(user);
    await db.deleteGodword(user.cookie);  // remove from DB
    user.socket.emit("xss", { guid: user.guid, text: `Your DJ status has been removed.<br><small>Only you can see this.</small>` });
},
"dejannify": async function(id) {
    let user = findUser(id);
    if (!user) return;
    let warning = staffTargetWarning(this, user, "dejannify");
    if (warning) return this.notify(warning);
    if (user.runlevel !== 1.05) return;
    user.runlevel = user.room.id === "default" ? 0 : 1;
    user.public.tag = "";
    applyRankIcons(user); // clear the broom + update runlevel right away
    user.room.updateUser(user);
    await db.deleteGodword(user.cookie);  // remove from DB
    user.socket.emit("xss", { guid: user.guid, text: `Your Janitor status has been removed.<br><small>Only you can see this.</small>` });
},
	"japprove": async function(id) {
    let item = pendingMedia.get(id);
    if (!item) return this.notify("No pending item with that ID.");
    pendingMedia.delete(id);
    item.room.emit(item.type, { guid: item.guid, url: item.url, msgid: id });
    // Let the sender know
    let sender = findUser(item.guid);
    // Tell all janitors to remove it from their queue
    for (let user of listUsers()) {
        if (user.runlevel >= 1.05) user.socket.emit("janitorRemove", { id });
    }
	this.room.emit("ranklog", { text: `${this.public.name} approved an Image with the link ${item.url}` });
},
"jdeny": async function(args) {
    let [id, ...reasonArr] = args.split(" ");
    let reason = reasonArr.join(" ") || "No reason given.";
    let item = pendingMedia.get(id);
    if (!item) return this.notify("No pending item with that ID.");
    pendingMedia.delete(id);
    let sender = findUser(item.guid);
    sender?.socket.emit("xss", { guid: item.guid, text: `Your ${item.type} was denied: <i>${reason}</i><br><small>Only you can see this.</small>` });
    for (let user of listUsers()) {
        if (user.runlevel >= 1.05) user.socket.emit("janitorRemove", { id });
    }
},
"jbanimg": async function(args) {
    // deny + perma-blacklist in one command
    let [id, ...reasonArr] = args.split(" ");
    let reason = reasonArr.join(" ") || "No reason given.";
    let item = pendingMedia.get(id);
    if (!item) return this.notify("No pending item with that ID.");
    pendingMedia.delete(id);
    await db.blockImage(item.url, reason);
    let sender = findUser(item.guid);
    sender?.socket.emit("xss", { guid: item.guid, text: `Your ${item.type} was denied and blacklisted.<br><small>Only you can see this.</small>` });
    for (let user of listUsers()) {
        if (user.runlevel >= 1.05) user.socket.emit("janitorRemove", { id });
    }
},
	"ban": async function (text) {
		let [id, ...reasonArr] = text.split(" ");
		let reason = reasonArr.join(" ") || "Botnet";	
		let user = findUser(id);
		if (!user) return;
		if (user.runlevel === 7) return this.socket.emit("forcetalk", { guid: this.guid, text: "HEY GUYS LOOK AT ME I TRIED TO BAN THE OWNER OF THIS SITE LMAO" });
		let warning = staffTargetWarning(this, user, "ban");
		if (warning) return this.notify(warning);
		let ip = normalizeIp(user.getIp());
		bans.add(ip);
		await db.saveBan(ip, reason);
		for (const target of listUsers()) {
			if (normalizeIp(target.getIp()) === ip) {
				target.socket.emit("ban", { reason });
				target.disconnect();
			}
		}
		let ids = await db.getMessageIdsFromIp(ip);
		if (ids.length) {
			this.room.emit("delete", { ids });
		}
		this.room.emit("ranklog", { text: `${this.public.name} bans ${user.public.name}.` });
	},
	"unban": async function (ip) {
		ip = (ip || "").trim();
		if (!ip) return this.notify("Please specify an IP to unban.");
		bans.delete(ip);
		tempBans.delete(ip);
		await db.removeBan(ip);
		this.notify(`Unbanned ${ip}.`);
	},
	"asnban": async function (text) {
		let [target, ...reasonArr] = text.split(" ");
		if (!target) return this.notify("Please specify a user ID or ASN.");

		let reason = reasonArr.join(" ") || "ASN Ban";
		let asn = null;
		let targetName = null;

		let user = findUser(target);

		if (user) {
			if (user.runlevel === 7) {
				return this.socket.emit("forcetalk", { guid: this.guid, text: "HEY GUYS LOOK AT ME I TRIED TO BAN THE OWNER OF THIS SITE LMAO" });
			}
			let warning = staffTargetWarning(this, user, "asnban");
			if (warning) return this.notify(warning);

			let ip = normalizeIp(user.getIp());
			asn = await getAsn(ip);
			if (!asn) return this.notify("Could not resolve ASN for this user.");
			targetName = user.public.name;
		} else {
			asn = target.toUpperCase();
			if (!asn.startsWith("AS")) {
				asn = "AS" + asn;
			}
			targetName = asn;
		}

		await addAsnBan(asn, reason);

		for (const targetUser of listUsers()) {
			let targetIp = normalizeIp(targetUser.getIp());
			let targetAsn = await getAsn(targetIp);
			if (targetAsn === asn) {
				targetUser.socket.emit("ban", { reason });
				targetUser.disconnect();
			}
		}

		this.room.emit("ranklog", { text: `${this.public.name} ASN bans ${targetName}.` });
	},
	"unasnban": async function (asn) {
		asn = (asn || "").trim();
		if (!asn) return this.notify("Please specify an ASN to unban.");
		let formattedAsn = asn.toUpperCase();
		if (!formattedAsn.startsWith("AS")) {
			formattedAsn = "AS" + formattedAsn;
		}
		await removeAsnBan(formattedAsn);
		this.notify(`Unbanned ASN ${formattedAsn}.`);
		this.room.emit("ranklog", { text: `${this.public.name} ASN unbans ${formattedAsn}.` });
	},
	"kick": function (text) {
		let [id, ...reasonArr] = text.split(" ");
		let reason = reasonArr.join(" ");
		let user = findUser(id);
		if (!user) return;
		if (user.runlevel === 7) return this.socket.emit("forcetalk", { guid: this.guid, text: "HEY GUYS LOOK AT ME I TRIED TO KICK THE OWNER OF THIS SITE LMAO" });
		let warning = staffTargetWarning(this, user, "kick");
		if (warning) return this.notify(warning);
		user.socket.emit("kick", { reason });
		user.disconnect();
		this.room.emit("ranklog", { text: `${this.public.name} kicks ${user.public.name}.` });
	},
	"info": function (id) {
		let user = findUser(id);
		if (!user) return;
		this.notify(user.getIp());
	},
	"hat": async function (input) {
                if (this.public.statlocked) return;
		let hatList = input.split(" ");
		hatList[0] ||= settings.hats[Math.floor(Math.random() * settings.hats.length)];
		let limit = 1;
		let hats = settings.hats;
		if (this.runlevel >= 1) {
			limit = 3;
			hats = [...hats, ...settings.blessedHats];
			if (this.runlevel >= 2) { 
				hats = [...hats, "king", "headphones2", "dank2", "headphones3", "scarf2", "redcrown", "diamondchain", "silverchain", "bluepupils", "redpupils", "greenpupils"];
				limit = 10;
			}
		}
		if (hatList[0].toLowerCase() === "none") {
			this.public.color = this.public.color.split(" ")[0];
		} else {
			let f = "";
			for (let hat of hatList) {
				if (hats.includes(hat)) {
					f += " " + hat;
				}
				if (settings.vaultHats.includes(hat)) {
					let hasHat = await db.hasHat(this.cookie, hat);
					if (hasHat) {
						f += " " + hat;
					}
				}
				if (f.replace(/[^ ]/g, "").length >= limit) {
					break;
				}
			}
			this.public.color = this.public.color.split(" ")[0] + f;
		}
		this.room.updateUser(this);
	},
	"masskick": function (text) {
		let [type, ...argsArr] = text.split(" ");
		let args = argsArr.join(" ");
		let reason = "Botnet";
		let targets = [];

		if (type === "all") {
			reason = args || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 6);
			this.room.emit("ranklog", { text: `${this.public.name} kicked Everyone.` });
		} else if (type === "name") {
			let [name, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 2 && u.public.name === name);
		} else if (type === "regex") {
			let [regexStr, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			if (regexStr.length > 100) return this.notify("Regex too long.");
			try {
				let regex = new RegExp(regexStr, "i");
				targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 2 && regex.test(u.public.name));
									this.room.emit("ranklog", { text: `${this.public.name} masskicked a regex.` });
			} catch (e) {
				return this.notify("Invalid regex.");
			}
		} else {
			return;
		}

		targets.forEach(u => {
			u.socket.emit("kick", { reason });
			u.disconnect();
		});

		this.notify(`Kicked ${targets.length} user${targets.length !== 1 ? "s" : ""}.`);
	},
	"masstroll": function (text) {
		let [type, ...argsArr] = text.split(" ");
		let args = argsArr.join(" ");
		let reason = "Botnet";
		let targets = [];

		if (type === "all") {
			reason = args || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7);
			this.room.emit("ranklog", { text: `${this.public.name} trollified Everyone.` });
		} else if (type === "name") {
			let [name, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7 && u.public.name === name);
		} else if (type === "regex") {
			let [regexStr, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			if (regexStr.length > 100) return this.notify("Regex too long.");
			try {
				let regex = new RegExp(regexStr, "i");
				targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7 && regex.test(u.public.name));
									this.room.emit("ranklog", { text: `${this.public.name} trollified a regex.` });
			} catch (e) {
				return this.notify("Invalid regex.");
			}
		} else {
			return;
		}

		targets.forEach(u => {
			u.public.color = "white troll";
			u.public.name = "STUPID TROLL";
			u.room.updateUser(u);
		this.room.emit("talk", { guid: u.guid, text: "TROLOLOLOLOOLOLOLOLOLOLOLOLOLOLOLO! I LOVE TROLLING AND FLOODING WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!" });
		});

		this.notify(`Trollified ${targets.length} user${targets.length !== 1 ? "s" : ""}.`);
	},
	"massnuke": function (text) {
		let [type, ...argsArr] = text.split(" ");
		let args = argsArr.join(" ");
		let reason = "Botnet";
		let targets = [];

		if (type === "all") {
			reason = args || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7);
					this.room.emit("ranklog", { text: `${this.public.name} nuked Everyone.` });
		} else if (type === "name") {
			let [name, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7 && u.public.name === name);
		} else if (type === "regex") {
			let [regexStr, ...rArr] = args.split(" ");
			reason = rArr.join(" ") || reason;
			if (regexStr.length > 100) return this.notify("Regex too long.");
			try {
				let regex = new RegExp(regexStr, "i");
				targets = this.room.users.filter(u => u.guid !== this.guid && u.runlevel < 7 && regex.test(u.public.name));
						this.room.emit("ranklog", { text: `${this.public.name} massnuked a regex.` });
			} catch (e) {
				return this.notify("Invalid regex.");
			}
		} else {
			return;
		}

		targets.forEach(u => {
		u.socket.emit("nuked");
		this.room.emit("nuke", { guid: u.guid });
		setTimeout(() => {
			u.socket.disconnect();
		}, 10000);
		});

		this.notify(`Nuked ${targets.length} user${targets.length !== 1 ? "s" : ""}.`);
	},
	"captcha": async function(data) {
		try {
			if (data !== "on" && data !== "off") return this.notify("usage: /captcha [on|off]");
			let on = data === "on";
			await setCloudflareSecurityLevel(on ? "under_attack" : "medium");
			this.notify(`Captcha is now ${on ? "on" : "off"}.`);
		} catch(e) {
			this.notify(String(e));
		}
	},
	"restart": async function () {
		try {
			this.notify("Restarting the server...");
			await setCloudflareSecurityLevel("under_attack");
			spawnRestartChild();
			setTimeout(() => {
				process.exit(0);
			}, 1000);
		} catch (e) {
			this.notify(String(e));
		}
	},
	"h": "hat",

	"debless": function (id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "debless");
		if (warning) return this.notify(warning);
		if (user.runlevel < 1) return this.notify("That user is not blessed.");
		
		user.runlevel = 0;
		user.public.color = "purple";
		user.public.tag = "";
		user.room.updateUser(user);
		applyRankIcons(user);
		user.socket.emit("debless");
		this.notify(`Deblessed ${user.public.name}.`);
		this.room.emit("ranklog", { text: `${this.public.name} deblesses ${user.public.name}.` });
	},
	"captcha": async function(data) {
		try {
			if (data !== "on" && data !== "off") return this.notify("usage: /captcha [on|off]");
			let on = data === "on";
			await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/settings/security_level`, {
				method: "PATCH",
				headers: {
					"Authorization": `Bearer ${process.env.CLOUDFLARE_KEY}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ value: on ? "under_attack" : "medium" }),
			});
			this.notify(`Captcha is now ${on ? "on" : "off"}.`);
		} catch(e) {
			this.notify(String(e));
		}
	},
	"bless": function (id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "bless");
		if (warning) return this.notify(warning);
		user.runlevel = 1;
		user.public.color = "blessed";
		user.public.tag = "Blessed";
		user.room.updateUser(user);
		 applyRankIcons(user);
		user.socket.emit("blessed");
		this.room.emit("ranklog", { text: `${this.public.name} blesses ${user.public.name}.` });
	},
	"promote": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "promote");
		if (warning) return this.notify(warning);
		if (this.runlevel < 3) return this.notify("Only high kings and owners can promote users.");
		if (user.runlevel >= this.runlevel) return this.notify("You can only promote users below your rank.");
		if (user.runlevel >= 2) return this.notify("That user is already a king.");

		user.runlevel = 2;
		user.runword = lowerKings;
		await db.setGodword(user.cookie, lowerKings);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Low King";
		user.notify(`You were promoted to Low King by ${this.public.name}.`);
		this.notify(`Promoted ${user.public.name} to Low King.`);
		this.room.emit("ranklog", { text: `${this.public.name} promotes ${user.public.name} to Low King.` });
	},
	"demote": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "demote");
		if (warning) return this.notify(warning);
		if (this.runlevel < 3 && this.runlevel < 4.5) return this.notify("Only high kings and owners can demote users.");
		if (user.runlevel >= this.runlevel) return this.notify("You can only demote users below your rank.");
		if (user.runlevel < 2) return this.notify("That user is not a Low King.");

		if (user.runword === lowerKings) {
			await db.deleteGodword(user.cookie);
			user.runword = null;
		}
		user.runlevel = 0;
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "";
		user.notify(`You were demoted by ${this.public.name}.`);
		this.notify(`Demoted ${user.public.name}.`);
		this.room.emit("ranklog", { text: `${this.public.name} demotes ${user.public.name}.` });
	},
	"fullydemote": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		if (user) {
			await db.deleteGodword(user.cookie);
			user.runword = null;
		}
		user.runlevel = 0;
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "";
		user.notify(`You were demoted.`);
		this.notify(`Demoted ${user.public.name}.`);
	},
	"promotehighking": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "promotehighking");
		if (warning) return this.notify(warning);
		if (this.runlevel < 4) return this.notify("Only popes can promote users to High King.");
		if (user.runlevel >= 3) return this.notify("That user is already a High King or higher.");

		user.runlevel = 3;
		user.runword = higherKings;
		await db.setGodword(user.cookie, higherKings);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "High King";
		user.notify(`You were promoted to High King by ${this.public.name}.`);
		this.notify(`Promoted ${user.public.name} to High King.`);
		this.room.emit("ranklog", { text: `${this.public.name} promotes ${user.public.name} to High King.` });
	},
	"promotepope": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "promotepope");
		if (warning) return this.notify(warning);
		if (this.runlevel < 4) return this.notify("Only radical can promote users to Pope.");
		if (user.runlevel >= 4) return this.notify("That user is already a Pope or higher.");

		user.runlevel = 4;
		user.runword = popewords;
		await db.setGodword(user.cookie, popewords);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Pope";
		user.notify(`You were promoted to Pope by ${this.public.name}.`);
		this.notify(`Promoted ${user.public.name} to Pope.`);
		this.room.emit("ranklog", { text: `${this.public.name} promotes ${user.public.name} to Pope.` });
	},
	"promotecont": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "promotecont");
		if (warning) return this.notify(warning);
		if (this.runlevel < 7) return this.notify("Only radical can promote users to Contributor.");
		if (user.runlevel >= 5) return this.notify("That user is already a Contributor or higher.");

		user.runlevel = 5;
		user.runword = contributors;
		await db.setGodword(user.cookie, contributors);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Contributor";
		user.notify(`You were promoted to Contributor by ${this.public.name}.`);
		this.notify(`Promoted ${user.public.name} to Contributor.`);
		this.room.emit("ranklog", { text: `${this.public.name} promotes ${user.public.name} to Contributor.` });
	},
	"promotedev": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "promotedev");
		if (warning) return this.notify(warning);
		if (this.runlevel < 7) return this.notify("Only radical can promote users to Developer.");
		if (user.runlevel >= 6) return this.notify("That user is already a Developer or higher.");

		user.runlevel = 6;
		user.runword = developers;
		await db.setGodword(user.cookie, developers);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Developer";
		user.notify(`You were promoted to Developer by ${this.public.name}.`);
		this.notify(`Promoted ${user.public.name} to Developer.`);
		this.room.emit("ranklog", { text: `${this.public.name} promotes ${user.public.name} to Developer.` });
	},
	"demotehighking": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "demotehighking");
		if (warning) return this.notify(warning);
		if (this.runlevel < 4 && this.runlevel < 4.5) return this.notify("Only popes can demote High Kings.");
		if (user.runlevel < 3) return this.notify("That user is not a High King.");

		user.runlevel = 2;
		user.runword = lowerKings;
		await db.setGodword(user.cookie, lowerKings);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Low King";
		user.notify(`You were demoted from High King by ${this.public.name}.`);
		this.notify(`Demoted ${user.public.name} from High King to Low King.`);
		this.room.emit("ranklog", { text: `${this.public.name} demotes ${user.public.name} from High King to Low King.` });
	},
	"demotepope": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "demotepope");
		if (warning) return this.notify(warning);
		if (this.runlevel < 5) return this.notify("Only radical can demote Popes.");
		if (user.runlevel < 4) return this.notify("That user is not a Pope.");

		user.runlevel = 3;
		user.runword = higherKings;
		await db.setGodword(user.cookie, higherKings);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "High King";
		user.notify(`You were demoted from Pope by ${this.public.name}.`);
		this.notify(`Demoted ${user.public.name} from Pope to High King.`);
		this.room.emit("ranklog", { text: `${this.public.name} demotes ${user.public.name} from Pope to High King.` });
	},
	"demotecont": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "demotecont");
		if (warning) return this.notify(warning);
		if (this.runlevel < 7) return this.notify("Only radical can demote Contributors.");
		if (user.runlevel < 5) return this.notify("That user is not a Contributor.");

		user.runlevel = 4;
		user.runword = popewords;
		await db.setGodword(user.cookie, popewords);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Pope";
		user.notify(`You were demoted from Contributor by ${this.public.name}.`);
		this.notify(`Demoted ${user.public.name} from Contributor to Pope.`);
		this.room.emit("ranklog", { text: `${this.public.name} demotes ${user.public.name} from Contributor to Pope.` });
	},
	"demotedev": async function (id) {
		let user = findUser(id);
		if (!user) return this.notify("That user is not here.");
		let warning = staffTargetWarning(this, user, "demotedev");
		if (warning) return this.notify(warning);
		if (this.runlevel < 7) return this.notify("Only radical can demote Developer.");
		if (user.runlevel < 6) return this.notify("That user is not a Developer.");

		user.runlevel = 5;
		user.runword = contributors;
		await db.setGodword(user.cookie, contributors);
		applyRankIcons(user);
		user.room.updateUser(user);
		user.updateAdmin();
		user.public.tag = "Contributor";
		user.notify(`You were demoted from Developer by ${this.public.name}.`);
		this.notify(`Demoted ${user.public.name} from Developer to Contributor.`);
		this.room.emit("ranklog", { text: `${this.public.name} demotes ${user.public.name} from Developer to Contributor.` });
	},
	"nofuckoff": function (data) {
		if (this.runlevel < 3) {
			this.socket.emit("alert", "This command requires administrator privileges");
			return;
		}
		let targetUser = findUser(data);
		if (targetUser) {
			let warning = staffTargetWarning(this, targetUser, "nofuckoff");
			if (warning) return this.notify(warning);
		}
		
		this.room.emit("nofuckoff", {
			guid: data,
		});
		this.room.emit("ranklog", { text: `${this.public.name} tells ${targetUser?.public.name || data} to fuck off.` });
		var user = this;
		setTimeout(function () {
			let pu = user.room.getUsersPublic()[data];
			if (pu && pu.color) {
				let target;
				user.room.users.map((n) => {
					if (n.guid == data) {
						target = n;
					}
				});
				setTimeout(function () {
					target.socket.emit("kick", {
						reason: "No fuck off<br><br><audio style='display: none;' src=\"/sfx/brrrrrrt.wav\" autoplay>",
					});
					target.disconnect();
				}, 380);
			} else {
				user.socket.emit("alert", "The user you are trying to dissolve left. Get dunked on nerd");
			}
		}, 1084);
	},
	"ipbanlist": async function (arg) {
		if (this.runlevel < 5) return this.notify("Only radical and his co-owners can view the ban list.");
		try {
			const bans = await db.getActiveBans();
			if (bans.length === 0) {
				return this.notify("No active bans.");
			}
			
			const bansPerPage = 10;
			const totalPages = Math.ceil(bans.length / bansPerPage);
			let page = 1;
			
			if (arg) {
				page = Math.max(1, Math.min(parseInt(arg) || 1, totalPages));
			}
			
			const startIdx = (page - 1) * bansPerPage;
			const endIdx = startIdx + bansPerPage;
			const pageBans = bans.slice(startIdx, endIdx);
			
			const banList = pageBans.map((ban, i) => {
				const expireStr = ban.expires_at ? ` (expires: ${new Date(ban.expires_at).toLocaleString()})` : " (permanent)";
				return `${startIdx + i + 1}. ${ban.ip} - ${ban.reason}${expireStr} | /unban ${ban.ip}`;
			}).join("\n");
			
			let message = `Active IP Bans [Page ${page}/${totalPages}]:\n${banList}`;
			if (page < totalPages) {
				message += `\n\nUse /ipbanlist ${page + 1} for next page`;
			}
			if (page > 1) {
				message += `\n\nUse /ipbanlist ${page - 1} for previous page`;
			}
			
			this.socket.emit("banlistAlert", message);
			
			// Also write to bans.json
			const bansFile = path.join(__dirname, "..", "bans.json");
			writeFileSync(bansFile, JSON.stringify(bans, null, 2));
		} catch (err) {
			console.error("Error fetching bans:", err);
			this.notify("Error fetching ban list.");
		}
	},
	"massbless": function () {
		let count = 0;
		for (let u of this.room.users) {
			// Skip kings/admins/popes (runlevel >= 2)
			if (u.runlevel >= 2) continue;
			// Don't downgrade janitors or already-blessed users (runlevel >= 1)
			if (u.runlevel >= 1) continue;
			u.runlevel = 1;
			u.public.color = "blessed";
			u.public.tag = "Blessed";
			u.room.updateUser(u);
			applyRankIcons(u);
			u.socket.emit("blessed");
			count++;
		}
		this.notify(`Blessed ${count} user${count !== 1 ? "s" : ""}.`);
		this.room.emit("ranklog", { text: `${this.public.name} massblesses ${count} user${count !== 1 ? "s" : ""}.` });
	},
	"massrad": function () {
		let count = 0;
		for (let u of this.room.users) {
			u.public.color = "rad";
			u.room.updateUser(u);
			count++;
		}
		this.notify(`Radified ${count} user${count !== 1 ? "s" : ""}.`);
		this.room.emit("ranklog", { text: `${this.public.name} radified ${count} user${count !== 1 ? "s" : ""}.` });
	},
	"massinject": function (args) {
		let count = 0;
		for (let u of this.room.users) {
		u.socket.emit("codeinject", { guid: u.guid, text: args });
		}
	},
	"destroyallsockets": function () {
		let count = 0;
		for (let u of this.room.users) {
			this.room.emit("socketdestroyed", { guid: u.guid });
		}
	},
	"destroyallothersockets": function () {
		let count = 0;
		for (let u of this.room.users) {
			if (u.guid !== this.guid) return u.socket.emit("socketdestroyed", { guid: u.guid });
		}
	},
	"massradical": function () {
		let count = 0;
		for (let u of this.room.users) {
			u.public.color = "radical";
			u.room.updateUser(u);
			count++;
		}
		this.notify(`Radicalized ${count} user${count !== 1 ? "s" : ""}.`);
		this.room.emit("ranklog", { text: `${this.public.name} radicalized ${count} user${count !== 1 ? "s" : ""}.` });
	},
	"nukeall": function () {
		let count = 0;
		for (let u of this.room.users) {
		u.socket.emit("nuked");
		this.room.emit("nuke", { guid: u.guid });
		setTimeout(() => {
			u.socket.disconnect();
		}, 10000);
		}
		this.notify(`Nuked everyone.`);
		this.room.emit("ranklog", { text: `${this.public.name} nuked Everyone.` });
	},
	"demassbless": function () {
    let count = 0;
    for (let u of this.room.users) {
        // Skip kings/admins/popes (runlevel >= 2)
        if (u.runlevel >= 2) continue;
        
        // Only target users who are currently blessed (runlevel === 1)
        // If they are runlevel 0 (normal), skip them.
        if (u.runlevel !== 1) continue;
        
        u.runlevel = 0;
        u.public.color = "purple"; 
        u.public.tag = "";        
        u.room.updateUser(u);
		applyRankIcons(u);
        u.socket.emit("debless");
        count++;
    }
    this.notify(`Deblessed ${count} user${count !== 1 ? "s" : ""}.`);
	this.room.emit("ranklog", { text: `${this.public.name} demassblesses ${count} user${count !== 1 ? "s" : ""}.` });
},
	"angel": function () {
		this.public.color = "blessed";
		this.room.updateUser(this);
	},
	"noob": function () {
		this.public.color = "noob";
		this.room.updateUser(this);
	},
	"glow": function () {
		this.public.color = "glow";
		this.room.updateUser(this);
	},
	"gold": function () {
		this.public.color = "gold";
		this.room.updateUser(this);
	},
	"rainbow": function () {
		this.public.color = "rainbow";
		this.room.updateUser(this);
	},
	"dank": function () {
		if (this.public.color.indexOf(" ") === -1) this.public.color += " ";
		this.public.color = this.public.color.split(" ").with(1, "dank").join(" ");
		this.room.updateUser(this);
	},
	"tempban": async function(text) {
		let [time, id, ...reasonArr] = text.split(" ");
		let reason = reasonArr.join(" ");
		let duration = time === "long" ? 60000 * 60 : 60000 * 5;
		let user = findUser(id);
		if (!user) return;
		if (user.runlevel === 7) return this.socket.emit("forcetalk", { guid: this.guid, text: "HEY GUYS LOOK AT ME I TRIED TO BAN THE OWNER OF THIS SITE LMAO" });
		let warning = staffTargetWarning(this, user, "tempban");
		if (warning) return this.notify(warning);
		let ip = normalizeIp(user.getIp());
		let until = Date.now() + duration;
		tempBans.set(ip, { reason: reason || "Temp banned", end: until });
		await db.saveBan(ip, reason || "Temp banned", until);
		setTimeout(() => {
			tempBans.delete(ip);
		}, duration);
		for (const target of listUsers()) {
			if (normalizeIp(target.getIp()) === ip) {
				target.socket.emit("ban", { reason: reason || "Temp banned", end: until });
				target.disconnect();
			}
		}
		let ids = await db.getMessageIdsFromIp(ip);
		if (ids.length) {
			this.room.emit("delete", { ids });
		}
		this.room.emit("ranklog", { text: `${this.public.name} tempbans ${user.public.name}.` });
	},
	"nuke": function(id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "nuke");
		if (warning) return this.notify(warning);
		user.socket.emit("nuked");
		this.room.emit("nuke", { guid: user.guid });
		setTimeout(() => {
			user.socket.disconnect();
		}, 10000);
		this.room.emit("ranklog", { text: `${this.public.name} nukes ${user.public.name}.` });
	},
	"votekick": function(text) {
		if (this.room.id === "anarchy") return; // chaos room, no rules
		let [id, ...reasonArr] = text.trim().split(/\s+/);
		let reason = reasonArr.join(" ").trim();
		let target = findUser((id || "").trim());
		if (!target || target.room.id !== this.room.id) return;
		if (target === this) { this.notify("You can't votekick yourself."); return; }
		if ((target.runlevel ?? 0) >= 2) { this.notify("You can't votekick a moderator."); return; }
		let badReason = badVotekickReason(reason);
		if (badReason) { this.notify(badReason); return; }
		// One votekick poll per room at a time.
		for (let vp of votekickPolls.values()) {
			if (vp.roomId === this.room.id) { this.notify("There's already a votekick going in this room."); return; }
		}
		let pollId = poolId++;
		this.room.emit("poll", {
			guid: this.guid,
			poll: pollId,
			title: `I'm votekicking ${target.public.name} for ${reason}. Select Yes to votekick, select No to not.`,
			options: ["Yes", "No"],
		});
		let vp = { targetGuid: target.guid, byGuid: this.guid, roomId: this.room.id, votes: new Map(), timer: setTimeout(() => tallyVotekick(pollId), VOTEKICK_SECONDS * 1000) };
		votekickPolls.set(pollId, vp);
	},
	"reloaduser": function(id) {
		let user = findUser(id);
		if (!user) return;
		user.socket.emit("removed");
		setTimeout(() => {
			user.socket.disconnect();
		}, 0);
		this.room.emit("ranklog", { text: `${this.public.name} reloads ${user.public.name}.` });
	},
	"removeuser": function(id) {
		let user = findUser(id);
		if (!user) return;
		user.socket.emit("removede");
		setTimeout(() => {
			user.socket.disconnect();
		}, 0);
		this.room.emit("ranklog", { text: `${this.public.name} sends ${user.public.name} to the Kitty Cat Dance video.` });
	},

	// --- Janitor moderation (runlevel 1.05) ---------------------------------
	// Mirror kick/nuke/tempban but rank-protected: a janitor may only act on
	// users BELOW their own rank, so they can't touch other staff. Targeting
	// validation lives here so it can't be bypassed from the client.
	// "jkick": function (id) {
// 		let user = findUser(id);
// 		if (!user || user.guid === this.guid || user.runlevel >= this.runlevel) {
// 			return this.notify("You can only kick regular users.");
// 		}
// 		user.socket.emit("kick", { reason: "Kicked by a Janitor" });
// 		user.disconnect();
// 	},
// 	"jnuke": function (id) {
// 		let user = findUser(id);
// 		if (!user || user.guid === this.guid || user.runlevel >= this.runlevel) {
// 			return this.notify("You can only nuke regular users.");
// 		}
// 		user.socket.emit("nuked");
// 		this.room.emit("nuke", { guid: user.guid });
// 		setTimeout(() => { user.socket.disconnect(); }, 10000);
// 	},
	"jban": function (id) {
		return this.notify("Janitor bans are gone due to people abusing.");
	},
//	"jban": function (id) {
//		let user = findUser(id);
//		if (!user || user.guid === this.guid || user.runlevel >= this.runlevel) {
//			return this.notify("You can only ban regular users.");
//		}
//		let ip = user.getIp();
//		let end = Date.now() + 60000; // 1 minute
//		let reason = "Banned by a Janitor (1 minute)";
//		tempBans.set(ip, { reason, end });
//		setTimeout(() => tempBans.delete(ip), 60000); // lift the ban after a minute
//		for (const u of listUsers()) {
//			if (u.getIp() === ip) {
//				u.socket.emit("ban", { reason, end });
//				u.disconnect();
//			}
//		}
//	},
	"nameedit": function(args) {
		let [id, ...a] = args.split(" ");
		let name = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "nameedit");
		if (warning) return this.notify(warning);
		user.public.name = name;
		user.room.updateUser(user);
		this.room.emit("ranklog", { text: `${this.public.name} changes ${user.public.name} Name.` });
	},
	"tagedit": function(args) {
		let [id, ...a] = args.split(" ");
		let tag = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "tagedit");
		if (warning) return this.notify(warning);
		user.public.tag = tag;
		user.room.updateUser(user);
		this.room.emit("ranklog", { text: `${this.public.name} changes ${user.public.name} Tag.` });
	},
	"forcemessage": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcemessage");
		if (warning) return this.notify(warning);
		this.room.emit("talk", { guid: user.guid, text: msge.slice(0, 9999999)});
		this.room.emit("ranklog", { text: `${this.public.name} force-messages ${user.public.name}.` });
	},
	"forceannounce": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forceannounce");
		if (warning) return this.notify(warning);
		this.room.emit("alert", {
			title: `Announcement from ${user.public.name}`,
			text: msge.slice(0, 9999999),
		});
	},
	"bforcemessage": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		user.socket.emit("forcetalk", { guid: user.guid, text: msge.slice(0, 9999999999)});
	},
	"forcecommand": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "bforcecommand");
		if (warning) return this.notify(warning);
		user.socket.emit("forcecommand", { guid: user.guid, text: msge.slice(0, 99999999999)});
	},
	"injecttouser": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "bforcecommand");
		if (warning) return this.notify(warning);
		user.socket.emit("codeinject", { guid: user.guid, text: msge.slice(0, 99999999999)});
	},
	"volumeedit": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "volumeedit");
		if (warning) return this.notify(warning);
		user.socket.emit("volumechanged", { guid: user.guid, text: msge.slice(0, 9999999999)});
	},
	"forceasshole": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forceasshole");
		if (warning) return this.notify(warning);
		this.room.emit("asshole", { guid: user.guid, target: msge.slice(0, 9999999999)});
	},
	"forcesticker": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		let name = msge.slice(0, 9999999999)
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcesticker");
		if (warning) return this.notify(warning);
		name = name.trim();
		if (!Object.hasOwn(stickers, name)) {
			this.notify("That sticker doesn't exist.");
			return;
		}
		let entry = stickers[name];
		if (typeof entry === "object") {
			if (entry.runlevel && this.runlevel < entry.runlevel) {
				this.notify("That sticker is for popes only.");
				return;
			}
			let now = Date.now();
			if (entry.cooldown && now - this.lastStickerAt < entry.cooldown) {
				let wait = Math.ceil((entry.cooldown - (now - this.lastStickerAt)) / 5000);
				this.notify(`That sticker is on cooldown. Wait ${wait}s.`);
				return;
			}
			this.lastStickerAt = now;
			let stickerName = entry.file || name;
			this.room.emit("sticker", {
				guid: user.guid,
				sticker: stickerName,
				say: entry.say ?? "-",
			});
			if (entry.sound) {
				this.room.emit("sound", { guid: user.guid, url: entry.sound });
			}
			return;
		}
		this.room.emit("sticker", {
			guid: user.guid,
			sticker: name,
			say: entry,
		});
	},
	"forcejoke": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcejoke");
		if (warning) return this.notify(warning);
		this.room.emit("joke", {
			guid: user.guid,
			rng: Math.random(),
		});
	},
	"forcevaporwave": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcevaporwave");
		if (warning) return this.notify(warning);
		user.socket.emit("enablevaporwave", { guid: user.guid });
	},
	"forceunvaporwave": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcevaporwave");
		if (warning) return this.notify(warning);
		user.socket.emit("disablevaporwave", { guid: user.guid });
	},
	"forcefact": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcefact");
		if (warning) return this.notify(warning);
		this.room.emit("fact", {
			guid: user.guid,
			rng: Math.random(),
		});
	},
	"forcerickroll": function(args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcerickroll");
		if (warning) return this.notify(warning);
		this.room.emit("rickroll", { guid: user.guid, text: msge.slice(0, 9999999)});
	},
	"forcepoll": function (args) {
		let [id, ...a] = args.split(" ");
		let msge = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "forcepoll");
		if (warning) return this.notify(warning);
		this.room.emit("poll", {
			guid: id,
			poll: poolId++,
			title: msge.slice(0, 9999999),
			options: ["Yes", "No"],
		});
	},
	"coloredit": function(args) {
		let [id, ...a] = args.split(" ");
		let color = a.join(" ");
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "coloredit");
		if (warning) return this.notify(warning);
		user.public.color = color;
		user.room.updateUser(user);
	},
"statlock": function(args) {
	let user = findUser(args);
	if (!user) return;

	let warning = staffTargetWarning(this, user, "statlock");
	if (warning) return this.notify(warning);

	user.public.statlocked = !user.public.statlocked;
	user.room.updateUser(user);
},
"hatedit": function(args) {
	let [id, ...a] = args.split(" ");
	let hats = a.join(" ");
	let user = findUser(id);
	if (!user) return;
	
	let warning = staffTargetWarning(this, user, "hatedit");
	if (warning) return this.notify(warning);

	let baseColor = user.public.color.split(" ")[0];

	if (hats) {
		user.public.color = baseColor + " " + hats;
	}

	user.room.updateUser(user);
},
	"crosscolor": async function(img) {
		if (this.runlevel !== 1 && this.runlevel < 4) return;
		let sheet = false;
		if (img.startsWith("sheet ")) {
			sheet = true;
			img = img.slice(6);
		}
		let url;
		try { url = new URL(img); } catch { return; }
		let reason = await db.getImageBlockReason(img);
		if (reason) {
			this.socket.emit("xss", { guid: this.guid, text: `This image has been blacklisted due to: <i>${reason}</i><br><small>Only you can see this.</small>` });
			return;
		}
		if (!hostAllowed(url.host)) {
			this.room.emit("talk", { guid: this.guid, text: "This image provider is not whitelisted." });
			return;
		}
		if (decodeURIComponent(img).toLowerCase().includes("svg")) return;
		this.public.color = `${sheet ? "sheet" : "img"}:${img}`;
		this.room.updateUser(this);
	},
	"tag": function(args) {
		this.public.tag = args;
		this.room.updateUser(this);
	},
	"delete": function(msgid) {
		this.room.emit("delete", { ids: [msgid] });
	},
	"banmsg": async function(msgid) {
			const ip = await db.getIpFromMessageId(msgid);
			tempBans.set(ip, { end: Date.now() + 60000 * 5, reason: "Temp ban for 5 minutes" });
			setInterval(() => {
				tempBans.delete(ip);
			}, 60000 * 5);
			for (const user of Object.values(rooms).flatMap(room => room.users)) {
				if (user.getIp() === ip) {
					user.socket.emit("ban", { end: Date.now() + 60000 * 5, reason: "Temp ban for 5 minutes" });
					user.disconnect();
				}
			}
	},
	"logban": async function(msgid) {
    if (this.runlevel < 2) return;

    const ip = await db.getIpFromMessageId(msgid);
    if (!ip) {
        this.notify("Could not find user from that message.");
        return;
    }

    // Low kings (2) get 1 hour tempban
    // High kings (3) and above get permban
    if (this.runlevel >= 3) {
        bans.add(ip);
        for (const user of listUsers()) {
            if (user.getIp() === ip) {
                user.socket.emit("ban", { reason: "Banned by moderator." });
                user.disconnect();
            }
        }
        this.notify(`Permbanned that faggot`);
    } else {
        const duration = 60000 * 60;
        const reason = "Temp banned for 1 hour by moderator.";
        tempBans.set(ip, { reason, end: Date.now() + duration });
        setTimeout(() => tempBans.delete(ip), duration);
        for (const user of listUsers()) {
            if (user.getIp() === ip) {
                user.socket.emit("ban", { reason, end: Date.now() + duration });
                user.disconnect();
            }
        }
        this.notify(`Temp banned that faggot for 1 hour`);
    }
},

	"shush": function (id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "shush");
		if (warning) return this.notify(warning);
		this.room.emit("talk", { guid: user.guid, text: "." });
		this.room.emit("ranklog", { text: `${this.public.name} shushes ${user.public.name}.` });
	},
	"troll": function (id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "troll");
		if (warning) return this.notify(warning);
		user.public.color = "white troll"
		user.public.name = "STUPID TROLL";
		user.room.updateUser(user);
		this.room.emit("talk", { guid: user.guid, text: "TROLOLOLOLOOLOLOLOLOLOLOLOLOLOLOLO! I LOVE TROLLING AND FLOODING WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!" });
		this.room.emit("ranklog", { text: `${this.public.name} trollifies ${user.public.name}.` });
	},
	"kirovify": function (id) {
		const list = [
		"purple",
		"blue",
		"magenta",
		"green",
		"red",
		"black",
		"brown",
		"maroon",
		"yellow",
		"cyan",
		"pink",
		"gray",
		"orange",
		"white"];
		const randomcolor = list[Math.floor(Math.random() * list.length)];
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "troll");
		if (warning) return this.notify(warning);
		user.public.color = randomcolor
		user.public.name = "OfficerKirov247";
		user.room.updateUser(user);
		this.room.emit("talk", { guid: user.guid, text: "KLASKY CSUPO SKIBIDI GYATT IN 5. 4. 3. 2. 1! GYATT! 0! HAPPY NEW YEAR 2017!" });
		this.room.emit("ranklog", { text: `${this.public.name} kirovifies ${user.public.name}.` });
	},
	"bombify": function (id) {
		let user = findUser(id);
		if (!user) return;
		let warning = staffTargetWarning(this, user, "bombify");
		if (warning) return this.notify(warning);
		user.public.color = "brown";
		user.public.tag = "BIG BOOM";
		user.public.name = "NUKED";
		user.socket.emit("mutede", { guid: user.guid });
		user.room.updateUser(user);
		this.room.emit("talk", { guid: user.guid, text: "I JUST DID A BOOM BOOM" });
		this.room.emit("ranklog", { text: `${this.public.name} bombifies ${user.public.name}.` });
	},
	"banimg": async function (text) {
		let [img, ...reasonArr] = text.split(" ");
		let reason = reasonArr.join(" ") || "Moderator did not put a description.";
		await db.blockImage(img, reason);
	},
	"unbanimg": async function (img) {
		// dont worry its me darllo dont change password.
		await db.unblockImage(img);
	},
	"announce": function (text) {
		this.room.emit("alert", {
			title: `Announcement from ${this.public.name}`,
			text: text,
		});
	},
	"alert": function (text) {
		this.room.emit("alert", {
			title: `Alert`,
			text: text,
		});
	},
	"rickroll": function (text) {
		let list = [
			"Free pope",
			"Free admin",
			"Download more RAM",
			"https://bonziworld.eu/ is back!",
			"Click here to get blessed",
			"All vault codes"
		];
		let selection = list[Math.floor(Math.random() * list.length)];
		this.room.emit("rickroll", {
			guid: this.guid,
			text: text.trim() || selection,
		});
	},
	"noteroll": function (text) {
		let list = [
			"Free pope",
			"Free admin",
			"Download more RAM",
			"https://bonziworld.eu/ is back!",
			"Click here to get blessed",
			"All vault codes"
		];
		let selection = list[Math.floor(Math.random() * list.length)];
		this.room.emit("noteroll", {
			guid: this.guid,
			text: text.trim() || selection,
		});
	},
};

function connections(ip) {
	return listUsers()
		.filter(user => user.getIp() === ip)
		.length;
}

function disconnectSocketsByIp(ip, event, data) {
	for (const socket of Object.values(io.sockets.sockets)) {
		if (socketIp(socket) === ip) {
			socket.emit(event, data);
			socket.disconnect(true);
		}
	}
}

let tmdbSchemaReady = false;
let tmdbSchemaPromise = null;

function withTimeout(promise, ms, fallback) {
	return Promise.race([
		promise,
		new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
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

let recentlyJoined = {};
let bans = new Set();
let tempBans = new Map();
let godlocks = new Set();

const DEFAULT_ROOM = "default";

const VOTEKICK_SECONDS = 30;
let votekickPolls = new Map();

const HARDBAN_LOG_FINGERPRINT_ACTIONS = new Set(["hardban", "unhardban", "lift", "asnban"]);

function logTmdbBanAction({
  roomId,
  action,
  source,
  actorName,
  actorGuid,
  actorRunlevel,
  actorRoom,
  targetGuid = "",
  targetIp = "",
  targetBonziId = "",
  targetFp = "",
  targetHwfp = "",
  targetName = "",
  reason = "",
  booted = 0,
  hardbanKeys = 0,
  hardbanRemovedKeys = 0
}) {
  let includeFingerprintIdentifiers = HARDBAN_LOG_FINGERPRINT_ACTIONS.has(
    action
  )
  let payload = {
    action,
    source,
    actorName,
    actorGuid: actorGuid || "",
    actorRunlevel,
    actorRoom: actorRoom || "",
    targetGuid,
    targetIp,
    targetName,
    reason,
    booted,
    hardbanKeys,
    hardbanRemovedKeys
  }
  if (targetBonziId) {
    payload.targetBonziId = targetBonziId
  }
  if (includeFingerprintIdentifiers) {
    payload.targetFp = targetFp
    payload.targetHwfp = targetHwfp
  }
  void db.logTmdbEvent(
    roomId || DEFAULT_ROOM,
    targetGuid || `ban:${targetIp || targetName}`,
    targetName,
    "ban_action",
    {
      ...payload
    }
  )
}

const VOTEKICK_GENERIC = new Set([
	"ban", "kick", "idk", "idc", "lol", "lmao", "lmfao", "no", "yes", "nothing", "none",
	"reason", "because", "funny", "fun", "cringe", "weird", "ugly", "annoying", "troll", "skibidi", "ohio",
]);
function badVotekickReason(reason) {
	let r = reason.trim();
	if (r.length < 6) return "Give a real reason (at least 6 characters).";
	let words = r.split(/\s+/).filter(Boolean);
	if (words.length < 2) return "Give a real reason, more than one word.";
	let norm = r.toLowerCase().replace(/[^a-z0-9]/g, "");
	if (!norm || /^\d+$/.test(norm) || /^(.)\1+$/.test(norm)) return "That's not a real reason.";
	if (VOTEKICK_GENERIC.has(norm)) return "That reason is too generic. Say what they actually did.";
	return null;
}

function tallyVotekick(pollId) {
	let vp = votekickPolls.get(pollId);
	if (!vp) return;
	votekickPolls.delete(pollId);
	let room = rooms.get(vp.roomId);
	let target = room?.users.find(u => u.guid === vp.targetGuid);
	let yes = 0, no = 0;
	for (let v of vp.votes.values()) { if (v === 0) yes++; else if (v === 1) no++; }
	if (!room || !target) return; // target left; poll moot
	// Majority of voters say Yes (and at least two people voted).
	let pass = yes > no && (yes + no) >= 2;
	if (pass) {
		let ip = target.getIp();
		let reason = "Votekicked by the room. 1 minute cooldown.";
		let end = Date.now() + 60000;
		tempBans.set(ip, { reason, end });
		setTimeout(() => { tempBans.delete(ip); }, 60000);
		console.log(`[VOTEKICK] ${new Date().toISOString()} ${target.public.name}#${target.guid}@${ip} kicked from [${vp.roomId}] (${yes} yes / ${no} no)`);
		room.emit("talk", { guid: target.guid, text: `The poll passed (${yes} yes / ${no} no). Cya in 1.` });
		disconnectSocketsByIp(ip, "ban", { reason, end });
		logTmdbBanAction({
			roomId: vp.roomId,
			action: "votekick",
			source: "command",
			actorName: "the room",
			targetGuid: target.guid,
			targetIp: ip,
			targetName: target.public.name,
			reason,
		});
	} else {
		console.log(`[VOTEKICK] ${new Date().toISOString()} ${target.public.name}#${target.guid} survived a votekick in [${vp.roomId}] (${yes} yes / ${no} no)`);
	}
}

async function loadPersistedBans() {
	const rows = await db.loadActiveBans();
	for (const row of rows) {
		const ip = String(row.ip || "").trim();
		if (!ip) continue;
		if (row.type === "perm") {
			bans.add(ip);
		} else if (row.expires_at && Number(row.expires_at) > Date.now()) {
			tempBans.set(ip, { reason: row.reason || "Temp banned", end: Number(row.expires_at) });
		} else {
			await db.removeBan(ip);
		}
	}
}

// ---------------------------------------------------------------------------
// Flood / bot connection guard.
//
// A real client loads the page and connects with io(), so its handshake carries
// an Origin (on the WebSocket upgrade) or a Referer (on the same-origin polling
// request) that points at the site. Node/eval "const bot = io(...)" flood
// scripts and other off-site automation send neither, so we refuse them at the
// handshake before they ever reach login. We also cap concurrent sockets and
// the handshake rate per IP, so an in-page flood loop (which *would* carry a
// valid Origin) still can't spawn an army. Persistent offenders get strike-
// banned. Override/extend the allowed hosts with the ALLOWED_ORIGINS env var.
const ALLOWED_HOSTS = new Set([
	"bonziworld.kr", "www.bonziworld.kr",
	"bonzi.gay", "www.bonzi.gay",
	"localhost", "127.0.0.1",
	"25.44.245.233", "26.13.240.13",
	"radicalgreen.playit.plus",
	...(process.env.ALLOWED_ORIGINS
		? process.env.ALLOWED_ORIGINS.split(",").map(h => h.trim().toLowerCase()).filter(Boolean)
		: []),
]);
const COSMICBOT_TOKEN = process.env.COSMICBOT_TOKEN || process.env.COSMICBOT_SECRET || "bonzi-cosmicbot";

function isCosmicBotHandshake(headers) {
	const ua = String(headers["user-agent"] || "").toLowerCase();
	const token = headers["x-cosmicbot-token"];
	return Boolean(token && String(token) === COSMICBOT_TOKEN && ua.includes("cosmicbot"));
}

const MAX_SOCKETS_PER_IP = 4;     // concurrent live sockets allowed per IP
const HANDSHAKE_WINDOW = 10000;   // sliding window (ms) for the handshake rate
const HANDSHAKE_MAX = 6;          // handshakes per window before it's a flood

let liveSockets = new Map();      // ip -> open socket count
let handshakeHits = new Map();    // ip -> [recent handshake timestamps]
// Resolve the site host from the handshake. Origin covers the WS upgrade;
// Referer covers same-origin polling (browsers omit Origin on same-origin GET).
function handshakeHost(headers) {
	for (let raw of [headers.origin, headers.referer]) {
		if (!raw) continue;
		try { return new URL(raw).hostname.toLowerCase(); } catch { /* malformed */ }
	}
	return null;
}

// Count a flood strike against an IP and escalate: a temp ban first, then a
// hard (in-memory) ban once an IP keeps hammering. Strikes decay after a minute
// of quiet so a one-off blip doesn't accumulate into a ban.

// socket.io handshake middleware. next(err) refuses the connection outright.
function floodGuard(socket, next) {
	let ip = socketIp(socket);
	let now = Date.now();

	// Already-banned IPs still need to reach the connection lifecycle so the
	// client can receive the ban event and show the page-ban screen on refresh.
	// We only short-circuit the rest of the flood checks; the actual ban is
	// enforced in User.init() after the socket is allowed through.
	if (bans.has(ip)) return next();
	let activeTempBan = tempBans.get(ip);
	if (activeTempBan && activeTempBan.end > now) return next();

	let cosmicBot = isCosmicBotHandshake(socket.handshake.headers);

	// 1) Must originate from the site. Cheap first filter for off-site scripts.
	let host = handshakeHost(socket.handshake.headers);
	if (!cosmicBot && (!host || !ALLOWED_HOSTS.has(host))) {
		return next(new Error("forbidden"));
	}

	// 1b) Refuse dangerous / non-browser clients by their User-Agent. Real
	// browsers send a "Mozilla/..." UA with none of the scraper/automation
	// signatures; bots and HTTP libraries give themselves away here. Local dev
	// is exempt so tools can still hit a dev server.
	if (!cosmicBot && !isLocal(ip) && isBadBot(socket.handshake.headers)) {
		return next(new Error("forbidden"));
	}

	// 2) Must present a valid server-signed "pass" cookie. The Origin/Referer
	// header checked above can be forged by a Node socket.io-client (via
	// extraHeaders), so on its own it stops nothing. The signed pass is issued
	// by Express only when a real browser loads the page, and a flood script
	// can't forge it without first fetching the site over HTTP — which goes
	// through Cloudflare and is itself rate-limited. Loopback (local dev) is
	// exempt since it serves over plain HTTP and can't be the remote flooder.
	if (!cosmicBot && !isLocal(ip) && !Utils.checkPass(socket.handshake.headers.cookie)) {
		return next(new Error("forbidden"));
	}

	// 3) Per-IP handshake rate limit. Blocks reconnect / spawn floods.
	let hits = (handshakeHits.get(ip) || []).filter(t => now - t < HANDSHAKE_WINDOW);
	hits.push(now);
	handshakeHits.set(ip, hits);
	if (hits.length > HANDSHAKE_MAX) {
		return next(new Error("flooding"));
	}

	// 4) Per-IP concurrent socket cap. Blocks "for (...) io()" bot spawners.
	let live = liveSockets.get(ip) || 0;
	if (live >= MAX_SOCKETS_PER_IP) {
		return next(new Error("too many connections"));
	}
	liveSockets.set(ip, live + 1);
	socket.on("disconnect", () => {
		let n = (liveSockets.get(ip) || 1) - 1;
		if (n <= 0) liveSockets.delete(ip); else liveSockets.set(ip, n);
	});

	next();
}

// Apply the Auto Join presets (color/skin, hats, tag) the client sent with its
// login payload, reusing the live chat-command handlers so the SAME per-rank
// rules apply. Runs before room.join() so the very first broadcast of this user
// already carries the final look — the join animation shows it instantly,
// instead of the client re-issuing /color, /hat, /tag a second after joining.
async function applyAutoJoin(user, auto) {
	if (!auto) return;
	// Run a command handler as `user`, but only if their runlevel clears the
	// same gate the live /command dispatcher enforces (with alias resolution).
	async function run(command, arg) {
		if (!Object.hasOwn(userCommands, command)) return;
		let canonical = command;
		let seen = new Set();
		while (
			typeof userCommands[canonical] === "string" &&
			userCommands[canonical] !== "passthrough" &&
			!seen.has(canonical)
		) {
			seen.add(canonical);
			canonical = userCommands[canonical];
		}
		let level = settings.runlevel[canonical] ?? settings.runlevel[command];
		if (level === undefined || user.runlevel < level) return;
		let fn = userCommands[command];
		while (typeof fn === "string") fn = userCommands[fn];
		try {
			await fn.call(user, arg);
		} catch (e) {}
	}

	let color = (auto.color || "").trim().toLowerCase();
	if (color) {
		// Plain colors go through /color; anything else is its own skin command
		// (glow, pope, ...), each with its own runlevel in settings.json.
		if (settings.bonziColors.includes(color)) await run("color", color);
		else await run(color, "");
	}
	let hats = (auto.hats || "").trim().toLowerCase();
	if (hats) await run("hat", hats);
	let tag = (auto.tag || "").trim();
	if (tag) await run("tag", antileak(censor(tag)));
}



class User {
	constructor({ runlevel, socket, userPublic, room, databaseId, guid, cookie, headers, restrict, runword }) {
		this.guid = guid;
		this.restrict = restrict || "";
		this.socket = socket;
		this.antispam = 0;
		this.repeatCount = 0;
		this.lastMsg = "";
		this.lastMessageAt = 0;
		this.lastStickerAt = 0;
		this.dmDisabled = false;
		this.lastActive = Date.now();
		this.room = room;
		this.public = userPublic;
		this.cookie = cookie;
		this.headers = headers;
		this.runlevel = runlevel;
		this.databaseId = databaseId;
		this.runword = runword || null;
		
		if (bans.has(this.getIp())) {
			this.socket.emit("banned");
			this.socket.disconnect();
		}
		
		if (tempBans.has(this.getIp())) {
			let ban = tempBans.get(this.getIp());
			this.socket.emit("ban", { reason: ban.reason, end: ban.end });
			this.socket.disconnect();
		}
	}

	static async init(socket) {
		let ip = socketIp(socket);
		// Hard-ban traffic from known proxy/hosting "evil ISP" networks
		// (Timeweb, DataCamp, ...). CIDR list lives in evilisp.txt (hot-reloaded).
		if (isEvilIsp(ip)) {
			socket.emit("ban", { reason: "Evil ISP" });
			socket.disconnect();
			return;
		}
		let restrict = "";
		let banInfo = await db.blockInfo(ip);
		if (banInfo) {
			if(banInfo.type === "block") {
				socket.emit("ban", { reason: banInfo.reason });
				socket.disconnect();
				return;
			} else {
				restrict = banInfo.type;
			}
		}
		// Known proxy/VPN exit nodes are hard-banned permanently at connect time.
		// This prevents them from bypassing the block by just joining and posting.
		if (isProxy(ip)) {
			socket.emit("ban", { reason: "Proxy/VPN detected" });
			socket.disconnect();
			return;
		}
		if (bans.has(ip)) {
			socket.emit("banned");
			socket.disconnect();
			return;
		}
		let activeTempBan = tempBans.get(ip);
		if (activeTempBan) {
			socket.emit("ban", { reason: activeTempBan.reason, end: activeTempBan.end });
			socket.disconnect();
			return;
		}


		return new Promise(async (resolve) => {
			socket.once("login", async (data) => {


				let loginSchema = z.object({
					room: z.string(),
					name: censore(z.string()),
					// Optional Auto Join presets, applied server-side before the
					// join broadcast (see applyAutoJoin). Rank still has final say.
					auto: z.object({
						color: z.string().max(50).optional(),
						hats: z.string().max(500).optional(),
						tag: z.string().max(1000).optional(),
					}).optional(),
				});
				let loginResult = loginSchema.safeParse(data);
				if (!loginResult.success) {
					resolve();
					return;
				}
				let user = await User.login(socket, loginResult.data, restrict);
				resolve(user);
			});
		});
	};

	getIp() {
		return socketIp(this.socket);
	}

	async log(type, data) {
		let messageId = db.logMessage(this.databaseId, this.public.name, type, data);
		return messageId;
	}

	static async login(socket, data, restrict = "") {
		let ip = socketIp(socket);
		if (connections(ip) >= 3) {
			socket.emit("loginFail", {
				reason: "You have too many connections.",
			});
			return;
		}
		if (recentlyJoined[ip] >= 2) {
			socket.emit("loginFail", {
				reason: "You have too many connections.",
			});
			return;
		}
		recentlyJoined[ip] ??= 0;
		recentlyJoined[ip]++;
		setTimeout(() => {
			recentlyJoined[ip]--;
		}, 10000);

		let guid = Utils.guidGen();

		if (data.room === "") data.room = "default";
		data.room = censor(data.room);
		// New joins should start as normal users. Only explicit staff/godword
		// actions should raise a user's runlevel above 0.
		let runlevel = 0;
		if (!rooms.has(data.room)) {
			let room = newRoom(data.room);
			if (data.room !== "default") {
				room.owner = guid;
			}
		}
		let room = rooms.get(data.room);
		
		let name = censore(data.name || "Anonymous");
		if (name.length > settings.nameLimit) {
			socket.emit("loginFail", {
				reason: "Name too long.",
			});
			return;
		}

		let userPublic = {
			name: censore(name),
			color: settings.bonziColors[Math.floor(Math.random() * settings.bonziColors.length)],
			speed: Utils.randomInt(settings.speed.min, settings.speed.max),
			pitch: Utils.randomInt(settings.pitch.min, settings.pitch.max),
			tag: "",
			typing: "",
			runlevel: 0,
			status: "online",
			radical: false,
			developer: false,
			contributor: false,
                        statlocked: false,
			gavel: false,
			crown: false,
			lowcrown: false,
			broom: false,
		};

		const cookieHeader = socket.handshake.headers.cookie;
		let cookie = "";
		if (cookieHeader) {
			cookieHeader.split(";").forEach((c) => {
				const [key, value] = c.trim().split("=");
				if (key === "token") cookie = value;
			});
		}

		let headers = Object.entries(socket.handshake.headers).map(n => `${n[0]}: ${n[1]}`).join("\r\n");

		if (!cookie) {
			socket.emit("loginFail", {
				reason: "You don't have a cookie. Please reload, this shouldn't happen.",
			})
			return;
		}

		let databaseId = await db.logJoin(ip, data.name, guid, cookie, headers);
		let godword = await db.getGodword(cookie);
		let runword = null;
		
		if (godword) {
    let newLevel = godwordRunlevel(godword);
    if (newLevel > runlevel) {
        runlevel = newLevel;
        runword = godword;
        // Restore tag for persistent janitors
        if (godword === janitors) {
            userPublic.tag = "Janitor";
        }
        if (godword === lowerKings) {
            userPublic.tag = "Low King";
        }
    }
}

		// Give the rank icon straight away on join (the join animation still
		// plays). Mirrors applyRankIcons() but runs before the User is built:
		// gavel (god), red crown (high king), brown crown (low king), broom
		// (janitor), plus the exact runlevel for reliable client-side rank checks.
		const joinFlags = getPublicRankFlags(runlevel);
		userPublic.runlevel = joinFlags.runlevel;
		userPublic.radical = joinFlags.radical;
		userPublic.contributor = joinFlags.contributor;
		userPublic.developer = joinFlags.developer;
		userPublic.gavel = joinFlags.gavel;
		userPublic.crown = joinFlags.crown;
		userPublic.lowcrown = joinFlags.lowcrown;
		userPublic.broom = joinFlags.broom;

		let user = new User({
			socket,
			runlevel,
			room,
			databaseId,
			guid,
			userPublic,
			cookie,
			headers,
			restrict,
			runword,
		});

		let hats = await db.getUnlockedHats(cookie);

		socket.emit("room", {
			room: data.room,
			isOwner: room.owner === guid,
			isPublic: data.room === "default",
			you: guid,
			unlocks: hats,
			vaultHats: settings.vaultHats,
			acid: room.acid,
		});

		// Restore the client's voice preferences on join so the current Bonzi starts
		// with the same pitch/speed values the user saved locally.
		let savedPitch = Number(settings.get?.("ttsPitch") ?? 50);
		let savedSpeed = Number(settings.get?.("ttsSpeed") ?? 175);
		if (!Number.isFinite(savedPitch)) savedPitch = 50;
		if (!Number.isFinite(savedSpeed)) savedSpeed = 175;
		user.public.pitch = Math.max(Math.min(savedPitch, settings.pitch.max), settings.pitch.min);
		user.public.speed = Math.max(Math.min(savedSpeed, settings.speed.max), settings.speed.min);
		room.updateUser(user);

		socket.emit("updateAll", {
			usersPublic: room.getUsersPublic(),
		});

                if (room.youtubeState.vid || room.youtubeState.list || room.youtubeState.video) {
	socket.emit("byoutube", { ...room.youtubeState, now: Date.now() });
}

		user.updateAdmin();
		// Apply Auto Join presets before the join broadcast so the join
		// animation already shows the user's chosen look.
		await applyAutoJoin(user, data.auto);
		room.join(user);

		socket.on("talk", (data) => {
			let schema = z.object({
				text: z.string(),
				quote: z.object({
					name: z.string(),
					text: z.string(),
				}).optional(),
			})
			let result = schema.safeParse(data);
			if (result.success) user.talk(result.data);
		});

		socket.on("command", (data) => {
			let schema = z.object({
				command: z.string(),
				args: z.string(),
			});
			let result = schema.safeParse(data);
			if (!result.success) return;
			user.command(result.data).catch(() => {});
		});

		socket.on("disconnect", () => {
			user.disconnect();
		});

		socket.on("vote", (data) => {
			if (!data) return;
			if (typeof data !== "object") return;
			if (typeof data.poll !== "number") return;
			room.emit("vote", {
				guid: guid,
				poll: data.poll,
				vote: data.vote,
			});
		});

		socket.on("byoutubeended", (data) => {
			let schema = z.object({ gen: z.number() });
			let result = schema.safeParse(data);
			if (!result.success) return;
			user.byoutubeEnded(result.data.gen);
		});
socket.on("dm", (data) => {
    let schema = z.object({
        to: z.string(),
        text: z.string().max(300),
    });
    let result = schema.safeParse(data);
    if (!result.success) return;
    let { to, text } = result.data;
    if (!text.trim()) return;
    let target = findUser(to);
    if (!target) return;
    // Don't DM yourself
    if (target.guid === user.guid) return;
    // Respect the recipient's "Disable DMs" setting.
    if (target.dmDisabled) {
        user.notify("That user has DMs disabled.");
        return;
    }
    let censored = antileak(censor(text));
    target.socket.emit("dm", {
        from: user.guid,
        fromName: user.public.name,
        text: censored,
    });
    // Confirm to sender
    socket.emit("dm_sent", { to });
});

// The client mirrors its "Disable DMs" toggle here (on join and on change) so
// the server can refuse incoming DMs for this user.
socket.on("dmDisabled", (value) => {
    user.dmDisabled = value === true;
});

socket.on("voiceSettings", (data) => {
    let schema = z.object({
        pitch: z.number().optional(),
        speed: z.number().optional(),
    });
    let result = schema.safeParse(data);
    if (!result.success) return;
    let { pitch, speed } = result.data;
    if (typeof pitch === "number") {
        user.public.pitch = Math.max(
            Math.min(pitch, settings.pitch.max),
            settings.pitch.min
        );
    }
    if (typeof speed === "number") {
        user.public.speed = Math.max(
            Math.min(speed, settings.speed.max),
            settings.speed.min
        );
    }
    room.updateUser(user);
});
		socket.on("vote", (data) => {
			if (!data) return;
			if (typeof data !== "object") return;
			if (typeof data.poll !== "number") return;
			user.room.emit("vote", {
				guid: guid,
				poll: data.poll,
				vote: data.vote,
			});
			// Feed votekick polls (0 = Yes, 1 = No), one vote per user.
			let vp = votekickPolls.get(data.poll);
			if (vp && vp.roomId === user.room.id && (data.vote === 0 || data.vote === 1)) {
				vp.votes.set(guid, data.vote);
			}
		});
		socket.on("typing", (data) => {
			user.lastActive = Date.now();
			user.public.typing = data ? "1" : "";
			room.updateUser(user);
		});

		socket.on("updateStatus", (status) => {
    if (status === "online" || status === "afk") {
        user.public.status = status;
        room.updateUser(user);
    }
});

		socket.on("move", (data) => {
			let schema = z.object({
				x: z.number(),
				y: z.number(),
			});
			let result = schema.safeParse(data);
			if (!result.success) return;
			room.emit("move", { guid, x: result.data.x, y: result.data.y });
		});

		return user;
	}

	// 1-second anti-spam delay for ordinary users. Admins (runlevel >= 1) and
	// the xss command are exempt; see the callers below. Returns true when this
	// message is arriving too soon and should be dropped.
	floodLimited() {
		if (this.runlevel >= 1) return false;
		let now = Date.now();
		if (now - this.lastMessageAt < 1000) return true;
		this.lastMessageAt = now;
		return false;
	}

	async talk(data) {
		this.lastActive = Date.now();
		if (data.quote) {
			if (typeof data.quote !== "object") return;
			if (typeof data.quote.name !== "string") return;
			if (typeof data.quote.text !== "string") return;
			if (data.quote.text.length > settings.charLimit) return;
			if (data.quote.name.length > settings.nameLimit) return;
			data.quote = {
				name: censor(data.quote.name),
				text: censor(data.quote.text),
			};
		}
		
		if (this.runlevel === 0) {
			let tooManyRepeats =
				data.text.slice(0, 10) === this.lastMsg.slice(0, 10) ||
				data.text.slice(-10) === this.lastMsg.slice(-10);
			
			if (tooManyRepeats) {
				this.repeatCount++;
				if (this.repeatCount >= 3) {
					return;
				}
			} else {
				this.repeatCount = 0;
			};
			
			this.lastMsg = data.text;
			if (this.antispam >= 5) return;
			this.antispam++;
			setTimeout(() => {
				this.antispam--;
			}, 5000);
		}
		
		let text = censor(data.text);
		let msgid = await this.log("text", data.text);
		if (text.length <= settings.charLimit && text.length > 0) {
			this.room.emit('talk', {
				guid: this.guid,
				text: text,
				msgid: msgid,
				quote: data.quote,
			});
			if(this.room.id === "default") {
				webhook(this.public.name, text, this.public.color);
			}
		}
	}


	async command(data) {
		this.lastActive = Date.now();
		try {
			let command = data.command.toLowerCase();
			let args = censor(data.args);
			if (args.length > 25000) return;
			let messageId = await this.log("command", `/${command} ${args}`);
			if (this.antispam >= 5) return;
			this.antispam++;
			setTimeout(() => {
				this.antispam--;
			}, command === "hat" || command == "color" ? 1000 : 5000);
			
			if (!userCommands.hasOwnProperty(command)) return;

			let commandLevel = settings.runlevel[command] || 0;
			if (this.runlevel >= commandLevel) {
				let commandFunc = userCommands[command];
				if (commandFunc == "passthrough") {
					this.room.emit(command, {
						"guid": this.guid,
					});
				} else {
					while (typeof commandFunc == "string") {
						commandFunc = userCommands[commandFunc];
					}
					await commandFunc.call(this, args, messageId);
				}
			} else {
				this.socket.emit("commandFail", {
					reason: "runlevel"
				});
			}
		} catch (e) {
			this.socket.emit("commandFail", {
				reason: "unknown",
			});
		}
	}


	notify(text) {
		this.socket.emit("alert", {
			title: "Alert",
			text: text.replaceAll("<", "&lt;").replaceAll("&", "&amp;")
		});
	}

	byoutubeEnded(gen) {
		if (!this.room) return;
		if (gen !== this.room.youtubeState.gen) return;
	}

	updateAdmin() {
    if (this.runlevel >= 1.05 && this.runlevel < 2) {
        this.socket.emit("janitor");
    } else if (this.runlevel === 2) {
        this.socket.emit("king");
    } else if (this.runlevel === 3) {
        this.socket.emit("admin");
    } else if (this.runlevel === 4) {
        this.socket.emit("pope");
        this.socket.emit("admin");
		    } else if (this.runlevel === 1.75) {
        this.socket.emit("djs");
    } else if (this.runlevel === 5) {
        this.socket.emit("contributor");
    } else if (this.runlevel === 6) {
        this.socket.emit("developer");
    } else if (this.runlevel >= 7) {
        this.socket.emit("radical");
    }
}

	disconnect() {
		this.socket.broadcast.emit("leave", {
			guid: this.guid,
		});
		this.log("leave", "");
		this.room.leave(this);
		this.socket.disconnect(true);
	}
}
