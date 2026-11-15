(function () {
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu (class goes on the pill so the burger and the list share a parent).
  var pill = doc.querySelector(".nav-pill");
  var burger = doc.querySelector(".burger");
  var nav = doc.getElementById("nav");
  function setMenu(open) {
    if (!pill || !burger) return;
    pill.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // Reveal on scroll: a plain position check, so content also shows after a hash jump.
  var items = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  var pending = items.slice();
  function reveal() {
    var limit = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
      return true;
    });
  }
  if (reduce) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + "ms"; });
    var ticking = false;
    var onMove = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; reveal(); });
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    window.addEventListener("hashchange", onMove);
    window.addEventListener("load", onMove);
    reveal();
    setTimeout(reveal, 150);
    setTimeout(reveal, 700);
  }

  // Moves stage: a stick figure does the move, the matching game screen fades in.
  var tabs = Array.prototype.slice.call(doc.querySelectorAll(".move-tabs button"));
  var shots = Array.prototype.slice.call(doc.querySelectorAll(".screen img"));
  var stage = doc.querySelector(".stage");
  if (tabs.length && stage) {
    var INFO = [
      ["Jump", "Jump over hurdles and barriers."],
      ["Duck", "Duck under bars and gates."],
      ["Step left", "Step left to dodge blocks and grab coins."],
      ["Step right", "Step right to clear crates and walls."],
      ["Punch", "Throw a punch to smash what is in your way."],
      ["Pose", "Match the outline on the wall to pass through."]
    ];
    // Points: head, neck, shoulderL, shoulderR, hipMid, hipL, hipR, elbowL, handL, elbowR, handR, kneeL, footL, kneeR, footR
    var STAND = [100,60, 100,84, 80,92, 120,92, 100,168, 88,168, 112,168, 66,126, 62,160, 134,126, 138,160, 88,218, 86,266, 112,218, 114,266];
    var LEFT = [70,62, 74,86, 54,94, 94,94, 86,168, 74,168, 98,168, 40,128, 30,158, 104,124, 110,156, 60,214, 40,266, 98,218, 100,266];
    function mirror(p) { return p.map(function (v, i) { return i % 2 === 0 ? 200 - v : v; }); }
    var POSES = [
      // jump
      { p: [100,26, 100,50, 80,58, 120,58, 100,128, 88,128, 112,128, 64,36, 58,8, 136,36, 142,8, 80,172, 84,210, 120,172, 116,210], air: 1 },
      // duck
      { p: [106,122, 104,144, 86,150, 122,150, 96,206, 86,206, 108,206, 68,178, 78,208, 136,176, 126,206, 72,234, 78,266, 124,228, 118,266], air: 0 },
      // step left
      { p: LEFT, air: 0 },
      // step right
      { p: mirror(LEFT), air: 0 },
      // punch
      { p: [106,62, 104,86, 84,94, 124,94, 100,168, 88,168, 112,168, 74,126, 94,98, 152,96, 188,92, 84,218, 76,266, 116,218, 126,266], air: 0 },
      // pose (arms out, like the wall)
      { p: [100,60, 100,84, 80,92, 120,92, 100,168, 88,168, 112,168, 52,92, 20,92, 148,92, 180,92, 86,218, 80,266, 114,218, 120,266], air: 0 }
    ];
    var el = function (id) { return doc.getElementById(id); };
    var parts = {
      head: el("f-head"), spine: el("f-spine"), sh: el("f-sh"), hip: el("f-hip"),
      armL: el("f-armL"), armR: el("f-armR"), legL: el("f-legL"), legR: el("f-legR")
    };
    var shadow = doc.querySelector(".f-shadow");
    var cur = STAND.slice(), curAir = 0;
    function draw(p, air) {
      parts.head.setAttribute("cx", p[0]); parts.head.setAttribute("cy", p[1]);
      parts.spine.setAttribute("x1", p[2]); parts.spine.setAttribute("y1", p[3]);
      parts.spine.setAttribute("x2", p[8]); parts.spine.setAttribute("y2", p[9]);
      parts.sh.setAttribute("x1", p[4]); parts.sh.setAttribute("y1", p[5]);
      parts.sh.setAttribute("x2", p[6]); parts.sh.setAttribute("y2", p[7]);
      parts.hip.setAttribute("x1", p[10]); parts.hip.setAttribute("y1", p[11]);
      parts.hip.setAttribute("x2", p[12]); parts.hip.setAttribute("y2", p[13]);
      parts.armL.setAttribute("points", p[4] + "," + p[5] + " " + p[14] + "," + p[15] + " " + p[16] + "," + p[17]);
      parts.armR.setAttribute("points", p[6] + "," + p[7] + " " + p[18] + "," + p[19] + " " + p[20] + "," + p[21]);
      parts.legL.setAttribute("points", p[10] + "," + p[11] + " " + p[22] + "," + p[23] + " " + p[24] + "," + p[25]);
      parts.legR.setAttribute("points", p[12] + "," + p[13] + " " + p[26] + "," + p[27] + " " + p[28] + "," + p[29]);
      var cx = (p[24] + p[28]) / 2;
      shadow.setAttribute("cx", cx);
      shadow.setAttribute("rx", 46 - air * 16);
      shadow.style.opacity = 1 - air * 0.55;
    }
    var raf = 0;
    function goTo(pose) {
      cancelAnimationFrame(raf);
      var from = cur.slice(), fromAir = curAir, to = pose.p, t0 = null, dur = reduce ? 1 : 420;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        for (var i = 0; i < to.length; i++) cur[i] = from[i] + (to[i] - from[i]) * e;
        curAir = fromAir + (pose.air - fromAir) * e;
        draw(cur, curAir);
        if (k < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    draw(STAND, 0);

    var index = 0, userUntil = 0;
    function select(i, byUser) {
      index = i;
      if (byUser) userUntil = Date.now() + 9000;
      tabs.forEach(function (b, n) { b.setAttribute("aria-selected", n === i ? "true" : "false"); });
      shots.forEach(function (s, n) { s.classList.toggle("on", n === i); });
      doc.getElementById("mv-title").textContent = INFO[i][0];
      doc.getElementById("mv-text").textContent = INFO[i][1];
      goTo(POSES[i]);
    }
    tabs.forEach(function (b, n) { b.addEventListener("click", function () { select(n, true); }); });
    // Start with the first move already performed, then cycle until the visitor takes over.
    setTimeout(function () { goTo(POSES[0]); }, 300);
    if (!reduce) {
      setInterval(function () {
        if (Date.now() < userUntil) return;
        var r = stage.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        select((index + 1) % POSES.length, false);
      }, 2600);
    }
  }

  // Hero video: phones only, and not for reduced motion. Desktop keeps the still image.
  var video = doc.querySelector(".hero-bg video");
  if (video && !reduce && window.matchMedia("(max-width: 700px)").matches) {
    video.src = video.getAttribute("data-src");
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { var q = video.play(); if (q && q.catch) q.catch(function () {}); }
          else video.pause();
        });
      }, { threshold: 0.05 }).observe(video);
    }
  }
})();
