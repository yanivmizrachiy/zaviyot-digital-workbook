/* מנוע חשיפה-בגלילה יוקרתי · Unified Theme
   שימוש: הוסיפו class="reveal" לכל אלמנט שתרצו שייחשף בגלילה, וטענו קובץ זה פעם אחת.
   ב-Next.js אפשר לעטוף בקומפוננטת "use client" עם useEffect שקורא ל-initReveal().
   מכבד prefers-reduced-motion (אז הכל פשוט מוצג). חסין לתוכן שנטען מאוחר (re-render / stream). */
(function () {
  function initReveal() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var vh = function () { return window.innerHeight || document.documentElement.clientHeight; };
      var arm = function () {
        document.querySelectorAll(".reveal:not(.is-in)").forEach(function (e) {
          if (e.getBoundingClientRect().top > vh() * 0.85) e.classList.add("is-armed");
        });
      };
      var reveal = function () {
        document.querySelectorAll(".reveal.is-armed:not(.is-in)").forEach(function (e) {
          if (e.getBoundingClientRect().top < vh() * 0.85) e.classList.add("is-in");
        });
      };
      arm();
      var raf = 0;
      var tick = function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { arm(); reveal(); });
      };
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick);
      var n = 0, iv = setInterval(function () { arm(); reveal(); if (++n > 20) clearInterval(iv); }, 200);
      // רשת ביטחון: אחרי 2.2 שנ' חושפים כל אלמנט שנותר חבוי — תוכן לעולם לא נשאר בלתי-נראה.
      setTimeout(function () {
        document.querySelectorAll(".reveal.is-armed:not(.is-in)").forEach(function (e) { e.classList.add("is-in"); });
      }, 2200);
    } catch (err) {
      document.querySelectorAll(".reveal").forEach(function (e) { e.classList.remove("is-armed"); });
    }
  }
  window.initReveal = initReveal;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initReveal);
  else initReveal();
})();
