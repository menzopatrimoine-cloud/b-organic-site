/* ============================================================
   B.organic — interactions (vanilla, zéro dépendance)
   - reveal au scroll (fade + translation)
   - état "scrolled" de la nav
   - compteurs des chiffres-clés
   Tout est neutralisé sous prefers-reduced-motion.
   ============================================================ */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Reveal au scroll ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Vidéos d'ambiance : lecture continue garantie ----
     Certains navigateurs bloquent l'autoplay ou mettent la vidéo en
     pause (économie d'énergie, onglet en arrière-plan). On relance. */
  var videos = document.querySelectorAll("video[autoplay]");
  function playAll() {
    videos.forEach(function (v) {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }
  playAll();
  document.addEventListener("touchstart", playAll, { once: true, passive: true });
  document.addEventListener("click", playAll, { once: true });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) playAll();
  });
  videos.forEach(function (v) {
    v.addEventListener("pause", function () {
      if (!v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
    v.addEventListener("ended", function () {
      v.currentTime = 0;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  });

  /* ---- Nav : ombre / fond au scroll ---- */
  var nav = document.getElementById("nav");
  var ticking = false;
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", (window.scrollY || 0) > 24);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- Compteurs des chiffres-clés (entiers uniquement) ---- */
  if (!reduce) {
    var statsWrap = document.querySelector(".stats");
    if (statsWrap) {
      var started = false;
      function runCounters() {
        if (started) return;
        started = true;
        statsWrap.querySelectorAll(".stat__num[data-count]").forEach(function (el) {
          var target = parseInt(el.getAttribute("data-count"), 10);
          if (isNaN(target)) return;
          if (target === 0) { el.textContent = "0"; return; }
          var duration = 900 + target * 90;
          var start = null;
          el.textContent = "0";
          function tick(ts) {
            if (start === null) start = ts;
            var t = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = String(Math.round(eased * target));
            if (t < 1) window.requestAnimationFrame(tick);
            else el.textContent = String(target);
          }
          window.requestAnimationFrame(tick);
        });
      }
      var statsIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { runCounters(); statsIO.disconnect(); }
          });
        },
        { threshold: 0.4 }
      );
      statsIO.observe(statsWrap);
    }
  }
})();
