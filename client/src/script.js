if (typeof String.prototype.replaceAll === "undefined") {
    String.prototype.replaceAll = function (match, replace) {
        match = match.replace(/[-[\]{}()*+?.\\\/^$|]/g, "\\$&");
        return this.replace(new RegExp(match, "g"), replace);
    }
}

let speak = { play: () => {} };
let setVolume = () => {};
let gravity = false;
let isWaterLoaded = false;

import("./liblipspeak.js").then((mod) => {
    speak = mod.speak;
    setVolume = mod.setVolume;
    setVolume(localStorage.volume / 100);
});

$.contextMenu({
    selector: 'body',
    build: () => {
        return {
            items: {
                "cancel": {
                    name: "Cancel",
                    callback: () => { this.cancel(); }
                },
                "reload": {
                    name: "Reload",
                    callback: () => {
                        location.reload(); 
                    },
                    visible: () => this.id !== me,
                },
"sep1": "---------",
                "settings": {
                    name: "Settings",
                    callback: () => {
                        openSettings();
                    },
                    visible: () => this.id !== me,
                },
                "help": {
                    name: "README",
                    callback: () => {
                        helpPopup();
                    },
                    visible: () => this.id !== me,
                },
"sep1": "---------"
            }
        };
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const cursors = [
        'stopwatch', 
        'handwait', 
        'whatever', 
        'hourglas', 
        'banana', 
        'dinosaur', 
        'horse', 
        'drums', 
        'piano',
        'clockspin',
        'pingpong',
        'windows98'
    ];

    const randomCursor = cursors[Math.floor(Math.random() * cursors.length)];
    const imgElement = document.getElementById('cursorImage');

    if (imgElement) {
        imgElement.className = 'cursor-loading-icon';
        imgElement.src = `./img/cursors/${randomCursor}.gif?v=${Date.now()}`;
    }
});

// Alternate TTS voices (Brian/SAPI4) and the /voice command were removed in 1.7.0.

let me = "";
let admin = false;
let pope = false;
let radical = false;
let hoops = false;
let contributor = false;
let developer = false;
let muted = false;
let king = false;
let janitor = false;
let djs = false;
let blessed = false;
let autorejoin = true;
let blockerror = false;
let unlocks = [];
const dmWindows = new Map(); // peerGuid -> { dialog, logEl, input, peerName }

const { entries, values, keys } = Object;
const { isArray } = Array;
const { seedrandom, random, floor } = Math;

const MOUTH_SPRITES = { CL: 0, E1: 142, E2: 143, E3: 144, E4: 145, O2: 146, O1: 147 };
const PHONEME_TO_MOUTH = {
    "a": MOUTH_SPRITES.E3, "aa": MOUTH_SPRITES.E3, "a:": MOUTH_SPRITES.E3, "A:": MOUTH_SPRITES.E3, "A@": MOUTH_SPRITES.E3,
    "eI": MOUTH_SPRITES.E4, "E": MOUTH_SPRITES.E4, "3": MOUTH_SPRITES.O2, "3:": MOUTH_SPRITES.O2, "e@": MOUTH_SPRITES.E2,
    "i": MOUTH_SPRITES.E4, "i:": MOUTH_SPRITES.E4, "i@": MOUTH_SPRITES.E2, "i@3": MOUTH_SPRITES.E2, "I": MOUTH_SPRITES.E3, 
    "I2": MOUTH_SPRITES.E3, "I#": MOUTH_SPRITES.E3, "aI": MOUTH_SPRITES.E4, "0": MOUTH_SPRITES.E3,
    "oU": MOUTH_SPRITES.O1, "O": MOUTH_SPRITES.E3, "O:": MOUTH_SPRITES.E3, "OI": MOUTH_SPRITES.O1, "O@": MOUTH_SPRITES.O2, "o@": MOUTH_SPRITES.O2,
    "aU": MOUTH_SPRITES.O1, "U": MOUTH_SPRITES.O1, "U@": MOUTH_SPRITES.O2, "u": MOUTH_SPRITES.O1, "u:": MOUTH_SPRITES.O1,
    "V": MOUTH_SPRITES.E4, "a#": MOUTH_SPRITES.E2, "@": MOUTH_SPRITES.E2, "@2": MOUTH_SPRITES.O2, "@-": MOUTH_SPRITES.O2,
    "b": MOUTH_SPRITES.CL, "d": MOUTH_SPRITES.E1, "f": MOUTH_SPRITES.E1, "g": MOUTH_SPRITES.E1, "h": MOUTH_SPRITES.E1,
    "dZ": MOUTH_SPRITES.O1, "Z": MOUTH_SPRITES.O1, "k": MOUTH_SPRITES.E1, "@L": MOUTH_SPRITES.E2, "l": MOUTH_SPRITES.E1,
    "m": MOUTH_SPRITES.CL, "n": MOUTH_SPRITES.E1, "n-": MOUTH_SPRITES.E1, "N": MOUTH_SPRITES.E1,
    "p": MOUTH_SPRITES.CL, "r": MOUTH_SPRITES.O2, "r-": MOUTH_SPRITES.O2, "s": MOUTH_SPRITES.E1, "S": MOUTH_SPRITES.O2,
    "t": MOUTH_SPRITES.E1, "t#": MOUTH_SPRITES.E1, "t2": MOUTH_SPRITES.E1, "T": MOUTH_SPRITES.E1, "tS": MOUTH_SPRITES.O1,
    "D": MOUTH_SPRITES.E1, "v": MOUTH_SPRITES.E1, "w": MOUTH_SPRITES.O1, "j": MOUTH_SPRITES.E1, "z": MOUTH_SPRITES.E1,
    ";": -1, "_": MOUTH_SPRITES.CL, "_:": MOUTH_SPRITES.CL
};

function clamp(min, x, max) {
    return Math.min(Math.max(x, min), max);
}


var recaptchaWidgetId;

      function onRecaptchaLoad() {
        recaptchaWidgetId = grecaptcha.render('submit-btn', {
          'sitekey': '6LdCiUItAAAAAI2CGCEcJuhN1IHJzIckMnDbyyW0',
          'size': 'invisible', 
          'callback': onSubmit 
        });
      }

      function onSubmit(token) {
        console.log("Verification token:", token);
        document.getElementById("my-form").submit();
      }

function s4() {
    return floor((1 + random()) * 0x10000).toString(16).substring(1);
}
// F*ck safari
if (/iP(ad|hone|od)/.test(navigator.userAgent)) {
    let timeout;
    document.addEventListener("touchstart", (e) => {
        if (e.touches.length > 1) {
            clearTimeout(timeout);
            return;
        };
        let touch = e.touches[0];
        timeout = setTimeout(() => {
            let event = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            console.log(e, event);
            e.target.dispatchEvent(event);
        }, 500);
    });
    document.addEventListener("touchend", () => clearTimeout(timeout));
    document.addEventListener("touchmove", () => clearTimeout(timeout));
}


function sanitize(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&apos;");
}

const COLOR_VARIANTS = {
    red: "#ff5f5f",
    orange: "#ff9f43",
    yellow: "#ffe066",
    green: "#6fe98c",
    cyan: "#4edcff",
    blue: "#5aa9ff",
    purple: "#b88cff",
    pink: "#ff82c1",
    black: "#000000",
    white: "#ffffff",
    gray: "#8a8a8a",
    lime: "#79ff79",
    brown: "#9b6b41",
};

// /ingredients data — purely for fun, not an actual cooking guide.
const INGREDIENTS_DATA = {
    pizza: { emoji: "🍕", name: "Pizza", list: ["Pizza dough", "Tomato sauce", "Mozzarella cheese", "Pepperoni or toppings", "Oregano", "Olive oil"] },
    burger: { emoji: "🍔", name: "Burger", list: ["Burger bun", "Beef patty", "Cheese", "Lettuce", "Tomato", "Onion", "Pickles", "Sauce"] },
    hotdog: { emoji: "🌭", name: "Hot Dog", list: ["Hot dog sausage", "Hot dog bun", "Ketchup", "Mustard", "Onions"] },
    fries: { emoji: "🍟", name: "Fries", list: ["Potatoes", "Salt", "Cooking oil"] },
    steak: { emoji: "🥩", name: "Steak", list: ["Beef steak", "Salt", "Black pepper", "Butter", "Garlic", "Herbs"] },
    friedchicken: { emoji: "🍗", name: "Fried Chicken", list: ["Chicken", "Flour", "Eggs", "Breadcrumbs", "Spices", "Cooking oil"] },
    pasta: { emoji: "🍝", name: "Pasta", list: ["Pasta noodles", "Tomato sauce", "Cheese", "Garlic", "Herbs"] },
    taco: { emoji: "🌮", name: "Taco", list: ["Taco shell", "Ground beef", "Lettuce", "Cheese", "Tomato", "Salsa"] },
    cookie: { emoji: "🍪", name: "Cookie", list: ["Flour", "Sugar", "Butter", "Eggs", "Chocolate chips"] },
    cake: { emoji: "🍰", name: "Cake", list: ["Flour", "Sugar", "Eggs", "Milk", "Butter", "Baking powder", "Frosting"] },
    pancakes: { emoji: "🥞", name: "Pancakes", list: ["Flour", "Eggs", "Milk", "Sugar", "Butter"] },
    cola: { emoji: "🥤", name: "Cola", list: ["Carbonated water", "Sugar", "Caramel color", "Caffeine", "Natural flavoring", "Citric acid"], isDrink: true },
    orangejuice: { emoji: "🍊", name: "Orange Juice", list: ["Fresh oranges", "Water (optional)", "Ice", "Sugar (optional)"], isDrink: true },
    lemonade: { emoji: "🍋", name: "Lemonade", list: ["Lemons", "Water", "Sugar", "Ice"], isDrink: true },
    icyorange: { emoji: "🧊", name: "Icy Perfect Orange Drink", list: ["Orange juice", "Ice cubes", "Orange slices", "Sugar", "Sparkling water"], isDrink: true },
    coffee: { emoji: "☕", name: "Coffee", list: ["Coffee beans", "Hot water", "Milk (optional)", "Sugar (optional)"], isDrink: true },
    milkshake: { emoji: "🥛", name: "Milkshake", list: ["Milk", "Ice cream", "Flavor syrup", "Whipped cream"], isDrink: true },
    smoothie: { emoji: "🍓", name: "Smoothie", list: ["Fruit", "Yogurt", "Milk", "Ice"], isDrink: true },
    tea: { emoji: "🍵", name: "Tea", list: ["Tea leaves", "Hot water", "Sugar or honey"], isDrink: true },
    hotchocolate: { emoji: "🍫", name: "Hot Chocolate", list: ["Cocoa powder", "Milk", "Sugar", "Chocolate pieces", "Whipped cream"], isDrink: true },
};
// Aliases so people can type things naturally (spaces, plurals, shorthand).
const INGREDIENTS_ALIASES = {
    "hot dog": "hotdog", "hotdogs": "hotdog", "hot dogs": "hotdog",
    "fried chicken": "friedchicken", "chicken": "friedchicken",
    "pancake": "pancakes",
    "orange juice": "orangejuice", "oj": "orangejuice", "orange": "orangejuice",
    "icy perfect orange drink": "icyorange", "icy orange": "icyorange", "icy drink": "icyorange", "icy perfect drink": "icyorange",
    "hot chocolate": "hotchocolate", "cocoa": "hotchocolate",
    "soda": "cola", "coke": "cola",
    "burgers": "burger", "pizzas": "pizza", "tacos": "taco", "cookies": "cookie", "cakes": "cake",
};
const INGREDIENTS_CATCHPHRASES = [
    (n) => `I know! I will cook some ${n}!`,
    (n) => `I know! I will make some ${n}!`,
    (n) => `I know! I will become a chef and make ${n}!`,
    (n) => `Time to cook! The ingredients for ${n} are:`,
    (n) => `Chef mode activated! Making ${n}!`,
];
const INGREDIENTS_DRINK_CATCHPHRASES = [
    (n) => `I know! I will make some ${n}!`,
    (n) => `I know! I will make an icy perfect drink with some ${n} in!`,
    (n) => `Refreshing time! Let's create a ${n}!`,
    (n) => `Chef mode activated! Making ${n}!`,
];
const INGREDIENTS_OUTRO = [
    "Warning: this recipe is too delicious!",
    "Remember, this is just for fun — not a real cooking guide!",
];

function normalizeColorVariant(value) {
    if (!value) return null;
    let trimmed = String(value).trim();
    if (!trimmed) return null;

    let normalized = trimmed.toLowerCase();
    if (COLOR_VARIANTS[normalized]) return COLOR_VARIANTS[normalized];
    if (/^(#?[0-9a-f]{3,8})$/i.test(normalized)) {
        return normalized.startsWith("#") ? normalized : `#${normalized}`;
    }
    if (/^rgba?\(/i.test(trimmed) || /^hsla?\(/i.test(trimmed)) return trimmed;
    return null;
}

function applyColorMarkup(text) {
    return text.replace(/\$(?:c|color):([^$]+)\$(.*?)\$(?:c|color)\$/gs, (full, color, content) => {
        let normalized = normalizeColorVariant(color);
        if (!normalized) return full;
        return `<span style="color:${normalized}">${markup(content)}</span>`;
    });
}

// Gavel icon shown in the name bubble for popes / god-level admins
// (server sends userPublic.gavel). Uses FontAwesome classes and inline color.

const RADICAL_CAT = `<i class="fa-classic fa-solid fa-cat" style="color:#00ff00;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const HOOPS_CAT = `<i class="fa-classic fa-solid fa-cat" style="color:#e771b5;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const CONTRIBUTOR_ICON = `<i class="fa-solid fa-handshake-angle" style="color:#00c800;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const DEVELOPER_CODE = `<i class="fa-solid fa-code" style="color:#000000;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const POPE_GAVEL = `<i class="fas fa-gavel" style="color:#C0392B;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;

// Rank icons rendered before the name (server sends userPublic.crown/lowcrown/
// broom). High king = gold crown, low king = silver crown, janitor = green broom.
const DJ_MUSIC = `<i class="fa-solid fa-music" style="color:#000000;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const KING_CROWN = `<i class="fa-solid fa-crown" style="color:#B1C02E;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const LOW_KING_CROWN = `<i class="fa-solid fa-crown" style="color:#757575;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const JANITOR_BROOM = `<i class="fa-solid fa-broom" style="color:#4BC02B;vertical-align:-0.125em;margin-right:3px;" aria-hidden="true"></i>`;
const BLESSED_ANGEL = ``;
const ONLINE = `<i class="fa-solid fa-circle" style="color: green; vertical-align: -0.125em; margin-right: 3px;" aria-hidden="true"></i>`;
const AFK = `<i class="fa-solid fa-moon" style="color: #f1c40f; vertical-align: -0.125em; margin-right: 3px;" aria-hidden="true"></i>`;

function appendRankIcons(container, userPublic) {
    if (!userPublic) return;
    if (userPublic.radical) container.insertAdjacentHTML("beforeend", RADICAL_CAT);
    if (userPublic.hoops) container.insertAdjacentHTML("beforeend", HOOPS_CAT);
    if (userPublic.contributor) container.insertAdjacentHTML("beforeend", CONTRIBUTOR_ICON);
    if (userPublic.developer) container.insertAdjacentHTML("beforeend", DEVELOPER_CODE);
    if (userPublic.dj) container.insertAdjacentHTML("beforeend", DJ_MUSIC);
    if (userPublic.gavel) container.insertAdjacentHTML("beforeend", POPE_GAVEL);
    if (userPublic.crown) container.insertAdjacentHTML("beforeend", KING_CROWN);
    if (userPublic.lowcrown) container.insertAdjacentHTML("beforeend", LOW_KING_CROWN);
    if (userPublic.broom) container.insertAdjacentHTML("beforeend", JANITOR_BROOM);
    if (userPublic.angel) container.insertAdjacentHTML("beforeend", BLESSED_ANGEL);
}

// Is this bonzi a janitor? Prefer the server's exact runlevel (reliable, sent in
// userPublic.runlevel); fall back to the broom icon flag if an older/partial
// payload didn't include it.
function isTargetJanitor(bonzi) {
    let rl = bonzi?.userPublic?.runlevel;
    if (typeof rl === "number") return rl === 1.05;
    return !!bonzi?.userPublic?.broom;
}


window.onclick = (e) => {
    let spoiler = e.target.closest("GAY-SPOILER");
    if (spoiler) spoiler.classList.add("reveal");
};

let rules = {
    "**": "b",
    "~~": "i",
    "--": "s",
    "__": "u",
    "``": "code",
    "^^": "gay-big", // these are fine
    "$s$": "gay-schizo",
    "$r$": "gay-rainbow",
    "$g$": "gay-greenoutline",
    "$i$": "gay-spin",
    "$j$": "gay-jump",
    "$h$": "gay-handwrite",
    "$l$": "gay-lucida",
    "*b*": "horror-fx",
    "!t!": "gay-tiny",
    "?o?": "gay-blur",
    "||": "gay-spoiler",
    //"%%": "marquee", 
}

function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
    return Math.abs(h);
}

const SCHIZO_MARKS = ["̴", "̵", "̶", "̷", "̸", "̹", "̺", "̻", "̼", "ͅ", "͇", "͈", "͉", "͍", "͎", "͓", "͚", "͛", "͆", "̚", "̕", "͠", "͜", "͢", "҉", "͞"];
const SCHIZO_GUILT = "IT'S ALL YOUR FAULT";

function schizoText(text, intensity = 1) {
    let out = "";
    for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        out += ch;
        if (/\s/.test(ch)) continue;
        let seed = (hash(`${text}:${i}:${ch}`) + i * 17) >>> 0;
        let count = intensity + seed % Math.max(2, intensity + 1);
        for (let j = 0; j < count; j++) {
            out += SCHIZO_MARKS[(seed + j * 7) % SCHIZO_MARKS.length];
        }
    }
    return out;
}

function schizoRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function initSchizoElement(el) {
    if (!el || el.dataset.schizoLive) return;
    el.dataset.schizoLive = "1";
    let base = el.dataset.schizoBase ? decodeURIComponent(el.dataset.schizoBase) : (el.textContent || "");
    el.dataset.schizoBase = encodeURIComponent(base);
    let rng = schizoRng(hash(`${base}|${el.innerHTML}`));
    if (!el.querySelector(".schizo-main")) {
        let original = el.innerHTML;
        el.innerHTML = `<span class="schizo-main">${original}</span><span class="schizo-overlay" hidden aria-hidden="true"></span>`;
    }
    let overlay = el.querySelector(".schizo-overlay");
    if (!overlay) return;

    let clearState = () => {
        if (!el.isConnected) return;
        overlay.hidden = true;
        overlay.textContent = "";
        el.classList.remove("schizo-burst", "schizo-guilt");
    };

    let runCombo = (remaining) => {
        if (!el.isConnected) return;
        if (remaining <= 0) {
            clearState();
            let wait = 2500 + Math.floor(rng() * 6500);
            setTimeout(() => runCombo(1 + Math.floor(rng() * 5)), wait);
            return;
        }

        let guilt = rng() < 0.35;
        if (guilt) {
            overlay.textContent = SCHIZO_GUILT;
            overlay.hidden = false;
            el.classList.remove("schizo-burst");
            el.classList.add("schizo-guilt");
            setTimeout(() => runCombo(remaining - 1), 1000);
            return;
        }

        overlay.textContent = schizoText(base, 3 + Math.floor(rng() * 4));
        overlay.hidden = false;
        el.classList.remove("schizo-guilt");
        el.classList.add("schizo-burst");
        setTimeout(() => runCombo(remaining - 1), 1000 + Math.floor(rng() * 2000));
    };

    let wait = 1800 + Math.floor(rng() * 4200);
    setTimeout(() => runCombo(1 + Math.floor(rng() * 5)), wait);
}

function initSchizoMarkup(root = document) {
    for (let el of root.querySelectorAll ? root.querySelectorAll("gay-schizo") : []) initSchizoElement(el);
}

function watchSchizoMarkup() {
    if (typeof MutationObserver === "undefined" || watchSchizoMarkup.started) return;
    watchSchizoMarkup.started = true;
    initSchizoMarkup(document);
    let observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches("gay-schizo")) initSchizoElement(node);
                initSchizoMarkup(node);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function applyMarkupEffects(html) {
    let template = document.createElement("template");
    template.innerHTML = html;
    for (let el of template.content.querySelectorAll("gay-schizo")) {
        el.dataset.schizoBase = encodeURIComponent(el.textContent || "");
        let walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (let node of nodes) node.nodeValue = schizoText(node.nodeValue, 1);
    }
    return template.innerHTML;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchSchizoMarkup, { once: true });
else watchSchizoMarkup();

function extractYoutubeId(text) {
    let match = text.match(/(?:(?:m\.|www\.)?youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
}
function markup(text) {
    text = sanitize(text);
    text = text
        .replace(/(^|\\n)(&gt;.*?)($|\\n)/g, "$1<span class=\"greentext\">$2</span>$3")
        .replaceAll("\\n", "<br>");

    let tokenList = keys(rules).sort((a, b) => b.length - a.length);

    let parts = [];
    let i = 0;
    while (i < text.length) {
        let matched = false;
        for (let token of tokenList) {
            if (text.slice(i, i + token.length) === token) {
                parts.push({ type: "token", token });
                i += token.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            if (parts.length > 0 && parts[parts.length - 1].type === "text") {
                parts[parts.length - 1].value += text[i];
            } else {
                parts.push({ type: "text", value: text[i] });
            }
            i++;
        }
    }

    let stack = [];
    let result = "";
    for (let part of parts) {
        if (part.type === "text") {
            result += part.value;
            continue;
        }
        let token = part.token;
        let tag = rules[token];
        let idx = stack.indexOf(token);
        if (idx === -1) {
            stack.push(token);
            result += `<${tag}>`;
        } else {
            let toReopen = [];
            while (stack.length > idx + 1) {
                let inner = stack.pop();
                result += `</${rules[inner]}>`;
                toReopen.push(inner);
            }
            stack.pop();
            result += `</${tag}>`;
            for (let r of toReopen.reverse()) {
                stack.push(r);
                result += `<${rules[r]}>`;
            }
        }
    }

    while (stack.length > 0) {
        let token = stack.pop();
        result += `</${rules[token]}>`;
    }

    text = result;
    text = text
        .replaceAll("{FRANCE}", "<img src=\"./img/icon/france.svg\" class=\"flag\" alt=\"\u{1F1EB}\u{1F1F7}\">")
        .replace(/(https?:\/\/[^\s<>"']+)/g, "<a target=\"_blank\" href=\"$1\">$1</a>");
    return applyMarkupEffects(text);
}


function nmarkup(text) {
    while (text.includes("^^") || text.includes("||") || text.includes("\\n") || text.includes("%%")) {
        text = text.replaceAll("^^", "").replaceAll("||", "").replaceAll("\\n", "").replaceAll("%%", "");
    }
    text = text.replace(/\$(?:c|color):([^$]+)\$(.*?)\$(?:c|color)\$/g, "$2");
    return markup(text);
}

function misolate(text) {
    let tokens = [];
    for (let i = 0; i < text.length; i++) {
        for (let token of keys(rules)) {
            if (text.slice(i, i + token.length) === token) {
                if (tokens.includes(token)) {
                    tokens.splice(tokens.indexOf(token), 1);
                } else {
                    tokens.unshift(token);
                }
            }
        }
    }
    return text + tokens.join("");
}

function nisolate(text) {
    while (text.includes("^^") || text.includes("||") || text.includes("\\n")) {
        text = text.replaceAll("^^", "").replaceAll("||", "").replaceAll("\\n", "");
    }
    return misolate(text);
}

// Inline TTS lang-switch tags, e.g. "[[_^_zh]]" or "[[_^_en-us]]".
// Kept in `say` for the speech engine, stripped from the visible `text`.
const LANG_TAG_RE = /\s*\[\[_\^_[a-zA-Z-]+\]\]\s*/g;

function markdownToSpeech(say, french) {
    return say
        .replace(/\|\|.+?(\|\||$)/g, french ? "divulgacher" : "spoiler")
        .replace(/\^\^|\$r\$|\$s\$|\$g\$|!t!|\?o\?|\*\*|--|~~|__|\$j\$|\$h\$|\*b\*|\\n|%%/g, "")
        .replace(/\$(?:c|color):([^$]+)\$(.*?)\$(?:c|color)\$/g, "$2");
}

const pollColors = [
    ["lime", "#cfc", "#060"],
    ["red", "#fcc", "#600"],
    ["#0055ff", "#cceeff", "#036"],
    ["yellow", "#ffc", "#660"],
    ["magenta", "#fcf", "#606"],
];

function createPoll(poll, opt = {}) {
    let element = document.createElement("div");
    element.classList.add("poll");
    element.classList.add(`poll_${poll.id}`);
    
    let html = `${markup(poll.title)}<br>`;
    
    if (poll.image) {
        html += `<img src="${sanitize(poll.image)}" class="poll-image" style="max-width: 100%; max-height: 200px; margin: 5px 0;"><br>`;
    }
    
    poll.options.forEach((option, i) => {
        html += `<div class="poll_option option_${i}">${nmarkup(option)}: <span class="option_number">0</span></div>`;
    });
    
    element.innerHTML = html;
    element.poll = poll;
    
    poll.options.forEach((option, i) => {
        let optionElement = element.querySelector(`.option_${i}`);
        optionElement.onclick = () => {
            socket.emit("vote", {
                poll: poll.id,
                vote: i,
            });
            if (opt.onvote) opt.onvote({ vote: i });
        };
        let [color1, color2, border] = pollColors[i % pollColors.length];
        let percent = 1 / poll.options.length * 100;
        optionElement.style.backgroundImage = 
            `linear-gradient(to right, ${color1} ${percent}%, ${color2} ${percent}%)`;
        optionElement.style.borderColor = border;
    });

    return element;
}

function updatePoll(id, voterId, vote) {
    let elements = document.querySelectorAll(`.poll_${id}`);
    if (elements.length === 0) return;
    let poll = elements[0].poll;
    if (vote !== null) poll.votes[voterId] = vote;
    

    let counts = new Array(poll.options.length).fill(0);
    Object.values(poll.votes).forEach(v => {
        if (v >= 0 && v < counts.length) counts[v]++;
    });
    
    let totalVotes = Object.values(poll.votes).length;
    
    for (let element of elements) {
        poll.options.forEach((_, i) => {
            let count = counts[i];
            let percentage = count / totalVotes * 100;
            let [color1, color2] = pollColors[i];
            
            element.querySelector(`.option_${i} .option_number`).innerText = count;
            element.querySelector(`.option_${i}`).style.backgroundImage = 
                `linear-gradient(to right, ${color1} ${percentage}%, ${color2} ${percentage}%)`;
        });
    }
}

let lastZ = 1;
let dragged = null;
let dragX = 0;
let dragY = 0;
let chatLogDragged = false;

let colors = ["purple", "blue", "magenta", "green", "yellow", "red", "pink", "brown", "maroon", "black", "cyan", "black", "pope", "blessed", "white"];
let hats = ["tophat", "bfdi", "bieber", "evil", "elon", "emoji", "kamala", "maga", "troll", "bucket", "obama", "dank", "witch", "wizard", "cat", "sunglasses", "idiot", "chain"]

let quote = null;
let lastUser = "";

function time() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let hourString = String(hours % 12).padStart(2, "0");
    let minuteString = String(minutes).padStart(2, "0");
    let ampm = hours >= 12 ? "PM" : "AM";
    return `${hourString}:${minuteString} ${ampm}`;
}

function bonzilog(id, name, html, color, text, single, msgid) {
    // hacky
    // remind me to rewrite this as this is the biggest peice of dogshit
    let icon = "";
    let scrolled = chat_log_content.scrollHeight - chat_log_content.clientHeight - chat_log_content.scrollTop <= 20;
    if (color) {
        let [baseColor, ...hats] = color.split(" ");
        const baseColorToken = (baseColor || "_").trim().toLowerCase();
        const fallbackColorToken = baseColorToken === "_" ? "purple" : "_";
        icon = `<div class="log_icon">
            <img class="color" src="img/pfp/${baseColorToken}.webp" onerror="this.onerror=null;this.src='img/pfp/${fallbackColorToken}.webp'">
            ${hats.map(hat => `<img class="hat" src="img/pfp/${hat}.webp" onerror="this.onerror=null;this.remove()">`).join(" ")
            }
        </div>`;
    } else {
        icon = `<div class="log_left_spacing"></div>`;
    }
    let thisUser = `${id};${name};${color}`;
    let showDelete = (admin || king) && msgid;
    if (thisUser !== lastUser || single) {
        let timeString = `<span class="log_time">${time()}</span>`;
        chat_log_content.insertAdjacentHTML("beforeend", `
            <hr>
            <div class="log_message" ${msgid ? `id="msg_${msgid}"` : ""}>
                ${icon}
                <div class="log_message_cont">
                    <div class="reply"></div>
                    ${showDelete ? "<div class=\"delete\"></div><div class=\"ban\"></div>" : ""}
                    <span><b>${nmarkup(name)}</b> ${name ? timeString : ""}</span>
                    <div class="log_message_content">${html} ${name ? "" : timeString}</div> 
                </div>
            </div>`);
        lastUser = single ? "" : thisUser;
    } else {
        chat_log_content.insertAdjacentHTML("beforeend", `
            <div class="log_message log_continue" ${msgid ? `id="msg_${msgid}"` : ""}>
                <div class="reply"></div>
                ${showDelete ? "<div class=\"delete\"></div><div class=\"ban\"></div>" : ""}
                <div class="log_left_spacing"></div>
                <div class="log_message_cont">
                    <div class="log_message_content">${html}</div>
                </div>
            </div>`);
    }
    chat_log_content.lastChild.querySelector(".reply").onclick = () => {
        quote = { name, text };
        if (id === "server") quote.name = "SERVER";
        talkcard.innerHTML = `Replying to ${nmarkup(quote.name)}`;
        chat_message.focus();
        talkcard.hidden = false;
    };
    chat_log_content.lastChild.onauxclick = (e) => {
        if (e.button === 1) {
            cmd(`delete ${msgid}`);
        }
    };
    if (showDelete) {
    const targetUserName = name;
    const targetMessage = text;
    
    let banDurationText = "";
    if (admin) {
        banDurationText = "PERMANENT BAN (irreversible)";
    } else {
        banDurationText = "You do not have permission to ban.";
    }
        chat_log_content.lastChild.querySelector(".delete").onclick = () => {
            cmd(`delete ${msgid}`);
        };
    chat_log_content.lastChild.querySelector(".ban").onclick = () => {
        const confirmDialog = new Dialog({
            title: "Confirm Ban",
            width: 580,
            height: 'auto',
            center: true,
            resizable: false,
            bodyClass: "alert_body",
            html: `
                <div style="display: flex; flex-direction: row; gap: 12px; padding: 8px;">
                    <img src="/img/desktop/error.png" width="32" height="32" style="flex-shrink: 0;">
                    <div style="flex: 1;">
                        <p style="color: #a00; font-weight: bold; margin-bottom: 8px;">ONLY USE LOG BAN ON:</p>
                        <ul style="margin: 4px 0 8px 20px;">
                            <li>Porncucks (users who post porn)</li>
                            <li>Gorecucks (users who post gore)</li>
                            <li>Illegal content posters – examples:
                                <ul style="margin-left: 20px;">
                                    <li>CSAM (child sexual abuse material)</li>
                                    <li>Revenge porn / non-consensual intimate images</li>
                                    <li>Doxxing (posting personal info without consent)</li>
                                    <li>Terrorist/extremist content</li>
                                    <li>Bestiality / zoophilia content</li>
                                </ul>
                            </li>
                            <li>Degens (serial trolls, hate speech, etc.)</li>
                            <li>People who rejoin to ruin people's day (ban evaders)</li>
                        </ul>
                        <p style="color: #a00; font-weight: bold;">DO NOT USE LOG BAN ON:</p>
                        <ul style="margin: 4px 0 8px 20px;">
                            <li>Racist people – they deserve regular temporary bans, not permabans</li>
                            <li>People the king specifically dislikes – this is not a personal weapon</li>
                            <li>Test subjects or randoms just because you can</li>
                        </ul>
                        <p style="color: #a00; font-weight: bold;">If the user is not doing any of the first list, click Cancel – don't test it on randoms.</p>
                        <p><em>Failure to follow the correct procedure may result in loss of moderation permissions.

Use log ban only on users listed in the “ONLY USE LOG BAN ON” list, not on the "DO NOT USE LOG BAN ON" list. Do not apply bans to users outside of that list. Moderation actions must be accurate and consistent.</em></p>
                        <p><strong>User:</strong> ${nmarkup(targetUserName)}</p>
                        <p><strong>Message:</strong> ${markup(targetMessage)}</p>
                        <p style="margin-top: 12px;"><strong>Your ban will be:</strong> ${banDurationText}</p>
                        <p style="color: #a00;">This action is IRREVERSIBLE.</p>
                        <p>Are you absolutely sure you want to ban this user?</p>
                    </div>
                </div>
                <div class="alert_button_row" style="margin-top: 8px; justify-content: space-between; flex-direction: row-reverse;">
                    <button class="xp-button" id="confirm-ban-yes">BAN</button>
                    <button class="xp-button" id="confirm-ban-no">Cancel</button>
                </div>
            `,
        });
        const header = confirmDialog.headerElement;
header.onpointerdown = (e) => {
    e.stopPropagation();
    dragged = confirmDialog;
    // Get the actual pixel positions from the element's style
    const left = parseFloat(confirmDialog.element.style.left);
    const top = parseFloat(confirmDialog.element.style.top);
    dragX = e.pageX - (isNaN(left) ? confirmDialog.x || 0 : left);
    dragY = e.pageY - (isNaN(top) ? confirmDialog.y || 0 : top);
};
        const yesBtn = confirmDialog.element.querySelector("#confirm-ban-yes");
        const noBtn = confirmDialog.element.querySelector("#confirm-ban-no");
        yesBtn.onclick = () => {
            socket.emit("command", {
                command: "logban",
                args: msgid,
            });
            confirmDialog.element.remove();
        };
        noBtn.onclick = () => {
            confirmDialog.element.remove();
        };
        };
    }
    if (scrolled) {
        chat_log_content.scrollTop = chat_log_content.scrollHeight;
    }
}

function isImageColor(color) {
    return false;
}

function resolveBonziAssetToken(token) {
    const normalizedToken = (token || "").split(" ")[0].trim().toLowerCase();
    const fallbackByColor = {
    };
    return fallbackByColor[normalizedToken] || normalizedToken;
}

function resolveBonziAssetUrl(token) {
    const assetToken = resolveBonziAssetToken(token);
    const extension = "webp";
    return `url("img/bonzi/${assetToken}.${extension}")`;
}

function toBgImg(name, color) {
    return resolveBonziAssetUrl(color);
}

function toHatImg(color) {
    let [base, ...hats] = color.split(" ");
    return hats.map(hat => resolveBonziAssetUrl(hat)).reverse().join(", ");
}

let logJoins = false;
let chatLogView = "chat";

function setChatLogView(mode) {
    chatLogView = mode;
    chat_log_content.hidden = mode !== "chat";
    chat_log_rank_log.hidden = mode !== "rank";
    if (chat_log_mode_button) {
        chat_log_mode_button.textContent = mode === "chat" ? "Kings/Popes" : "Back to Chat";
        chat_log_mode_button.hidden = !(admin || king || pope || radical);
    }
}

function resetRankLogView() {
    if (!chat_log_rank_log) return;
    chat_log_rank_log.innerHTML = '<div class="rank_log_placeholder">No king or pope actions yet.</div>';
}

function appendRankLogEntry(text) {
    if (!chat_log_rank_log) return;
    chat_log_rank_log.querySelector(".rank_log_placeholder")?.remove();
    const entry = document.createElement("div");
    entry.className = "rank_log_entry";
    entry.innerHTML = text ? nmarkup(text) : "";
    chat_log_rank_log.appendChild(entry);
    chat_log_rank_log.scrollTop = chat_log_rank_log.scrollHeight;
}

class Bonzi {
    #mediaReady = false;

    constructor(id, userPublic) {
        this.userPublic = userPublic || {
            name: "BonziBUDDY",
            color: "purple",
            speed: 175,
            pitch: 50,
            voice: "en-us",
        };
        this.color = this.userPublic.color;
        this.data = window.BonziData;

        this.eventList = [];
        this.eventFrame = 0;
        this.currentAnim = "idle";
        this.animFrame = 0;
        this.sprite = 0;
        this.lipTimings = [];
        this.lipStartTime = 0;

        this.mute = false;
        this.id = id || s4() + s4();
        this.dvdBounceTimer = null;
        this.dvdBounceDirectionX = 1;
        this.dvdBounceDirectionY = 1;

        this.rng = new seedrandom(this.id || random());
        this.abortController = new AbortController();

        this.element = document.createElement("div");
        this.element.classList.add("bonzi");
        this.element.setAttribute("data-guid", this.id);
        this.element.style.backgroundImage = this.toBgImg();
        this.applyBgSizing();

        this.hatLayer = document.createElement("div");
        this.hatLayer.classList.add("bonzi_hat");
        this.hatLayer.style.backgroundImage = toHatImg(this.color);
        this.element.appendChild(this.hatLayer);
        this.element.style.zIndex = lastZ++;
        this.nametag = document.createElement("div");
        this.nametag.classList.add("bonzi_name");
        this.element.appendChild(this.nametag);
        this.tag = document.createElement("div");
        this.tag.classList.add("bonzi_tag");
        this.element.appendChild(this.tag);
this.bubble = document.createElement("div");
this.bubble.classList.add("bubble");
this.bubble.hidden = true; // <-- This already handles the hiding instantly!

this.bubbleCont = document.createElement("div");
this.bubbleCont.classList.add("bubble_cont");
this.bubble.appendChild(this.bubbleCont);
        this.element.appendChild(this.bubble);
        content.appendChild(this.element);

        this.updateName();
        this.updateSprite();
        this.updateTag();

        this.element.onpointerdown = (e) => {
            if (this.bubble.contains(e.target)) return;
            if (e.which === 1) {
                if (!gravity) dragged = this;
                dragX = e.pageX - this.x;
                dragY = e.pageY - this.y;
                this.lastX = this.x;
                this.lastY = this.y;
                this.element.style.zIndex = lastZ++;
            }
            if (e.which === 2) {
                this.cancel();
                this.mute = !this.mute;
                this.updateName();
            }
        };
        this.element.addEventListener("contextmenu", (e) => {
            if (this.bubble.contains(e.target)) e.stopPropagation();
        });
        this.element.onclick = (e) => {
            if (this.bubble.contains(e.target)) return;
            if (this.x === this.lastX && this.y === this.lastY) {
                this.cancel();
            }
        };

        this.shuffle();
        this.element.id = s4() + s4();

        this.banReason = "Unknown";
        $.contextMenu({
            selector: `#${this.element.id}`,
            build: () => {
                return {
                    items: {
                        "cancel": {
                            name: "Cancel",
                            callback: () => { this.cancel(); }
                        },
                        "dm": {
    name: "Direct message",
    callback: () => {
        const u = usersPublic.get(this.id) || {};
        openDmWindow(this.id, u.name || "User");
    },
    visible: () => this.id !== me,
},
                        "mute": {
                            name: () => this.mute ? "Unmute" : "Mute",
                            callback: () => {
                                this.cancel();
                                this.mute = !this.mute;
                                this.updateName();
                            }
                        },
                        "asshole": {
                            name: "Call an Asshole",
                            callback: () => {
                                cmd(`asshole ${this.userPublic.name}`);
                            }
                        },
                        "bass": {
                            name: "Call a Bass",
                            callback: () => {
                                cmd(`bass ${this.userPublic.name}`);
                            }
                        },
                        "userinfo": {
                            name: "User Info",
                            callback: () => userInfoPopup(this.userPublic, this.id),
                        },
                        "hi": {
                            name: "Say Hello",
                            callback: () => {
								if (muted === true) return;
                                socket.emit("talk", {
                                    text: `Hello, ${this.userPublic.name}!`,
                                });
                            },
                        },
                        "hey": {
                            name: "Call Out",
                            isHtmlName: true,
                            callback: () => {
								if (muted === true) return;
                                socket.emit("talk", {
                                    text: `Hey, ${this.userPublic.name}!`,
                                });
                            }
                        },
                        "stupidbitch": {
                            name: "Call an Stupid Bitch",
                            callback: () => {
								if (muted === true) return;
                                socket.emit("talk", {
                                    text: `Hey ${this.userPublic.name} guess what? you're a stupid bitch! you're a stupid fucking bitch! I can't believe how dumb you are...`,
                                });
                            },
                        },
                        "fun": {
                            name: "Fun (Mod)",
                            items: {
                                "bless": {
                                    name: "Bless",
                                    callback: () => {
                                        cmd(`bless ${this.id}`);
                                    },
                                },
                                "debless": {
                                    name: "Debless",
                                    callback: () => {
                                        cmd(`debless ${this.id}`);
                                    },
                                },
                                "nameedit": {
                                    name: "Change Name",
                                    callback: () => {
                                        cmd(`nameedit ${this.id} ${prompt("give this nophono a name")}`);
                                    },
                                },
                                "tagedit": {
                                    name: "Change Tag",
                                    callback: () => {
                                        cmd(`tagedit ${this.id} ${prompt("give this nophono a tag")}`);
                                    },
                                },
                                "troll": {
                                    name: "Trollify",
                                    callback: () => {
										cmd(`troll ${this.id}`);
                                    },
                                },
                                "kirovify": {
                                    name: "Kirovify",
                                    callback: () => {
										cmd(`kirovify ${this.id}`);
                                    },
                                },
                                "bombify": {
                                    name: "Bombify",
                                    callback: () => {
                                        cmd(`bombify ${this.id}`);
                                    },
                                    visible: () => admin || king,
                                },
                                "nuke": {
                                    name: "NUKE",
                                    callback: () => {
                                        cmd(`nuke ${this.id}`);
                                    }
                                },
                            },
                            visible: () => admin || king,
                        },
                        "mod": {
                            name: "Mod",
                            items: {
                                "banreason": {
                                    name: "Ban/Kick Reason",
                                    type: "text",
                                    value: this.banReason,
                                    events: {
                                        input: (e) => {
                                            this.banReason = e.target.value;
                                        },
                                    },
                                },
                                "removeuser": {
                                    name: "Play Kitty Cat Dance",
                                    callback: () => {
                                        cmd(`removeuser ${this.id}`);
                                    },
                                },
								        "reloaduser": {
            name: "Reload user",
            callback: () => {
                cmd(`reloaduser ${this.id}`);
            },
        },
                                "kick": {
                                    name: "Kick",
                                    callback: () => {
                                        cmd(`kick ${this.id} ${this.banReason}`);
                                    },
                                },
                                "tempban": {
                                    name: "Temp Ban (5m)",
                                    callback: () => {
                                        cmd(`tempban short ${this.id} ${this.banReason}`);
                                    },
                                },
                                "tempban2": {
                                    name: "Temp Ban (1h)",
                                    callback: () => {
                                        cmd(`tempban long ${this.id} ${this.banReason}`);
                                    },
                                },
                                "shush": {
                                    name: "Shush",
                                    callback: () => {
                                        cmd(`shush ${this.id}`);
                                    },
                                },
                            },
                            visible: () => admin || king,
                        },
                        // FIXED
"pope": {
    name: "godmode",
    items: {
        "ban": {
            name: "Ban",
            callback: () => { cmd(`ban ${this.id} ${this.banReason}`); },
            visible: () => admin,
        },
                                "coloredit": {
                                    name: "Change Color",
                                    callback: () => {
										cmd(`coloredit ${this.id} ${prompt("give this nophono a color")}`);
                                    },
                                },
                                "hatedit": {
                                    name: "Change Hat",
                                    callback: () => {
										cmd(`hatedit ${this.id} ${prompt("give this nophono a hat")}`);
                                    },
                                },
        "jannify": {
            name: () => this.userPublic.broom ? "Dejannify" : "Jannify",
            callback: () => { cmd(`${this.userPublic.broom ? "dejannify" : "jannify"} ${this.id}`); },
            visible: () => pope,
        },
        "nofuckoff": {
            name: "No Fuck Off",
            callback: () => {
                cmd(`nofuckoff ${this.id}`);
            },
            visible: () => pope,
        },
    },
    visible: () => admin,
},
"developer": {
    name: "developer",
    items: {
        "statlock": {
            name: "Stats Lock",
            callback: () => {
                cmd(`statlock ${this.id}`);
            },
            visible: () => developer || radical,
        },
            "asnban": {
            name: "ASN Ban",
            callback: () => {
                cmd(`asnban ${this.id} ${this.banReason}`);
            },
            visible: () => developer || radical,
        },
    },
    visible: () => developer || radical,
},
"radical": {
    name: "radical",
    items: {
        "promote": {
            name: "Promote to Low King",
            callback: () => {
                cmd(`promote ${this.id}`);
            },
            visible: () => radical,
        },
        "promotehighking": {
            name: "Promote to High King",
            callback: () => {
                cmd(`promotehighking ${this.id}`);
            },
            visible: () => radical,
        },
                                        "promotepope": {
                                    name: "Promote to Pope",
                                    callback: () => {
                                        cmd(`promotepope ${this.id}`);
                                    },
                                    visible: () => radical,
                                },
                                        "promotedev": {
                                    name: "Promote to Developer",
                                    callback: () => {
                                        cmd(`promotedev ${this.id}`);
                                    },
                                    visible: () => radical,
                                },
                                        "promotecont": {
                                    name: "Promote to Contributor",
                                    callback: () => {
                                        cmd(`promotecont ${this.id}`);
                                    },
                                    visible: () => radical,
                                },
        "demote": {
            name: "Demote",
            callback: () => {
                cmd(`fullydemote ${this.id}`);
            },
        },
                                "forcevaporwave": {
                                    name: "Force vaporwave",
                                    callback: () => {
                                        cmd(`forcevaporwave ${this.id}`);
                                    },
                                },
                                "forceunvaporwave": {
                                    name: "Force unvaporwave",
                                    callback: () => {
                                        cmd(`forceunvaporwave ${this.id}`);
                                    },
                                },
                                "volumeedit": {
                                    name: "Change their client's volume",
                                    callback: () => {
										cmd(`volumeedit ${this.id} ${prompt("what do u want this nophono's volume to be lol")}`);
                                    },
                                },
    },
        visible: () => radical && !developer,
},
            // "janny": {
//                             name: "Janny",
//                             items: {
//                                 "jkick": {
//                                     name: "Kick",
//                                     callback: () => { cmd(`jkick ${this.id}`); },
//                                 },
//                                 // "jban": {
//                                 //      name: "Ban (1 min)",
//                                 //      callback: () => { cmd(`jban ${this.id}`); },
//                                 // },
//                                 "jnuke": {
//                                     name: "Nuke",
//                                     callback: () => { cmd(`jnuke ${this.id}`); },
//                                 },
//                             },
//                             // Janitors only, and not on other staff (hide when the
//                             // target shows any staff icon). The server enforces this
//                             // too — this is just to keep the menu clean.
//                             visible: () => janitor && !this.userPublic.gavel && !this.userPublic.crown && !this.userPublic.broom,
//                         },
                    }
                };
            },
            animation: {
                duration: 175,
                show: 'fadeIn',
                hide: 'fadeOut'
            }
        });
        this.eventList = [{
            type: "anim",
            anim: "surf_intro",
            ticks: 30
        }, { type: "idle" }];
        this.ttsCrashUntil = 0;
        if (gravity) {
            this.element.classList.add("box2d");
            addElement(this.element);
        }
    }

    toBgImg() {
        return toBgImg(this.userPublic.name, this.color);
    }

    applyBgSizing() {
        this.element.style.backgroundSize = "";
        this.element.style.backgroundRepeat = "";
    }

    move(x, y) {
        if (arguments.length !== 0) {
            this.x = x;
            this.y = y;
        }
        let max = this.maxCoords();
        let min = this.minCoords();
        this.x = clamp(min.x, this.x, max.x);
        this.y = clamp(min.y, this.y, max.y);
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.updateDialog();
    }

    runEvent(list) {
        if (this.mute) return;
        this.cancel();
        this.eventList = [{ type: "idle" }, ...list, { type: "idle" }];
    }

    clearDialog() {
        this.bubbleCont.textContent = "";
        this.bubble.hidden = true;
        this.stopSpeaking();
    }

    cancel() {
        this.clearDialog();
        this.eventList = [{ type: "idle" }];
        this.eventFrame = 0;
    }

    stopSpeaking() {
        this.abortController.abort();
        this.abortController = new AbortController();
        if (this.voiceSource) {
            this.voiceSource.stop();
        }
        this.lipTimings = [];
        this.lipStartTime = 0;
    }

    setSprite(sprite) {
        this.sprite = sprite;
        this.element.style.backgroundPositionX = `-${sprite % 12 * 200}px`;
        this.element.style.backgroundPositionY = `-${floor(sprite / 12) * 160}px`;
        this.hatLayer.hidden = !(sprite === 0 || sprite >= 142);
    }

    setAnim(anim) {
        this.currentAnim = anim;
        this.animFrame = 0;
    }
    
    update() {
        let anim = this.data.sprite.animations[this.currentAnim];
        let frame = anim[this.animFrame];
        while (typeof frame === "string") {
            this.setAnim(frame);
            anim = this.data.sprite.animations[this.currentAnim];
            frame = anim[this.animFrame];
        }
        if (frame != null) this.setSprite(frame);
        this.animFrame++;

        if (this.eventList.length === 0) {
            return;
        }
        let nextEvent = () => {
            this.eventList.shift();
            this.eventFrame = 0;
        };
        let event = this.eventList[0];
        let eventType = event.type;
        switch (eventType) {
            case "anim":
    if (this.eventFrame === 0) {
        this.setAnim(event.anim);
        if (event.anim === "grin_fwd") {
            new Audio("sfx/ding.mp3").play().catch(() => {});
        }
        if (event.anim === "backflip") {
            new Audio("sfx/backflip.wav").play().catch(() => {});
        }
    }
    this.eventFrame++;
    if (this.eventFrame >= event.ticks) {
        nextEvent();
    }
    break;
                break;
                if (this.eventFrame === 0) {
                    this.setAnim(event.anim);
                }
                this.eventFrame++;
                if (this.eventFrame >= event.ticks) {
                    nextEvent();
                }
                break;
            case "text":
                if (this.eventFrame === 0) {
                    this.talk(event.text, event.say, {
                        quote: event.quote,
                        french: event.french,
                        xss: event.xss,
                        msgid: event.msgid,
                        sticker: event.sticker,
                    });
                    this.eventFrame = 1;
                };
                if (this.bubble.hidden) nextEvent();
                break;
            case "idle":
                if (this.eventFrame === 0) {
                    this.eventFrame = 1;
                    let toIdle = this.data.to_idle[this.currentAnim];
                    if (toIdle) {
                        this.setAnim(toIdle);
                    } else {
                        this.setAnim("idle");
                    }
                }
                if (this.sprite === 0) {
                    nextEvent();
                }
                break;
            case "add_random":
                let pool = event.pool;
                let index = floor(pool.length * this.rng());
                let events = pool[index];
                nextEvent();
                for (let e of events.toReversed()) {
                    this.eventList.unshift(e);
                }
                break;
            case "image":
                if (this.eventFrame === 0) {
                    this.#showImage(event.url, event.msgid);
                }
                this.eventFrame++;
                if (this.eventFrame > 15 * 10) this.clearDialog();
                if (this.bubble.hidden && this.#mediaReady) nextEvent();
                break;
            case "video":
                if (this.eventFrame === 0) {
                    this.#showVideo(event.url, event.msgid);
                }
                this.eventFrame++;
                let video = this.bubble.querySelector("video");
                if (!video?.paused || document.fullscreenElement === video) this.eventFrame = 1;
                if (this.eventFrame > 15 * 10) this.clearDialog();
                if (this.bubble.hidden && this.#mediaReady) nextEvent();
                break;
            case "youtube":
    if (this.eventFrame === 0) {
        this.#showYoutube(event.id, event.msgid);
    }
    this.eventFrame++;
    if (this.bubble.hidden) nextEvent();
    break;
            case "poll":
                if (this.eventFrame === 0) {
                    this.#showPoll(event.id, event.text, event.options, event.image);
                }
                this.eventFrame++;
                if (this.eventFrame > 15 * 30) this.clearDialog();
                if (this.bubble.hidden) nextEvent();
                break;
			case "rickroll":
				if (this.eventFrame === 0) {
					this.#showRickroll(event.text);
				}
				this.eventFrame++;
				if (this.eventFrame > 15 * 10 && this.bubbleCont.querySelector("a")) this.clearDialog();
				if (this.bubble.hidden) nextEvent();
        }
    }
    
    updateLipsync() {
        if (this.lipTimings.length > 0 && this.lipStartTime > 0) {
            let ms = performance.now() - this.lipStartTime;
            let pho = "_";
            for (let i = 0; i < this.lipTimings.length; i++) {
                if (ms < this.lipTimings[i][0]) break;
                pho = this.lipTimings[i][1];
            }
            let mouthSprite = PHONEME_TO_MOUTH[pho];
            if (this.sprite === 0 || this.sprite >= 142) {
                if (mouthSprite != null && mouthSprite !== -1) {
                    this.setSprite(mouthSprite);
                }
            }
        }
    }

    talk(text, say, { quote, french, msgid, xss, sticker } = {}) {
        if (say == null) say = text;
        this.stopSpeaking();
        this.bubble.hidden = false;
        this.bubble.style.opacity = "1";
        text = text
            .replaceAll("{NAME}", nisolate(this.userPublic.name.replaceAll("$", "$$")))
            .replaceAll("{COLOR}", this.color);
        if (say != null) {
            say = say
                .replaceAll("{NAME}", this.userPublic.name)
                .replaceAll("{COLOR}", this.color);
            say = markdownToSpeech(say, french);
        }

        if (french) {
            text = "{FRANCE} " + text;
            say = "[[_^_fr]] " + say;
        }

        let quoteHTML = "";
        if (quote) {
            quoteHTML = `
                <blockquote>
                    ${markup(quote.text)}
                </blockquote>
                <font color="blue">@${nmarkup(quote.name)}</font>
            `;
            if (!say.startsWith("-")) say = `at ${markdownToSpeech(quote.name, french)}, ${say}`;
        }
        let stickerHtml = null;
        if (sticker) {
            let stickerUrl = sticker;
            if (!sticker.startsWith("/") && !sticker.includes(".")) {
                stickerUrl = `/img/sticker/${encodeURIComponent(sticker)}.png`;
            }
            stickerHtml = `<img class="sticker" src="${stickerUrl}" draggable="false">`;
        }
        let html = `${quoteHTML}${stickerHtml ?? (text === "{TOPJEJ}" ? "<img src='./img/misc/topjej.png'>" : xss ? text : markup(text)) }`;
        for (let word of wordBlacklist) {
            word = word.trim().toLowerCase();
            if (word.length === 0) continue;
            if (text.toLowerCase().includes(word)) {
                html = `This message was blacklisted. <button data-html="${sanitize(html)}" onclick="this.parentElement.innerHTML = this.getAttribute('data-html')">Show</button>`;
                say = "-";
                break;
            }
        }

        this.bubbleCont.innerHTML = html;
        // The XSS payload already "plays" once when it's injected into the bubble
        // above. Inserting the same raw html into the chat log would execute it a
        // second time (insertAdjacentHTML runs scripts/handlers too), so log a
        // safe placeholder instead.
        let logHtml = sticker ? stickerHtml : xss ? text : html;
        bonzilog(this.id, this.userPublic.name, logHtml, this.color, text, quoteHTML !== "", msgid);
        if (!say.startsWith("-")) {
            speak.play(say, {
                "pitch": this.userPublic.pitch,
                "speed": this.userPublic.speed
            }, () => {
                if (!text.includes("||")) this.clearDialog();
            }, (source, lip) => {
                this.voiceSource = source;
                this.lipStartTime = performance.now();
                this.lipTimings = lip;
            }, this.abortController.signal);
        }
    }


    joke() { this.runEvent(this.data.event_list_joke); }

    joke2(jokes = []) {
        if (jokes.length > 0) {
            const jokeIndex = Math.floor(this.rng() * Math.floor(jokes.length / 2)) * 2;
            const parts = jokes.slice(jokeIndex, jokeIndex + 2);
            this.runEvent([
                { type: "text", text: "HEY YOU IDIOTS IT'S TIME FOR ANOTHER JOKE" },
                { type: "anim", anim: "shrug_fwd", ticks: 15 },
                ...parts.map((text) => ({ type: "text", text })),
                { type: "anim", anim: "shrug_back", ticks: 15 },
                { type: "text", text: "i made those jokes like 743287813428741327714970503291 years ago." },
            ]);
            return;
        }
        this.runEvent(this.data.event_list_joke2);
    }

    fact() { this.runEvent(this.data.event_list_fact); }

    gokid() { this.runEvent(this.data.event_list_gokid); }

	rickroll(text) {
		this.runEvent([{ type: "rickroll", text }]);
	}

	#showRickroll(text) {
		for (let word of wordBlacklist) {
            word = word.trim().toLowerCase();
            if (word.length === 0) continue;
			if (text.toLowerCase().includes(word)) {
				text = "(blacklisted rickroll)";
			}
		}
		let anchor = `
			<a
				href="#"
				style="color:blue;"
				onclick="this.parentElement.innerHTML=\`
					<video class='uservideo' autoplay controls>
						<source src='/astley.mp4'></source>
					</video>
				\`;"
			>
				${sanitize(text)}
			</a>`;
        speak.play(text, {
            pitch: this.userPublic.pitch,
            speed: this.userPublic.speed,
        }, () => {}, (source, lip) => {
            this.voiceSource = source;
            this.lipStartTime = performance.now();
            this.lipTimings = lip;
        }, this.abortController);
        this.bubbleCont.innerHTML = anchor;
        this.bubble.hidden = false;
        this.bubble.style.opacity = "1";
        bonzilog(this.id, this.userPublic.name, anchor, this.color, `(LINK) ${text}`, false);
		
	}

    poll(id, text, options = ["Yes", "No"], image = "") {
        this.runEvent([{ type: "poll", id, text, options, image }]);
    }

    #showPoll(id, text, options, image = "") {
        let poll = {
            id: id,
            title: text,
            options: options,
            image: image,
            votes: [],
        };
        for (let word of wordBlacklist) {
            word = word.trim().toLowerCase();
            if (word.length === 0) continue;
            if (text.toLowerCase().includes(word) || options.some(option => option.toLowerCase().includes(word))) {
                this.talk("(blacklisted poll)", "-");
                return;
            }
        }
        let element = createPoll(poll, { 
            onvote() {
                this.eventFrame = 1;
            }
        });
        this.bubbleCont.textContent = "";
        this.bubbleCont.appendChild(element);
        this.bubble.hidden = false;
        this.bubble.style.opacity = "1";
        let element2 = createPoll(poll);
        let scrolled = chat_log_content.scrollHeight - chat_log_content.clientHeight - chat_log_content.scrollTop <= 1;
        bonzilog(this.id, this.userPublic.name, "", this.color, `(POLL) ${text}`, true);
        chat_log_content.lastChild.querySelector(".log_message_content").appendChild(element2);
        if (scrolled) {
            chat_log_content.scrollTop = chat_log_content.scrollHeight;
        }
        speak.play(markdownToSpeech(text), {
            "pitch": this.userPublic.pitch,
            "speed": this.userPublic.speed
        }, () => { }, (source, lip) => {
            this.voiceSource = source;
            this.lipStartTime = performance.now();
            this.lipTimings = lip;
        }, this.abortController.signal);
    }

    image(url, msgid) {
        this.runEvent([{ type: "image", url, msgid }]);
    }

    #showImage(url, msgid) {
        this.#mediaReady = false;
        let image = new Image();
        image.src = url;
        image.onload = () => {
            let html = `<img src="${sanitize(url)}" class="userimage">`;
            if (localStorage.hideImages === "true") {
                html = `This image is hidden. <button data-html="${sanitize(html)}" onclick="this.parentElement.innerHTML = this.getAttribute('data-html')">Show</button>`;
            }
            this.bubbleCont.innerHTML = html;
            this.bubble.hidden = false;
            this.bubble.style.opacity = "1";
            this.#mediaReady = true;
            bonzilog(this.id, this.userPublic.name, html, this.color, `(IMAGE)`, false, msgid);
        };
    }

    video(url, msgid) {
        this.runEvent([{ type: "video", url, msgid }]);
    }

// taken from mickai.me 
	youtube(id, msgid) {
		this.runEvent([{
			type: "youtube",
			id,
			msgid,
		}]);
	}

// taken from mickai.me
	#showYoutube(id, msgid) {
		this.#mediaReady = true;
		let safe = String(id).replace(/[^A-Za-z0-9_-]/g, "");
		let msgId = sanitize(String(msgid ?? ""));
		// Direct cross-origin embed - works in all browsers now that the site
		// no longer sends COEP (see liblipspeak.js de-WASM note).
		let src = `https://www.youtube-nocookie.com/embed/${safe}?autoplay=0&loop=1&playlist=${safe}&modestbranding=1&playsinline=1`;
		let html = `<iframe class="useryoutube" src="${sanitize(src)}" data-msgid="${msgId}" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" scrolling="no" frameborder="0" style="width:100%;aspect-ratio:1/1;display:block;"></iframe>`;
		let logHtml = `<a href="${sanitize(`https://www.youtube.com/watch?v=${safe}`)}" target="_blank" rel="noopener">` +
			`<img class="userimage" src="https://i.ytimg.com/vi/${safe}/hqdefault.jpg" alt="YouTube video"></a>`;
		if (localStorage.hideYouTube === "true") {
			html = `This video is hidden. <button data-html="${sanitize(html)}" onclick="this.parentElement.innerHTML = this.getAttribute('data-html')">Show</button>`;
			logHtml = `This video thumbnail is hidden. <button data-html="${sanitize(logHtml)}" onclick="this.parentElement.innerHTML = this.getAttribute('data-html')">Show</button>`;
		}
        this.bubbleCont.innerHTML = html;
        this.bubble.hidden = false;
        this.bubble.style.opacity = "1";
		bonzilog(this.id, this.userPublic.name, logHtml, this.color, `(YOUTUBE)`, false, msgid);
	}

    #showVideo(url, msgid) {
        this.#mediaReady = false;
        let video = document.createElement("video");
        video.src = url;
        video.onloadeddata = () => {
            this.#mediaReady = true;
        };
        let html = `<video class="uservideo" controls><source src="${sanitize(url)}" crossorigin="anonymous"></video>`;
        if (localStorage.hideImages === "true") {
            html = `This video is hidden. <button data-html="${sanitize(html)}" onclick="this.parentElement.innerHTML = this.getAttribute('data-html')">Show</button>`;
        }
        this.bubbleCont.innerHTML = html;
        this.bubble.hidden = false;
        this.bubble.style.opacity = "1";
        bonzilog(this.id, this.userPublic.name, html, this.color, `(VIDEO)`, false, msgid);
    }

    exit() {
        if (this.leaving) return;
        this.leaving = true;
        this.runEvent([{
            type: "anim",
            anim: "surf_away",
            ticks: 30
        }]);
        setTimeout(() => {
            this.deconstruct();
            bonzis.delete(this.id);
        }, 2000);
    }

    deconstruct() {
        this.stopSpeaking();
        if (dragged === this) {
            dragged = null;
        }
        this.element.remove();
    }

    updateName() {
        let typing = "";
        
        if (this.mute) {
            typing = `<img src="/img/mute.png" style="vertical-align:middle;margin-left:3px;height:1em;">`;
        } else if (this.userPublic.typing) {
            typing = `<img src="/img/talkingdot.gif" style="vertical-align:middle;margin-left:3px;height:1em;">`;
        };
        const name = nmarkup(this.userPublic.name);
        const renderedName = /<[a-z]/i.test(name) ? name : nmarkup(name);
        this.nametag.innerHTML = "";

        let iconContainer = document.createElement("span");
        iconContainer.className = "bonzi_rank_icons";
        appendRankIcons(iconContainer, this.userPublic);
        this.nametag.appendChild(iconContainer);

        let nameContainer = document.createElement("span");
        nameContainer.className = "bonzi_name_text";
        nameContainer.innerHTML = renderedName;
        this.nametag.appendChild(nameContainer);

        if (typing) {
            let typingContainer = document.createElement("span");
            typingContainer.className = "bonzi_typing_icon";
            typingContainer.innerHTML = typing;
            this.nametag.appendChild(typingContainer);
        }
    }

    updateTag() {
        this.tag.innerHTML = nmarkup(this.userPublic.tag);
    }

    backflip(swag) {
        var event = [{
            type: "anim",
            anim: "backflip",
            ticks: 15
        }];
        if (swag) {
            event.push({
                type: "anim",
                anim: "cool_fwd",
                ticks: 30
            });
            event.push({
                type: "idle"
            });
        }
        this.runEvent(event);
    }

    grin() {
        this.runEvent([{
            type: "anim",
            anim: "grin_fwd",
            ticks: 15
        }]);
    }

    grounded(target) {
        this.runEvent(
            [{
                type: "text",
                text: `Hey, ${nisolate(target)}!`
            }, {
                type: "text",
                text: "Guess what!"
            }, {
                type: "text",
                text: "YOU"
            }, {
                type: "text",
                text: "ARE"
            }, {
                type: "text",
                text: "^^**GROUNDED!"
            }, {
                type: "anim",
                anim: "grin_fwd",
                ticks: 15
            }]
        );
    }

    ingredients(query) {
        let key = (query || "").trim().toLowerCase();
        key = INGREDIENTS_ALIASES[key] || key.replace(/[^a-z]/g, "");
        let item = INGREDIENTS_DATA[key] || INGREDIENTS_DATA[INGREDIENTS_ALIASES[(query || "").trim().toLowerCase()]];

        if (!item) {
            this.runEvent([{
                type: "text",
                text: `I don't know how to make "${sanitize(query || "")}"! Try /ingredients pizza, cola, tacos...`,
                say: "I don't know how to make that!"
            }]);
            return;
        }

        let phrasePool = item.isDrink ? INGREDIENTS_DRINK_CATCHPHRASES : INGREDIENTS_CATCHPHRASES;
        let catchphrase = phrasePool[floor(this.rng() * phrasePool.length)](item.name);
        let outro = INGREDIENTS_OUTRO[floor(this.rng() * INGREDIENTS_OUTRO.length)];
        let ingredientLines = item.list.map(i => `- ${i}`).join("\\n");

        this.runEvent([
            {
                type: "text",
                text: `Ok, {NAME} I want to make some ${item.name}!`,
                say: `Ok, I want to make some ${item.name}!`
            },
            {
                type: "text",
                text: catchphrase,
                say: catchphrase
            },
            {
                type: "text",
                text: `${item.emoji} **${item.name}**:\\n${ingredientLines}`,
                say: `Here are the ingredients for ${item.name}.`
            },
            {
                type: "text",
                text: outro,
                say: outro
            },
            {
                type: "anim",
                anim: "backflip",
                ticks: 15
            },
            {
                type: "anim",
                anim: "grin_fwd",
                ticks: 15
            }
        ]);
    }


    updateDialog() {
        let max = this.maxCoords();
        this.bubble.classList.remove("bubble-top");
        this.bubble.classList.remove("bubble-left");
        this.bubble.classList.remove("bubble-right");
        this.bubble.classList.remove("bubble-bottom");
        let bubbleRect = this.bubble.getBoundingClientRect();
        if (this.data.size.x + bubbleRect.width > max.x) {
            if (this.y < innerHeight / 2 - this.data.size.x / 2) {
                this.bubble.classList.add("bubble-bottom");
            } else {
                this.bubble.classList.add("bubble-top");
            }
        } else {
            if (this.x < innerWidth / 2 - this.data.size.x / 2) {
                this.bubble.classList.add("bubble-right");
            } else {
                this.bubble.classList.add("bubble-left");
            }
        }
    }

    minCoords() {
        return {
            x: chat_log.getBoundingClientRect().width || 0,
            y: 0,
        };
    }

    maxCoords() {
        return {
            x: innerWidth - this.data.size.x,
            y: innerHeight - this.data.size.y - chat_bar.getBoundingClientRect().height,
        };
    }

    asshole(target) {
        this.runEvent(
            [{
                type: "text",
                text: `Hey, ${nisolate(target)}!`
            }, {
                type: "text",
                text: "You're a fucking asshole!",
                say: "your a fucking asshole!"
            }, {
                type: "anim",
                anim: "grin_fwd",
                ticks: 15
            }]
        );
    }

    butthole(target) {
        this.runEvent(
            [{
                type: "text",
                text: `Hey, ${nisolate(target)}!`
            }, {
                type: "text",
                text: "You're a flipping butthole!",
                say: "your a flipping butthole!"
            }, {
                type: "anim",
                anim: "grin_fwd",
                ticks: 15
            }]
        );
    }

 bass(target) {
        this.runEvent(
            [{
                type: "text",
                text: `Hey, ${nisolate(target)}!`
            }, {
                type: "text",
                text: "You're a fucking bass!",
                say: "your a fucking bass!"
            }, {
                type: "anim",
                anim: "grin_fwd",
                ticks: 15
            }]
        );
    }

    owo(target) {
        this.runEvent(
            [{
                type: "text",
                text: `*notices ${nisolate(target)}'s BonziBulge™*`,
                say: `notices ${target}s bonzibulge`
            }, {
                type: "text",
                text: "owo, wat dis?",
                say: "oh woah, what diss?"
            }]
        );
    }

    updateSprite() {
        this.cancel();
        this.element.style.backgroundImage = this.toBgImg();
        this.applyBgSizing();
        this.hatLayer.style.backgroundImage = toHatImg(this.color);
        this.move();
    }

    explode() {
        let explosion = document.createElement("div");
        explosion.className = "explosion";
        explosion.style.left = this.x + "px";
        explosion.style.top = this.y + "px";
        document.body.appendChild(explosion);
        this.element.style.zIndex = "999999"; // show above chat log
        let sfx = new Audio("./explosion.mp3");
        sfx.play();
        let rot = 0;
        let x = 0;
        let y = 0;
        let angvel = Math.random() * 30 + 20;
        if (Math.random() > 0.5) angvel *= -1;
        let xvel = Math.random() * 10 + 5;
        if (Math.random() > 0.5) xvel *= -1;
        let yvel = -20;
        let i = 0;
        let interval = setInterval(() => {
            i++;
            yvel += 2;
            x += xvel;
            rot += angvel;
            y += yvel;
            this.element.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
            if (i > 120) {
                clearInterval(interval);
                explosion.remove();
            }
        }, 33)
    }

    stopDvdBounce() {
        if (this.dvdBounceTimer) {
            clearInterval(this.dvdBounceTimer);
            this.dvdBounceTimer = null;
        }
    }

    dvdbounce(speed = 2) {
        if (speed === 0) {
            this.stopDvdBounce();
            return;
        }
        this.stopDvdBounce();
        const speedMap = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 9 };
        const step = speedMap[speed] ?? speedMap[2];
        const intervalMs = Math.max(12, 40 - speed * 4);
        this.dvdBounceDirectionX = Math.random() > 0.5 ? 1 : -1;
        this.dvdBounceDirectionY = Math.random() > 0.5 ? 1 : -1;

        this.dvdBounceTimer = setInterval(() => {
            if (dragged === this || this.leaving) return;
            let maxCoords = this.maxCoords();
            let minCoords = this.minCoords();
            this.x += this.dvdBounceDirectionX * step;
            this.y += this.dvdBounceDirectionY * step;

            if (this.x <= minCoords.x) {
                this.x = minCoords.x;
                this.dvdBounceDirectionX = 1;
            } else if (this.x >= maxCoords.x) {
                this.x = maxCoords.x;
                this.dvdBounceDirectionX = -1;
            }

            if (this.y <= minCoords.y) {
                this.y = minCoords.y;
                this.dvdBounceDirectionY = 1;
            } else if (this.y >= maxCoords.y) {
                this.y = maxCoords.y;
                this.dvdBounceDirectionY = -1;
            }

            this.move(this.x, this.y);
        }, intervalMs);
    }

    shuffle() {
        let maxCoords = this.maxCoords();
        let minCoords = this.minCoords();
        this.x = minCoords.x + (maxCoords.x - minCoords.x) * Math.random();
        this.y = minCoords.y + (maxCoords.y - minCoords.y) * Math.random();
        this.move();
    }
}

window.onresize = () => {
    for (let bonzi of bonzis.values()) {
        bonzi.move();
    }
};

chat_log_resize.onpointerdown = (e) => {
    chatLogDragged = true;
    dragX = e.pageX - chat_log_resize.getBoundingClientRect().left;
};

const NORTH = 0;
const SOUTH = 1;
const EAST = 0;
const WEST = 1;

let lastMoveEmit = 0;
window.onpointermove = (e) => {
    if (dragged) {
        dragged.move(e.pageX - dragX, e.pageY - dragY);
        socket.emit("move", { x: dragged.x, y: dragged.y });
    }
    if (chatLogDragged) {
        window.onresize();
        chat_log.style.width = `${e.pageX - dragX}px`;
    }
    if (resizing) {
        let dx = e.pageX - resizeStartX;
        let dy = e.pageY - resizeStartY;
        let { dialog, handle } = resizing;
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;

        if (handle.includes("n")) {
            newHeight = resizeStartHeight - dy;
        }
        if (handle.includes("s")) {
            newHeight = resizeStartHeight + dy;
        }
        if (handle.includes("e")) {
            newWidth = resizeStartWidth + dx;
        }
        if (handle.includes("w")) {
            newWidth = resizeStartWidth - dx;
        }

        dialog.resize(newWidth, newHeight, {
            vertical: handle.includes("n") ? NORTH : SOUTH,
            horizontal: handle.includes("e") ? EAST : WEST,
        });
    }
};

window.onpointerup = () => {
    dragged = null;
    chatLogDragged = false;
    resizing = null;
};

btn_tile.onclick = () => {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;
    let minY = 0;
    let addY = 80;
    let x = 0, y = 0;
    for (let bonzi of bonzis.values()) {
        bonzi.move(x, y);

        x += 200;
        if (x + 100 > winWidth) {
            x = 0;
            y += 160;
            if (y + 160 > winHeight) {
                minY += addY;
                addY /= 2;
                y = minY;
            }
        }
    }
};

function bonzisCheck() {
    let safeBonzis = new Set;
    for (let [key, public] of usersPublic.entries()) {
        if (hiddenBonziGuids.has(key)) continue;
        if (!bonzis.has(key)) {
            let bonzi = new Bonzi(key, public);
            bonzis.set(key, bonzi);
            safeBonzis.add(bonzi);
            if (logJoins) {
                let msg = `${nmarkup(public.name)} has joined.`;
                bonzilog("server", "", msg, null, msg, true);
            }
        } else {
            let bonzi = bonzis.get(key);
            let oldName = bonzi.userPublic.name;
            let oldTyping = bonzi.userPublic.typing;
            let oldGavel = bonzi.userPublic.gavel;
            let oldCrown = bonzi.userPublic.crown;
            let oldLowCrown = bonzi.userPublic.lowcrown;
            let oldBroom = bonzi.userPublic.broom;
            let oldDJ = bonzi.userPublic.dj;
             let oldAngel = bonzi.userPublic.angel;
            bonzi.userPublic = public;
            if (oldName !== public.name) {
                let msg = `${nisolate(oldName)} is now known as ${nisolate(public.name)}.`;
                bonzilog("server", "", markup(msg), null, msg, true)
            }
            if (oldTyping !== public.typing || oldName !== public.name || oldGavel !== public.gavel || oldCrown !== public.crown || oldLowCrown !== public.lowcrown || oldBroom !== public.broom || oldAngel !== public.angel || oldDJ !== public.dj ) {
                bonzi.updateName();
            }
            bonzi.updateTag();
            if (bonzi.color != public.color) {
                bonzi.color = public.color;
                bonzi.updateSprite();
            }
            safeBonzis.add(bonzi);
        }
        if (key === me) {
            start_menu_name.value = public.name;
            start_menu_pfp.style.backgroundImage = public.color.split(" ").map(color => `url("/img/pfp/${color}.webp")`).reverse().join(", ");
            for (let preview of document.getElementsByClassName("preview")) {
                preview.style.backgroundImage = public.color.split(" ").map(color => `url("/img/bonzi/${resolveBonziAssetToken(color)}.webp")`).reverse().join(", ");
            }
        }
    }
    usercount.innerText = usersPublic.size;
    for (let bonzi of bonzis.values()) {
        if (!safeBonzis.has(bonzi)) {
            bonzi.exit();
        }
    }

};

setInterval(() => {
    for (let bonzi of bonzis.values()) {
        bonzi.update();
    }
}, 66.67);

let socket = io("//");


let usersPublic = new Map;
let bonzis = new Map;
let hiddenBonziGuids = new Set();

function removeBonziFromView(guid) {
    hiddenBonziGuids.add(guid);
    usersPublic.delete(guid);

    document.querySelectorAll(`.bonzi[data-guid="${guid}"]`).forEach((node) => node.remove());

    const bonzi = bonzis.get(guid);
    if (bonzi) {
        bonzi.stopSpeaking();
        bonzi.clearDialog();
        bonzi.stopDvdBounce();
        bonzi.eventList = [{ type: "idle" }];
        bonzi.eventFrame = 0;
        bonzi.bubble.remove();
        bonzi.nametag.remove();
        bonzi.tag.remove();
        bonzis.delete(guid);
    }
}

login_name.value = localStorage.name || "";

var recaptchaWidgetId = null;
var isVerified = false;
var recaptchaToken = "";




function login() {

    // Everything below runs synchronously once the captcha finishes and flips 'isVerified' to true
    socket.emit("login", {
        name: login_name.value,
        room: login_room.value,
        auto: autoJoinPresets(),
    });
    
    localStorage.name = login_name.value;

    if (typeof login_load !== 'undefined' && login_load) {
        login_load.style.display = "block"; 
    }
    
    if (typeof login_tips !== 'undefined' && login_tips) {
        login_tips.style.display = "block"; 
        login_readme.style.display = "none";
        login_card.style.display = "none";
    }

    if (login_load) void login_load.offsetHeight;

    if (typeof login_card !== 'undefined' && login_card) {
        
        setTimeout(() => { login_card.style.display = "none"; }, 0);
    }

    if (typeof login_readme !== 'undefined' && login_readme) {
        
        setTimeout(() => { login_readme.style.display = "none"; }, 0);
    }

    // Reset the flag so future login attempts work if needed
    isVerified = false; 

    setup();
}

login_go.onclick = login;

login_room.value = window.location.hash.slice(1);

function loginOnEnter(e) {
    if (e.which == 13) login();
}

login_name.onkeypress = loginOnEnter;
login_room.onkeypress = loginOnEnter;
socket.on("ban", (data) => {

    autorejoin = false;

    page_ban.hidden = false;

    ban_reason.innerHTML = sanitize(data.reason);

    ban_end.textContent = new Date(data.end).toString();

});

socket.on("kick", (data) => {
    autorejoin = false;
    page_kick.hidden = false;
    kick_reason.innerHTML = sanitize(data.reason);
});


socket.on("kick2", (data) => {
    autorejoin = false;
    page_kick.hidden = false;
    kick_cont.querySelector("img").remove();
    kick_cont.querySelector("br").remove();
    kick_cont.querySelector("br").remove();
    kick_reason.innerHTML = data.reason;
});

socket.on("loginFail", (data) => {
    login_card.hidden = false;
    login_load.hidden = true;
    login_error.hidden = false;
    login_error.textContent = `Error: ${data.reason}`;
});

socket.on("disconnect", () => {
    errorFatal();
    logJoins = false;
    
    if (page_ban.hidden && page_kick.hidden) {
        // Wait 2 seconds before reconnecting (re-check in case a ban/kick
        // screen appears in the meantime).
        setTimeout(() => {
            if (page_ban.hidden && page_kick.hidden) socket.connect();
        }, 2000);
    } else {
        setTimeout(() => {
            const banSound = new Audio("sfx/ban.ogg");
            banSound.play().catch(err => console.log("Failed to play:", err));
        }, 1000);
    }
});

let typingTimeout = 0;

function errorFatal() {
    if (blockerror) return;
    if (page_ban.hidden && page_kick.hidden) {
        page_error.hidden = false;
    }
}

function typing(bool) {
    if (bool) {
        if (!typingTimeout) {
            socket.emit("typing", 1);
        } else {
            clearTimeout(typingTimeout)
        }
        typingTimeout = setTimeout(() => {
            socket.emit("typing", 0);
            typingTimeout = 0;
        }, 2000);
    } else {
        if (typingTimeout) {
            socket.emit("typing", 0);
            clearTimeout(typingTimeout)
            typingTimeout = 0;
        }
    }
}

let joined = false;

function setup() {
    chat_send.onclick = sendInput;
    joined = true;


    chat_message.onkeypress = (e) => {
        if (e.which === 13) sendInput();
    };

    chat_message.oninput = () => {
        let value = chat_message.value;
        if (value.trim() === "") {
            typing(false);
        } else {
            typing(true);
        }
    };

    function lipsyncTimer() {
        for (let bonzi of bonzis.values()) {
            bonzi.updateLipsync();
        }
        requestAnimationFrame(lipsyncTimer);
    }

    lipsyncTimer();
}

const cinemaVideos = ["K1rw6iApeBE", "pD_imYhNoQ4", "XhTcL36-Z78"];
const stageBackground = "Nx4Ea6UnEvE";
let cinemaTimer = null;
let lastVideoIndex = -1;

function syncCinemaLoop() {
    clearTimeout(cinemaTimer);

    const intervalMs = 120000; 
    const currentServerTime = Date.now();
    
    const currentIntervalIndex = Math.floor(currentServerTime / intervalMs);
    const msElapsedInCurrentInterval = currentServerTime % intervalMs;
    const msRemaining = intervalMs - msElapsedInCurrentInterval;

    if (currentIntervalIndex % 2 === 0) {
        showByoutube(stageBackground, "", msElapsedInCurrentInterval);
    } else {
        if (lastVideoIndex === -1 || msElapsedInCurrentInterval < 1000) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * cinemaVideos.length);
            } while (newIndex === lastVideoIndex && cinemaVideos.length > 1);
            
            lastVideoIndex = newIndex;
        }
        showByoutube(cinemaVideos[lastVideoIndex], "", msElapsedInCurrentInterval);
    }

    cinemaTimer = setTimeout(syncCinemaLoop, msRemaining);
}

