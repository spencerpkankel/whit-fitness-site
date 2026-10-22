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
// ---- Wall-ball buddy: a tiny figure whose reps are locked to scrolling ----
(function () {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.body || document.querySelector(".wb-buddy")) return;
  var wrap = document.createElement("div");
  wrap.className = "wb-buddy"; wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<svg viewBox="0 -46 70 144" focusable="false">' +
      '<g class="wb-halo"><line x1="14" y1="93.5" x2="66" y2="93.5"/><line x1="62" y1="-44" x2="62" y2="93.5"/><path class="wb-body-h" d=""/><circle class="wb-head-h" r="5.2"/><circle class="wb-ball-h" r="5.6"/></g>' +
      '<line class="wb-floor" x1="14" y1="93.5" x2="66" y2="93.5"/>' +
      '<line class="wb-wall" x1="62" y1="-44" x2="62" y2="93.5"/>' +
      '<line class="wb-target" x1="58" y1="-33" x2="62" y2="-33"/>' +
      '<path class="wb-body" d=""/>' +
      '<circle class="wb-head" r="5.2"/>' +
      '<circle class="wb-ball" r="5.6"/>' +
    '</svg>';
  document.body.appendChild(wrap);
  var q = function (c) { return wrap.querySelector(c); };
  var body = q(".wb-body"), head = q(".wb-head"), ball = q(".wb-ball"), bodyH = q(".wb-body-h"), headH = q(".wb-head-h"), ballH = q(".wb-ball-h");

  // Joint angles in degrees: 0 = straight up, positive = toward the wall (right).
  // [shin, thigh, torso, upperArm, forearm]
  var STAND = [0, 0, 2, 150, 20];
  var SQUAT = [32, -78, 32, 120, -10];
  var THROW = [-4, 2, -2, 14, 6];
  var L = { shin: 19, thigh: 19, torso: 23, upper: 11, fore: 10.5 };
  var ANK = [39.5, 92];                 // closer to the wall
  var TARGET = [56, -33];               // higher throw
  var REP_PX = 420;                     // pixels of scrolling per rep

  function dir(a) { var r = a * Math.PI / 180; return [Math.sin(r), -Math.cos(r)]; }
  function add(p, a, len) { var d = dir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(A, B, t) { return A.map(function (v, i) { return lerp(v, B[i], t); }); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeIn(t) { return t * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  // Catch flows straight into the next squat: easeIn into "stand" at the end of a rep and easeOut
  // out of it at the start of the next, so there is no pause at the top between reps.
  function pose(p) {
    if (p < .28) return mix(STAND, SQUAT, easeOut(p / .28));
    if (p < .46) return mix(SQUAT, THROW, ease((p - .28) / .18));
    if (p < .78) return THROW;
    return mix(THROW, STAND, easeIn((p - .78) / .22));
  }
  function set(el, a, v) { el.setAttribute(a, v); }
  function draw(p) {
    var a = pose(p);
    var knee = add(ANK, a[0], L.shin), hip = add(knee, a[1], L.thigh), neck = add(hip, a[2], L.torso), sh = add(hip, a[2], L.torso - 4.5);
    var elb = add(sh, a[3], L.upper), hand = add(elb, a[4], L.fore), hc = add(neck, a[2], 5.6);
    var d = "M" + (ANK[0] + 5) + " " + ANK[1] + "H" + ANK[0] + "L" + knee + "L" + hip + "L" + neck + "M" + sh + "L" + elb + "L" + hand;
    set(body, "d", d); set(bodyH, "d", d);
    set(head, "cx", hc[0]); set(head, "cy", hc[1]); set(headH, "cx", hc[0]); set(headH, "cy", hc[1]);
    var bx = hand[0] + 3.5, by = hand[1] - 2;
    if (p >= .46 && p < .78) {
      // projectile: height follows a parabola (fast off the hands, slows at the apex, speeds up coming down)
      var t = (p - .46) / .32, arc = 1 - Math.pow(2 * t - 1, 2), out = 1 - Math.abs(2 * t - 1);
      bx = lerp(bx, TARGET[0], out); by = lerp(by, TARGET[1], arc);
    }
    bx = bx.toFixed(2); by = by.toFixed(2);
    set(ball, "cx", bx); set(ball, "cy", by); set(ballH, "cx", bx); set(ballH, "cy", by);
  }

  // shown = what's drawn; goal = where scrolling says he should be (in reps, always forward)
  var shown = 0, goal = 0, lastY = window.pageYOffset, lastT = 0, lastScroll = 0, running = false;
  draw(0);
  function frame(now) {
    var dt = Math.min(50, now - lastT || 16); lastT = now;
    if (now - lastScroll > 180) {
      // scrolling stopped: finish the current rep at a relaxed pace, then rest at the chest
      var restAt = Math.ceil(goal - 1e-6);
      if (goal % 1 > 1e-6) goal = Math.min(restAt, goal + dt / 1000 * 0.9);
    }
    shown += (goal - shown) * Math.min(1, dt / 45);   // tiny smoothing so it tracks the scroll without jitter
    if (Math.abs(goal - shown) < 0.0005) shown = goal;
    draw(shown % 1);
    if (shown === goal && goal % 1 < 1e-6 && now - lastScroll > 180) { running = false; shown = goal = Math.round(goal); return; }
    requestAnimationFrame(frame);
  }
  function kick() { if (!running && !document.hidden) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } }
  window.addEventListener("scroll", function () {
    var y = window.pageYOffset;
    goal += Math.min(Math.abs(y - lastY), 1200) / REP_PX;   // locked to distance scrolled, either direction
    lastY = y; lastScroll = performance.now();
    kick();
  }, { passive: true });
})();
