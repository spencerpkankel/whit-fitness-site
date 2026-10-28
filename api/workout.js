/* Whit Fitness: today's workouts from Wodify.
 *
 * GET /api/workout  ->  { date, programs: { crossfit: {...}, hyrox: {...}, vitality: {...} } }
 *
 * Runs on Vercel (Node). The Wodify API key never reaches the browser: set it in
 * Vercel > Project > Settings > Environment Variables as WODIFY_API_KEY.
 * Optional: WORKOUT_DEBUG_KEY lets you open /api/workout?debug=<that key> to see
 * Wodify's raw response while tuning the layout.
 *
 * Only *today's* workout (gym-local, America/Los_Angeles) is ever served, so the
 * page can't be used to peek at programming before it's published.
 */
"use strict";

const API = "https://api.wodify.com/v1";
const LOCATION = process.env.WODIFY_LOCATION || "Whit Fitness";
const TZ = "America/Los_Angeles";

// Site program key -> Wodify program name and id (from Wodify, Oct 2026)
const PROGRAMS = {
  crossfit: { name: "CrossFit", id: 2519 },
  hyrox: { name: "Hyrox", id: 130235 },
  vitality: { name: "Vitality", id: 132278 },
};

function gymDate(d = new Date()) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

async function wodify(path, key) {
  const r = await fetch(API + path, { headers: { "x-api-key": key, accept: "application/json" } });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch (e) { body = { _raw: text }; }
  return { status: r.status, body };
}