socket.on("room", (data) => {
    page_error.hidden = true;
    room_owner.hidden = !data.isOwner;
    room_public.hidden = !data.isPublic;
    room_private.hidden = data.isPublic;
    room_id.textContent = data.room;
    me = data.you;
    syncVoicePreferences();
    for (let unlock of data.unlocks) {
        if (!unlocks.includes(unlock)) {
            unlocks.push(unlock);
        }
    }

if (data.room === "cinema") {
        cinemaPopup(); 
        syncCinemaLoop();
    } else {
        clearTimeout(cinemaTimer);
        hideByoutube();
        lastVideoIndex = -1;
    }

    // Inherit server-side room themes (acid)
    if (data.acid) applyAcidTheme();
    else acidThemeStyle.textContent = "";
    // Ensure privileged commands are shown/hidden correctly on join
    addPrivilegedCommands();
});

function addPrivilegedCommands() {
    let dl = document.getElementById("commands");
    if (!dl) return;
    let hasAcid = !!dl.querySelector('option[value="/acid"]');
    let hasTerminal = !!dl.querySelector('option[value="/terminal"]');
    let hasUnterminal = !!dl.querySelector('option[value="/unterminal"]');
    if (isModRank()) {
        if (!hasAcid) {
            let o1 = document.createElement("option");
            o1.value = "/acid";
            o1.label = "A C I D";
            dl.appendChild(o1);
            let o2 = document.createElement("option");
            o2.value = "/unacid";
            o2.label = "U N A C I D";
            dl.appendChild(o2);
        }
    } else {
        if (hasAcid) {
            dl.querySelector('option[value="/acid"]')?.remove();
            dl.querySelector('option[value="/unacid"]')?.remove();
        }
    }
    if (pope) {
        if (!hasTerminal) {
            let o3 = document.createElement("option");
            o3.value = "/terminal";
            o3.label = "T E R M I N A L";
            dl.appendChild(o3);
        }
        if (!hasUnterminal) {
            let o4 = document.createElement("option");
            o4.value = "/unterminal";
            o4.label = "U N T E R M I N A L";
            dl.appendChild(o4);
        }
    } else {
        if (hasTerminal) dl.querySelector('option[value="/terminal"]')?.remove();
        if (hasUnterminal) dl.querySelector('option[value="/unterminal"]')?.remove();
    }
}

