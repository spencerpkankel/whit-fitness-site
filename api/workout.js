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

const HOSTS = ["https://api.wodify.com/v1"];
const API = HOSTS[0];
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

async function wodifyAt(host, path, key) {
  const r = await fetch(host + path, { headers: { "x-api-key": key, accept: "application/json" } });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch (e) { body = { _raw: text }; }
  return { status: r.status, body, host };
}
async function wodify(path, key) {
  let last;
  for (const h of HOSTS) {
    last = await wodifyAt(h, path, key).catch((e) => ({ status: "err", body: String(e), host: h }));
    if (last.status !== 403 && last.status !== "err") return last;
  }
  return last;
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

/* ---------- demo videos ----------
   Coaches can drop a YouTube link into a part (pasted URL, hyperlink or Wodify's embedded video).
   Pull those out before the HTML is flattened to text (which would throw the link away), so the
   board can show them as players. Bare YouTube URLs are then removed from the text itself. */
const YT = /(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^\s"'<>]*?&(?:amp;)?)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})([^\s"'<>]*)/gi;
function ytStart(rest) {
  const m = /[?&#](?:amp;)?(?:t|start)=(?:(\d+)h)?(?:(\d+)m)?(\d+)?s?/i.exec(rest || "");
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}
const URLISH = /^(https?:\/\/|www\.|youtu)/i;
function videosIn(...sources) {
  const out = [], seen = new Set();
  const add = (id, rest, label) => {
    if (seen.has(id)) return;
    seen.add(id);
    const v = { id };
    const s = ytStart(rest);
    if (s) v.start = s;
    if (label && !URLISH.test(label)) v.label = label.slice(0, 80);
    out.push(v);
  };
  for (const src of sources) {
    if (src == null) continue;
    const s = String(src);
    // Hyperlinks first, so their text can label the video
    const a = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = a.exec(s))) {
      YT.lastIndex = 0;
      const y = YT.exec(m[1]);
      if (y) add(y[1], y[2], toText(m[2]));
    }
    YT.lastIndex = 0;
    while ((m = YT.exec(s))) add(m[1], m[2]);
  }
  return out;
}
// Drop bare YouTube URLs (and lines left holding only "Demo:" or similar) from plain text
function stripVideoUrls(t) {
  if (!t) return t;
  return t.split("\n").map((l) => {
    YT.lastIndex = 0;
    if (!YT.test(l)) return l;
    YT.lastIndex = 0;
    const left = l.replace(YT, "").replace(/[\s:–—-]+$/, "").trim();
    return /^[*•\s]*(demo|video|demo video|movement demo|watch|link|here)?[\s:–—-]*$/i.test(left) ? null : left;
  }).filter((l) => l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
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
    const rawDesc = pick(c, "Description", "description", "ComponentDescription", "Details", "Text", "Prescription");
    const rawNotes = pick(c, "Comment", "Comments", "Notes", "CoachNotes", "coach_notes", "AthleteNotes");
    const videos = videosIn(rawDesc, rawNotes,
      pick(c, "VideoURL", "video_url", "Video", "VideoLink", "video_link", "DemoVideo", "demo_video", "MediaURL", "media_url", "URL", "Link"));
    const name = toText(pick(c, "Name", "ComponentName", "component_name", "Title", "title", "Label"));
    const desc = stripVideoUrls(toText(rawDesc));
    const notes = stripVideoUrls(toText(rawNotes));
    const section = pick(c, "IsSection", "is_section", "SectionHeader");
    const part = { name, text: desc, notes, section: section === true || section === "true" };
    if (videos.length) part.videos = videos;
    return part;
  }).filter((c) => c.name || c.text || c.notes || c.videos);
}

/* Wodify's FormattedWOD is nested <div>s:
   <span> <div><div>NAME (Score type)</div><div>description… <div>notes</div></div></div> … </span>
   Split it into sections so the page can show A / B / C with names and notes. */
