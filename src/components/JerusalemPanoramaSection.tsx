"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./jerusalem-panorama.css";

// "זוויות בין חומות ירושלים" — רצועת פנורמה קולנועית מיד מתחת ל-Hero:
// התמונה שמסר יניב (תלמידים חוקרים זוויות הולוגרפיות על רקע חומות העיר
// העתיקה) — תמונת הזהות של ההדרכה במחוז ירושלים. נבנית כפאזל איטי של
// 8×4 אריחים בסדר פסיפס קבוע, ואז נושמת ב-Ken Burns (jerusalem-panorama.css).
// בלי JS או ב-reduced-motion — מוצגת שלמה מיד (אותו דפוס reveal כמו FinaleSection).

const COLS = 8;
const ROWS = 4;

// סדר חשיפת פסיפס קבוע (דטרמיניסטי — זהה בשרת ובלקוח, בלי Math.random):
// האריחים מדורגים לפי מרחק מנקודת-עוגן ליד כיפת הזהב (עמודה 3.2, שורה 0.8)
// עם פיזור זהב-יחס עדין — נראה אקראי, מתפשט מהמרכז-ימין החוצה.
const MOSAIC_DELAYS: number[] = (() => {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const dist = Math.hypot(c - 3.2, (r - 0.8) * 1.7);
    const jitter = ((i * 7) % 11) / 11; // פסאודו-אקראי קבוע
    return { i, key: dist + jitter * 1.6 };
  });
  const order = [...cells].sort((a, b) => a.key - b.key).map((c) => c.i);
  const delays = new Array<number>(COLS * ROWS);
  order.forEach((cellIndex, rank) => (delays[cellIndex] = rank * 52));
  return delays;
})();

export function JerusalemPanoramaSection() {
  const frameRef = useRef<HTMLDivElement>(null);

  // חימוש (הסתרת האריחים) רק כש-JS רץ; חשיפה עם כניסה לחלון התצוגה.
  // לצד ה-IntersectionObserver רצה בדיקת-ביטחון עיתית: אם המסגרת כבר נראית
  // בפועל וה-IO לא ירה (דפדפן חריג / tab שהוסתר) — הפאזל נחשף בכל זאת.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("jpan--armed");
    let fallback = 0;
    const revealNow = () => {
      el.classList.add("jpan--in");
      io.disconnect();
      window.clearInterval(fallback);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) revealNow();
      },
      { threshold: 0.22, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    fallback = window.setInterval(() => {
      const r = el.getBoundingClientRect();
      if (window.innerHeight > 0 && r.top < window.innerHeight * 0.85 && r.bottom > 0) revealNow();
    }, 1500);
    return () => {
      io.disconnect();
      window.clearInterval(fallback);
    };
  }, []);

  return (
    <section className="jpan" aria-label="זוויות בין חומות ירושלים">
      <div className="container">
        <div
          ref={frameRef}
          className="jpan__frame"
          role="img"
          aria-label="תלמידים חוקרים זוויות באמצעות טאבלטים ומדי זווית הולוגרפיים על רקע חומות ירושלים העתיקה בשקיעה — הדמיה"
          style={{ "--jpan-src": "url(/panorama/jerusalem-angles.webp)" } as CSSProperties}
        >
          <div className="jpan__grid" aria-hidden="true">
            {MOSAIC_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="jpan__tile"
                style={
                  {
                    backgroundPosition: `${((i % COLS) * 100) / (COLS - 1)}% ${(Math.floor(i / COLS) * 100) / (ROWS - 1)}%`,
                    "--d": `${delay}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <span className="jpan__sheen" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