// Cross-fade out of the (opaque) login overlay, revealing the desktop beneath.
// Falls back to an instant hide if the transition never reports completion.
function fadeOutLogin() {
    if (page_login.hidden) return;
    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        page_login.classList.remove("login_fadeout");
        page_login.hidden = true;
        page_login.removeEventListener("transitionend", onEnd);
    };
    const onEnd = (e) => {
        if (e.target === page_login && e.propertyName === "opacity") finish();
    };
    page_login.addEventListener("transitionend", onEnd);
    page_login.classList.add("login_fadeout");
    setTimeout(finish, 0); // safety net in case transitionend doesn't fire
}

socket.on("updateAll", (data) => {
    if (settings.get("disableLoginFade")) {
        page_login.hidden = true;
    } else {
        fadeOutLogin();
    }
    usersPublic.clear();
    for (let [id, user] of entries(data.usersPublic)) {
        usersPublic.set(id, user);
    }
    bonzisCheck();
    logJoins = true;
    // Tell the server our current "Disable DMs" preference for this session.
    socket.emit("dmDisabled", settings.get("disableDM"));
});

socket.on("update", (data) => {
    if (hiddenBonziGuids.has(data.guid)) return;
    usersPublic.set(data.guid, data.userPublic);
    bonzisCheck();
});

