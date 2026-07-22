"use client";

import { useEffect, useRef, useState } from "react";

// אנימציית הזוויות של עמוד השער (angles_v2) — לולאת וידאו שקטה בפאנל כהה
// ממוסגר, כחלק מקומפוזיציית ה-Hero. עקרונות:
// • ‏<video> תקני: muted + playsInline (חובה ל-autoplay ב-Safari/מובייל), loop,
//   preload="metadata" חסכוני, poster מפריים אמיתי מהסרטון — אין קפיצת פריסה
//   (aspect-ratio קבוע על העטיפה).
// • IntersectionObserver: הסרטון מתנגן רק כשהוא על המסך ונעצר כשיוצא — ומתחדש
//   כשחוזר. אם הדפדפן חוסם autoplay — נשאר הפוסטר הסטטי (ללא שגיאה).
// • prefers-reduced-motion: מוצגת תמונת הפוסטר בלבד, בלי לולאה אוטומטית.
const SRC = "/video/zaviyot-angles-loop.mp4";
const POSTER = "/video/zaviyot-angles-poster.jpg";

export function HeroAngleVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {
            /* autoplay נחסם — הפוסטר נשאר מוצג */
          });
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div className="herovid" aria-hidden="true">
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER} alt="" />
      ) : (
        <video ref={videoRef} muted playsInline loop preload="metadata" poster={POSTER} tabIndex={-1}>
          <source src={SRC} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
