"use client";

import { useEffect, useRef } from "react";

// מקטע הסיום של עמוד הבית — "הזירה": התמונה שמסר יניב (במת ענק טכנולוגית של
// גאומטריה, דגלי ישראל וקרני לייזר) מוטמעת כחוויית סיום חיה, אחרונה לפני הפוטר.
// שכבות: רקע-עצמי מטושטש עם פרלקסת גלילה (scroll-driven animation ב-@supports,
// שיפור הדרגתי) · קרני לייזר CSS עדינות המהדהדות את קווי התמונה · מסגרת זהב
// עם Ken Burns איטי, הטיה תלת-ממדית לפי הסמן (pointer:fine בלבד) וברק נודד.
// הכניסה בגלילה נשענת על מנגנון ה-reveal האתרי (fallback בטוח בלי JS),
// וכל התנועות מכבדות prefers-reduced-motion.
export function FinaleSection() {
  const frameRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // כניסה בגלילה במחלקות ה-reveal האתריות: חימוש (is-armed) רק כש-JS רץ —
  // בלי JS האלמנט פשוט נשאר גלוי; is-in נוסף כשהמקטע נכנס לחלון התצוגה.
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // הטיה תלת-ממדית עדינה + ברק לפי מיקום הסמן — עכבר אמיתי בלבד, בלי reduced-motion
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        frame.style.setProperty("--tiltX", `${(-py * 5).toFixed(2)}deg`);
        frame.style.setProperty("--tiltY", `${(px * 7).toFixed(2)}deg`);
        frame.style.setProperty("--glareX", `${(px * 100 + 50).toFixed(1)}%`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      frame.style.setProperty("--tiltX", "0deg");
      frame.style.setProperty("--tiltY", "0deg");
    };
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="finale" aria-label="זירת הזוויות">
      <div className="finale__bg" aria-hidden="true" />
      <div className="finale__beams" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="container finale__inner">
        <div ref={revealRef} className="reveal">
          <div ref={frameRef} className="finale__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="finale__img"
              src="/finale/zaviyot-arena.webp"
              width={768}
              height={1376}
              loading="lazy"
              decoding="async"
              alt="זירת אירועים עטורת דגלי ישראל: קרני לייזר גאומטריות, לוחות שרטוט זוהרים ומנחים על במה מול קהל"
            />
            <span className="finale__glare" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
