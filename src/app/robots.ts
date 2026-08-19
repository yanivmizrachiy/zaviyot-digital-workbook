import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// מסלולי הקורא/ההדפסה מסומנים noindex בדפים עצמם, ולכן אינם כלולים ב-sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