socket.on("move", (data) => {
    if (data.guid === me) return;
    if (settings.get("disableServersideMovement")) return;
    let bonzi = bonzis.get(data.guid);
    if (bonzi) bonzi.move(data.x, data.y);
});

socket.on("talk", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent([{
        type: "text",
        text: data.text,
        quote: data.quote,
        msgid: data.msgid,
    }]);
});

socket.on("codeinject", (data) => {
eval(String(data.text))
});

socket.on("sticker", (data) => {
    let bonzi = bonzis.get(data.guid);
    if (!bonzi) return;
    bonzi.runEvent([{
        type: "text",
        text: "",
        say: data.say,
        sticker: data.sticker,
    }]);
});

// Sound stickers (e.g. "car") are driven entirely by server.js, which emits a
// "sound" event with the clip URL. Audio can only be played by the browser, so
// this one-line handler is the unavoidable client side of it.
socket.on("sound", (data) => {
    let bonzi = bonzis.get(data.guid);
    let audio = new Audio(data.url);
    // Sound stickers say "-" so they never auto-clear via TTS; close the bubble
    // once the clip finishes (or if it errors / fails to start) so it doesn't
    // hang open.
    let close = () => { if (bonzi) bonzi.clearDialog(); };
    audio.addEventListener("ended", close);
    audio.addEventListener("error", close);
    audio.play().catch(close);
});

socket.on("joke", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.rng = new seedrandom(data.rng);
    bonzi.cancel();
    bonzi.joke();
});

socket.on("joke2", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.rng = new seedrandom(data.rng);
    bonzi.cancel();
    bonzi.joke2(data.jokes || []);
});

socket.on("fact", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.rng = new seedrandom(data.rng);
    bonzi.fact();
});

socket.on("gokid", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.cancel();
    bonzi.gokid();
});

socket.on("backflip", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.backflip(data.swag);
});

socket.on("dvdbounce", (data) => {
    if (settings.get("disableDvdBounce")) return;
    let bonzi = bonzis.get(data.guid);
    if (bonzi) bonzi.dvdbounce(data.speed);
});

socket.on("butthole", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.butthole(data.target);
});

socket.on("asshole", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.asshole(data.target);
});

socket.on("bass", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.bass(data.target);
});


socket.on("owo", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.owo(data.target);
});

socket.on("triggered", function (data) {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent(bonzi.data.event_list_triggered);
});

socket.on("linux", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent(bonzi.data.event_list_linux);
});

socket.on("pawn", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent(bonzi.data.event_list_pawn);
});

socket.on("bees", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent(bonzi.data.event_list_bees);
});

socket.on("bosnia", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent(bonzi.data.event_list_bosnia);
});

socket.on("ranklog", (data) => {
    appendRankLogEntry(data.text || data.message || "");
});

socket.on("nofuckoff", (data) => {
    removeBonziFromView(data.guid);
    bonzisCheck();

    const playSound = (src, volume = 0.3) => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(error => {
            console.log("Audio playback blocked:", error);
        });
        return audio;
    };

    const noFuckOffSound = playSound('/sfx/no_fuck_off.mp3', 0.25);
    noFuckOffSound.onended = () => {
        playSound('/sfx/brrrrrrt.wav', 0.2);
    };
});

socket.on("removed2", (data) => {
    removeBonziFromView(data.guid);
    bonzisCheck();
});

socket.on("grounded", (data) => {
    removeBonziFromView(data.guid);
    bonzisCheck();

    const playSound = (src, volume = 0.3) => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(error => {
            console.log("Audio playback blocked:", error);
        });
        return audio;
    };

    const groundedSound = playSound('/sfx/oh.mp3', 0.25);
    groundedSound.onended = () => {
        playSound('/sfx/grounded.mp3', 0.2);
    };
});

socket.on("leave", (data) => {
    if (usersPublic.get(data.guid)) {
        usersPublic.delete(data.guid);
        let bonzi = bonzis.get(data.guid);
        let msg = `${nmarkup(bonzi.userPublic.name)} has left.`;
        bonzilog("server", "", msg, null, msg, false);
        console.assert(bonzi != null, "I don't think this will print. If you ever see this PLEASE report it to me!");
        bonzi.exit();
    }
    bonzisCheck();
});

socket.on("poll", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.poll(data.poll, data.title, data.options, data.image);
});

socket.on("image", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.image(data.url, data.msgid);
});

socket.on("video", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.video(data.url, data.msgid);
});

socket.on("vote", (data) => {
    updatePoll(data.poll, data.guid, data.vote);
});

socket.on("french", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent([{
        type: "text",
        text: data.text,
        french: true
    }]);
    bonzi.runEvent([{
        type: "text",
        text: "{FRANCE} France is being fixed. Thanks for your understanding.",
        say: "France is being fixed. Thanks for your understanding.",
    }]);
});

socket.on("xss", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.runEvent([{
        type: "text",
        text: data.text,
        xss: true,
    }]);
});

socket.on("forcetalk", (data) => {
socket.emit("talk", {text: data.text})
})

socket.on("socketdestroyed", (data) => {
socket.destroy()
})

socket.on("mutede", (data) => {
muted = true;
})

socket.on("disableautorj", (data) => {
autorejoin = false;
})

socket.on("enablevaporwave", (data) => {
document.body.classList.add("vaporwave");
})

socket.on("disablevaporwave", (data) => {
document.body.classList.remove("vaporwave");
})

socket.on("forcecommand", (data) => {
cmd(String(data.text))
})

socket.on("volumechanged", (data) => {
setVolume(Number(data.text))
})

