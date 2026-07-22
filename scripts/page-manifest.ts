import { WS_PAGES, wsPageImage } from "../src/components/worksheets/registry.ts";
import { worksheetComponentKey } from "../src/components/worksheets/worksheetKind.ts";

// מנפיק manifest לבדיקת בריאות: לכל מפתח-רכיב — מספר העמוד *הנגזר מהרישום*
// (לא קשיח) וטקסט-סימן שמופיע ב-HTML המוגש של עמוד הקורא (אומת מול השרת).
// מכסה את כל סוגי הרכיבים + עמוד תמונה אחד (ה-marker שלו הוא כתובת ה-webp).
// הרצה: node --experimental-strip-types zaviyot/scripts/page-manifest.ts
const MARKERS: Record<string, string> = {
  cover: "מורים יקרים",
  toc: "תוכן העניינים",
  "intro-a": "לומדים ומלמדים",
  "intro-b": "למה ללמוד להבנה",
  "why-models": "השורה התחתונה",
  presentation: "פתיחה במסך מלא",
  "around-us": "רשמו האם הזווית",
  "angles-types": "זווית חדה",
  measurement: "מדידה ואומדן של זוויות",
  applet: "Matific",
};

const seen = new Set<string>();
const out: { page: number; key: string; marker: string; title: string }[] = [];
WS_PAGES.forEach((p, i) => {
  const key = worksheetComponentKey(p);
  if (seen.has(key)) return;
  const marker = key === "image" ? wsPageImage(i + 1) : MARKERS[key];
  if (!marker) return;
  seen.add(key);
  out.push({ page: i + 1, key, marker, title: p.title });
});

process.stdout.write(JSON.stringify(out));