/* ---------- text helpers ---------- */
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", deg: "°", frac12: "½", times: "×" };
function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}
// HTML (or plain text) -> plain text that keeps the coach's line breaks
function toText(v) {
  if (v == null) return "";
  let s = String(v);
  s = s.replace(/<(script|style|iframe|object|embed|svg)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n")
       .replace(/<li[^>]*>/gi, "• ")
       .replace(/<\/(p|div|li|h[1-6]|tr|ul|ol|table)>/gi, "\n")
       .replace(/<[^>]+>/g, "");
  s = decode(s).replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return s.trim();
}
// Allow-list sanitizer for Wodify's pre-formatted HTML (fallback only)
const OK = new Set(["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "div", "span", "table", "thead", "tbody", "tr", "td", "th", "hr"]);
function cleanHtml(v) {
  if (!v) return "";
  return String(v)
    .replace(/<(script|style|iframe|object|embed|svg|form|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|form|img|link|meta|noscript|template)\b[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (m, slash, tag) => (OK.has(tag.toLowerCase()) ? `<${slash}${tag.toLowerCase()}>` : ""));
}

/* ---------- normalising Wodify's shapes ---------- */
// Wodify's field names vary between endpoints (PascalCase vs snake_case), so look up loosely.
function pick(o, ...names) {
  if (!o || typeof o !== "object") return undefined;
  const keys = Object.keys(o);
  for (const n of names) {
    const want = n.toLowerCase().replace(/_/g, "");
    const k = keys.find((x) => x.toLowerCase().replace(/_/g, "") === want);
    if (k && o[k] != null && o[k] !== "") return o[k];
  }
  return undefined;
}
function asArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "object") {
    const inner = pick(v, "Component", "Components", "WorkoutComponent", "items", "records", "data");
    if (inner) return asArray(inner);
    return [v];
  }
  return [];
}
function normComponents(list) {
  return asArray(list).map((c) => {
    const name = toText(pick(c, "Name", "ComponentName", "component_name", "Title", "title", "Label"));
    const desc = toText(pick(c, "Description", "description", "ComponentDescription", "Details", "Text", "Prescription"));
    const notes = toText(pick(c, "Comment", "Comments", "Notes", "CoachNotes", "coach_notes", "AthleteNotes"));
    const section = pick(c, "IsSection", "is_section", "SectionHeader");
    return { name, text: desc, notes, section: section === true || section === "true" };
  }).filter((c) => c.name || c.text || c.notes);
}

async function fromFormatted(key, date, prog) {
  const q = `?date=${date}&location=${encodeURIComponent(LOCATION)}&program=${encodeURIComponent(prog.name)}`;
  const { status, body } = await wodify(`/workouts/formattedworkout${q}`, key);
  const wod = pick(body, "APIWod") || body;
  const err = pick(body, "APIError");
  if (status !== 200 || err || !wod || typeof wod !== "object") {
    return { ok: false, status, error: err ? toText(pick(err, "ErrorMessage")) : `HTTP ${status}`, raw: body };
  }
  const header = pick(wod, "WodHeader", "Header") || {};
  const comps = normComponents(pick(wod, "Components", "WodComponents"));
  return {
    ok: true,
    raw: body,
    workout: {
      title: toText(pick(header, "Name", "WodName", "Title") || pick(wod, "Name", "WodName")),
      notes: toText(pick(header, "Comments", "Comment", "Notes") || pick(wod, "Comments", "Notes")),
      components: comps,
      html: comps.length ? "" : cleanHtml(pick(wod, "FormattedWOD", "FormattedWod", "Html")),
    },
  };
}

// Fallback: the newer search endpoints (/workouts/search, /workouts/{id})
async function fromSearch(key, date, prog) {
  const q = encodeURIComponent(`date|eq|'${date}';program_id|eq|${prog.id}`);
  const s = await wodify(`/workouts/search?q=${q}&page_size=5`, key);
  const rows = asArray(pick(s.body, "workouts", "records", "data", "items") || s.body);
  const hit = rows.find((w) => w && pick(w, "id", "workout_id"));
  if (s.status !== 200 || !hit) return { ok: false, status: s.status, error: "Not found", raw: s.body };
  const one = await wodify(`/workouts/${pick(hit, "id", "workout_id")}`, key);
  const w = pick(one.body, "workout", "data") || one.body;
  const comps = normComponents(pick(w, "components", "workout_components"));
  return {
    ok: comps.length > 0,
    raw: one.body,
    workout: { title: toText(pick(w, "name", "title")), notes: toText(pick(w, "notes", "comments")), components: comps, html: "" },
  };
}

async function loadProgram(key, date, prog) {
  let r = await fromFormatted(key, date, prog).catch((e) => ({ ok: false, error: String(e) }));
  if (!r.ok) {
    const r2 = await fromSearch(key, date, prog).catch((e) => ({ ok: false, error: String(e) }));
    if (r2.ok) return r2;
    r.fallback = r2;
  }
  return r;
}

module.exports = async function handler(req, res) {
  // Tolerate stray spaces, line breaks or quotes picked up when pasting the key into Vercel
  const key = (process.env.WODIFY_API_KEY || "").trim().replace(/^["']|["']$/g, "").trim();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex");
  if (!key) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "not_configured", message: "WODIFY_API_KEY is not set in Vercel." }));
    return;
  }
  const url = new URL(req.url, "http://x");
  const debug = process.env.WORKOUT_DEBUG_KEY && url.searchParams.get("debug") === process.env.WORKOUT_DEBUG_KEY;
  const date = gymDate();

  const entries = await Promise.all(
    Object.entries(PROGRAMS).map(async ([k, prog]) => [k, await loadProgram(key, date, prog)])
  );
  const programs = {};
  const raw = {};
  for (const [k, r] of entries) {
    programs[k] = r.ok ? { found: true, program: PROGRAMS[k].name, ...r.workout } : { found: false, program: PROGRAMS[k].name };
    if (debug) raw[k] = r;
  }
  // Cache at Vercel's edge for 2 minutes so a busy morning doesn't hammer Wodify,
  // while a workout your coaches just posted still shows up quickly.
  res.setHeader("Cache-Control", debug ? "no-store" : "public, s-maxage=120, stale-while-revalidate=600");
  res.statusCode = 200;
  res.end(JSON.stringify(debug ? { date, programs, raw } : { date, programs }));
};

module.exports._test = { toText, cleanHtml, normComponents, gymDate };