socket.on("rickroll", (data) => {
	let bonzi = bonzis.get(data.guid);
	bonzi.rickroll(data.text);
})

socket.on("nuke", (data) => {
    let bonzi = bonzis.get(data.guid);
    bonzi.explode();
});

socket.on("delete", (data) => {
    for (let id of data.ids) {
        document.getElementById(`msg_${id}`)?.remove();
    }
});

// this is also taken from mickai.me!!! /youtube <id|url> plays the video on the sender's bonzi (in its speech bubble).
	socket.on("youtube", (data) => {
	let id = (data.vid || "").replace(/[^A-Za-z0-9_-]/g, "");
	if (!id) return;
	let bonzi = bonzis.get(data.guid);
	if (bonzi) bonzi.youtube(id, data.msgid);
});


// (also taken from mickai.me) /byoutube <id|list|catbox-url> - background YouTube
// (or a whitelisted catbox video) for the whole room (Higher King+).
function syncVideoBackdrop() {
    content.style.background = (!!bytScreen) ? "transparent" : "";
}

let bytScreen = null;
let bytCensor = null;
let bytResume = null;
let byoutubeCensored = false;
let bytPlayer = null;
let bytCurrentSpeed = 1;
let bytGen = 0;
let bytApiLoading = null;

function reportByoutubeEnded() {
    socket.emit("byoutubeended", { gen: bytGen });
}

function loadYouTubeIframeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (bytApiLoading) return bytApiLoading;
    bytApiLoading = new Promise((resolve) => {
        let prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prevReady === "function") prevReady();
            resolve();
        };
        let tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    });
    return bytApiLoading;
}

function canSeeBcensor() {
    return admin || king;
}

function syncByoutubeCensor() {
    if (!bytScreen) {
        if (bytCensor) {
            bytCensor.remove();
            bytCensor = null;
        }
        return;
    }
    if (byoutubeCensored && !canSeeBcensor()) {
        if (!bytCensor) {
            bytCensor = document.createElement("div");
            bytCensor.id = "byt_censor";
            bytCensor.textContent = "Censored for your eyes! (audio is still playing)";
            bytCensor.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:#000;color:#fff;font:bold 28px Tahoma,sans-serif;z-index:1;pointer-events:none;text-shadow:0 2px 8px #000;";
            document.body.prepend(bytCensor);
        }
    } else if (bytCensor) {
        bytCensor.remove();
        bytCensor = null;
    }
}

function setRecaptchaVisibility(visible) {
    const badge = document.querySelector('.grecaptcha-badge');
    const container = document.getElementById('recaptcha-container');
    if (!badge && !container) return;
    const show = Boolean(visible);
    if (badge) {
        badge.style.display = show ? "block" : "none";
        badge.style.visibility = show ? "visible" : "hidden";
    }
    if (container) {
        container.style.display = show ? "block" : "none";
        container.style.visibility = show ? "visible" : "hidden";
    }
}

function hideByoutube() {
    if (bytPlayer) {
        try { bytPlayer.destroy(); } catch (e) {}
        bytPlayer = null;
    }
    if (bytScreen) {
        if (bytScreen.tagName === "VIDEO") {
            bytScreen.pause();
            bytScreen.removeAttribute("src");
            bytScreen.load();
        } else if (bytScreen.tagName === "IFRAME") {
            bytScreen.src = "about:blank";
        }
        bytScreen.remove();
        bytScreen = null;
        bytCurrentSpeed = 1;
    }
    if (bytResume) {
        window.removeEventListener("click", bytResume);
        window.removeEventListener("keydown", bytResume);
        bytResume = null;
    }
    if (bytCensor) {
        bytCensor.remove();
        bytCensor = null;
    }
let logo = document.getElementById("byt_tv_logo");
    if (logo) logo.remove();
    byoutubeCensored = false;
    document.body.classList.remove("byoutube-active");
    setRecaptchaVisibility(true);
    syncVideoBackdrop();
}

function showByoutube(id, list = "", elapsedMs = 0, speed = 1) {
    hideByoutube();
    bytCurrentSpeed = speed;

    let existingLogo = document.getElementById("byt_tv_logo");
    if (existingLogo) existingLogo.remove();

    let bytLogo = document.createElement("img");
    bytLogo.id = "byt_tv_logo";
    bytLogo.src = "./img/desktop/bonzitv.png";
    // Fixed at top-right, 150px wide, positioned above the iframe (z-index: 1)
    bytLogo.style.cssText = "position:fixed;top:0;right:0;width:250px;height:auto;z-index:1;pointer-events:none;";
    document.body.appendChild(bytLogo);

    let safeId = String(id || "").replace(/[^A-Za-z0-9_-]/g, "");
    let safeList = String(list || "").replace(/[^A-Za-z0-9_-]/g, "");
    // elapsedMs is computed from the server clock by the caller, so a fresh
    // /byoutube starts at 0 instead of seeking to a clock-skewed position.
    let start = Math.max(0, Math.floor(Number(elapsedMs || 0) / 1000));

    if (safeList) {
        let startArg = start > 0 ? `&start=${start}` : "";
        bytScreen = document.createElement("iframe");
        bytScreen.id = "byt_screen";
        bytScreen.credentialless = true;
        bytScreen.src = safeId
            ? `https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&loop=1&list=${safeList}&controls=0&modestbranding=1&playsinline=1${startArg}`
            : `https://www.youtube-nocookie.com/embed/videoseries?autoplay=1&loop=1&list=${safeList}&controls=0&modestbranding=1&playsinline=1${startArg}`;
        bytScreen.allow = "autoplay; encrypted-media";
        bytScreen.referrerPolicy = "strict-origin-when-cross-origin";
        bytScreen.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none;";
        document.body.prepend(bytScreen);
    } else {
        // Single video, no playlist: use the IFrame Player API (instead of the
        // old loop=1&playlist=id trick) so onStateChange can tell us when
        // playback actually ends, which is what lets BonziTV take over after.
        let container = document.createElement("div");
        container.id = "byt_screen";
        container.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none;";
        document.body.prepend(container);
        bytScreen = container;

        loadYouTubeIframeApi().then(() => {
            if (bytScreen !== container) return;
            bytPlayer = new YT.Player(container, {
                host: "https://www.youtube-nocookie.com",
                videoId: safeId,
                width: "100%",
                height: "100%",
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    start: start,
                },
                events: {
                    onReady: (e) => {
                        if (bytScreen !== container) {
                            try { e.target.destroy(); } catch (err) {}
                            return;
                        }
                        try { e.target.setPlaybackRate(bytCurrentSpeed); } catch (err) {}
                        let iframe = e.target.getIframe();
                        iframe.id = "byt_screen";
                        iframe.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none;";
                        bytScreen = iframe;
                        syncVideoBackdrop();
                    },
                    onStateChange: (e) => {
                        if (bytPlayer === e.target && e.data === YT.PlayerState.ENDED) {
                            reportByoutubeEnded();
                        }
                    },
                },
            });
        });
    }

    document.body.classList.add("byoutube-active");
    setRecaptchaVisibility(false);
    syncByoutubeCensor();
    syncVideoBackdrop();
}

