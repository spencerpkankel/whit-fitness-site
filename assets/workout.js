/* Whit Fitness: /workout page (also runs the gym TVs at /workout?tv=1).

   Reads the class schedule from site.js (window.WHIT_SCHEDULE) and today's workouts
   from /api/workout (Wodify), then shows the workout for the class that's on now.

   How it moves through the day
   - While a class is on, its workout is shown.
   - Between classes it keeps the last class's workout up (people finishing in open
     gym), until the next class is 10 minutes out.
   - If the next class is a different program (Tue/Thu 10am: CrossFit -> Vitality),
     a small pop-up asks "Looks like Vitality is starting soon. Show that workout?"
     Nobody answers? It switches by itself when the class starts. "Stay" keeps the
     current workout up.
   - The program switcher (right side; bottom bar on phones) opens any program's
     workout (or another day) and stays there until the next class comes around:
     the pop-up appears 10 min before, and it switches at class start unless
     someone taps "Stay".
   - Rolls over to the new day's workouts after midnight.

   Preview another time: /workout?at=17:40&day=2  (day 0 = Sunday). Add &tv=1 for TV mode. */
(function () {
  "use strict";
  var page = document.querySelector(".wod-page");
  var card = document.querySelector("[data-wod-card]");
  if (!page || !card) return;

  var SCHEDULE = window.WHIT_SCHEDULE || [];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var LEAD = 10;                 // minutes before a class that the pop-up / switch happens

  // Schedule program -> Wodify program that holds its workout
  var WORKOUT_OF = { crossfit: "crossfit", lift: "crossfit", hyrox: "hyrox", vitality: "vitality" };
  var LABEL = { crossfit: "CrossFit", hyrox: "HYROX", vitality: "Vitality 55+" };
  var SHORT = { crossfit: "CrossFit", hyrox: "HYROX", vitality: "Vitality" };
  var TAB_ORDER = ["crossfit", "hyrox", "vitality"];

  var q = function (s) { return document.querySelector(s); };
  var els = {
    date: q("[data-wod-date]"), days: q("[data-wod-days]"), classes: q("[data-wod-classes]"), open: q("[data-wod-open]"),
    tabs: q("[data-wod-tabs]"), status: q("[data-wod-status]"), title: q("[data-wod-title]"),
    meta: q("[data-wod-meta]"), body: q("[data-wod-body]"), live: q("[data-wod-live]"), toast: q("[data-wod-toast]")
  };

  var params = new URLSearchParams(location.search);
  var TV = params.get("tv") === "1";
  var state = {
    data: null, error: null,
    manual: null,                              // class id being shown instead of live
    follow: false,                             // true: rejoin live once it catches up (pop-up switches)
    manualProgram: params.get("program"),      // program with no class today
    dismissed: {},                             // class ids someone said "stay" to
    toastId: null, toastAt: 0,
    wkey: null, focus: -1, notesOpen: {}, vidsOpen: {},     // TV: which part is blown up, which coach notes are open
    lastTouch: Date.now(), day: null, loadedAt: Date.now(),
    offset: 0,                                 // day being viewed, relative to today (Mon..Sun of this week)
    days: {}                                   // workouts per date: { "2026-10-26": { data, error } }
  };

  /* ---------- time ---------- */
  function gymNow() {
    var o = {};
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", second: "numeric",
        month: "numeric", day: "numeric", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {}
    var d = new Date();
    var now = {
      day: o.weekday ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday) : d.getDay(),
      min: o.hour ? (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) : d.getHours() * 60 + d.getMinutes(),
      sec: o.second ? +o.second : d.getSeconds(),
      month: o.month ? +o.month - 1 : d.getMonth(), date: o.day ? +o.day : d.getDate()
    };
    var at = params.get("at"), day = params.get("day");
    if (at && /^\d{1,2}:\d{2}$/.test(at)) { now.min = toMin(at); now.sec = 0; }
    if (day && /^[0-6]$/.test(day)) now.day = +day;
    return now;
  }
  function toMin(t) { var a = t.split(":"); return +a[0] * 60 + +a[1]; }
  function hm(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  function fmt(t) { var a = t.split(":"), h = +a[0]; return (h % 12 || 12) + ":" + a[1] + (h < 12 ? "am" : "pm"); }
  function fmtShort(t) { return fmt(t).replace(":00", ""); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dur(x) { return x.dur || 60; }
  function isoToday() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function isoAdd(iso, n) { var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function mondayOffset(now) { return -((now.day + 6) % 7); }          // days from today back to Monday
  // The "now" used for the day on screen: today is live; past days are over; future days haven't started
  function viewNow(now) {
    if (!state.offset) return now;
    var iso = isoAdd(isoToday(), state.offset), d = new Date(iso + "T12:00:00Z");
    return { day: (now.day + state.offset + 7) % 7, min: state.offset < 0 ? 24 * 60 : -1, sec: 0,
      month: d.getUTCMonth(), date: d.getUTCDate(), other: true };
  }

  /* ---------- schedule ---------- */
  function classesToday(now) {
    return SCHEDULE.filter(function (x) { return x.d === now.day && x.p !== "open" && x.p !== "childcare"; })
      .map(function (x) {
        var s = toMin(x.t), e = s + dur(x);
        return { x: x, id: x.t + "-" + x.p, start: s, end: e, wk: WORKOUT_OF[x.p] || null,
          when: now.min >= e ? "done" : now.min >= s ? "now" : "later" };
      });
  }
  function byId(list, id) { return list.filter(function (c) { return c.id === id; })[0] || null; }

  // What the screen shows when nobody has chosen anything
  function autoPick(list, now) {
    var adult = list.filter(function (c) { return c.wk; });
    if (!adult.length) return list[0] || null;
    var on = adult.filter(function (c) { return c.when === "now"; });
    if (on.length) return on[on.length - 1];                      // newest class that has started
    var next = adult.filter(function (c) { return c.when === "later"; })[0];
    var last = adult.filter(function (c) { return c.when === "done"; }).pop();
    if (!last) return next;
    if (!next) return last;
    // Same program next? Move on once it's 10 min out. Different program waits for the pop-up/start.
    if (next.wk === last.wk && next.start - now.min <= LEAD) return next;
    return last;
  }
  function classForProgram(list, wk) {
    var m = list.filter(function (c) { return c.wk === wk; });
    return m.filter(function (c) { return c.when === "now"; }).pop() ||
      m.filter(function (c) { return c.when === "later"; })[0] || m[m.length - 1] || null;
  }

  /* ---------- choose what to show ---------- */
  function select(list, now) {
    var real = gymNow();
    var today = now.other ? classesToday(real) : list;   // pop-ups always follow today's real schedule
    var auto = autoPick(list, now);

    // A class someone was warned about has started: switch to it (back to today if needed), unless they said stay
    if (state.toastId) {
      var t = byId(today, state.toastId);
      if (!t || state.dismissed[state.toastId]) { hideToast(); }
      else if (t.when !== "later") {
        state.manual = t.id; state.follow = true; state.manualProgram = null; hideToast();
        if (state.offset) { state.offset = 0; setUrl(null); return select(today, real); }
      }
    }

    // A person's choice stays on screen until the next class comes around (no timeout)
    var sel = null;
    if (state.manual) sel = byId(list, state.manual);
    if (!sel && state.manualProgram && WORKOUT_OF[state.manualProgram]) {
      var wk = WORKOUT_OF[state.manualProgram];
      sel = classForProgram(list, wk) || (now.other ? null : { x: { n: LABEL[wk], p: wk }, wk: wk, when: "none", id: "none-" + wk });
    }
    // Pinned to a program whose next class is coming up? Same workout, so just move along to that class quietly
    if (!now.other && sel && sel.wk && state.manual) {
      var nx = list.filter(function (c) {
        return c.wk === sel.wk && c.start > (sel.start || 0) && (c.when === "now" || (c.when === "later" && c.start - now.min <= LEAD));
      })[0];
      if (nx) { state.manual = nx.id; state.follow = true; sel = nx; }
    }
    if (sel && auto && sel.id === auto.id && state.follow) { state.manual = null; state.follow = false; sel = null; } // caught up with live
    var live = !sel && !now.other;
    if (!sel) sel = auto;

    // Next class of a different program (or any class, when another day is on screen) coming up? Offer it.
    var up = today.filter(function (c) {
      return c.wk && c.when === "later" && c.start - real.min <= LEAD && !state.dismissed[c.id] &&
        (now.other || !sel || c.wk !== sel.wk);
    })[0] || null;
    if (up) showToast(up, sel, now); else if (state.toastId) hideToast();
    return { sel: sel, live: live };
  }

  /* ---------- render ---------- */
  function render() {
    var now = gymNow();
    if (state.day !== null && state.day !== now.day) {       // new day
      state.manual = null; state.manualProgram = null; state.dismissed = {}; state.offset = 0; state.days = {}; hideToast(); setUrl(null); load();
    }
    state.day = now.day;
    renderDays(now);
    var vnow = viewNow(now);
    var iso = isoAdd(isoToday(), state.offset);
    var slot = state.days[iso] || {};
    state.data = slot.data || null; state.error = slot.error || null;
    if (state.offset < 0 && !slot.data && !slot.error && !slot.loading) load(iso);
    var list = classesToday(vnow);
    var pick = select(list, vnow);
    els.date.textContent = DAYS[vnow.day] + ", " + MONTHS[vnow.month] + " " + vnow.date;
    renderRail(list, pick.sel);
    renderSwitch(list, pick.sel, vnow);
    renderWorkout(pick.sel, vnow, pick.live);
    renderOpenGym(vnow);
    if (TV) fitTv();
  }

  function renderDays(now) {
    if (!els.days) return;
    var mon = mondayOffset(now), today = isoToday(), html = "";
    for (var i = 0; i < 7; i++) {
      var off = mon + i, d = new Date(isoAdd(today, off) + "T12:00:00Z"), wd = (now.day + off + 7) % 7;
      html += '<button type="button" role="tab" data-dayoff="' + off + '" aria-selected="' + (off === state.offset) + '"' +
        ' class="' + (off === 0 ? "is-today" : off > 0 ? "is-future" : "is-past") + '">' +
        '<span class="dn">' + (off === 0 ? "Today" : DAYS[wd].slice(0, 3)) + '</span><span class="dd">' +
        (off === 0 ? DAYS[wd].slice(0, 3) + " " : "") + d.getUTCDate() + "</span></button>";
    }
    els.days.innerHTML = html;
  }

  function renderRail(list, sel) {
    var nextFlag = false;
    els.classes.innerHTML = list.map(function (c) {
      var tag = "", cls = ["wod-c", "k-" + c.x.p];
      if (c.when === "now") { tag = '<span class="tag">On now</span>'; cls.push("is-now"); }
      else if (c.when === "later" && !nextFlag) { tag = '<span class="tag">Next</span>'; cls.push("is-next"); nextFlag = true; }
      else if (c.when === "done") cls.push("is-done");
      if (sel && c.id === sel.id) cls.push("is-sel");
      var inner = '<span class="t">' + fmt(c.x.t) + '</span><span class="p">' + esc(c.x.n) + tag + '</span><span class="c">' + esc(c.x.c || "") + "</span>";
      if (!c.wk) return '<li class="' + cls.join(" ") + '"><a href="/youth">' + inner + "</a></li>";
      return '<li class="' + cls.join(" ") + '"><button type="button" data-class="' + esc(c.id) + '"' +
        (sel && c.id === sel.id ? ' aria-current="true"' : "") + ">" + inner + "</button></li>";
    }).join("") || '<li class="wod-empty">No classes on the schedule this day.</li>';
  }

  function renderSwitch(list, sel, now) {
    var progs = state.data && state.data.programs || {};
    els.tabs.innerHTML = TAB_ORDER.map(function (k) {
      var m = list.filter(function (c) { return c.wk === k; });
      var on = m.filter(function (c) { return c.when === "now"; })[0];
      var nx = m.filter(function (c) { return c.when === "later"; })[0];
      var sub = on ? "On now" : now && now.other ? (m.length ? m.map(function (c) { return fmtShort(c.x.t); }).slice(0, 2).join(", ") + (m.length > 2 ? "…" : "") : "No class")
        : nx ? fmt(nx.x.t) : m.length ? "Done today" : "No class today";
      var posted = state.offset > 0 || !state.data || (progs[k] && progs[k].found);
      return '<button type="button" class="k-' + k + (on ? " has-now" : "") + (posted ? "" : " is-empty") +
        '" data-program="' + k + '" aria-pressed="' + (sel && sel.wk === k) + '"><span class="sw" aria-hidden="true"></span>' +
        '<span class="nm">' + SHORT[k] + '</span><span class="sb">' + (posted ? sub : "Not posted yet") + "</span></button>";
    }).join("") + (TV ? '<a class="wod-tv-exit" href="/workout">Exit TV</a>'
      : '<button type="button" class="wod-tv-btn" data-tv>TV mode</button>');
  }

  function statusText(c, now) {
    if (now.other && c) return DAYS[now.day] + " · " + fmt(c.x.t) + (state.offset < 0 ? " class" : "");
    if (!c || c.when === "none") return "No " + (c ? LABEL[c.wk] : "") + " class today";
    if (c.when === "now") return "On now · until " + fmt(hm(c.end));
    if (c.when === "done") return "Earlier today · " + fmt(c.x.t) + " class";
    var mins = c.start - now.min;
    if (mins <= 90) return "Up next · starts in " + (mins < 60 ? mins + " min" : Math.floor(mins / 60) + " hr" + (mins % 60 ? " " + (mins % 60) + " min" : ""));
    return "Up next · " + fmt(c.x.t);
  }

  function renderWorkout(c, now, live) {
    card.setAttribute("aria-busy", state.data || state.error ? "false" : "true");
    card.className = "wod-card" + (c ? " k-" + (c.wk || c.x.p) : "") + (c && c.when === "now" ? " is-now" : "");
    if (!c) {
      els.status.textContent = ""; els.title.textContent = "No classes today"; els.meta.textContent = "";
      els.body.innerHTML = '<p class="muted">Open gym and 24/7 member access are still on. See the <a href="/schedule">full schedule</a>.</p>';
      els.live.textContent = ""; return;
    }
    els.status.textContent = statusText(c, now);
    els.status.className = "wod-status" + (c.when === "now" ? " is-now" : "");

    if (!c.wk) {   // Youth: programmed by ATP, booked on Upper Hand
      els.title.textContent = c.x.n;
      els.meta.textContent = fmt(c.x.t) + (c.x.c ? " · " + c.x.c : "");
      els.body.innerHTML = '<p>ATP youth sessions are programmed by the ATP coaches and booked on Upper Hand. <a href="/youth">See youth training</a>.</p>';
      els.live.innerHTML = liveNote(live); return;
    }

    var w = state.data && state.data.programs && state.data.programs[c.wk];
    var heading = c.x.p === "lift" ? c.x.n : LABEL[c.wk];
    els.title.textContent = heading + (w && w.found && w.title && !sameName(w.title, heading) ? ": " + w.title : "");
    var meta = [];
    if (c.x.t) meta.push(fmt(c.x.t) + (dur(c.x) !== 60 ? " · " + dur(c.x) + " min" : ""));
    if (c.x.c) meta.push("Coach " + c.x.c);
    els.meta.textContent = meta.join(" · ");
    els.live.innerHTML = liveNote(live);

    if (state.offset > 0) {
      els.body.innerHTML = '<p class="wod-missing">' + esc(DAYS[now.day]) + "'s workouts go up on " + esc(DAYS[now.day]) +
        '. Members can check the Wodify app.</p>';
      return;
    }
    if (state.error && !state.data) {
      els.body.innerHTML = '<p class="wod-missing">We couldn\'t load this workout just now. It\'s also in the Wodify app.</p>';
      return;
    }
    if (!state.data) { els.body.innerHTML = '<div class="wod-skel" aria-hidden="true"><i></i><i></i><i></i></div>'; return; }
    if (!w || !w.found) {
      var others = TAB_ORDER.filter(function (k) { return k !== c.wk && state.data.programs[k] && state.data.programs[k].found; });
      els.body.innerHTML = '<p class="wod-missing">' + (now.other ? "No " + esc(LABEL[c.wk]) + " workout was posted for " + esc(DAYS[now.day]) + ".</p>"
        : "Today's " + esc(LABEL[c.wk]) + " workout hasn't been posted yet. Check back closer to class, or open the Wodify app.</p>") +
        (others.length ? '<p class="small muted">Posted today: ' + others.map(function (k) {
          return '<button type="button" class="linkish" data-program="' + k + '">' + LABEL[k] + "</button>";
        }).join(", ") + "</p>" : "");
      return;
    }
    var wkey = c.id + "|" + isoAdd(isoToday(), state.offset);
    if (wkey !== state.wkey) { state.wkey = wkey; state.focus = -1; state.notesOpen = {}; state.vidsOpen = {}; }
    var html = workoutHtml(w);
    // Only redraw when something changed, so a demo video that's playing isn't cut off by the 20s refresh
    if (els.body._html !== html || els.body.firstChild !== els.body._first) {
      els.body.innerHTML = html; els.body._html = html; els.body._first = els.body.firstChild;
    }
  }

  // Skip Wodify's default names ("CrossFit 10/27/2026", "Tuesday", "Vitality"): they repeat what's on screen
  function sameName(a, b) {
    var n = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ""); };
    var t = String(a);
    if (/\d{1,2}[\/.-]\d{1,2}/.test(t) || /^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?$/i.test(t.trim())) return true;
    return n(t) === n(b) || n(t).indexOf(n(b).replace(/55$/, "")) === 0 || ["crossfit", "hyrox", "vitality"].indexOf(n(t)) > -1;
  }

  // On the TVs a blank line becomes a small gap instead of a full empty line, so the text can run bigger
  function paras(t) {
    if (!TV) return esc(t);
    return String(t).split(/\n\s*\n/).map(function (x) { return '<span class="tv-p">' + esc(x.trim()) + "</span>"; }).join("");
  }

  // Lines starting with * are coaching cues: they go with the coach notes, not the main text
  function splitCues(text, notes) {
    var main = [], cues = [], seen = {};
    var key = function (x) { return x.toLowerCase().replace(/[^a-z0-9]/g, ""); };
    String(notes || "").split("\n").forEach(function (l) { if (l.trim()) seen[key(l)] = 1; });
    String(text || "").split("\n").forEach(function (l) {
      var t = l.trim();
      if (/^\*+\s*\S/.test(t)) { var cue = t.replace(/^\*+\s*/, ""); if (!seen[key(cue)]) { seen[key(cue)] = 1; cues.push(cue); } }
      else main.push(l);
    });
    var m = main.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    var n = [cues.join("\n"), String(notes || "").trim()].filter(Boolean).join("\n\n");
    return { text: m, notes: n };
  }

  // Demo videos: a tucked-away card like the coach notes. Players only exist while it's open,
  // so a closed card costs nothing (matters on the TVs).
  function videosHtml(list, i) {
    var vids = (list || []).filter(function (v) { return v && /^[A-Za-z0-9_-]{11}$/.test(v.id); });
    if (!vids.length) return "";
    var open = !!state.vidsOpen[i];
    return '<div class="wod-vids' + (open ? " is-open" : "") + '"><button type="button" data-vids="' + i + '" aria-expanded="' + open + '">' +
      "<b>Demo videos" + (vids.length > 1 ? ' <span class="wod-vids-n">' + vids.length + "</span>" : "") + "</b>" +
      '<span class="wod-coach-i" aria-hidden="true"></span></button>' +
      (open ? '<div class="wod-vids-body"><div class="wod-vids-strip" tabindex="0" aria-label="Demo videos, scroll sideways">' + vids.map(function (v, k) {
        var src = "https://www.youtube-nocookie.com/embed/" + v.id + "?rel=0&amp;playsinline=1" + (v.start ? "&amp;start=" + (+v.start | 0) : "");
        var label = v.label || (vids.length > 1 ? "Demo " + (k + 1) : "Demo");
        return '<figure class="wod-vid"><div class="wod-vid-frame"><iframe src="' + src + '" title="' + esc(label) + '" loading="lazy" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
          'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div>' +
          (v.label ? "<figcaption>" + esc(v.label) + "</figcaption>" : "") + "</figure>";
      }).join("") + "</div></div>" : "") + "</div>";
  }

  function workoutHtml(w) {
    var out = "";
    if (w.notes) out += '<p class="wod-notes">' + esc(w.notes) + "</p>";
    if (w.components && w.components.length) {
      var n = w.components.length, focus = TV && n > 1 && state.focus < n ? state.focus : -1;
      out += '<ol class="wod-parts' + (focus > -1 ? " has-focus" : "") + '" data-n="' + n + '">' + w.components.map(function (p, i) {
        var sp = splitCues(p.text, p.notes);
        var open = state.notesOpen[i] != null ? state.notesOpen[i] : !TV;   // TVs start with notes tucked away
        var cls = "wod-part" + (p.section ? " is-section" : "") + (focus === i ? " is-focus" : focus > -1 ? " is-collapsed" : "");
        return '<li class="' + cls + '"' + (TV && n > 1 ? ' data-part="' + i + '"' : "") + ">" +
          (p.name ? '<h3><span class="wod-letter" aria-hidden="true">' + String.fromCharCode(65 + i) + "</span>" + esc(p.name) + (p.score ? '<span class="wod-score">' + esc(p.score) + "</span>" : "") + "</h3>" : "") +
          (sp.text ? '<div class="wod-text">' + paras(sp.text) + "</div>" : "") +
          (sp.notes ? '<div class="wod-coach' + (open ? " is-open" : "") + '"><button type="button" data-notes="' + i + '" aria-expanded="' + open + '">' +
            '<b>Coach notes</b><span class="wod-coach-i" aria-hidden="true"></span></button><div class="wod-coach-body">' + paras(sp.notes) + "</div></div>" : "") +
          videosHtml(p.videos, i) + "</li>";
      }).join("") + "</ol>";
    } else if (w.html) {
      out += '<div class="wod-html">' + w.html + "</div>"; // sanitized server-side
    }
    return out || '<p class="wod-missing">Today\'s workout is posted but empty. Check the Wodify app.</p>';
  }

  function liveNote(live) {
    if (state.offset) return '<button type="button" class="linkish" data-live>Back to today</button>';
    return live ? '<span class="wod-live-dot" aria-hidden="true"></span>Follows the class schedule'
      : '<button type="button" class="linkish" data-live>Back to the live class</button>';
  }

  function renderOpenGym(now) {
    if (now.other) { els.open.innerHTML = 'Members have 24/7 keycode access. <a href="/schedule">Full schedule</a>'; return; }
    var open = SCHEDULE.filter(function (x) { return x.d === now.day && x.p === "open" && toMin(x.end) > now.min; });
    var cur = open.filter(function (x) { return toMin(x.t) <= now.min; })[0];
    els.open.innerHTML = (cur ? "Open gym now until " + fmtShort(cur.end) + ". "
      : open.length ? "Open gym later: " + open.map(function (x) { return fmtShort(x.t) + "–" + fmtShort(x.end); }).join(", ") + ". " : "") +
      'Members have 24/7 keycode access. <a href="/schedule">Full schedule</a>';
  }

  /* ---------- pop-up ---------- */
  function showToast(up, sel, now) {
    var stay = now && now.other ? DAYS[now.day] : sel ? (sel.x.p === "lift" ? sel.x.n : SHORT[sel.wk] || sel.x.n) : "this";
    var label = LABEL[up.wk];
    if (state.toastId !== up.id) {
      state.toastId = up.id;
      els.toast.className = "wod-toast k-" + up.wk;
      els.toast.innerHTML =
        '<p class="wod-toast-msg"><b>' + esc(label) + " starts at " + fmt(up.x.t) + "</b>" +
        "Looks like " + esc(SHORT[up.wk]) + " class is starting soon. Want to show that workout?</p>" +
        '<div class="wod-toast-btns"><button type="button" class="btn" data-toast="go">Show ' + esc(SHORT[up.wk]) + "</button>" +
        '<button type="button" class="btn btn-ghost" data-toast="stay">Stay on ' + esc(stay) + "</button></div>" +
        '<p class="wod-toast-count" data-toast-count></p>';
      els.toast.hidden = false;
      requestAnimationFrame(function () { els.toast.classList.add("is-in"); });
    }
    state.toastAt = up.start;
    tickToast();
  }
  function hideToast() {
    state.toastId = null;
    if (!els.toast.hidden) { els.toast.classList.remove("is-in"); els.toast.hidden = true; els.toast.innerHTML = ""; }
  }
  function tickToast() {
    var el = els.toast.querySelector("[data-toast-count]");
    if (!el || !state.toastId) return;
    var now = gymNow();
    var s = state.toastAt * 60 - (now.min * 60 + now.sec);
    el.textContent = s > 0 ? "Switching automatically in " + Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2) : "Switching now…";
    if (s <= 0) render();
  }

  /* ---------- TV: slide parts between layouts ---------- */
  function partRects() {
    return [].map.call(els.body.querySelectorAll(".wod-part"), function (li) { return li.getBoundingClientRect(); });
  }
  // FLIP: each part starts where it was, then glides and resizes into its new spot while its contents fade in
  function slideParts(before) {
    if (!before.length || !Element.prototype.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ease = "cubic-bezier(.22,.8,.24,1)";
    [].forEach.call(els.body.querySelectorAll(".wod-part"), function (li, i) {
      var f = before[i], l = li.getBoundingClientRect();
      if (!f || !l.width || !l.height) return;
      var bg = getComputedStyle(li).backgroundColor;
      li.animate([
        { transformOrigin: "0 0", backgroundColor: "#1b241e", transform: "translate(" + (f.left - l.left) + "px," + (f.top - l.top) + "px) scale(" + f.width / l.width + "," + f.height / l.height + ")" },
        { transformOrigin: "0 0", backgroundColor: "#1b241e", offset: 0.7 },
        { transformOrigin: "0 0", backgroundColor: bg, transform: "none" }
      ], { duration: 520, easing: ease });
      [].forEach.call(li.children, function (ch) {
        ch.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 520, easing: "ease-out" });
      });
    });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".wod-vids-body")) return;      // scrolling / tapping the video strip
    var b = e.target.closest("[data-vids],[data-notes],[data-part],[data-class],[data-program],[data-live],[data-toast],[data-tv],[data-dayoff]");
    if (!b) return;
    if (b.hasAttribute("data-vids")) {                 // open / close demo videos
      var vi = +b.getAttribute("data-vids");
      state.vidsOpen[vi] = b.getAttribute("aria-expanded") !== "true"; render(); return;
    }
    if (b.hasAttribute("data-notes")) {                // open / close coach notes
      var ni = +b.getAttribute("data-notes");
      state.notesOpen[ni] = b.getAttribute("aria-expanded") !== "true"; render(); return;
    }
    if (b.hasAttribute("data-part")) {                 // TV: blow one part up, tap it again to go back
      var pi = +b.getAttribute("data-part");
      var before = partRects();
      state.focus = state.focus === pi ? -1 : pi; render(); slideParts(before); return;
    }
    state.lastTouch = Date.now();
    if (b.hasAttribute("data-dayoff")) {
      var keep = select(classesToday(viewNow(gymNow())), viewNow(gymNow())).sel;
      state.offset = +b.getAttribute("data-dayoff");
      state.manual = null; state.follow = false;
      state.manualProgram = state.offset && keep && keep.wk ? keep.wk : null;   // stay on the same program if that day has it
      setUrl(null); render(); return;
    }
    var vn = viewNow(gymNow());
    var list = classesToday(vn);
    if (b.hasAttribute("data-tv")) { enterTv(); return; }
    if (b.hasAttribute("data-toast")) {
      var id = state.toastId;
      if (b.getAttribute("data-toast") === "go") { state.manual = id; state.follow = true; state.manualProgram = null; state.offset = 0; }
      else if (!state.offset) {
        var cur = select(list, gymNow()).sel;            // pin what's on screen now
        if (cur && cur.id.indexOf("none-") !== 0) { state.manual = cur.id; state.follow = false; }
      }
      state.dismissed[id] = true; hideToast(); setUrl(null); render(); return;
    }
    var auto = autoPick(list, vn);
    state.follow = false;
    if (b.hasAttribute("data-live")) { state.manual = null; state.manualProgram = null; state.offset = 0; setUrl(null); }
    else if (b.hasAttribute("data-class")) {
      var id2 = b.getAttribute("data-class");
      state.manual = auto && auto.id === id2 ? null : id2; state.manualProgram = null; setUrl(null);
    } else {
      var k = b.getAttribute("data-program");
      var c = classForProgram(list, k);
      if (vn.other) { state.manual = c ? c.id : null; state.manualProgram = c ? null : k; }
      else if (auto && auto.wk === k) { state.manual = null; state.manualProgram = null; setUrl(null); }   // that's live already
      else { state.manual = c ? c.id : null; state.manualProgram = c ? null : k; setUrl(k); }
    }
    render();
    if (!TV && window.matchMedia("(max-width: 899px)").matches && !b.closest(".wod-card")) card.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (t) {
    document.addEventListener(t, function () { state.lastTouch = Date.now(); }, { passive: true });
  });
  function setUrl(program) {
    try {
      var u = new URL(location.href);
      if (program) u.searchParams.set("program", program); else u.searchParams.delete("program");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  /* ---------- TV mode ---------- */
  function enterTv() {
    var u = new URL(location.href); u.searchParams.set("tv", "1"); u.searchParams.delete("program");
    var go = function () { location.href = u.pathname + u.search; };
    var fs = document.documentElement.requestFullscreen;
    if (fs) document.documentElement.requestFullscreen().then(go, go); else go();
  }
  var wakeLock = null;
  function keepAwake() {
    if (!TV || !("wakeLock" in navigator) || document.hidden) return;
    navigator.wakeLock.request("screen").then(function (l) { wakeLock = l; }).catch(function () {});
  }
  // Make the workout text as big as the screen allows: try a few column layouts
  // (1, 2 or 3 columns; 2 columns weighted by how long each part is) and keep
  // whichever fits the largest text without scrolling.
  function fitTv() {
    var body = els.body;
    var parts = body.querySelector(".wod-parts");
    var items = parts ? [].slice.call(parts.children) : [];
    var n = items.length;
    var fits = function () { return body.scrollHeight <= body.clientHeight + 2 && body.scrollWidth <= body.clientWidth + 2; };
    var biggest = function () {                      // binary search, in vh
      var lo = 1.3, hi = 9;
      body.style.fontSize = hi + "vh"; if (fits()) return hi;
      for (var i = 0; i < 12; i++) {
        var mid = (lo + hi) / 2; body.style.fontSize = mid + "vh";
        if (fits()) lo = mid; else hi = mid;
      }
      return lo;
    };
    var layouts = ["minmax(0, 1fr)"];
    if (parts && parts.classList.contains("has-focus")) {
      layouts = [items.map(function (li) { return li.classList.contains("is-focus") ? "minmax(0, 1fr)" : "11vw"; }).join(" ")];
    } else if (n >= 2) {
      var len = items.map(function (li) { var t = li.querySelector(".wod-text"); return Math.max(40, t ? t.textContent.length : 0); });
      layouts = ["minmax(0, 1fr)", "repeat(2, minmax(0, 1fr))"];
      if (n === 2) {
        var r = Math.min(2.5, Math.max(0.4, len[1] / len[0]));
        layouts.push("minmax(0, 1fr) minmax(0, " + r.toFixed(2) + "fr)");
        layouts.push("minmax(0, 1fr) minmax(0, " + Math.sqrt(r).toFixed(2) + "fr)");
      }
      if (n >= 3) layouts.push("repeat(3, minmax(0, 1fr))");
    }
    var best = { size: 0, grid: null };
    layouts.forEach(function (g) {
      if (parts) parts.style.gridTemplateColumns = g || "";
      var s = biggest();
      if (s > best.size + 0.05) best = { size: s, grid: g };
    });
    if (parts) parts.style.gridTemplateColumns = best.grid || "";
    body.style.fontSize = best.size.toFixed(2) + "vh";
  }
  if (TV) {
    document.body.classList.add("tv");
    keepAwake();
    window.addEventListener("resize", fitTv);
    var cursorT;
    document.addEventListener("mousemove", function () {
      document.body.classList.remove("tv-idle"); clearTimeout(cursorT);
      cursorT = setTimeout(function () { document.body.classList.add("tv-idle"); }, 4000);
    });
    // Any click on the TV hides Chrome's tabs and address bar (browsers only allow full screen after a click)
    document.addEventListener("click", function () {
      var d = document.documentElement;
      if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(function () {});
    }, true);
    // Pick up site updates overnight
    setInterval(function () {
      var n = gymNow();
      if (Date.now() - state.loadedAt > 6 * 3600e3 && n.min > 150 && n.min < 240) location.reload();
    }, 10 * 60e3);
  }

  /* ---------- data ---------- */
  function load(iso) {
    var today = isoToday(); iso = iso || today;
    var slot = state.days[iso] = state.days[iso] || {};
    slot.loading = true;
    return fetch("/api/workout" + (iso === today ? "" : "?date=" + iso), { headers: { accept: "application/json" }, cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { if (!j || !j.programs) throw new Error("bad response"); slot.data = j; slot.error = null; })
      .catch(function (err) { slot.error = err; })      // keep showing the last good workout
      .then(function () { slot.loading = false; render(); });
  }

  render();
  load();
  setInterval(render, 20 * 1000);
  setInterval(tickToast, 1000);
  setInterval(function () { load(); }, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { load(); keepAwake(); } });
})();
