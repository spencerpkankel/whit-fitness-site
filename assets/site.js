/* Whit Fitness site script: mobile nav, "Today at Whit" board, schedule filter.
   Schedule data below mirrors schedule.html (Wodify, Oct 2026). d: 0=Sun..6=Sat */
(function () {
  "use strict";
  var BOOK_URL = "https://crossfitevviva.wodify.com/OnlineSalesPage/Main?q=Classes%7CLocationId%3D656";
  var SCHEDULE = /*SCHEDULE*/[{"d":0,"t":"08:30","dur":60,"p":"lift","c":"Ann Moore","n":"Lift + Mobility"},{"d":0,"t":"09:30","dur":60,"p":"hyrox","c":"Ann Moore","n":"HYROX"},{"d":0,"t":"12:00","end":"13:00","p":"open","n":"Open gym"},{"d":1,"t":"05:00","dur":60,"p":"crossfit","c":"Ann Moore","n":"CrossFit"},{"d":1,"t":"06:00","dur":60,"p":"crossfit","c":"Ann Moore","n":"CrossFit"},{"d":1,"t":"07:30","end":"09:00","p":"open","n":"Open gym"},{"d":1,"t":"09:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":1,"t":"09:00","p":"childcare","n":"Childcare"},{"d":1,"t":"10:00","end":"12:00","p":"open","n":"Open gym"},{"d":1,"t":"12:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":1,"t":"13:00","end":"16:00","p":"open","n":"Open gym"},{"d":1,"t":"16:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":1,"t":"17:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":1,"t":"18:30","dur":60,"p":"youth","c":"ATP","n":"Youth (ATP)"},{"d":2,"t":"05:00","dur":60,"p":"crossfit","c":"Erin Newton","n":"CrossFit"},{"d":2,"t":"06:00","dur":60,"p":"crossfit","c":"Erin Newton","n":"CrossFit"},{"d":2,"t":"07:30","end":"09:00","p":"open","n":"Open gym"},{"d":2,"t":"09:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":2,"t":"10:00","dur":60,"p":"vitality","c":"Hannah Kankel","n":"Vitality 55+"},{"d":2,"t":"10:00","end":"12:00","p":"open","n":"Open gym"},{"d":2,"t":"12:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":2,"t":"13:00","end":"16:00","p":"open","n":"Open gym"},{"d":2,"t":"16:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":2,"t":"17:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":2,"t":"18:30","dur":60,"p":"youth","c":"ATP","n":"Youth (ATP)"},{"d":3,"t":"05:00","dur":60,"p":"hyrox","c":"Ann Moore","n":"HYROX"},{"d":3,"t":"06:00","dur":60,"p":"hyrox","c":"Ann Moore","n":"HYROX"},{"d":3,"t":"07:30","end":"09:00","p":"open","n":"Open gym"},{"d":3,"t":"09:00","dur":60,"p":"hyrox","c":"Leticia Ficek","n":"HYROX"},{"d":3,"t":"09:00","p":"childcare","n":"Childcare"},{"d":3,"t":"10:00","end":"12:00","p":"open","n":"Open gym"},{"d":3,"t":"12:00","dur":60,"p":"hyrox","c":"Leticia Ficek","n":"HYROX"},{"d":3,"t":"13:00","end":"16:00","p":"open","n":"Open gym"},{"d":3,"t":"16:30","dur":60,"p":"hyrox","c":"Spencer Kankel","n":"HYROX"},{"d":3,"t":"17:30","dur":60,"p":"hyrox","c":"Spencer Kankel","n":"HYROX"},{"d":3,"t":"18:30","dur":60,"p":"youth","c":"ATP","n":"Youth (ATP)"},{"d":4,"t":"05:00","dur":60,"p":"crossfit","c":"Ann Moore","n":"CrossFit"},{"d":4,"t":"06:00","dur":60,"p":"crossfit","c":"Ann Moore","n":"CrossFit"},{"d":4,"t":"07:30","end":"09:00","p":"open","n":"Open gym"},{"d":4,"t":"09:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":4,"t":"10:00","dur":60,"p":"vitality","c":"Hannah Kankel","n":"Vitality 55+"},{"d":4,"t":"10:00","end":"12:00","p":"open","n":"Open gym"},{"d":4,"t":"12:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":4,"t":"13:00","end":"16:00","p":"open","n":"Open gym"},{"d":4,"t":"16:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":4,"t":"17:30","dur":60,"p":"crossfit","c":"Hannah Kankel","n":"CrossFit"},{"d":4,"t":"18:30","dur":60,"p":"youth","c":"ATP","n":"Youth (ATP)"},{"d":5,"t":"05:00","dur":60,"p":"crossfit","c":"Erin Newton","n":"CrossFit"},{"d":5,"t":"06:00","dur":60,"p":"crossfit","c":"Erin Newton","n":"CrossFit"},{"d":5,"t":"07:30","end":"09:00","p":"open","n":"Open gym"},{"d":5,"t":"09:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":5,"t":"09:00","p":"childcare","n":"Childcare"},{"d":5,"t":"10:00","end":"12:00","p":"open","n":"Open gym"},{"d":5,"t":"12:00","dur":60,"p":"crossfit","c":"Leticia Ficek","n":"CrossFit"},{"d":5,"t":"13:00","end":"16:00","p":"open","n":"Open gym"},{"d":5,"t":"16:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":5,"t":"17:30","dur":60,"p":"crossfit","c":"Spencer Kankel","n":"CrossFit"},{"d":6,"t":"08:00","dur":75,"p":"hyrox","c":"Calli Dean","n":"HYROX"},{"d":6,"t":"09:15","dur":75,"p":"hyrox","c":"Calli Dean","n":"HYROX"}]/*END*/;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // ---- Year ----
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Mobile nav ----
  var btn = document.querySelector(".menu-btn");
  var panel = document.getElementById("mobile-nav");
  if (btn && panel) {
    var setOpen = function (open) {
      btn.setAttribute("aria-expanded", String(open));
      panel.setAttribute("data-open", String(open));
      btn.lastChild.textContent = open ? "Close" : "Menu";
    };
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); }
    });
    window.matchMedia("(min-width: 1121px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  // ---- Gym-local time (Eugene, America/Los_Angeles) ----
  function gymNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      return { day: day, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function toMin(t) { var a = t.split(":"); return +a[0] * 60 + +a[1]; }
  function fmt(t) {
    var a = t.split(":"), h = +a[0], ap = h < 12 ? "am" : "pm";
    return (h % 12 || 12) + ":" + a[1] + ap;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---- Today board (home): collapsed = next few classes; expanded = pick any day this week ----
  var board = document.querySelector("[data-board]");
  if (board && SCHEDULE.length) {
    var now = gymNow();
    var list = board.querySelector("[data-board-list]");
    var dayEl = board.querySelector("[data-board-day]");
    var foot = board.querySelector("[data-board-foot]");
    var SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var COLLAPSED = 3;
    var isClass = function (x) { return x.p !== "open" && x.p !== "childcare"; };
    var classesOn = function (d) { return SCHEDULE.filter(function (x) { return x.d === d && isClass(x); }); };
    var isPast = function (x, d) { return d === now.day && toMin(x.t) + (x.dur || 60) <= now.min; };

    // Default day: today if classes remain, otherwise the next day with classes
    var homeDay = now.day, homeLabel = "Today, " + DAYS[now.day];
    if (!classesOn(now.day).some(function (x) { return !isPast(x, now.day); })) {
      for (var i = 1; i <= 7; i++) {
        var dd = (now.day + i) % 7;
        if (classesOn(dd).length) { homeDay = dd; homeLabel = (i === 1 ? "Tomorrow, " : "") + DAYS[dd]; break; }
      }
    }
    var expanded = false, selDay = homeDay;

    function rows(d, limit) {
      var items = classesOn(d), nextFlagged = false;
      if (!expanded) items = items.filter(function (x) { return !isPast(x, d); });
      var hidden = limit ? Math.max(0, items.length - limit) : 0;
      if (limit) items = items.slice(0, limit);
      var html = items.map(function (x) {
        var start = toMin(x.t), cls = "", tag = "";
        if (isPast(x, d)) cls = "is-past";
        else if (d === now.day && start <= now.min) { cls = "is-now"; tag = '<span class="tag">On now</span>'; }
        else if (!nextFlagged && d === homeDay) { cls = "is-next"; tag = '<span class="tag">Next</span>'; nextFlagged = true; }
        var len = x.dur && x.dur !== 60 ? ", " + x.dur + " min" : "";
        var href = x.p === "youth" ? "https://www.atpeugene.com" : BOOK_URL;
        return '<li class="' + cls + '"><span class="t">' + fmt(x.t) + '</span><span class="p">' + esc(x.n) + tag +
          '</span><span class="c">' + esc(x.c || "") + len + '</span><a class="cover" href="' + href + '" rel="noopener" aria-label="Book ' + esc(DAYS[d] + " " + fmt(x.t) + " " + x.n) + '"></a></li>';
      }).join("");
      return { html: html || '<li class="board-empty">No classes. Members have 24/7 keycode access.</li>', hidden: hidden };
    }
    function openGym(d) {
      var open = SCHEDULE.filter(function (x) { return x.d === d && x.p === "open" && (d !== now.day || toMin(x.end) > now.min); });
      return open.length
        ? "Open gym " + open.map(function (x) { return fmt(x.t).replace(":00", "") + "–" + fmt(x.end).replace(":00", ""); }).join(", ")
        : "Members: 24/7 keycode access";
    }
    function tabs() {
      var h = '<div class="board-tabs" role="tablist" aria-label="Pick a day">';
      for (var i = 0; i < 7; i++) {
        var d = (now.day + i) % 7;
        h += '<button type="button" role="tab" data-d="' + d + '" aria-selected="' + (d === selDay) + '">' + (i === 0 ? "Today" : SHORT[d]) + "</button>";
      }
      return h + "</div>";
    }
    var tabsWrap = document.createElement("div");
    tabsWrap.className = "board-tabs-wrap";
    list.parentNode.insertBefore(tabsWrap, list);
    var toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "board-toggle";
    toggle.setAttribute("aria-expanded", "false");
    board.appendChild(toggle);

    function render() {
      var r = rows(selDay, expanded ? 0 : COLLAPSED);
      list.innerHTML = r.html;
      tabsWrap.innerHTML = expanded ? tabs() : "";
      dayEl.textContent = expanded ? (selDay === now.day ? "Today, " : "") + DAYS[selDay] : homeLabel;
      foot.innerHTML = "<span>" + esc(openGym(selDay)) + '</span><a href="/schedule">Full schedule &amp; pricing</a>';
      foot.hidden = !expanded;
      board.classList.toggle("is-expanded", expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.innerHTML = expanded
        ? '<span>Show less</span><span class="chev" aria-hidden="true"></span>'
        : '<span>' + (r.hidden ? "+" + r.hidden + (homeDay === now.day ? " more today · " : " more · ") : "") + "See the week's schedule</span>" + '<span class="chev" aria-hidden="true"></span>';
    }
    var anim = null;
    function animateTo(fn) {
      var reduceM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var h0 = board.getBoundingClientRect().height;
      if (anim) anim.cancel();
      fn();
      if (reduceM || !board.animate) return;
      var h1 = board.getBoundingClientRect().height;
      if (Math.abs(h1 - h0) < 2) return;
      anim = board.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" });
      anim.onfinish = anim.oncancel = function () { anim = null; };
    }
    toggle.addEventListener("click", function () {
      animateTo(function () { expanded = !expanded; selDay = homeDay; render(); });
      if (!expanded) board.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    tabsWrap.addEventListener("click", function (e) {
      var t = e.target.closest("[data-d]");
      if (!t) return;
      animateTo(function () { selDay = +t.getAttribute("data-d"); render(); });
      var nb = tabsWrap.querySelector('[data-d="' + selDay + '"]');
      if (nb) nb.focus();
    });
    render();
  }

  // ---- Schedule filter + today highlight ----
  var filters = document.querySelector(".filters");
  if (filters) {
    var g = gymNow();
    document.querySelectorAll('[data-day="' + g.day + '"]').forEach(function (el) { el.classList.add("today"); });
    var status = document.querySelector("[data-filter-status]");
    var buttons = filters.querySelectorAll("button");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var f = b.getAttribute("data-filter");
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll(".chip[data-p]").forEach(function (c) {
        c.hidden = !(f === "all" || c.getAttribute("data-p") === f);
      });
      // Hide empty table rows and list items
      document.querySelectorAll(".sched-table tbody tr").forEach(function (tr) {
        tr.hidden = !tr.querySelector(".chip:not([hidden])");
      });
      document.querySelectorAll(".sched-days li").forEach(function (li) {
        li.hidden = !li.querySelector(".chip:not([hidden])");
      });
      document.querySelectorAll(".sched-days section").forEach(function (s) {
        s.hidden = !s.querySelector("li:not([hidden])");
      });
      if (status) status.textContent = "Showing " + (f === "all" ? "all programs" : b.textContent.trim());
    });
  }

  // ---- FAQ: smooth open/close ----
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(document.querySelectorAll(".faq details"), function (d) {
    var sum = d.querySelector("summary"), body = d.querySelector(".answer");
    if (!sum || !body) return;
    if (d.open) d.classList.add("is-open");
    var anim = null;
    sum.addEventListener("click", function (e) {
      if (reduce || !body.animate) { d.classList.toggle("is-open", !d.open); return; }
      e.preventDefault();
      var opening = !d.classList.contains("is-open");
      var start = anim ? body.getBoundingClientRect().height : (opening ? 0 : body.offsetHeight);
      if (anim) anim.cancel();
      d.classList.toggle("is-open", opening);
      if (opening) d.open = true;
      var end = opening ? body.scrollHeight : 0;
      body.style.overflow = "hidden";
      anim = body.animate(
        [{ height: start + "px", opacity: opening ? 0 : 1 }, { height: end + "px", opacity: opening ? 1 : 0 }],
        { duration: 280, easing: "cubic-bezier(.2,.7,.2,1)" }
      );
      anim.onfinish = function () { anim = null; body.style.overflow = ""; if (!opening) d.open = false; };
      anim.oncancel = function () { body.style.overflow = ""; };
    });
  });
})();

/* Review carousel buttons */
(function(){var l=document.querySelector(".reviews");if(!l)return;
document.querySelectorAll(".rev-btn").forEach(function(b){b.addEventListener("click",function(){var c=l.querySelector(".review");var w=c?c.getBoundingClientRect().width+16:300;l.scrollBy({left:w*Number(b.dataset.dir),behavior:"smooth"});});});})();
(function(){var l=document.querySelector(".reviews");if(!l)return;function u(){l.classList.toggle("at-end",l.scrollLeft+l.clientWidth>=l.scrollWidth-8)}l.addEventListener("scroll",u,{passive:true});u();})();
// Smooth-scroll in-page section links (ATP page buttons and any other #anchors)
(function(){document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||a.classList.contains("skip"))return;var id=a.getAttribute("href").slice(1);if(!id)return;var t=document.getElementById(id);if(!t)return;e.preventDefault();var top=t.getBoundingClientRect().top+window.pageYOffset-parseFloat(getComputedStyle(t).scrollMarginTop||0);window.scrollTo({top:top,behavior:"smooth"});if(history.pushState)history.pushState(null,"","#"+id);});})();
// Open an expandable card when a link or redirect targets it (e.g. /youth#sample)
(function(){function o(){var id=location.hash.slice(1);if(!id)return;var t=document.getElementById(id);var d=t&&(t.tagName==="DETAILS"?t:(t.querySelector&&t.querySelector("details[data-autoopen]"))||(t.closest&&t.closest("details")));if(d)d.open=true;}o();window.addEventListener("hashchange",o);document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(a)setTimeout(o,0);});})();
// ---- Scroll buddies: tiny figures whose reps are locked to page position ----
// /hyrox gets a wall-ball guy, /crossfit gets a thruster guy. Click one to knock him over.
(function () {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.body || document.querySelector(".wb-buddy")) return;
  var path = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  var kind = path === "/hyrox" ? "wallball" : path === "/crossfit" ? "thruster" : null;
  if (!kind) return;

  function dir(a) { var r = a * Math.PI / 180; return [Math.sin(r), -Math.cos(r)]; }
  function add(p, a, len) { var d = dir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp2(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function mix(A, B, t) { return A.map(function (v, i) { return lerp(v, B[i], t); }); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeIn(t) { return t * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  // Joint angles in degrees: 0 = straight up, positive = facing direction (right).
  // [shin, thigh, torso, upperArm, forearm]
  var L = { shin: 19, thigh: 19, torso: 23, upper: 11, fore: 10.5 };
  var C = kind === "wallball" ? {
    cls: "wb-wallball", viewBox: "0 -46 62 144", ank: [39.5, 92], floor: [14, 62], objR: 5.6, rep: 420,
    STAND: [0, 0, 2, 150, 20], LOW: [36, -106, 40, 112, -18], TOP: [-4, 2, -2, 14, 6], FLAIL: [0, 0, -4, 96, 70],
    target: [56, -33], hit: [16, -46, 46, 142],
    pose: function (p) {
      if (p < .28) return mix(C.STAND, C.LOW, easeOut(p / .28));
      if (p < .46) return mix(C.LOW, C.TOP, ease((p - .28) / .18));
      if (p < .78) return C.TOP;
      return mix(C.TOP, C.STAND, easeIn((p - .78) / .22));
    },
    obj: function (p, hand) {
      if (p >= .46 && p < .78) {
        var t = (p - .46) / .32, arc = 1 - Math.pow(2 * t - 1, 2), out = 1 - Math.abs(2 * t - 1);
        return [lerp(hand[0], C.target[0], out), lerp(hand[1], C.target[1], arc)];
      }
      return hand;
    },
    hold: function (hand) { return [hand[0] + 3.5, hand[1] - 2]; }
  } : {
    cls: "wb-thruster", viewBox: "0 -8 66 106", ank: [30, 92], floor: [4, 62], objR: 7.4, rep: 420,
    // front rack: elbows up and forward, hands back at the shoulders
    STAND: [0, 0, 1, 100, -55], LOW: [36, -106, 26, 116, -42], TOP: [0, 0, 0, 4, 2], FLAIL: [0, 0, -4, 96, 70],
    hit: [6, -8, 58, 104],
    pose: function (p) {
      // 0-.32 front squat down, .32-.56 drive up, .46-.66 press overhead (overlaps the drive, like a real thruster),
      // .66-.74 lockout, .74-1 bar back to the rack
      var legs, arms;
      if (p < .32) legs = mix(C.STAND, C.LOW, ease(p / .32));
      else if (p < .56) legs = mix(C.LOW, C.STAND, ease((p - .32) / .24));
      else legs = C.STAND;
      if (p < .46) arms = p < .32 ? legs : mix(C.LOW, C.STAND, ease((p - .32) / .24));
      else if (p < .66) arms = mix(C.STAND, C.TOP, ease((p - .46) / .2));
      else if (p < .74) arms = C.TOP;
      else arms = mix(C.TOP, C.STAND, ease((p - .74) / .26));
      return [legs[0], legs[1], legs[2], arms[3], arms[4]];
    },
    obj: function (p, hand) { return hand; },
    hold: function (hand, a) { var r = clamp01((a[3] - 4) / 96); return [hand[0] + 6.5 * r, hand[1] - 1 + 5.5 * r]; }   // racked: bar on the front of the shoulders
  };
  var ANK = C.ank, FALL = -84;

  var wrap = document.createElement("div");
  wrap.className = "wb-buddy " + C.cls; wrap.setAttribute("aria-hidden", "true");
  var objSvg = kind === "wallball"
    ? '<g class="wb-halo"><circle class="wb-obj-h" r="' + C.objR + '"/></g><g class="wb-obj"><circle class="wb-ball" r="' + C.objR + '"/></g>'
    : '<g class="wb-halo"><circle class="wb-obj-h" r="' + C.objR + '"/></g><g class="wb-obj"><circle class="wb-plate" r="' + (C.objR - 1.3) + '"/><circle class="wb-hub" r="1.9"/></g>';
  wrap.innerHTML =
    '<svg viewBox="' + C.viewBox + '" focusable="false">' +
      '<g class="wb-halo"><line class="wb-floor-h" x1="' + C.floor[0] + '" y1="93.5" x2="' + C.floor[1] + '" y2="93.5"/></g>' +
      '<line class="wb-floor" x1="' + C.floor[0] + '" y1="93.5" x2="' + C.floor[1] + '" y2="93.5"/>' +
      (C.target ? '<line class="wb-target" x1="' + (C.target[0] + 2) + '" y1="' + C.target[1] + '" x2="62" y2="' + C.target[1] + '"/>' : '') +
      '<g class="wb-fig"><g class="wb-halo"><path class="wb-body-h" d=""/><circle class="wb-head-h" r="5.2"/></g>' +
        '<path class="wb-body" d=""/><circle class="wb-head" r="5.2"/></g>' + objSvg +
      '<g class="wb-stars" opacity="0"><path d="M0 -4V4M-4 0H4M-2.8 -2.8L2.8 2.8M-2.8 2.8L2.8 -2.8"/></g>' +
      '<rect class="wb-hit" x="' + C.hit[0] + '" y="' + C.hit[1] + '" width="' + C.hit[2] + '" height="' + C.hit[3] + '" fill="transparent"/>' +
    '</svg>';
  document.body.appendChild(wrap);
  var q = function (c) { return wrap.querySelector(c); };
  var body = q(".wb-body"), head = q(".wb-head"), bodyH = q(".wb-body-h"), headH = q(".wb-head-h");
  var obj = q(".wb-obj"), objH = q(".wb-obj-h"), fig = q(".wb-fig"), stars = q(".wb-stars"), floor = q(".wb-floor"), floorH = q(".wb-floor-h");

  function set(el, a, v) { el.setAttribute(a, v); }
  function rotAround(pt, deg) {
    var r = deg * Math.PI / 180, dx = pt[0] - ANK[0], dy = pt[1] - ANK[1];
    return [ANK[0] + dx * Math.cos(r) - dy * Math.sin(r), ANK[1] + dx * Math.sin(r) + dy * Math.cos(r)];
  }
  function geom(a) {
    var knee = add(ANK, a[0], L.shin), hip = add(knee, a[1], L.thigh), neck = add(hip, a[2], L.torso), sh = add(hip, a[2], L.torso - 4.5);
    var elb = add(sh, a[3], L.upper), hand = add(elb, a[4], L.fore), hc = add(neck, a[2], 5.6);
    return { d: "M" + (ANK[0] + 5) + " " + ANK[1] + "H" + ANK[0] + "L" + knee + "L" + hip + "L" + neck + "M" + sh + "L" + elb + "L" + hand,
             head: hc, hand: C.hold(hand, a) };
  }
  function paint(a, op, rot) {
    var g = geom(a);
    set(body, "d", g.d); set(bodyH, "d", g.d);
    set(head, "cx", g.head[0]); set(head, "cy", g.head[1]); set(headH, "cx", g.head[0]); set(headH, "cy", g.head[1]);
    set(fig, "transform", rot ? "rotate(" + rot.toFixed(2) + " " + ANK[0] + " " + ANK[1] + ")" : "");
    var tr = "translate(" + op[0].toFixed(2) + " " + op[1].toFixed(2) + ")";
    set(obj, "transform", tr); set(objH, "transform", tr);
  }
  function scrollPhase() { return ((window.pageYOffset / C.rep) % 1 + 1) % 1; }
  function draw(p) { var a = C.pose(p); paint(a, C.obj(p, geom(a).hand), 0); }

  // ---- scroll lock: pose is a pure function of page position; at most one draw per frame ----
  var queued = false, knocked = false;
  function render() { queued = false; if (!knocked) draw(scrollPhase()); }
  render();
  window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(render); } }, { passive: true });

  // ---- click: knocked over, bonked, gets back up ----
  function knockout() {
    if (knocked) return;
    knocked = true;
    var p0 = scrollPhase(), a0 = C.pose(p0), b0 = C.obj(p0, geom(a0).hand), R = C.objR;
    var headDown = rotAround(geom(C.FLAIL).head, FALL);
    var bonk = [headDown[0] + 1, headDown[1] - 5.2 - R];
    var apex = [lerp(b0[0], bonk[0], .45), Math.min(b0[1], bonk[1]) - 34];
    var rest = [bonk[0] - 10 - R, ANK[1] + 1.5 - R];
    var bounceTop = [lerp(bonk[0], rest[0], .4), bonk[1] - 12];
    var t0 = performance.now();
    set(floor, "x1", -40); set(floorH, "x1", -40);
    function step(now) {
      var t = (now - t0) / 1000, a, rot = 0, bp, s = 0;
      if (t < .45) { a = mix(a0, C.FLAIL, ease(clamp01(t / .3))); rot = FALL * easeIn(t / .45); }
      else if (t < 1.45) { a = C.FLAIL; rot = FALL + Math.sin((t - .45) * 9) * Math.max(0, 1.5 - (t - .45) * 3); }
      else if (t < 2.05) { var u = ease((t - 1.45) / .6); a = mix(C.FLAIL, C.STAND, u); rot = FALL * (1 - u); }
      else a = mix(C.STAND, C.pose(scrollPhase()), ease(clamp01((t - 2.05) / .4)));
      if (t < .5) bp = [lerp(b0[0], apex[0], t / .5), lerp(b0[1], apex[1], easeOut(t / .5))];
      else if (t < .9) { var f = (t - .5) / .4; bp = [lerp(apex[0], bonk[0], f), lerp(apex[1], bonk[1], easeIn(f))]; }
      else if (t < 1.35) { var g2 = (t - .9) / .45;
        bp = [lerp(bonk[0], rest[0], g2), g2 < .4 ? lerp(bonk[1], bounceTop[1], easeOut(g2 / .4)) : lerp(bounceTop[1], rest[1], easeIn((g2 - .4) / .6))]; }
      else if (t < 1.65) bp = rest;
      else if (t < 2.05) bp = lerp2(rest, geom(a).hand, ease((t - 1.65) / .4));
      else { var hd = geom(a).hand; bp = lerp2(hd, C.obj(scrollPhase(), hd), ease(clamp01((t - 2.05) / .4))); }
      paint(a, bp, rot);
      if (t > .9 && t < 1.75) {
        s = t < 1.05 ? (t - .9) / .15 : 1 - (t - 1.05) / .7;
        set(stars, "transform", "translate(" + (headDown[0] + 2).toFixed(2) + " " + (headDown[1] - 9).toFixed(2) + ") rotate(" + ((t - .9) * 300).toFixed(1) + ") scale(" + (1.1 + 0.6 * s).toFixed(2) + ")");
      }
      set(stars, "opacity", Math.max(0, Math.min(1, s)).toFixed(2));
      if (t < 2.45) requestAnimationFrame(step);
      else { set(floor, "x1", C.floor[0]); set(floorH, "x1", C.floor[0]); set(stars, "opacity", 0); knocked = false; render(); }
    }
    requestAnimationFrame(step);
  }
  q(".wb-hit").addEventListener("click", knockout);
})();
