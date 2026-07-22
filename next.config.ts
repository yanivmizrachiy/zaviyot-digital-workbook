import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // קיבוע שורש הפרויקט כדי למנוע בחירת lockfile שגוי כאשר קיימים מספר lockfiles במחשב.
  turbopack: {
    root: import.meta.dirname,
  },
  // התמונות באתר הן קבצים מקומיים תחת public/, לכן אין צורך בדומיינים חיצוניים.
  // פורמטים מודרניים (AVIF/WebP) לכל תמונות next/image — קטן ומהיר יותר בכל מכשיר.
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    // 90 — ללוגו העגול בכותרת (זהות האתר, חייב להיות חד); 75 — ברירת המחדל לשאר.
    qualities: [75, 90],
  },
  // כותרות אבטחה בסיסיות לכל התגובות. ללא CSP קשיח בכוונה — כדי לא לשבור
  // הטמעות חוקיות (YouTube nocookie, PDF worker/blob, Matific, גופנים).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
