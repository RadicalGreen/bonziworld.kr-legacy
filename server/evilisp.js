// Evil ISP blocklist — loads evilisp.txt and decides whether an IP belongs to a
// banned hosting / proxy / VPN network (ban reason "Evil ISP"), as opposed to
// proxyblocker.txt which only restricts images.
//
// evilisp.txt format (one entry per line):
//   1.2.3.0/24        ban this CIDR (IPv4 or IPv6; a bare IP is a /32 or /128)
//   !1.2.3.4/30       ALLOW exception — never ban this range, even when a wider
//                     banned range covers it (carve a hole in a banned ASN)
//   # === Label ===   section header; following entries are attributed to
//                     "Label" (powers evilIspSource() + evilIspStats())
//   # comment         ignored. Blank lines ignored. Inline "#" also trims.
//
// Beyond a plain matcher this module adds:
//   - allowlist carve-outs (! lines) that override the blocklist
//   - per-source attribution from "# === Label ===" headers (evilIspSource)
//   - a bounded LRU cache for repeated lookups (bots retry from one IP)
//   - debounced hot-reload so a burst of saves reloads exactly once
//   - introspection via evilIspStats()
//
// The file is hot-reloaded on change, so the list updates without a restart.
import { readFileSync, watchFile } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseIp, parseCidr, makeCidrMatcher } from "./iputil.js";

const FILE = new URL("./evilisp.txt", import.meta.url);
const FILE_PATH = fileURLToPath(FILE);

// Whole live dataset, swapped atomically on reload so lookups never observe a
// half-built list.
let state = {
	block: () => false,          // fast boolean membership over banned ranges
	allow: () => false,          // fast boolean membership over allow exceptions
	labeled: { 4: [], 6: [] },   // sorted {start,end,label} for source attribution
	sources: {},                 // label -> count of banned ranges
	blockCount: 0,
	allowCount: 0,
	invalid: 0,
	loadedAt: 0,
};

// --- bounded LRU cache for isEvilIsp(ip) ---------------------------------
// A Map preserves insertion order, so the first key is the least-recently used.
const CACHE_MAX = 4096;
let cache = new Map();

function cacheGet(ip) {
	if (!cache.has(ip)) return undefined;
	const v = cache.get(ip);
	cache.delete(ip);   // re-insert to mark as most-recently used
	cache.set(ip, v);
	return v;
}

function cacheSet(ip, v) {
	cache.set(ip, v);
	if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
}

// "# === Amazon AWS ===" -> "Amazon AWS"; any other comment -> null.
function sectionLabel(line) {
	const m = line.match(/^#\s*=+\s*(.+?)\s*=+\s*$/);
	return m ? m[1].trim() : null;
}

export function reloadEvilIspList() {
	let txt;
	try {
		txt = readFileSync(FILE, "utf8");
	} catch (e) {
		console.error("evilisp: failed to load evilisp.txt:", e.message);
		return state.blockCount;
	}

	const blockEntries = [];
	const allowEntries = [];
	const labeled = { 4: [], 6: [] };
	const sources = {};
	let invalid = 0;
	let label = "ungrouped";

	for (const raw of txt.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line) continue;
		if (line.startsWith("#")) {
			const l = sectionLabel(line);
			if (l) label = l;
			continue;
		}
		const isAllow = line.startsWith("!");
		// strip the "!" marker, socks/http schemes, credentials, and trailing comments
		let body = (isAllow ? line.slice(1) : line).replace(/#.*$/, "").trim();
		body = body.replace(/^(?:socks[45]|https?):\/\/(?:[^@]+@)?/i, "").trim();


		if (body.startsWith("[")) {
			const closingBracket = body.indexOf("]");
			if (closingBracket !== -1) {
				body = body.slice(1, closingBracket);
			}
		} else {
			const colonIdx = body.indexOf(":");
			if (colonIdx !== -1 && body.indexOf(":", colonIdx + 1) === -1) {
				body = body.slice(0, colonIdx);
			}
		}

		if (!body) continue;
		const cidr = parseCidr(body);
		if (!cidr) { invalid++; continue; }
		if (isAllow) {
			allowEntries.push(body);
		} else {
			blockEntries.push(body);
			labeled[cidr.version].push({ start: cidr.start, end: cidr.end, label });
			sources[label] = (sources[label] || 0) + 1;
		}
	}

	for (const v of [4, 6]) {
		labeled[v].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
	}

	state = {
		block: makeCidrMatcher(blockEntries),
		allow: allowEntries.length ? makeCidrMatcher(allowEntries) : () => false,
		labeled,
		sources,
		blockCount: blockEntries.length,
		allowCount: allowEntries.length,
		invalid,
		loadedAt: Date.now(),
	};
	cache = new Map();   // verdicts may have changed

	const extra =
		(allowEntries.length ? `, ${allowEntries.length} allow` : "") +
		(invalid ? `, ${invalid} invalid` : "");
	console.log(
		`evilisp: loaded ${blockEntries.length} blocked ranges across ` +
		`${Object.keys(sources).length} source(s)${extra}`
	);
	return blockEntries.length;
}

reloadEvilIspList();

// Debounced hot-reload: editors often emit several change events for one save,
// so coalesce a burst into a single reload shortly after writes settle.
let reloadTimer = null;
try {
	watchFile(FILE_PATH, { interval: 2000 }, () => {
		if (reloadTimer) clearTimeout(reloadTimer);
		reloadTimer = setTimeout(reloadEvilIspList, 300);
	});
} catch {
	// watching is best-effort
}

// Authoritative test: in a banned range AND not carved out by an allow
// exception. Cached per IP.
export function isEvilIsp(ip) {
	const cached = cacheGet(ip);
	if (cached !== undefined) return cached;
	const evil = state.block(ip) && !state.allow(ip);
	cacheSet(ip, evil);
	return evil;
}

// Best-effort provider label for an IP (the "# === Label ===" section its range
// falls under), or null. Only meaningful when isEvilIsp(ip) is true — lets a
// caller log a specific reason like `Evil ISP (Amazon AWS)`.
export function evilIspSource(ip) {
	const p = parseIp(ip);
	if (!p) return null;
	if (state.allow(ip)) return null;   // carved out -> not attributed
	const arr = state.labeled[p.version];
	if (!arr.length) return null;
	const val = p.value;
	// Binary-search the rightmost range whose start <= val, then walk back over
	// any enclosing (nested) ranges to find one that actually contains val.
	let lo = 0, hi = arr.length - 1, idx = -1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (arr[mid].start <= val) { idx = mid; lo = mid + 1; }
		else hi = mid - 1;
	}
	for (let i = idx, steps = 0; i >= 0 && steps < 2048; i--, steps++) {
		if (arr[i].end >= val) return arr[i].label;
	}
	return null;
}

// Number of banned ranges currently loaded (kept for backward compatibility).
export function evilIspListSize() {
	return state.blockCount;
}

// Introspection: counts, per-source breakdown, cache size, last load time.
export function evilIspStats() {
	return {
		blocked: state.blockCount,
		allow: state.allowCount,
		invalid: state.invalid,
		sources: { ...state.sources },
		v4Ranges: state.labeled[4].length,
		v6Ranges: state.labeled[6].length,
		cacheSize: cache.size,
		loadedAt: state.loadedAt,
	};
}
