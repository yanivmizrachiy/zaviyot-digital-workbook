"use client";

import { useEffect } from "react";
import { waitForPrintReady } from "./printReady";

// לוגיקת ההמתנה (גופנים + תמונות, race-safe, ניקוי מלא) חיה ב-printReady.ts —
// קובץ ‎.ts טהור שנבדק ב-node:test. כאן רק ההפעלה בצד הלקוח.
export { waitForPrintReady } from "./printReady";

// פותח את חלון ההדפסה אוטומטית (Print → שמירה כ-PDF) כשמגיעים עם ?print=1 —
// רק אחרי שהגופנים וכל התמונות נטענו (או אחרי timeout הבטיחות), ופעם אחת בלבד.
export function PrintAutoTrigger() {
  useEffect(() => {
    let cancelled = false;
    void waitForPrintReady(document).then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