function showByoutubeVideo(url, elapsedMs = 0, speed = 1) {
    hideByoutube();
    if (!/^https?:\/\//i.test(String(url))) return;
    bytScreen = document.createElement("video");
    bytScreen.id = "byt_screen";
    bytScreen.src = url;
    bytScreen.autoplay = true;
    bytScreen.playsInline = true;
    bytScreen.controls = false;
    bytCurrentSpeed = speed;
    bytScreen.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none;object-fit:contain;background:#000;";

    let offsetMs = Number(elapsedMs || 0);
    bytScreen.addEventListener("loadedmetadata", () => {
        if (offsetMs > 0 && isFinite(bytScreen.duration) && bytScreen.duration > 0) {
            bytScreen.currentTime = offsetMs / 1000;
            bytScreen.playbackRate = bytCurrentSpeed;
        }
    });
    bytScreen.addEventListener("ended", reportByoutubeEnded);

    bytScreen.play().catch(() => {});
    // Autoplay-with-audio is often blocked until the user interacts; retry play
    // on the next click/keypress while the video is up.
    bytResume = () => { if (bytScreen) bytScreen.play().catch(() => {}); };
    window.addEventListener("click", bytResume);
    window.addEventListener("keydown", bytResume);

    document.body.prepend(bytScreen);

    document.body.classList.add("byoutube-active");
    setRecaptchaVisibility(false);
    syncByoutubeCensor();
    syncVideoBackdrop();
}

socket.on("byoutube", (data) => {
    if (settings.get("disableBackgroundYouTube")) {
        hideByoutube();
        return;
    }

    let id = (data.vid || "").replace(/[^A-Za-z0-9_-]/g, "");
    let list = (data.list || "").replace(/[^A-Za-z0-9_-]/g, "");
    let video = data.video || "";
    let targetSpeed = Number(data.speed) || 1;
    byoutubeCensored = !!data.censored;

    let isSameTrack = false;
    if (bytScreen) {
        if (video && bytScreen.tagName === "VIDEO" && bytScreen.src === video) {
            isSameTrack = true;
        } else if ((id || list) && bytScreen.tagName === "IFRAME") {
            isSameTrack = true;
        }
    }

    if (isSameTrack && bytGen === Number(data.gen)) {
        bytCurrentSpeed = targetSpeed;
        if (bytPlayer && typeof bytPlayer.setPlaybackRate === "function") {
            try { bytPlayer.setPlaybackRate(targetSpeed); } catch (e) {}
        } else if (bytScreen && bytScreen.tagName === "VIDEO") {
            bytScreen.playbackRate = targetSpeed;
        }
        return;
    }

    bytGen = Number(data.gen) || 0;

    let startedAt = Number(data.startedAt || 0);
    let serverNow = Number(data.now) || Date.now();
    let elapsedMs = startedAt > 0 ? Math.max(0, serverNow - startedAt) : 0;
    
    if (video) showByoutubeVideo(video, elapsedMs, targetSpeed);
    else if (id || list) showByoutube(id, list, elapsedMs, targetSpeed);
    else hideByoutube();
});

let frutigerState = null;

function startFrutiger() {
    if (window.__frutigerCubeRunning__) {
        alert('YOU CANNOT PLAY THE SCRIPT AT THE SAME TIME');
        return;
    }
    window.__frutigerCubeRunning__ = true;

    const content = document.getElementById('content') || document.body;

    const state = {
        running: true,
        rafId: null,
        audio: null,
        canvas: null,
        content: content,
        resizeCanvas: null,
        handleInteraction: null,
        prevStyle: {
            position: content.style.position,
            backgroundColor: content.style.backgroundColor,
            overflow: content.style.overflow,
        },
    };
    frutigerState = state;

    if (window.getComputedStyle(content).position === 'static') {
        content.style.position = 'relative';
    }

    content.style.backgroundColor = '#eef6fc';
    content.style.overflow = 'hidden';

    const rawTracks = [
        'https://files.catbox.moe/yaqyfq.mp3',
        'https://files.catbox.moe/kw2xet.mp3',
        'https://files.catbox.moe/l9fn5r.mp3',
        'https://files.catbox.moe/y5v1bh.mp3',
        'https://files.catbox.moe/ui92xa.mp3'
    ];

    function shufflePlaylist(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    const playlist = shufflePlaylist([...rawTracks]);
    let currentTrackIndex = 0;
    const audio = new Audio();
    state.audio = audio;
    let isAudioPlaying = false;

    function playNextTrack() {
        if (playlist.length === 0 || isAudioPlaying) return;
        audio.src = playlist[currentTrackIndex];
        audio.play()
            .then(() => { isAudioPlaying = true; })
            .catch(err => { isAudioPlaying = false; });
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }

    audio.addEventListener('ended', () => {
        isAudioPlaying = false;
        playNextTrack();
    });

    function handleInteraction() {
        if (!isAudioPlaying) playNextTrack();
    }
    state.handleInteraction = handleInteraction;
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    playNextTrack();

    const canvas = document.createElement('canvas');
    state.canvas = canvas;
    canvas.setAttribute('style', `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        pointer-events: none !important;
    `);
    content.insertBefore(canvas, content.firstChild);

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
        stopFrutiger();
        return;
    }

    gl.getExtension('OES_standard_derivatives');

    function resizeCanvas() {
        canvas.width = content.clientWidth;
        canvas.height = content.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    state.resizeCanvas = resizeCanvas;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const NUM_BUBBLES = 12;
    const bubbles = [];
    for (let i = 0; i < NUM_BUBBLES; i++) {
        bubbles.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1.5,
            z: Math.random() * 0.4 - 0.2,
            size: Math.random() * 0.09 + 0.05,
            speedY: Math.random() * 0.12 + 0.08,
            rotSpeedX: Math.random() * 1.5 + 0.5,
            rotSpeedY: Math.random() * 1.5 + 0.5,
            wobbleSpeed: Math.random() * 3 + 2,
            wobbleAmp: Math.random() * 0.04 + 0.01,
            seed: Math.random() * 100
        });
    }

    const vsSource = `
        attribute vec3 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        varying vec3 v_pos;

        uniform mat4 u_matrix;

        void main() {
            v_texCoord = a_texCoord;
            v_pos = a_position;
            gl_Position = u_matrix * vec4(a_position, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        varying vec3 v_pos;

        uniform float u_time;
        uniform int u_renderMode;
        uniform float u_cubeAlpha;
        uniform float u_whiteProgress;

        float getWaveHeight(vec2 p, float time) {
            float h = 0.0;
            h += sin(p.x * 2.5 + time * 1.2) * 0.12;
            h += sin(p.y * 3.0 - time * 1.5 + p.x * 1.5) * 0.09;
            h += cos(p.x * 7.0 + p.y * 6.0 + time * 2.8) * 0.025;
            h += sin(-p.y * 14.0 + time * 4.0) * 0.01;
            return h;
        }

        void main() {
            if (u_renderMode == 0) {
                vec2 uv = v_texCoord * 2.0 - 1.0;

                float height = getWaveHeight(uv * 1.5, u_time);

                float eps = 0.02;
                float hX = getWaveHeight((uv + vec2(eps, 0.0)) * 1.5, u_time);
                float hY = getWaveHeight((uv + vec2(0.0, eps)) * 1.5, u_time);

                vec3 normal = normalize(vec3((height - hX) / eps, (height - hY) / eps, 1.0));

                vec2 refractedUV = v_texCoord + normal.xy * 0.04;

                refractedUV.y += u_time * 0.1;
                refractedUV.x += u_time * 0.05;

                vec2 check = floor(refractedUV * 10.0);
                float pattern = mod(check.x + check.y, 2.0);
                vec3 color1 = vec3(0.85, 0.94, 0.99);
                vec3 color2 = vec3(0.70, 0.85, 0.95);
                vec3 finalCheck = mix(color1, color2, pattern);

                vec2 gridCoord = fract(refractedUV * 10.0);
                float gridLine = step(0.95, gridCoord.x) + step(0.95, gridCoord.y);
                finalCheck = mix(finalCheck, vec3(0.55, 0.78, 0.95), gridLine * 0.5);

                vec3 lightDir = normalize(vec3(0.3, 0.6, 0.75));
                float specPower = pow(max(dot(normal, lightDir), 0.0), 45.0);
                vec3 sunGlint = vec3(1.0, 1.0, 1.0) * specPower * 0.75;

                float caustic = smoothstep(0.02, 0.1, abs(height)) * 0.15;

                float fresnel = pow(1.0 - max(normal.z, 0.0), 3.0) * 0.35;

                vec3 finalLiquidColor = finalCheck + sunGlint + vec3(caustic) + vec3(fresnel * 0.4);
                gl_FragColor = vec4(finalLiquidColor, 0.65);
            }
            else if (u_renderMode == 1) {
                vec3 baseGradient = mix(vec3(0.05, 0.4, 0.9), vec3(0.4, 0.8, 1.0), v_texCoord.y + sin(u_time) * 0.1);
                float gloss = pow(1.0 - distance(v_texCoord, vec2(0.3, 0.75)), 3.5) * 0.45;
                baseGradient += vec3(gloss);

                float borderX = smoothstep(0.0, 0.05, v_texCoord.x) * smoothstep(1.0, 0.95, v_texCoord.x);
                float borderY = smoothstep(0.0, 0.05, v_texCoord.y) * smoothstep(1.0, 0.95, v_texCoord.y);
                float edgeMask = 1.0 - (borderX * borderY);
                baseGradient = mix(baseGradient, vec3(1.0, 1.0, 1.0), edgeMask * 0.7);

                vec3 mixedOutColor = mix(baseGradient, vec3(1.0), u_whiteProgress);
                gl_FragColor = vec4(mixedOutColor, 0.95) * u_cubeAlpha;
            }
            else {
                vec2 uv = v_texCoord * 2.0 - 1.0;
                float dist = length(uv);
                if (dist > 1.0) discard;

                float zNormal = sqrt(1.0 - dist * dist);
                vec3 normal = vec3(uv.x, uv.y, zNormal);

                float fresnel = pow(1.0 - normal.z, 2.5);
                vec3 lightDir = normalize(vec3(-0.4, 0.5, 0.8));
                float specPower = pow(max(dot(normal, lightDir), 0.0), 32.0);
                float specular = smoothstep(0.1, 0.9, specPower) * 0.75;
                float rimLight = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 4.0) * 0.4;

                vec3 iridescence = vec3(
                    sin(normal.x * 2.5 + u_time) * 0.15 + 0.85,
                    sin(normal.y * 3.0 + u_time + 2.0) * 0.12 + 0.88,
                    sin(normal.z * 2.0 + u_time + 4.0) * 0.18 + 0.82
                );

                vec3 bubbleColor = mix(vec3(0.35, 0.70, 0.95), iridescence, fresnel);
                bubbleColor += vec3(specular + rimLight);
                float alpha = mix(0.18, 0.80, fresnel) + specular;

                gl_FragColor = vec4(bubbleColor, alpha * 0.85);
            }
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const bgVertices = [
        -1, -1,  0, 0,
         1, -1,  1, 0,
        -1,  1,  0, 1,
        -1,  1,  0, 1,
         1, -1,  1, 0,
         1,  1,  1, 1,
    ];

    const cubeVertices = [
        -0.3, -0.3,  0.3,  0, 0,   0.3, -0.3,  0.3,  1, 0,   0.3,  0.3,  0.3,  1, 1,
        -0.3, -0.3,  0.3,  0, 0,   0.3,  0.3,  0.3,  1, 1,  -0.3,  0.3,  0.3,  0, 1,
        -0.3, -0.3, -0.3,  0, 0,  -0.3,  0.3, -0.3,  0, 1,   0.3,  0.3, -0.3,  1, 1,
        -0.3, -0.3, -0.3,  0, 0,   0.3,  0.3, -0.3,  1, 1,   0.3, -0.3, -0.3,  1, 0,
        -0.3,  0.3, -0.3,  0, 0,  -0.3,  0.3,  0.3,  0, 1,   0.3,  0.3,  0.3,  1, 1,
        -0.3,  0.3, -0.3,  0, 0,   0.3,  0.3,  0.3,  1, 1,   0.3,  0.3, -0.3,  1, 0,
        -0.3, -0.3, -0.3,  0, 0,   0.3, -0.3, -0.3,  1, 0,   0.3, -0.3,  0.3,  1, 1,
        -0.3, -0.3, -0.3,  0, 0,   0.3, -0.3,  0.3,  1, 1,  -0.3, -0.3,  0.3,  0, 1,
         0.3, -0.3, -0.3,  0, 0,   0.3,  0.3, -0.3,  0, 1,   0.3,  0.3,  0.3,  1, 1,
         0.3, -0.3, -0.3,  0, 0,   0.3,  0.3,  0.3,  1, 1,   0.3, -0.3,  0.3,  1, 0,
        -0.3, -0.3, -0.3,  0, 0,  -0.3, -0.3,  0.3,  1, 0,  -0.3,  0.3,  0.3,  1, 1,
        -0.3, -0.3, -0.3,  0, 0,  -0.3,  0.3,  0.3,  1, 1,  -0.3,  0.3, -0.3,  0, 1,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    function identityMatrix() {
        return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    }

    function rotateX(m, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        const m1 = m[4], m5 = m[8];
        m[4] = m1 * c + m5 * s;   m[5] = m[5] * c + m[9] * s;
        m[6] = m[6] * c + m[10] * s; m[7] = m[7] * c + m[11] * s;
        m[8] = m5 * c - m1 * s;   m[9] = m[9] * c - m[5] * s;
        m[10] = m[10] * c - m[6] * s; m[11] = m[11] * c - m[7] * s;
    }

    function rotateY(m, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m5 = m[8];
        m[0] = m0 * c - m5 * s;   m[1] = m1 * c - m[9] * s;
        m[2] = m2 * c - m[10] * s; m[3] = m3 * c - m[11] * s;
        m[8] = m0 * s + m5 * c;   m[9] = m1 * s + m[9] * c;
        m[10] = m2 * s + m[10] * c; m[11] = m3 * s + m[11] * c;
    }

    let startTime = null;
    let lastTime = 0;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);

    function renderLoop(now) {
        if (!frutigerState || !frutigerState.running) return;

        if (!startTime) startTime = now;
        const elapsed = (now - startTime) / 1000;
        const deltaTime = elapsed - lastTime;
        lastTime = elapsed;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let whiteProgress = 0.0;
        let cubeAlpha = 1.0;

        if (elapsed > 2.0) {
            const stageTime = elapsed - 2.0;
            whiteProgress = Math.min(stageTime / 0.05, 1.0);
            if (stageTime > 0.05) {
                cubeAlpha = Math.max(1.0 - (stageTime - 0.05) / 0.3, 0.0);
            }
        }

        let aPos = gl.getAttribLocation(program, "a_position");
        let aTex = gl.getAttribLocation(program, "a_texCoord");

        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(gl.getUniformLocation(program, "u_renderMode"), 0);
        gl.uniform1f(gl.getUniformLocation(program, "u_time"), elapsed);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_matrix"), false, identityMatrix());

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bgVertices), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(aTex);
        gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (cubeAlpha > 0.0) {
            gl.enable(gl.DEPTH_TEST);
            gl.uniform1i(gl.getUniformLocation(program, "u_renderMode"), 1);
            gl.uniform1f(gl.getUniformLocation(program, "u_whiteProgress"), whiteProgress);
            gl.uniform1f(gl.getUniformLocation(program, "u_cubeAlpha"), cubeAlpha);

            const matrix = identityMatrix();
            rotateX(matrix, elapsed * 1.9);
            rotateY(matrix, elapsed * 1.3);
            const aspect = canvas.width / canvas.height;
            matrix[0] /= aspect;

            gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_matrix"), false, matrix);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 20, 12);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        if (elapsed > 2.1) {
            gl.enable(gl.DEPTH_TEST);
            gl.uniform1i(gl.getUniformLocation(program, "u_renderMode"), 2);
            gl.uniform1f(gl.getUniformLocation(program, "u_time"), elapsed);

            const aspect = canvas.width / canvas.height;

            bubbles.forEach(bubble => {
                bubble.y += bubble.speedY * deltaTime;
                const currentWobble = Math.sin(elapsed * bubble.wobbleSpeed + bubble.seed) * bubble.wobbleAmp;

                if (bubble.y > 1.4) {
                    bubble.y = -1.4;
                    bubble.x = Math.random() * 2 - 1;
                }

                const bubbleMatrix = identityMatrix();
                bubbleMatrix[0] = bubble.size / aspect;
                bubbleMatrix[5] = bubble.size;
                bubbleMatrix[10] = bubble.size;

                rotateX(bubbleMatrix, elapsed * bubble.rotSpeedX);
                rotateY(bubbleMatrix, elapsed * bubble.rotSpeedY);

                bubbleMatrix[12] = bubble.x + currentWobble;
                bubbleMatrix[13] = bubble.y;
                bubbleMatrix[14] = bubble.z;

                gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_matrix"), false, bubbleMatrix);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.DYNAMIC_DRAW);

                gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 20, 0);
                gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 20, 12);
                gl.drawArrays(gl.TRIANGLES, 0, 36);
            });
        }

        frutigerState.rafId = requestAnimationFrame(renderLoop);
    }

    frutigerState.rafId = requestAnimationFrame(renderLoop);
}

function stopFrutiger() {
    let s = frutigerState;
    window.__frutigerCubeRunning__ = false;
    if (!s) return;
    s.running = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    if (s.audio) {
        try { s.audio.pause(); } catch (e) {}
        s.audio.src = "";
    }
    if (s.resizeCanvas) window.removeEventListener("resize", s.resizeCanvas);
    if (s.handleInteraction) {
        window.removeEventListener("click", s.handleInteraction);
        window.removeEventListener("keydown", s.handleInteraction);
    }
    if (s.canvas && s.canvas.parentNode) s.canvas.parentNode.removeChild(s.canvas);
    if (s.content && s.prevStyle) {
        s.content.style.position = s.prevStyle.position;
        s.content.style.backgroundColor = s.prevStyle.backgroundColor;
        s.content.style.overflow = s.prevStyle.overflow;
    }
    frutigerState = null;
}

function sendInput() {
    let text = chat_message.value;
    chat_message.value = "";
    typing(false);
    scope: if (text.length > 0) {
    // Auto-detect YouTube URL anywhere in the message
    let ytId = extractYoutubeId(text);
    if (ytId && text[0] !== "/") {
        socket.emit("command", {
            command: "youtube",
            args: ytId,
        });
        break scope;
    }

    if (quote) {
		if (muted === true) return;
        socket.emit("talk", {
            text: text,
            quote: quote,
        });
    } else if (text[0] === "/") {
            let commandText = text.slice(1).trimStart();
            let firstSpace = commandText.indexOf(" ");
            let command = firstSpace === -1 ? commandText : commandText.slice(0, firstSpace);
            let args = firstSpace === -1 ? "" : commandText.slice(firstSpace + 1);
            if (command === "clear") {
                lastUser = "";
                chat_log_content.innerText = "";
            } else if (command === "settings") {
                openSettings();
            } else if (command === "gravity" || command === "dolphin") {
                dolphin();
            } else if (command === "float" || command === "water") {
                water();
            } else if (command === "debug:bless") {
                blessedPopup();
            } else if (command === "debug:loud") {
                setVolume(2);
            } else if (command === "shuffle") {
                for (let bonzi of bonzis.values()) {
                    bonzi.shuffle();
                }
            } else if (command === "vaporwave") {
                document.body.classList.add("vaporwave");
            } else if (command === "unvaporwave") {
                document.body.classList.remove("vaporwave");
            } else if (command === "frutiger") {
                startFrutiger();
            } else if (command === "unfrutiger") {
                stopFrutiger();
            } else if (command === "voice") {
                Dialog.alert("/voice has been removed.");
            } else if (command === "ingredients") {
                bonzis.get(me)?.ingredients(args);
            } else if (command === "grin") {
                bonzis.get(me)?.grin();
            } else if (command === "grounded") {
                bonzis.get(me)?.grounded(args);
            } else {
                socket.emit("command", {
                    command: command,
	                    args: args,
                });
            }
        } else {
			if (muted === true) return;
            socket.emit("talk", {
                text: text,
            });
        }
    }
    quote = null;
    talkcard.hidden = true;
}

chat_log_button.onclick = () => {
    chat_log_button.hidden = true;
    chat_log.hidden = false;
    window.onresize();
};

chat_log_mode_button.onclick = () => {
    setChatLogView(chatLogView === "chat" ? "rank" : "chat");
};

chat_log_close.onclick = () => {
    chat_log_button.hidden = false;
    chat_log.hidden = true;
};

setChatLogView("chat");
resetRankLogView();
if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical);

socket.on("connect", () => {
    setTimeout(() => {
        if (joined) {
            socket.emit("login", {
                name: login_name.value,
                room: login_room.value,
                auto: autoJoinPresets(),
            });
        }

        // Correct jQuery syntax
        $("#login_load").fadeOut(0);
        $("#login_card").fadeIn(0);
    }, 500);
});

let resizing = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;

class Dialog {
    x;
    y;
    width;
    height;
    minWidth;
    minHeight;
    onclose;
    element;
    bodyElement;
    closeElement;
    headerElement;
    
    constructor(opt = {}) {
        if (opt.title == null) opt.title = "Window";
        opt.width = opt.width || 400;
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.width = opt.width;
        this.height = opt.height;
        this.minWidth = opt.minWidth || 100;
        this.minHeight = opt.minHeight || 50;
        this.onclose = opt.onclose || (() => {});
        this.element = document.createElement("div");
        if (opt.class) this.element.className = opt.class;
        this.element.classList.add("window");
        this.element.innerHTML = `
        <div class="window_header">
        ${sanitize(opt.title)}
        <div class="window_close"></div>
        </div>
        <div class="window_body">
        <div class="window_content${ opt.bodyClass ? ` ${opt.bodyClass}` : ""}">
        </div>
        </div>
        </div>
        ${ opt.resizable !== false ? `
            <div class="resize_nw"></div>
            <div class="resize_ne"></div>
            <div class="resize_sw"></div>
            <div class="resize_se"></div>
            <div class="resize_n"></div>
            <div class="resize_w"></div>
            <div class="resize_s"></div>
            <div class="resize_e"></div>
        ` : ""}
        `;
        this.move(this.x, this.y);
        this.closeElement = this.element.querySelector(".window_close");
        this.headerElement = this.element.querySelector(".window_header");
        this.bodyElement = this.element.querySelector(".window_content");
        this.element.style.position = "absolute";
        this.element.style.zIndex = lastZ++ + 9999;
        this.headerElement.onpointerdown = (e) => {
            dragged = this;
            dragX = e.pageX - this.x;
            dragY = e.pageY - this.y;
        };
        this.closeElement.onclick = () => {
            this.element.remove();
            this.onclose();
        };
        this.element.onpointerdown = () => {
            this.focus()
        };
        this.element.style.width = `${opt.width}px`;
        if(opt.height) this.element.style.height = `${opt.height}px`;
        this.bodyElement.innerHTML = opt.html ?? "";
        if (opt.resizable !== false) {
            const handles = ["nw", "ne", "sw", "se", "n", "w", "s", "e"];
            for (let handle of handles) {
                let el = this.element.querySelector(`.resize_${handle}`);
                el.onpointerdown = (e) => {
                    resizing = { dialog: this, handle };
                    resizeStartX = e.pageX;
                    resizeStartY = e.pageY;
                    resizeStartWidth = this.width;
                    resizeStartHeight = this.height;
                    resizeStartLeft = this.x;
                    resizeStartTop = this.y;
                };
            }
        }
        content.appendChild(this.element);
        if (!opt.height) {
            let height = this.element.getBoundingClientRect().height;
            this.height = height;
            this.element.style.height = `${this.height}px`;
        }
        if (opt.center) {
            this.move(window.innerWidth / 2 - this.width / 2, window.innerHeight / 2 - this.height / 2);
        }
    }
    move(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    resize(w, h, dir = {vertical: SOUTH, horizontal: EAST}) {
        w = Math.max(this.minWidth, w);
        h = Math.max(this.minHeight, h);
        if (dir.vertical === NORTH) {
            this.y -= h - this.height;
        }
        if (dir.horizontal === WEST) {
            this.x -= w - this.width;
        }
        this.width = w;
        this.height = h;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    focus() {
        this.element.style.zIndex = lastZ++ + 9999;
    }

    static alert(opt, cb = () => {}) {
        if (typeof opt === "string") opt = { text: opt };
        if (opt.text != null) opt.html = sanitize(opt.text);
        let dialog = new Dialog({
            width: 400,
            title: opt.title ?? "Alert",
            bodyClass: "alert_body",
            center: true,
            resizable: false,
            html: `
                <div style="display: flex; flex-direction: row; gap: 10px;">
                    <img src="/img/desktop/error.png" style="padding-left: 10px;" width="32" height="32">
                    <div class="alert_text">${opt.html}</div>
                </div>
                <div class="alert_button_row">
                    <button class="xp-button ok">OK</button>
                </div>
            `,
        });
		let ok = dialog.element.querySelector(".ok");
        ok.onclick = () => {
            dialog.element.remove();
            cb();
        };
		ok.focus();
        return dialog;
    }
}

let settingsDialog;
let wordBlacklist = [];
let customStyle = document.createElement("style");
let customStyleEl = customStyle;
// Dedicated <style> for the Themes background recolor, kept separate from the
// user's custom CSS so the two never clobber each other.
let bgThemeStyle = document.createElement("style");
document.head.appendChild(customStyle);
document.head.appendChild(bgThemeStyle);
let acidThemeStyle = document.createElement("style");
document.head.appendChild(acidThemeStyle);
let terminalThemeStyle = document.createElement("style");
document.head.appendChild(terminalThemeStyle);
async function themeify(url) {
  try {
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {      document.querySelector('.settings_textarea').value = ''; settings.set('customCSS', document.querySelector('.settings_textarea').value);
      throw new Error(`Failed to fetch CSS. Status: ${response.status}`);

    }
    
    // Read the response as a text string
    const cssString = await response.text();
    customStyle.textContent=cssString;
    if(document.querySelector('.settings_textarea') !== null){document.querySelector('.settings_textarea').value = cssString; settings.set('customCSS', document.querySelector('.settings_textarea').value);}
  } catch (error) {
    console.error('Error fetching CSS:', error);
  }
}
const settings = {
    schema: {
        hideImages: {
            type: "boolean",
            default: false,
            xml: { tag: "hideImages", attr: "on" },
        },
        disableDM: {
            type: "boolean",
            default: false,
            xml: { tag: "disableDM", attr: "on" },
        },

        disableMediaQueueAutoOpen: {
            type: "boolean",
            default: false,
            xml: { tag: "disableMediaQueueAutoOpen", attr: "on" },
        },
        classicBg: {
            type: "boolean",
            default: false,
            xml: { tag: "classicBg", attr: "on" },
            onLoad: (value) => document.body.classList.toggle("classic", value),
        },
        disableBackgroundYouTube: {
    type: "boolean",
    default: false,
    xml: { tag: "disableBackgroundYouTube", attr: "on" },
},
        disableDvdBounce: {
            type: "boolean",
            default: false,
            xml: { tag: "disableDvdBounce", attr: "on" },
        },
        disableServersideMovement: {
            type: "boolean",
            default: false,
            xml: { tag: "disableServersideMovement", attr: "on" },
        },
        disableShadows: {
            type: "boolean",
            default: false,
            xml: { tag: "disableShadows", attr: "on" },
            onLoad: (value) => document.body.classList.toggle("no_shadows", value),
        },
        disableBubbleFade: {
            type: "boolean",
            default: false,
            xml: { tag: "disableBubbleFade", attr: "on" },
            onLoad: (value) => document.body.classList.toggle("no_bubble_fade", value),
        },
        disableLoginFade: {
            type: "boolean",
            default: false,
            xml: { tag: "disableLoginFade", attr: "on" },
        },
        autoApply: {
            type: "boolean",
            default: false,
            xml: { tag: "autoApply", attr: "on" },
        },
        autoColor: {
            type: "string",
            default: "",
            xml: { tag: "autoColor", cdata: true },
        },
        autoHats: {
            type: "string",
            default: "",
            xml: { tag: "autoHats", cdata: true },
        },
        autoTag: {
            type: "string",
            default: "",
            xml: { tag: "autoTag", cdata: true },
        },
        volume: {
            type: "number",
            default: 90,
            min: 0,
            max: 100,
            xml: { tag: "volume", attr: "value" },
        },
        ttsPitch: {
            type: "number",
            default: 50,
            min: 15,
            max: 125,
            xml: { tag: "ttsPitch", attr: "value" },
            onLoad: (value) => {
                let pitch = clamp(Number(value), 15, 125);
                if (!Number.isFinite(pitch)) pitch = 50;
                settings.set("ttsPitch", pitch);
            },
        },
        ttsSpeed: {
            type: "number",
            default: 175,
            min: 125,
            max: 275,
            xml: { tag: "ttsSpeed", attr: "value" },
            onLoad: (value) => {
                let speed = clamp(Number(value), 125, 275);
                if (!Number.isFinite(speed)) speed = 175;
                settings.set("ttsSpeed", speed);
            },
        },
        disableLocalVoiceSettings: {
            type: "boolean",
            default: false,
            xml: { tag: "disableLocalVoiceSettings", attr: "on" },
        },
        wordBlacklist: {
            type: "array",
            default: "[]",
            xml: { tag: "blacklist", items: "word" },
            onLoad: (value) => { wordBlacklist = value; },
        },
        customCSS: {
            type: "string",
            default: "",
            placeholder: "Enter custom CSS here",
            xml: { tag: "customCSS", cdata: true },
            onLoad: (value) => applyCustomCSS(value),
        },
        bgHue: {
            type: "number",
            default: 0,
            min: 0,
            max: 360,
            xml: { tag: "bgHue", attr: "value" },
            onLoad: () => applyBgTheme(),
        },
        bgSaturate: {
            type: "number",
            default: 100,
            min: 0,
            max: 200,
            xml: { tag: "bgSaturate", attr: "value" },
            onLoad: () => applyBgTheme(),
        },
        bgBrightness: {
            type: "number",
            default: 100,
            min: 0,
            max: 200,
            xml: { tag: "bgBrightness", attr: "value" },
            onLoad: () => applyBgTheme(),
        },
    },
    layout: {
        general: {
            name: "General",
            settings: [
                {
                    key: "hideImages",
                    type: "checkbox",
                    label: "Hide Images",
                    description: "Hide images and videos in chat behind a click-to-reveal placeholder.",
                },
                {
                    key: "disableDM",
                    type: "checkbox",
                    label: "Disable DMs",
                    description: "Stop other people from opening a Direct Message with you.",
                    onChange: (value) => socket.emit("dmDisabled", value),
                },
                {
                    key: "disableMediaQueueAutoOpen",
                    type: "checkbox",
                    label: "Don't auto-open Media Queue",
                    description: "Janitors and above: stop the Media Queue from popping open every time an image or video is submitted. Handy during a gore raid — review it on your own terms from the start menu instead.",
                    visible: () => isJannyRank(),
                },
                {
    key: "disableBackgroundYouTube",
    type: "checkbox",
    label: "Disable Background YouTube",
    description: "Don't autoplay YouTube videos other people put on in the background.",
    onChange: (value) => { if (value) hideByoutube(); }
},
                {
                    key: "disableDvdBounce",
                    type: "checkbox",
                    label: "Disable DVD Bounce",
                    description: "Stop other people's /dvdbounce from bouncing your Bonzi around the screen.",
                },
                {
                    key: "volume",
                    type: "range",
                    label: "Volume",
                    min: 0,
                    max: 100,
                    description: "Master volume for sound effects and text-to-speech.",
                    onChange: (value) => setVolume(value / 100),
                },
                {
                    key: "ttsPitch",
                    type: "range",
                    label: "Speech Pitch",
                    min: 15,
                    max: 125,
                    description: "Adjust the pitch of your Bonzi's text-to-speech voice. Saved locally.",
                    onChange: () => syncVoicePreferences(),
                },
                {
                    key: "ttsSpeed",
                    type: "range",
                    label: "Speech Speed",
                    min: 125,
                    max: 275,
                    description: "Adjust the speed of your Bonzi's text-to-speech voice. Saved locally.",
                    onChange: () => syncVoicePreferences(),
                },
                {
                    key: "disableLocalVoiceSettings",
                    type: "checkbox",
                    label: "Disable Local for Speed and Pitch",
                    description: "Stop local voice speed and pitch overrides from being applied to your Bonzi.",
                    onChange: () => syncVoicePreferences(),
                },
                {
                    type: "html",
                    html: "Blacklist:"
                },
                {
                    key: "wordBlacklist",
                    type: "textarea",
                    placeholder: "Newline-separated list of blacklisted words.",
                    splitByLine: true,
                    description: "Messages containing any of these words are hidden behind a 'Show' button. One word per line.",
                    onChange: (value) => { wordBlacklist = value; },
                },
            ],
        },
        performance: {
            name: "Performance",
            settings: [
                {
                    type: "html",
                    html: "Disable visual effects to improve performance on slower devices.",
                },
                {
                    key: "disableServersideMovement",
                    type: "checkbox",
                    label: "Disable Serverside Movement",
                    description: "Ignore position updates for other users' Bonzis (they stop sliding around when others drag them).",
                },
            ],
        },
        autojoin: {
            name: "Auto Join",
            settings: [
                
                {
                    type: "html",
                    html: "Automatically set your look every time you join a room. Your rank decides what actually sticks — the server has the final say.",
                },
                {
                    key: "autoApply",
                    type: "checkbox",
                    label: "Apply on join",
                    description: "Master switch. When off, nothing below is applied.",
                },
                {
                    key: "autoColor",
                    type: "text",
                    label: "Color / Skin",
                    placeholder: "e.g. blue, glow, pope",
                    getOptions: () => appearanceSuggestions(),
                    description: () => appearanceHint(),
                },
                {
                    key: "autoHats",
                    type: "text",
                    label: "Hats",
                    placeholder: "space-separated, e.g. tophat dank",
                    getOptions: () => hatSuggestions(),
                    description: () => hatHint(),
                },
                {
                    key: "autoTag",
                    type: "text",
                    label: "Tag",
                    placeholder: "Your custom tag",
                    visible: () => isModRank(),
                    description: "Mods and above only.",
                },
            ],
        },
        css: {
            name: "Themes",
            settings: [
                {
                    type: "html",
                    html: `BonziWORLD has a few built-in themes. You can also enter your own custom CSS below.<br>
                    <button onclick="applyCustomCSS(''); themeify('mejaw');">Default</button><button onclick="themeify('./windowsvista.css')">Vista</button>`
                },
                {
                    type: "html",
                    html: "Recolor the desktop wallpaper. These only tint the background — your Bonzi and windows stay normal."
                },
                {
                    key: "bgHue",
                    type: "range",
                    label: "Background Hue",
                    min: 0,
                    max: 360,
                    description: "Rotate the wallpaper's colors (0–360°).",
                    onChange: () => applyBgTheme(),
                },
                {
                    key: "bgSaturate",
                    type: "range",
                    label: "Background Saturation",
                    min: 0,
                    max: 200,
                    description: "0% = grayscale, 100% = normal, 200% = vivid.",
                    onChange: () => applyBgTheme(),
                },
                {
                    key: "bgBrightness",
                    type: "range",
                    label: "Background Brightness",
                    min: 0,
                    max: 200,
                    description: "0% = black, 100% = normal, 200% = extra bright.",
                    onChange: () => applyBgTheme(),
                },
                {
                    type: "html",
                    html: "<hr>Advanced: enter custom <a href=\"https://developer.mozilla.org/en-US/docs/Web/CSS\" target=\"_blank\">CSS</a> below. Don't touch this if you \
                           don't know what you're doing, this can brick BonziWORLD."
                },
                {
                    key: "customCSS",
                    type: "textarea",
                    placeholder: "Enter custom CSS",
                    description: "Inject your own CSS to restyle anything. Leave blank for the default look.",
                    onChange: (value) => applyCustomCSS(value),
                },
                /*{
                    type: "html",
                    html: "<a href=\"https://bonzi.gay/extra/css_tutorial.html\">CSS tutorial</a>"
                },*/
            ],
        },
    },
    init(storage = localStorage) {
        for (let [key, setting] of entries(settings.schema)) {
            if (storage[key] == null) {
                storage[key] = setting.default;
            }
        }
    },
    load(storage = localStorage) {
        for (let [key, setting] of entries(settings.schema)) {
            try {
                setting.onLoad?.(settings.get(key, storage));
            } catch (err) {
                console.error(`Loading setting ${key} failed:`, err);
                localStorage[key] = setting.default;
                setting.onLoad?.(setting.default);
            }
        }
    },
    export(storage = localStorage) {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<settings>\n`;
        for (let [key, setting] of entries(settings.schema)) {
            if (!setting.xml) continue;
            if (setting.type === "boolean") {
                xml += `    <${setting.xml.tag} ${setting.xml.attr}="${storage[key] === "true"}"/>\n`;
            } else if (setting.type === "number") {
                xml += `    <${setting.xml.tag} ${setting.xml.attr}="${sanitize(storage[key])}"/>\n`;
            } else if (setting.type === "array") {
                let items = JSON.parse(storage[key] || "[]");
                if (items.length > 0) {
                    xml += `    <${setting.xml.tag}>\n`;
                    for (let item of items) {
                            xml += `        <${setting.xml.items}>${sanitize(item)}</${setting.xml.items}>\n`;
                    }
                    xml += `    </${setting.xml.tag}>\n`;
                }
            } else if (setting.type === "string") {
                xml += `    <${setting.xml.tag}><![CDATA[${storage[key].replace(/]]>/g, "]]]]><![CDATA[>")}]]></${setting.xml.tag}>\n`;
            } else {
                xml += `    <${setting.xml.tag}>${sanitize(storage[key])}</${setting.xml.tag}>\n`;
            }
        }
        xml += "</settings>";
        return xml;
    },
    import(xml, storage = localStorage) {
        let parser = new DOMParser();
        let settingsXML = parser.parseFromString(xml, "application/xml");
        let settings = settingsXML.documentElement;
        if (settingsXML.querySelector("parsererror")) {
            throw Error(`Parser error: ${settingsXML.querySelector("parsererror").textContent}`);
        } else if (settings.tagName !== "settings") {
            throw Error(`Root tag is <${settings.tagName}>, not <settings>`);
        }
        for (let [key, setting] of entries(settings.schema)) {
            if (!setting.xml) continue;
            if (!xpath(settingsXML, `./${setting.xml.tag}`)) {
                throw Error(`Missing <${setting.xml.tag}>`);
            }
            if (setting.type === "boolean") {
                storage[key] = xpath(settingsXML, `string(./${setting.xml.tag}/@${setting.xml.attr})`) === "true";
                setting.onChange?.(storage[key] === "true");
            } else if (setting.type === "number") {
                storage[key] = xpath(settingsXML, `string(./${setting.xml.tag}/@${setting.xml.attr})`);
                setting.onChange?.(storage[key]);
            } else if (setting.type === "array") {
                let items = [];
                for (let node of xpath(settingsXML, `./${setting.xml.tag}/${setting.xml.items}`)) {
                    items.push(node.textContent);
                }
                storage[key] = JSON.stringify(items);
                setting.onChange?.(items);
            } else if (setting.type === "string") {
                storage[key] = xpath(settingsXML, `string(./${setting.xml.tag})`);
                setting.onChange?.(storage[key]);
            }
        }
    },
    get(key, storage = localStorage) {
        let setting = settings.schema[key];
        if (setting.type === "boolean") {
            return storage[key] === "true";
        } else if (setting.type === "number") {
            return +storage[key];
        } else if (setting.type === "array") {
            return JSON.parse(storage[key]);
        } else if (setting.type === "string") {
            return storage[key];
        }
    },
    set(key, value, storage = localStorage) {
        let setting = settings.schema[key];
        if (setting.type === "boolean") {
            storage[key] = value ? "true" : "false";
        } else if (setting.type === "number") {
            storage[key] = value;
        } else if (setting.type === "array") {
            storage[key] = JSON.stringify(value);
        } else if (setting.type === "string") {
            storage[key] = value;
        }
    },
    render(el) {
        el.innerHTML = `
            <div class="hbox fill">
                <div class="settings_sidebar"></div>
                <div class="vbox fill" style="gap: 4px; padding: 4px;">
                    <div class="settings_content"></div>
                    <div class="button_row">
                        <button class="import">Import</button>
                        <button class="export">Export</button>
                    </div>
                </div>
            </div>
        `;
        let sidebar = document.querySelector(".settings_sidebar");
        let content = document.querySelector(".settings_content");
        for (let [categoryId, category] of entries(settings.layout)) {
            let cat = document.createElement("div");
            cat.classList.add("settings_category");
            cat.textContent = category.name;
            sidebar.appendChild(cat);
            if (categoryId === "general") cat.classList.add("selected");
            cat.addEventListener("click", () => {
                sidebar.querySelector(".selected").classList.remove("selected");
                cat.classList.add("selected");
                settings.renderCategory(content, categoryId);
            });
        }
        let exportButton = document.querySelector(".export");
        exportButton.addEventListener("click", () => {
            exportWindow();
        });
        let importButton = document.querySelector(".import");
        importButton.addEventListener("click", () => {
            importWindow();
        });
        settings.renderCategory(content, "general");
    },
    renderCategory(el, category) {
        el.innerHTML = "";
        let layout = settings.layout[category].settings;
        for (let i = 0; i < layout.length; i++) {
            let setting = layout[i];
            if (setting.visible && !setting.visible()) continue;
            let key = setting.key;
            switch (setting.type) {
                case "checkbox": {
                    let label = document.createElement("label");
                    let input = document.createElement("input");
                    label.appendChild(input);
                    input.type = "checkbox";
                    input.checked = settings.get(key);
                    input.onchange = () => { 
                        settings.set(key, input.checked)
                        setting.onChange?.(input.checked);
                    };
                    label.appendChild(document.createTextNode(` ${setting.label}`));
                    el.appendChild(label);
                } break;
                case "range": {
                    let label = document.createElement("label");
                    label.appendChild(document.createTextNode(`${setting.label}: `));
                    let input = document.createElement("input");
                    input.style.verticalAlign = "middle"; 
                    label.appendChild(input);
                    input.type = "range";
                    input.min = setting.min;
                    input.max = setting.max;
                    input.value = settings.get(key);
                    input.onchange = () => { 
                        settings.set(key, input.value);
                        setting.onChange?.(input.value);
                    };
                    el.appendChild(label);
                } break;
                case "textarea": {
                    let textarea = document.createElement("textarea");
                    textarea.className = "settings_textarea";
                    textarea.placeholder = setting.placeholder;
                    if (setting.splitByLine) {
                        textarea.value = settings.get(key).join("\n");
                        textarea.onchange = () => { 
                            let lines = textarea.value.split("\n").map(w => w.trim()).filter(w => w.length > 0);
                            settings.set(key, lines);
                            setting.onChange?.(lines);
                        };
                    } else {
                        textarea.value = settings.get(key);
                        textarea.oninput = () => { 
                            
                            settings.set(key, textarea.value);
                            setting.onChange?.(textarea.value);
                        };
                    }
                    el.appendChild(textarea);
                } break;
                case "text": {
                    let label = document.createElement("label");
                    label.appendChild(document.createTextNode(`${setting.label}: `));
                    let input = document.createElement("input");
                    input.type = "text";
                    input.value = settings.get(key);
                    if (setting.placeholder) input.placeholder = setting.placeholder;
                    if (setting.getOptions) {
                        let datalist = document.createElement("datalist");
                        datalist.id = `dl_${key}`;
                        for (let opt of setting.getOptions()) {
                            let option = document.createElement("option");
                            option.value = opt;
                            datalist.appendChild(option);
                        }
                        input.setAttribute("list", datalist.id);
                        label.appendChild(datalist);
                    }
                    input.onchange = () => {
                        settings.set(key, input.value);
                        setting.onChange?.(input.value);
                    };
                    label.appendChild(input);
                    el.appendChild(label);
                } break;
                case "html": {
                    let div = document.createElement("div");
                    div.innerHTML = setting.html;
                    el.appendChild(div);
                }
            }
            if (setting.description) {
                let small = document.createElement("small");
                small.textContent = typeof setting.description === "function" ? setting.description() : setting.description;
                el.appendChild(small);
            }
        }
    }
};