function topDivs(html) {
  const out = [];
  const re = /<(\/?)div\b[^>]*>/gi;
  let depth = 0, start = -1, m;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (depth === 0) start = re.lastIndex; depth++; }
    else if (depth > 0) { depth--; if (depth === 0 && start >= 0) { out.push(html.slice(start, m.index)); start = -1; } }
  }
  return out;
}
function stripTopDivs(html) {
  let out = "", depth = 0, last = 0, m;
  const re = /<(\/?)div\b[^>]*>/gi;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (depth === 0) out += html.slice(last, m.index); depth++; }
    else if (depth > 0) { depth--; if (depth === 0) last = re.lastIndex; }
  }
  return depth === 0 ? out + html.slice(last) : out;
}
function parseFormatted(html) {
  if (!html) return [];
  const span = /<span\b[^>]*>([\s\S]*)<\/span>/i.exec(String(html));
  const blocks = topDivs(span ? span[1] : String(html));
  const parts = [];
  for (const b of blocks) {
    const kids = topDivs(b);
    if (kids.length < 2) continue;
    let name = toText(kids[0]), score = "";
    const sm = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(name);
    if (sm) { name = sm[1].trim(); score = sm[2].trim(); }
    const videos = videosIn(b);
    const notes = stripVideoUrls(topDivs(kids[1]).map(toText).filter(Boolean).join("\n\n"));
    const text = stripVideoUrls(toText(stripTopDivs(kids[1])));
    const part = { name, score, text, notes, section: false };
    if (videos.length) part.videos = videos;
    if (name || text || videos.length) parts.push(part);
  }
  return parts;
}

async function fromFormatted(key, date, prog) {
  const q = `?date=${date}&location=${encodeURIComponent(LOCATION)}&program=${encodeURIComponent(prog.name)}`;
  const { status, body } = await wodify(`/workouts/formattedworkout${q}`, key);
  const wod = pick(body, "APIWod") || body;
  const err = pick(body, "APIError");
  if (status !== 200 || err || !wod || typeof wod !== "object" || body._raw !== undefined) {
    return { ok: false, status, error: err ? toText(pick(err, "ErrorMessage")) : `HTTP ${status}`, raw: body };
  }
  const header = pick(wod, "WodHeader", "Header") || {};
  let comps = normComponents(pick(wod, "Components", "WodComponents"));
  const formatted = pick(wod, "FormattedWOD", "FormattedWod", "Html");
  if (!comps.length) comps = parseFormatted(formatted);
  let title = toText(pick(header, "Name", "WodName", "Title") || pick(wod, "Name", "WodName"));
  if (!title && formatted) { const t = topDivs(String(formatted)); const first = t.length ? topDivs(t[0]) : []; title = first.length ? toText(first[0]) : ""; }
  return {
    ok: true,
    raw: body,
    workout: {
      title,
      notes: toText(pick(header, "Comments", "Comment", "Notes") || pick(wod, "Comments", "Notes")),
      components: comps,
      html: comps.length ? "" : cleanHtml(formatted),
    },
  };
}

// Fallback: the newer search endpoints (/workouts/search, /workouts/{id})
async function fromSearch(key, date, prog) {
  const q = encodeURIComponent(`date|eq|'${date}';program_id|eq|${prog.id}`);
  const s = await wodify(`/workouts/search?q=${q}&page_size=5`, key);
  const rows = asArray(pick(s.body, "workouts", "records", "data", "items") || s.body);
  const hit = rows.find((w) => w && pick(w, "id", "workout_id"));
  if (s.status !== 200 || !hit || s.body._raw !== undefined) return { ok: false, status: s.status, error: "Not found", raw: s.body };
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
  // Today by default; ?date= may ask for an earlier day this week (Mon..today), never a future one
  const today = gymDate();
  let date = today;
  const asked = url.searchParams.get("date");
  if (asked) {
    const wd = new Date(today + "T12:00:00Z").getUTCDay();             // 0 = Sunday
    const monday = new Date(today + "T12:00:00Z"); monday.setUTCDate(monday.getUTCDate() - ((wd + 6) % 7));
    const mon = monday.toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asked) || asked > today || asked < mon) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "date_out_of_range", message: "Only this week's days up to today are available." }));
      return;
    }
    date = asked;
  }

  const entries = await Promise.all(
    Object.entries(PROGRAMS).map(async ([k, prog]) => [k, await loadProgram(key, date, prog)])
  );
  const programs = {};
  const raw = {};
  for (const [k, r] of entries) {
    const has = r.ok && r.workout && (r.workout.components.length || r.workout.html || r.workout.notes);
    programs[k] = has ? { found: true, program: PROGRAMS[k].name, ...r.workout } : { found: false, program: PROGRAMS[k].name };
    if (debug) raw[k] = r;
  }
  // Cache at Vercel's edge for 2 minutes so a busy morning doesn't hammer Wodify,
  // while a workout your coaches just posted still shows up quickly.
  res.setHeader("Cache-Control", debug ? "no-store" : date < today ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=120, stale-while-revalidate=600");
  res.statusCode = 200;
  res.end(JSON.stringify(debug ? { date, programs, raw } : { date, programs }));
};

module.exports._test = { toText, cleanHtml, normComponents, gymDate, parseFormatted, videosIn, stripVideoUrls };
