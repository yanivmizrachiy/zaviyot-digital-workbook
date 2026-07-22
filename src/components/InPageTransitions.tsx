"use client";

import { useEffect } from "react";

// מנגנון מרכזי יחיד לכל המעברים הפנימיים בעמוד.
// כל קישור עוגן (href="#...") שמצביע לאזור קיים מקבל מעבר crossfade יוקרתי
// ואחיד — דהייה מהירה החוצה, קפיצה מיידית ליעד (בלי גלילה נראית), ודהייה
// פנימה עם עליית-מה רכה — במקום גלילה ילידית. מכבד prefers-reduced-motion,
// משאיר את ה-href כ-fallback ללא JS, ולא נוגע בקישור הדילוג-לתוכן (נגישות).
export function InPageTransitions() {
  useEffect(() => {
    let animating = false;

    function onClick(event: MouseEvent) {
      // לא להתערב בלחיצות מיוחדות (פתיחה בטאב חדש וכו') או בקליק שכבר טופל.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const targetEl = event.target as Element | null;
      const anchor = targetEl?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (href.length < 2) return; // "#" בלבד — אין יעד
      if (anchor.classList.contains("skip-link")) return; // נגישות — דילוג מיידי לתוכן

      let target: HTMLElement | null = null;
      try {
        target = document.querySelector(href) as HTMLElement | null;
      } catch {
        return; // סלקטור לא חוקי — לא מתערבים
      }
      if (!target) return;

      event.preventDefault();

      const nav = document.querySelector(".sitenav") as HTMLElement | null;
      const offset = (nav?.offsetHeight ?? 0) + 18; // תואם ל-scroll-margin-top ב-CSS

      const jump = () => {
        const top = target!.getBoundingClientRect().top + window.scrollY - offset;
        // עקיפה זמנית של scroll-behavior כדי לכפות קפיצה מיידית אמיתית
        // (אם יישאר smooth, הקפיצה תהפוך לגלילה נראית מאחורי הדהייה).
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, top);
        html.style.scrollBehavior = prev;
        history.pushState(null, "", href);
      };

      // כיבוד העדפת תנועה מופחתת — מעבר מיידי בלי הנפשה.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        jump();
        return;
      }

      if (animating) return; // מונע חפיפת מעברים בלחיצות מהירות
      animating = true;

      const main = (document.getElementById("main") ?? document.body) as HTMLElement;

      // 1. דהייה מהירה החוצה
      main.style.transition = "opacity 150ms ease";
      main.style.opacity = "0";

      window.setTimeout(() => {
        // 2. קפיצה ליעד בזמן שהתוכן נסתר
        jump();

        // 3. דהייה פנימה + עליית-מה עדינה של היעד (תחושת "התמקמות" יוקרתית)
        main.style.transition = "opacity 340ms ease";
        main.style.opacity = "1";
        target!.style.transition = "transform 460ms cubic-bezier(0.22, 1, 0.36, 1)";
        target!.style.transform = "translateY(16px)";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            target!.style.transform = "translateY(0)";
          })
        );

        // 4. ניקוי הסגנונות הזמניים בתום המעבר
        window.setTimeout(() => {
          main.style.transition = "";
          main.style.opacity = "";
          target!.style.transition = "";
          target!.style.transform = "";
          animating = false;
        }, 520);
      }, 160);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