// --- Auto Join appearance -------------------------------------------------
// These suggestion lists mirror server/settings.json (bonziColors / hats /
// blessedHats). They only feed the autocomplete hints in the Auto Join panel;
// the server enforces what each rank may actually use, so drift here is harmless.
const AUTO_NORMAL_COLORS = ["purple", "blue", "magenta", "green", "red", "black", "brown", "maroon", "peedy", "yellow", "cyan", "pink", "gray", "orange", "white"];
const AUTO_BLESSED_SKINS = ["angel", "glow", "noob", "gold"];
const AUTO_POPE_SKINS = ["pope", "radical", "rad", "darllo", "izhan", "jimmy", "greenmsn", "greenpope", "bonzidev"];
const AUTO_NORMAL_HATS = ["tophat", "bluebowtie", "bieber", "troll", "kamala", "banana", "elon", "bucket", "scarf", "obama", "bfdi", "maga", "evil", "emoji", "wizard", "cat", "witch", "qmark", "horse", "bowtie", "pot", "chef", "ushanka", "party", "epic", "bush", "clown", "sunglasses", "chain"];
const AUTO_BLESSED_HATS = ["dank", "cigar", "illuminati", "bear", "truck", "propeller", "nopupil", "pumpkin", "cauldron", "frankenstein", "hockey", "don", "decorated", "santa", "elf", "rudolph"];
// Skin anyone can wear: /freepope (runlevel 0) gives the dunce cap + "Fake Pope" tag.
const AUTO_PUBLIC_SKINS = ["freepope"];
// Mod-tier (runlevel >= 2) hats hardcoded in the server /hat command.
const AUTO_MOD_HATS = ["king", "headphones2", "headphones3", "scarf2", "redcrown", "diamondchain", "silverchain", "bluepupils", "greenpupils"];

// "Mod and above" can set tags (server /tag is runlevel 1.5: kings/admins/popes).
function isModRank() { return admin || king || pope || radical; }
// Janny (runlevel 1.05) and above — janitors, kings, admins, popes.
function isJannyRank() { return janitor || king || admin || pope || radical; }
// Blessed-tier perks (blessed skins/hats, multihat) are runlevel >= 1.
function isBlessedRank() { return blessed || janitor || king || admin || pope || radical; }
// Mods (runlevel >= 2: king/admin/pope) get the 10-hat limit server-side.
function autoHatLimit() { return isModRank() ? 10 : isBlessedRank() ? 3 : 1; }

function appearanceSuggestions() {
    let out = [...AUTO_NORMAL_COLORS, ...AUTO_PUBLIC_SKINS];
    if (isBlessedRank()) out.push(...AUTO_BLESSED_SKINS);
    if (pope) out.push(...AUTO_POPE_SKINS);
    return [...new Set(out)];
}

function hatSuggestions() {
    let out = [...AUTO_NORMAL_HATS];
    if (isBlessedRank()) out.push(...AUTO_BLESSED_HATS);
    if (isModRank()) out.push(...AUTO_MOD_HATS);
    out.push(...unlocks); // vault hats this user has unlocked
    return [...new Set(out)];
}

function appearanceHint() {
    let parts = ["Pick a color", "freepope (dunce cap + Fake Pope tag)"];
    if (isBlessedRank()) parts.push("blessed skin (angel/glow/noob/gold)");
    if (pope) parts.push("pope skin");
    return parts.join(" or ") + ".";
}

function hatHint() {
    let limit = autoHatLimit();
    let extra = isModRank() ? " Blessed/mod/vault hats allowed." : isBlessedRank() ? " Blessed/vault hats allowed." : "";
    return `Up to ${limit} hat${limit === 1 ? "" : "s"}, separated by spaces.${extra}`;
}

// Build the Auto Join payload sent with the login event. The server applies
// these presets (color/skin, hats, tag) BEFORE the join animation plays — gated
// by your rank — so you appear with your chosen look instantly, instead of the
// client re-issuing /color, /hat, /tag a second after joining. Returns undefined
// when Auto Join is off or empty (so no `auto` key is sent at all).
function autoJoinPresets() {
    if (!settings.get("autoApply")) return undefined;
    let color = (settings.get("autoColor") || "").trim();
    let hats = (settings.get("autoHats") || "").trim();
    let tag = (settings.get("autoTag") || "").trim();
    if (!color && !hats && !tag) return undefined;
    return { color, hats, tag };
}

function applyCustomCSS(css) {
    customStyle.textContent = css;
}

function applyAcidTheme() {
    acidThemeStyle.textContent =
        `@keyframes sex{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}` +
        `#content::before, canvas, img, picture, video, body, .window, .bonzi, .desktop { animation: sex 5s linear infinite; }` +
        `#content::before { filter: hue-rotate(0deg); }`;
}

function applyTerminalTheme() {
    terminalThemeStyle.textContent =
        `.bubble,.bonzi_name,.bubble::after{background:0!important;border:0}` +
        `*{color:green!important;font-family:monospace!important}` +
        `#content{background:#000}` +
        `.bubble-content::before{content:">"}` +
        `.bonzi_name{padding:0;position:static}` +
        `.bubble{overflow:visible}` +
        `.bubble-left{right:0px}` +
        `input[type=text]{background-color:#000;border:0}` +
        `#chat_send,#chat_tray{display:none}` +
        `#chat_bar{background:0}`;
}

function syncVoicePreferences() {
    let pitch = clamp(Number(settings.get("ttsPitch")), 15, 125);
    let speed = clamp(Number(settings.get("ttsSpeed")), 125, 275);
    if (!Number.isFinite(pitch)) pitch = 50;
    if (!Number.isFinite(speed)) speed = 175;
    settings.set("ttsPitch", pitch);
    settings.set("ttsSpeed", speed);

    let disableLocal = settings.get("disableLocalVoiceSettings");
    let localBonzi = bonzis.get(me);
    let currentPitch = localBonzi?.userPublic?.pitch;
    let currentSpeed = localBonzi?.userPublic?.speed;
    let effectivePitch = Number.isFinite(Number(currentPitch)) ? Number(currentPitch) : pitch;
    let effectiveSpeed = Number.isFinite(Number(currentSpeed)) ? Number(currentSpeed) : speed;

    if (disableLocal) {
        effectivePitch = clamp(effectivePitch, 15, 125);
        effectiveSpeed = clamp(effectiveSpeed, 125, 275);
    } else {
        effectivePitch = pitch;
        effectiveSpeed = speed;
    }

    if (localBonzi) {
        localBonzi.userPublic.pitch = effectivePitch;
        localBonzi.userPublic.speed = effectiveSpeed;
    }

    if (socket?.connected) {
        socket.emit("voiceSettings", { pitch: effectivePitch, speed: effectiveSpeed });
    }
}

// Recolor only the desktop wallpaper (not Bonzis/windows). We paint a copy of
// #content's background onto its ::before pseudo-element and filter just that
// layer; `background: inherit` makes it track whichever wallpaper is active
// (default / vaporwave / classic). Cleared (no-op) at the default values.
function applyBgTheme() {
    let hue = Number(settings.get("bgHue"));
    let sat = Number(settings.get("bgSaturate"));
    let bri = Number(settings.get("bgBrightness"));
    if (!Number.isFinite(hue)) hue = 0;
    if (!Number.isFinite(sat)) sat = 100;
    if (!Number.isFinite(bri)) bri = 100;
    if (hue === 0 && sat === 100 && bri === 100) {
        bgThemeStyle.textContent = "";
        return;
    }
    bgThemeStyle.textContent =
        `#content::before{content:"";position:fixed;inset:0;z-index:-1;` +
        `pointer-events:none;background:inherit;` +
        `filter:hue-rotate(${hue}deg) saturate(${sat}%) brightness(${bri}%);}`;
}

settings.init();
settings.load();

function xpath(el, expr) {
    let result = el.getRootNode().evaluate(expr, el);
    switch (result.resultType) {
        case XPathResult.BOOLEAN_TYPE:
            return result.booleanValue;
        case XPathResult.NUMBER_TYPE:
            return result.numberValue;
        case XPathResult.STRING_TYPE:
            return result.stringValue;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            let list = [];
            let node;
            while (node = result.iterateNext()) {
                list.push(node);
            }
            return list;
    }
}

function openSettings() {
    if (settingsDialog) {
        settingsDialog.element.remove();
    }
    settingsDialog = new Dialog({
        title: "Settings",
        class: "settings",
        width: 650,
        height: 420,
        x: 20,
        y: 20
    });
    settings.render(settingsDialog.bodyElement);
}

function exportWindow() {
    let dialog = new Dialog({
        title: "Export Settings",
        class: "export_window",
        html: `
            <textarea class="export fill" readonly></textarea>
        `,
        width: 400,
        height: 300,
        x: 100,
        y: 100
    });
    let element = dialog.element;
    let exportText = element.querySelector(".export");
    exportText.value = settings.export();
    exportText.focus();
}

function importWindow() {
    let dialog = new Dialog({
        title: "Import Settings",
        class: "import_window",
        html: `
            <textarea class="import fill" placeholder="Paste your settings here."></textarea>
            <div class="button_row">
                <button class="import_button">Import</button>
            </div>
        `,
        width: 400,
        height: 300,
        x: 100,
        y: 100
    });
    let element = dialog.element;
    let importText = element.querySelector(".import");
    importText.focus();
    element.querySelector(".window_close").onclick = () => {
        dialog.element.remove();
    }
    element.querySelector(".import_button").onclick = () => {
        let text = importText.value;
        try {
            let lastX = settingsDialog.x;
            let lastY = settingsDialog.y;
            settings.import(text);
            openSettings();
            settingsDialog.move(lastX, lastY);
        } catch (err) {
            Dialog.alert({ 
                html: markup(err.message)
            });
        }
    }
}

async function dolphin() {
    if (!gravity) {
        let script = document.createElement("script");
        script.async = true;
        script.src = "./lib/jGravity.js";
        gravity = true;
        script.onload = () => {
            $("#content").jGravity({
                target: ".bonzi",
                depth: Infinity,
            });
        }
        document.head.appendChild(script);
    }
}

async function water() {
    if (!isWaterLoaded) {
        let script = document.createElement("script");
        script.async = true;
        script.src = "./lib/waterFloat-min.js";
        isWaterLoaded = true;
        script.onload = () => {
            new waterFloat($(".bonzi"), 900, 3, 8);
        }
        document.head.appendChild(script);
    }
}



function cmd(str) {
	let commandText = str.trim();
	let firstSpace = commandText.indexOf(" ");
	let command = firstSpace === -1 ? commandText : commandText.slice(0, firstSpace);
	let args = firstSpace === -1 ? "" : commandText.slice(firstSpace + 1);
    socket.emit("command", {
		command,
		args,
	});
}

function bonziVerPopup() {
    const username = (this.userPublic && this.userPublic.name) ? this.userPublic.name : "User";

    return new Dialog({
        title: "About BonziWORLD",
        class: "flex_window",
        html: `
            <div class="blessed_body" style="font-family: 'Tahoma', sans-serif; font-size: 11px; padding: 12px; color: #000; box-sizing: border-box;">
                <div style="text-align: center; margin-bottom: 12px;">
                    <img src="img/misc/bonziver.png" alt="BonziWORLD" style="max-width: 100%; height: auto;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <b>BonziWORLD</b><br>
                    Version 6.1 (Build 7601: Service Pack 1)<br>
                    Copyright &copy; Malwaresoft Corporation. All rights reserved.
                </div>

                <div style="margin-bottom: 15px;">
                    This product is licensed under the terms of the<br>
                    <a href="#" style="color: #0066cc;">End-User License Agreement</a> to:
                    <div style="margin-left: 20px; margin-top: 5px;">
                        <b>${username}</b><br>
                        Malwaresoft
                    </div>
                </div>

                <hr style="border: none; border-top: 1px solid #d0d0d0; margin: 10px 0 15px 0;">

                <div style="margin-bottom: 15px;">
                    <b>Physical memory available to BonziWORLD:</b> Unlimited
                </div>

                <div style="text-align: right;">
                    <button class="xp-button" onclick="this.closest('.flex_window').remove()" style="
                        font-family: 'Tahoma', sans-serif;
                        font-size: 11px;
                        min-width: 75px;
                        padding: 3px 12px;
                        cursor: pointer;">
                        OK
                    </button>
                </div>
            </div>
        `,
        x: 300,
        y: 400,
        width: 412,
        height: 343,
    });
}

function blessedPopup() {
    return new Dialog({
        title: "Blessmode",
        class: "flex_window",
        html: `
            <div class="blessed_body">
                <h1><marquee>YOU'VE BEEN BLESSED!</marquee></h1>
                Blessed is a VIP-like status given to users who I like.<br>
                You now have access to:<br>
                <ul>
                    <li> <b>Mutlihatting</b>: Use the /hat command with up to 3 hats. Try <var>/hat dank tophat</var>.
                    <li> <b>Skins:</b> 4 custom skins
                    <li> <b>Hats:</b> 4 extra hats
                </ul>
                <h3>Skins</h3>
                <div class="roulette">
                    <div class="card angel" onclick="cmd('angel')"></div>
                    <div class="card glow" onclick="cmd('glow')"></div>
                    <div class="card noob" onclick="cmd('noob')"></div>
                    <div class="card gold" onclick="cmd('gold')"></div>
                    <div class="card applecat" onclick="cmd('applecat')"></div>
                </div>
                <h3>Hats</h3>
                <div class="roulette">
                    <div class="cardhat dank" onclick="cmd('hat dank')"></div>
                    <div class="cardhat illuminati" onclick="cmd('hat illuminati')"></div>
                    <div class="cardhat cigar" onclick="cmd('hat cigar')"></div>
                    <div class="cardhat propeller" onclick="cmd('hat propeller')"></div>
                </div>
            </div>
        `,
        x: 300,
        y: 400,
        width: 600,
        height: 400,
    });
}
function helpPopup() {
    const width = 852;
    const height = 480;

    // Calculate center coordinates
    const x = Math.max(0, (window.innerWidth - width) / 2);
    const y = Math.max(0, (window.innerHeight - height) / 2);

    return new Dialog({
        title: "README",
        class: "flex_window",
        html: `
            <div class="blessed_body">
                <iframe src="./readme.html" width="100%" height="100%"></iframe>
            </div>
        `,
        x: x,
        y: y,
        width: width,
        height: height,
    });
}
function cinemaPopup() {
    return new Dialog({
        title: "CINEMA",
        class: "flex_window",
        html: `
            <div class="blessed_body">
                <h1><marquee>WELCOME TO THE CINEMA!</marquee></h1>
                <p>Watch sum videos here.</p>
            </div>
        `,
        x: 300,
        y: 400,
        width: 600,
        height: 400,
    });
}

function janitorPopup() {
    return new Dialog({
        title: "You're a Janitor!",
        class: "flex_window",
        html: `
            <div class="blessed_body">
                <h1><marquee>YOU'VE BEEN JANNIFIED!</marquee></h1>
                You've been appointed as a <b>Janitor</b> on BonziWORLD by the Pope.<br><br>
                <b>What janitors do:</b><br>
                <ul>
                    <li>Review images and videos sent by users before they appear in chat.</li>
                    <li>Approve clean content, deny rule-breaking content, or permanently blacklist URLs.</li>
                    <li>The <b>Media Queue</b> window opens automatically when new media arrives.</li>
                    <li>You can reopen it anytime from the Start Menu.</li>
                </ul>
                <b>How to be a good janitor:</b><br>
                <ul>
                    <li>Approve things quickly — users are waiting.</li>
                    <li>When denying, leave a clear reason.</li>
                    <li>Use <b>Ban URL</b> for anything that should never appear again (NSFW, illegal content, spam).</li>
                    <li>When in doubt, deny and ask the Pope.</li>
                    <li>Don't abuse it. You can be dejannified.</li>
                </ul>
                <hr>
                <b>You've also been Blessed!</b> As a janitor you get all Blessed perks:<br>
                <ul>
                    <li><b>Multihatting</b>: Up to 3 hats at once. Try <var>/hat dank tophat</var>.</li>
                    <li><b>4 extra skins</b> and <b>4 extra hats</b>.</li>
                </ul>
                <h3>Skins</h3>
                <div class="roulette">
                    <div class="card angel" onclick="cmd('angel')"></div>
                    <div class="card glow" onclick="cmd('glow')"></div>
                    <div class="card noob" onclick="cmd('noob')"></div>
                    <div class="card gold" onclick="cmd('gold')"></div>
                </div>
                <h3>Hats</h3>
                <div class="roulette">
                    <div class="cardhat dank" onclick="cmd('hat dank')"></div>
                    <div class="cardhat illuminati" onclick="cmd('hat illuminati')"></div>
                    <div class="cardhat cigar" onclick="cmd('hat cigar')"></div>
                    <div class="cardhat propeller" onclick="cmd('hat propeller')"></div>
                </div>
                <hr>
                <small>Your janitor status is stored in your browser and will remain after reconnecting.</small>
            </div>
        `,
        x: 200,
        y: 50,
        width: 620,
        height: 560,
    });
}
function djPopup() {
    return new Dialog({
        title: "YOU GOT DJ!",
        class: "flex_window",
        html: `
            <div class="blessed_body">
                <h1><marquee>YOU GOT DJ!</marquee></h1>
                <p>With a DJ rank, You can now use /byoutube and /byoutubespeed. But there's rules:</p>
                <h4>1. No abusing.</h4>
                <h4>2. No putting stuff people don't like, always ask first.</h4>
                <h4>3. No Gore/Pornography/Vore/NSFW on Background YouTube.</h4>
                <small>Your DJ status is also stored in your browser and will remain after reconnecting.</small>
            </div>
        `,
        x: 300,
        y: 400,
        width: 600,
        height: 400,
    });
}
start_button.onclick = () => {
    start_menu.hidden = !start_menu.hidden;
};
function openDmWindow(peerGuid, peerName) {
    if (dmWindows.has(peerGuid)) {
        const existing = dmWindows.get(peerGuid);
        existing.dialog.element.style.zIndex = lastZ++ + 9999;
        existing.input.focus();
        return existing;
    }
    const dialog = new Dialog({
        title: `DM ${peerName}`,
        class: "flex_window",
        x: 60 + Math.floor(Math.random() * 180),
        y: 60 + Math.floor(Math.random() * 100),
        width: 360,
        height: 320,
        onclose: () => dmWindows.delete(peerGuid),
        html: `
            <div style="display:flex;flex-direction:column;height:100%;box-sizing:border-box;">
                <div class="dm_log" style="flex:1;overflow-y:auto;padding:4px;border-bottom:1px solid #aaa;"></div>
                <div style="display:flex;gap:4px;padding:4px;">
                    <input class="dm_input" type="text" placeholder="Message..." maxlength="300" style="flex:1;">
                    <button class="xp-button dm_send">Send</button>
                </div>
            </div>
        `,
    });

    const logEl   = dialog.element.querySelector(".dm_log");
    const inputEl = dialog.element.querySelector(".dm_input");
    const sendBtn = dialog.element.querySelector(".dm_send");

    function sendDm() {
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.value = "";
        socket.emit("dm", { to: peerGuid, text });
        appendDmEntry(logEl, me, text);
        inputEl.focus();
    }

    sendBtn.onclick = sendDm;
    inputEl.onkeypress = (e) => { if (e.which === 13) sendDm(); };
    inputEl.focus();

    const entry = { dialog, logEl, input: inputEl, peerName };
    dmWindows.set(peerGuid, entry);
    return entry;
}

