import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// העמודים הציבוריים היציבים בלבד: דף הבית, רשימת דפי העבודה (/worksheets),
// אינדקס ההמחשות (/hamchashot) ועמוד סרטוני ההמחשה (/videos) — יש להם
// title/description ואינם noindex. דפי הקורא (/worksheets/[n],
// /worksheets/w/[k], /hamchashot/[n]), ההדפסה ו-sugei-zaviyot מסומנים
// noindex ולכן אינם כאן.
// בלי lastModified מלאכותי — אין תאריך-תוכן אמיתי, ותאריך-build גורם לכל
// פריסה להיראות כשינוי תוכן.

// רשימה מיוצאת כדי שבדיקת ה-sitemap תאמת אותה מול המסלולים הידועים.
export const PUBLIC_ROUTES = [
  "/",
  "/worksheets",
  "/videos",
  "/hamchashot",
  "/hamchashot/t/concept",
  "/hamchashot/t/measure",
  "/hamchashot/t/coords",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: route === "/" ? SITE_URL : `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