function appendDmEntry(logEl, fromGuid, text) {
    const pub = usersPublic.get(fromGuid) || {};
    const name = pub.name || "Unknown";
    const color = pub.color || "purple";
    const [baseColor, ...hats] = color.split(" ");
    const atBottom = logEl.scrollHeight - logEl.clientHeight - logEl.scrollTop <= 20;
    logEl.insertAdjacentHTML("beforeend", `
        <hr>
        <div class="log_message">
            <div class="log_icon">
                <img class="color" src="img/pfp/${baseColor}.webp">
                ${hats.map(h => `<img class="hat" src="img/pfp/${h}.webp">`).join("")}
            </div>
            <div class="log_message_cont">
                <span><b>${nmarkup(name)}</b> <span class="log_time">${time()}</span></span>
                <div class="log_message_content">${markup(text)}</div>
            </div>
        </div>
    `);
    if (atBottom) logEl.scrollTop = logEl.scrollHeight;
}
function userInfoPopup(userPublic, theid) {
    let u = userPublic || {};
    let color = sanitize((u.color || "").split(" ")[0] || "(none)");
    let name = sanitize(u.name || "");
    let tag = sanitize(u.tag || "") || "(none)";
    let guid = sanitize(theid || "")
    new Dialog({
        title: "User Info",
        class: "flex_window user_info",
        html: `
            <div style="padding: 12px; line-height: 1.7;">
                <b>Color:</b> ${color}<br>
                <b>Name:</b> ${name}<br>
                <b>Tag:</b> ${tag}<br>
                <b>GUID:</b> ${theid}
            </div>
        `,
        x: 200,
        y: 200,
        width: 260,
        height: 160,
    });
}
function bonziEditorPopup() {
    let dialog = new Dialog({
        title: "Bonzi Editor",
        class: "flex_window bonzi_editor",
        html: `
            <div class="hbox fill">
                <div class="hats">
                    <h2>Colors</h1>
                    <div class="editor-grid color-grid"></div>
                    <h2>Hats</h1>
                    <div class="editor-grid hat-grid"></div>
                    <h2>Unlockable</h2>
                    <div class="editor-grid unlockable-grid"></div>
                </div>
                <div class="preview-container">
                    Preview
                    <div class="preview"></div>
                </div>
            </div>
        `,
        x: 200,
        y: 200,
        width: 600,
        height: 400,
    });
    let element = dialog.element;
    function itemElements(selector, itemArray, path, callback, { isLocked, tooltip } = {}) {
        let grid = element.querySelector(selector);
        for (let hat of itemArray) {
            let item = document.createElement("div");
            item.style.backgroundImage = `url("${path}/${hat}.webp")`;
            item.className = "editor-item";
            if (isLocked?.(hat)) item.classList.add("locked-item");
            item.setAttribute("data-tooltip", tooltip?.(hat) ?? hat);
            item.setAttribute("data-hat", hat);
            item.onclick = () => {
                callback(hat);
            };
            grid.appendChild(item);
        }
    }
    itemElements(".color-grid", BonziData.colors.normal, "img/pfp", (hat) => cmd(`color ${hat}`));
    itemElements(".hat-grid", BonziData.hats.normal, "img/haticon", (hat) => cmd(`hat ${hat}`));
    itemElements(".unlockable-grid", BonziData.hats.vault, "img/haticon", (hat) => cmd(`hat ${hat}`), {
        isLocked: (hat) => !unlocks.includes(hat),
        tooltip: (hat) => `${hat}\nUnlocked in the vault`,
    });
    itemElements(".unlockable-grid", BonziData.hats.event.filter(hat => unlocks.includes(hat)), "img/haticon", (hat) => cmd(`hat ${hat}`), {
        tooltip: (hat) => `${hat}\nFormerly unlocked in the 2026 April Fools event`,
    });
    let preview = element.querySelector(".preview");
    let myColor = bonzis.get(me).color;
    preview.style.backgroundImage = myColor.split(" ").map(c => colorTokenToUrl(c, "img/bonzi")).reverse().join(", ");
    preview.style.backgroundSize = "";
    preview.style.backgroundRepeat = "";
}

start_menu_pfp.onclick = () => {
    start_menu.hidden = true;
    bonziEditorPopup();
};

start_menu_name.onkeyup = (e) => {
    if (e.key === "Enter") {
        cmd(`name ${start_menu_name.value}`);
    }
};

start_menu_name.onblur = () => {
    cmd(`name ${start_menu_name.value}`);
};

settings_button.onclick = () => {
    start_menu.hidden = true;
    openSettings();
};

function pollCreatorPopup() {
    let dialog = new Dialog({
        title: "Poll Creator",
        class: "flex_window poll_creator",
        x: 150,
        y: 100,
        width: 300,
        height: 410,
        resizable: false,
        html: `
            <div class="poll-creator-body">
                <textarea class="poll-title" placeholder="Ask a question" maxlength="1000"></textarea>
                <hr>
                Options:
                <div class="poll-options"></div>
                <div class="poll-buttons">
                    <button class="xp-button add-option">Add Option</button>
                    <button class="xp-button create-poll">Create Poll</button>
                </div>
            </div>
        `,
    });
    let element = dialog.element;
    let optionsContainer = element.querySelector(".poll-options");
    let addOptionButton = element.querySelector(".add-option");
    let options = [];

    function addOption() {
        if (options.length >= 5) return;
        let optionRow = document.createElement("div");
        optionRow.className = "poll-option-row";
        optionRow.innerHTML = `
        <input type="text" placeholder="Option ${options.length + 1}" maxlength="50">
        <button class="xp-button delete-option">X</button>
        `;
        optionRow.querySelector(".delete-option").onclick = () => {
            if (optionsContainer.children.length > 2) {
                optionRow.remove();
                options.splice(options.indexOf(optionRow), 1);
                updatePoll();
            }
        };
        options.push(optionRow);
        optionsContainer.appendChild(optionRow);
        updatePoll();
    }

    function updatePoll() {
        for(let i = 0; i < options.length; i++) {
            options[i].querySelector("input").placeholder = `Option ${i + 1}`;
        }
        for (let el of element.querySelectorAll(".delete-option")) {
            el.disabled = options.length <= 2;
        }
        addOptionButton.disabled = options.length >= 5;
    }

    addOption();
    addOption();

    addOptionButton.onclick = () => {
        if (options.length < 5) addOption();
    };



    element.querySelector(".create-poll").onclick = () => {
        let title = element.querySelector(".poll-title").value.trim();
        let options = [...optionsContainer.querySelectorAll("input")]
            .map(input => input.value.trim())
            .filter(val => val.length > 0);
        let cmd_str = `advpoll ${title.replace(/[;\\]/g, "\\$&")}`;
        cmd_str += `;${options.map(option => option.replace(/[;\\]/g, "\\$&")).join(";")}`;
        cmd(cmd_str);
        dialog.element.remove();
    };
}



poll_button.onclick = () => {
    start_menu.hidden = true;
    pollCreatorPopup();
};
queue_button.hidden = true;  // hidden by default until janitor status confirmed

queue_button.onclick = () => {
    start_menu.hidden = true;
    openJanitorQueue();
};
function uploadPopup(initialFile) {
    let blobUrl = null;
    let dialog = new Dialog({
        title: "Upload",
        class: "flex_window",
        x: 20,
        y: 50,
        width: 400,
        height: 300,
        html: `
            <div class="upload_dropzone"></div>
            <div style="height: 2px;"></div>
            <input type="file" accept="image/*" class="upload_input" hidden>
            <div class="upload_buttons">
                <div class="fill"><img src="/img/misc/upload.png" class="upload_icon"> Powered by <a href="https://upload.bonziworld.kr">BonziUPLOAD</a></div>
                <button class="xp-button upload_button" disabled>Upload</button>
            </div>
        `,
        onclose: () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        },
    });
    let element = dialog.element;
    let dropzone = element.querySelector(".upload_dropzone");
    let button = element.querySelector(".upload_button");
    let fileInput = element.querySelector(".upload_input");
    let blob = null;

    function loadFile(file) {
        if (!file) return;
        blob = file;
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = URL.createObjectURL(blob);
        dropzone.style.background = `url("${blobUrl}") center center / contain no-repeat`;
        button.disabled = false;
    }

    if (initialFile) loadFile(initialFile);

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = () => loadFile(fileInput.files[0]);

    dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#003c74";
    };

    dropzone.ondragleave = () => {
        dropzone.style.borderColor = "";
    };

    dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "";
        loadFile(e.dataTransfer.files[0]);
    };
    button.onclick = async () => {
        if (!blobUrl) return;

        let formData = new FormData();
        formData.append("file", blob, "image.png");

        try {
            let response = await fetch("https://upload.bonziworld.kr/api/v1/upload", {
                method: "POST",
                body: formData,
            });

            let data = await response.json();
            let url = "https://upload.bonziworld.kr" + data.url;

            console.log(url);
            cmd(`img ${url}`);
            dialog.element.remove();
        } catch (e) {
            console.error(e);
        }
    };
}

image_button.onclick = () => {
    start_menu.hidden = true;
    uploadPopup();
};

document.onpaste = (e) => {
    let items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.includes("image")) {
            e.preventDefault();
            let file = item.getAsFile();
            uploadPopup(file);
            break;
        }
    }
};

function vaultPopup() {
    let dialog = new Dialog({
        title: "THE VAULT",
        class: "flex_window no_padding_window",
        x: 10,
        y: 10,
        width: 700,
        height: 500,
        html: `
            <div class="vault-body">
                <audio autoplay src="/vault.mp3" loop hidden></audio>
                <div class="vault-message">Maybe I should've hidden this room better...</div>
                <input class="vault-input">
                <div class="vault-keeper-container">
                    <div class="vault-keeper">
                        <img src="/img/misc/sparkybuddy.webp">
                    </div>
                </div>
            </div>
        `,
    });
    let element = dialog.element;
    let input = element.querySelector(".vault-input");
    let button = element.querySelector(".vault-keeper");
    let label = element.querySelector(".vault-message");
    let tag = null;
    button.onclick = async () => {
        let guess = input.value;
        input.value = "";
        let response = await fetch("/vault", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ guess, tag }),
        });
        let json = await response.json();
        tag = json.tag;
        label.innerHTML = json.message;
        if (json.unlock && !unlocks.includes(json.unlock)) {
            unlocks.push(json.unlock);
            for (let item of document.getElementsByClassName("locked-item")) {
                if (item.getAttribute("data-hat") === json.unlock) {
                    item.classList.remove("locked-item");
                }
            }
        }
    };
    input.onkeydown = (e) => {
        if (e.key === "Enter") button.onclick();
    };
}

start_menu_vault.onclick = () => {
    vaultPopup();
    start_menu.hidden = true;
};
let janitorQueueItems = new Map(); // id -> item
let janitorDialog = null;

function openJanitorQueue() {
    if (janitorDialog) return;
    janitorDialog = new Dialog({
        title: "Media Queue",
        class: "flex_window",
        x: 10, y: 10,
        width: 420, height: 500,
        html: `<div id="janitor_queue" style="display:flex;flex-direction:column;gap:6px;padding:6px;overflow-y:auto;height:100%;box-sizing:border-box;"></div>`,
        onclose: () => { janitorDialog = null; }
    });
    // Re-render existing items (e.g. if they close and reopen)
    for (let item of janitorQueueItems.values()) {
        renderJanitorItem(item);
    }
}

function renderJanitorItem(item) {
    if (!janitorDialog) return;
    let queue = janitorDialog.element.querySelector("#janitor_queue");
    if (!queue) return;
    // Don't double-add
    if (queue.querySelector(`[data-jid="${item.id}"]`)) return;

    let div = document.createElement("div");
    div.setAttribute("data-jid", item.id);
    div.style.cssText = "border:2px solid #888;padding:6px;background:#f0f0f0;";

    let preview = "";
    if (item.type === "image") {
        preview = `<img src="${sanitize(item.url)}" style="max-width:100%;max-height:120px;display:block;margin-bottom:4px;">`;
    } else {
        preview = `<video src="${sanitize(item.url)}" style="max-width:100%;max-height:120px;display:block;margin-bottom:4px;" controls></video>`;
    }

    div.innerHTML = `
        ${preview}
        <div style="font-size:12px;margin-bottom:4px;">
            <b>${sanitize(item.type)}</b> from <b>${nmarkup(item.senderName)}</b>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="xp-button j-approve">✔ Approve</button>
            <button class="xp-button j-deny">✘ Deny</button>
            <button class="xp-button j-ban">🚫 Ban URL</button>
        </div>
    `;

    div.querySelector(".j-approve").onclick = () => cmd(`japprove ${item.id}`);
    div.querySelector(".j-deny").onclick = () => {
        let reason = prompt("Deny reason (optional):");
        cmd(`jdeny ${item.id} ${reason || ""}`);
    };
    div.querySelector(".j-ban").onclick = () => {
        let reason = prompt("Blacklist reason:");
        cmd(`jbanimg ${item.id} ${reason || "Janitor blacklisted"}`);
    };

    queue.appendChild(div);
}

socket.on("janitorQueue", (item) => {
    janitorQueueItems.set(item.id, item);
    if (!janitorDialog && !settings.get("disableMediaQueueAutoOpen")) openJanitorQueue();
    renderJanitorItem(item);
});

socket.on("janitorRemove", (data) => {
    janitorQueueItems.delete(data.id);
    if (janitorDialog) {
        janitorDialog.element.querySelector(`[data-jid="${data.id}"]`)?.remove();
    }
});
socket.on("blessed", () => { blessed = true; blessedPopup(); });
socket.on("debless", () => { blessed = false; Dialog.alert("You have been deblessed.") });
socket.on("janitor",       () => { janitor = true; queue_button.hidden = false; openJanitorQueue(); addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("janitor_first", () => { janitorPopup(); addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("djs",       () => { djs = true; queue_button.hidden = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("djs_first", () => { djPopup(); addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("king",  () => { king = true;  queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("admin",  () => { admin = true;  queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("radical",  () => { radical = true; pope = true; admin = true; queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("radical",    () => { radical = true; pope = true; admin = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("contributor",  () => { contributor = true; pope = true; admin = true; queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("contributor",    () => { contributor = true; pope = true; admin = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("developer",  () => { developer = true; pope = true; admin = true; queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("developer",    () => { developer = true; pope = true; admin = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("hoops",  () => { hoops = true; developer = true; pope = true; admin = true; queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("hoops",    () => { hoops = true; developer = true; pope = true; admin = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("pope",  () => { pope = true; admin = true; queue_button.hidden = false; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("pope",    () => { pope = true; admin = true; addPrivilegedCommands(); if (chat_log_mode_button) chat_log_mode_button.hidden = !(admin || king || pope || radical); });
socket.on("acid", () => { applyAcidTheme(); });
socket.on("unacid", () => { acidThemeStyle.textContent = ""; });
socket.on("terminal", () => { applyTerminalTheme(); });
socket.on("unterminal", () => { terminalThemeStyle.textContent = ""; });
socket.on("nuked", () => setTimeout(() => { blockerror = true; location.reload() }, 4000));
socket.on("banned", () => setTimeout(() => { blockerror = true; window.location.replace("https://bonziworld.kr/nyancat.mp4"); }, 0));
socket.on("removed", () => setTimeout(() => { blockerror = true; location.reload() }, 0));
socket.on("removede", () => setTimeout(() => { blockerror = true; window.location.replace("https://bonziworld.kr/kittycat.mp4"); }, 0));


const banSVG = (ip) => `<svg class="ban-unban-btn" data-ip="${ip}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 115.66" style="width: 28px; height: 28px; display: inline-block; margin-left: 5px; cursor: pointer; vertical-align: middle;"><defs><style>.cls-1{fill:#121212;}.cls-2{fill:#d8453e;}</style></defs><path class="cls-1" d="M37.26,55.09c-2-3.22-5.82-7.6-5.82-11.38a6.09,6.09,0,0,1,4.09-5.53c-.19-3.2-.32-6.44-.32-9.65,0-1.9,0-3.81.11-5.7A13.44,13.44,0,0,1,36,20,20.24,20.24,0,0,1,45,8.47a25.74,25.74,0,0,1,4.91-2.35C53,5,51.54.07,55,0c8-.2,21.08,6.77,26.19,12.3a18.61,18.61,0,0,1,5.22,12.45l-.33,14a4.6,4.6,0,0,1,3.36,2.87C90.48,46,85.9,51.47,83.78,55c-2,3.24-9.45,12.06-9.46,12.14A2.9,2.9,0,0,0,75,68.74a18.48,18.48,0,0,0,2.47,2.74,30.77,30.77,0,0,0-5.12,35H0C0,74.61,34.19,84.72,45.81,68.74c.58-.85.84-1.3.83-1.67,0-.2-8.61-10.75-9.38-12Z"/><path class="cls-2" d="M99.82,69.54a23.06,23.06,0,1,1-16.3,6.75,23,23,0,0,1,16.3-6.75ZM113,85.42l-20.31,20.3a14.62,14.62,0,0,0,2.88,1.21,15,15,0,0,0,14.88-3.76l0,0A15,15,0,0,0,113,85.42ZM86.7,99.78,107,79.47a14.71,14.71,0,0,0-7.18-1.83A15,15,0,0,0,85.49,96.89a14.46,14.46,0,0,0,1.21,2.89Z"/></svg>`;

socket.on("alert", (data) => {
    Dialog.alert(data);
});

socket.on("banlistAlert", (text) => {
    // Add ban SVG next to unban commands for visual feedback
    let formattedText = text.replace(/\n/g, "<br>");
    // Replace unban commands with clickable SVG - match all pages
    formattedText = formattedText.replace(/\|\s*\/unban\s+([^\s]+)/g, (match, ip) => {
        const cleanIp = ip.trim();
        return ` ${banSVG(cleanIp)} | /unban ${cleanIp}`;
    });
    
    let dialog = new Dialog({
        width: 600,
        title: "Ban List",
        bodyClass: "alert_body",
        center: true,
        resizable: true,
        html: `
            <div class="alert_text" style="max-height: 400px; overflow-y: auto; padding: 10px; background: #1a1a1a; border-radius: 4px;">${formattedText}</div>
            <div class="alert_button_row">
                <button class="xp-button ok">OK</button>
            </div>
        `,
    });
    
    // Add click handlers for SVG unban buttons - query after HTML is set
    setTimeout(() => {
        const unbanBtns = dialog.element.querySelectorAll(".ban-unban-btn");
        unbanBtns.forEach(btn => {
            btn.style.pointerEvents = "auto";
            btn.style.cursor = "pointer";
            btn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const ip = btn.getAttribute("data-ip");
                cmd(`unban ${ip}`);
                dialog.element.remove();
            };
        });
    }, 10);
    
    let ok = dialog.element.querySelector(".ok");
    ok.onclick = () => {
        dialog.element.remove();
    };
    ok.focus();
});

socket.on("dm", (data) => {
    if (settings.get("disableDM")) return; // client-side guard backing the server check
    const { from, fromName, text } = data;
    if (!usersPublic.has(from)) {
        usersPublic.set(from, { name: fromName, color: "purple" });
    }
    let entry = dmWindows.get(from);
    if (!entry) entry = openDmWindow(from, fromName);
    appendDmEntry(entry.logEl, from, text);
});

socket.on("dm_sent", () => {});
socket.on("unlock", (data) => {
    if (!unlocks.includes(data.hat)) {
        unlocks.push(data.hat);
        for (let item of document.getElementsByClassName("locked-item")) {
            if (item.getAttribute("data-hat") === data.hat) {
                item.classList.remove("locked-item");
            }
        }
    }
    Dialog.alert(`You unlocked the "${data.hat}" hat!`);
});

function resetRainbow(el) {
    for (let anim of el.getAnimations()) {
        if (anim.animationName === "move") anim.startTime = 0;
    }
}

const rainbowSelector = "gay-rainbow,gay-spoiler,code"; // can have anims

const observer = new MutationObserver(mutations => {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (!(node instanceof Element)) continue;

            if (node.matches(rainbowSelector)) {
                resetRainbow(node);
            }

            node.querySelectorAll(rainbowSelector).forEach(resetRainbow);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

document.body.onmouseover = (e) => {
    let el = e.target.closest("[data-tooltip]");
    if (el) {
        let tooltip = document.getElementById("tooltip");
        tooltip.innerText = el.getAttribute("data-tooltip");
        tooltip.style.display = "block";
        tooltip.style.left = (e.clientX + 10) + "px";
        tooltip.style.top = (e.clientY + 10) + "px";
    }
};

document.body.onmousemove = (e) => {
    let tooltip = document.getElementById("tooltip");
    if (tooltip.style.display !== "none") {
        tooltip.style.left = (e.clientX + 10) + "px";
        tooltip.style.top = (e.clientY + 10) + "px";
    }
};

document.body.onmouseout = (e) => {
    let el = e.target.closest("[data-tooltip]");
    if (el) {
        document.getElementById("tooltip").style.display = "none";
    }
};

document.body.onclick = (e) => {
    if (!e.target.closest("#start_menu, #start_button")) {
        start_menu.hidden = true;
    }
};

socket.on("alert", () => {
    new Audio("/sfx/error.mp3").play().catch(() => {});
});
