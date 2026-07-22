// רישום עמודי חוברת "הוראת זוויות בכיתה ז׳" — הספר הדיגיטלי המלא.
// הסדר (חכם, לפי זרימת ההוראה):
//   1 שער — מכתב המורה (איילת) · 2 תוכן עניינים לחיץ · 3–4 "מתוך עדכון ת״ל"
//   (גאומטריה קדם-היסקית / למה ללמוד להבנה — תוכן אמיתי) · 5 "מה אנחנו מלמדים?"
//   (הועבר מעמוד הבית) · 6 זוויות סביבנו · 7 סוגי זוויות ·
//   8–19 דפי "סוגי זוויות ומדידתן" והמחשות · מדידה ואומדן · דף עבודה "שרטוט
//   ומדידת זוויות" · דפי מערכת צירים ברצף · זוג עמודי "קישור ליישומונים"
//   (36–37, כפולה אחת פתוחה: Matific מימין, StoryboardThat משמאל — אחרי דפי
//   העבודה ולא בתוכם) · שער "דפי עבודה" (אומדן + שאלות מתוכנית הלימודים).
// עמוד "מטרות הלמידה" (objectives) נמחק לצמיתות לבקשת יניב (17.7.2026).
// המצגת אינה עמוד בחוברת — היא מוצגת כמקטע עצמאי בעמוד הבית (PresentationViewer),
// מתחת לחוברת, בהטמעה זהה למצגת של "מספרים מכוונים".
// עמודי תמונה: /booklet-worksheets/page-NN.webp (img = מספר הקובץ / עמוד ב-PDF).
// עמודי cover/toc/presentation/content מרונדרים חי (React) — לא תמונות.
// WsPage הוא discriminated union לפי kind — כל וריאנט מחייב בדיוק את השדות שלו:
// image מחייב img; presentation מחייב presentationSrc+downloadName; content מחייב
// content; cover/toc ללא שדות זרים. כך עמוד חסר-שדה נכשל בקומפילציה, לא בזמן ריצה.
export type WsContentId =
  | "angles-types" | "measurement" | "draw-measure" | "around-us" | "intro-a" | "intro-b" | "what-we-teach" | "why-models" | "applet" | "applet-maker"
  | "protractor-poster" | "clock-angles"
  | "right-angle-estimate"
  | "angle7-1" | "angle7-2" | "angle7-3" | "angle7-4";

type WsPageBase = {
  title: string;
  section: "angles" | "coords";
  toc?: { label: string; sub: string }; // אם קיים — העמוד מופיע כפרק בתוכן העניינים
  // אם קיים — כאן נפתח "שער" (קבוצת נושא) חדש בחוברת. השערים נגזרים מהסימונים
  // האלה (WS_GROUPS) ומשמשים את תוכן העניינים, פאנל הניווט ובורר ההדפסה —
  // מקור-אמת אחד, עמיד להוספת עמודים בתוך שער קיים.
  groupStart?: string;
  // true = דף עבודה אמיתי (עמוד תרגול שהתלמיד עובד עליו) — להבדיל מעמודי שער,
  // הסבר, פוסטר או יישומון. הסיווג נעשה לפי בחינת תוכן העמודים עצמם. ממנו
  // נגזרים אוטומטית עמוד "דפי עבודה" (/worksheets) והמספור הרץ (WORKSHEETS) —
  // המספור רץ לפי סדר ההופעה בחוברת בלבד: דף עבודה 1 = הראשון ברצף, וכן הלאה,
  // אחד אחרי השני בלי קפיצות (דרישת יניב 17.7.2026 — החליפה את worksheetOrder).
  worksheet?: true;
};

export type WsPage =
  | (WsPageBase & { kind: "cover" })
  | (WsPageBase & { kind: "toc" })
  | (WsPageBase & { kind: "image"; img: number }) // מספר קובץ התמונה / עמוד ב-PDF
  | (WsPageBase & { kind: "presentation"; presentationSrc: string; downloadName: string })
  | (WsPageBase & { kind: "content"; content: WsContentId });

export const WS_PAGES: WsPage[] = [
  // ——— שער 1: פתיחה ומבוא ———
  { title: "מכתב המורה — הוראת זוויות בכיתה ז׳", section: "angles", kind: "cover", groupStart: "פתיחה ומבוא", toc: { label: "פתיחה — מכתב המורה", sub: "דברי פתיחה מאת איילת קריספין" } },
  { title: "תוכן העניינים", section: "angles", kind: "toc" },
  { title: "מתוך עדכון ת״ל — גאומטריה קדם-היסקית: לומדים ומלמדים להבנה", section: "angles", kind: "content", content: "intro-a", toc: { label: "מתוך עדכון ת״ל", sub: "גאומטריה קדם-היסקית: לומדים ומלמדים להבנה" } },
  { title: "מתוך עדכון ת״ל — למה ללמוד להבנה?", section: "angles", kind: "content", content: "intro-b" },
  { title: "מה אנחנו מלמדים?", section: "angles", kind: "content", content: "what-we-teach", toc: { label: "מה אנחנו מלמדים?", sub: "נושאי הלימוד מתוך תוכנית הלימודים המעודכנת" } },
  // "למה נשתמש בהמחשות?" — הועבר מעמוד הבית לחוברת לבקשת יניב (17.7.2026).
  { title: "למה נשתמש בהמחשות?", section: "angles", kind: "content", content: "why-models", toc: { label: "למה נשתמש בהמחשות?", sub: "פעולה במרחב · הגשר בין האינטואיציה לידע הפורמלי" } },
  // ——— שער 2: סוגי זוויות ומדידתן (עמודי לימוד והפניות) ———
  { title: "סוגי זוויות", section: "angles", kind: "content", content: "angles-types", groupStart: "סוגי זוויות ומדידתן", toc: { label: "סוגי זוויות ומדידתן", sub: "ששת סוגי הזוויות והגדרותיהם" } },
  { title: "פוסטר — זוויות, מד זווית ומחוגה", section: "angles", kind: "image", img: 7 },
  { title: "מדידה ואומדן של זוויות", section: "coords", kind: "content", content: "measurement", toc: { label: "מדידה ואומדן של זוויות", sub: "מד זווית · אומדן · דיוק" } },
  // זוג עמודי "קישור ליישומונים" — כותרת זהה, צמודים זה לזה (דרישת יניב 17.7.2026);
  // בתוכן העניינים הפניה אחת בלבד, המצביעה על העמוד שבו הזוג מתחיל.
  { title: "קישור ליישומונים", section: "coords", kind: "content", content: "applet", toc: { label: "קישור ליישומונים", sub: "מד זווית לאומדן זוויות (Matific) · יצירת דפי עבודה של זוויות (StoryboardThat)" } },
  { title: "קישור ליישומונים", section: "coords", kind: "content", content: "applet-maker" },
  // פוסטר "כיצד להשתמש במד זווית" (עיצוב Canva DAHPn7_umZ8 של יניב, שוחזר
  // אחד-לאחד כרכיב וקטורי) — צמוד לעמודי המדידה וליישומון מד-הזווית, מחוץ
  // לרצף דפי העבודה. בעמוד עצמו כפתורי הורדה מיידית / תצוגה מלאה / הדפסה,
  // ותוכן העניינים מפנה ישירות אליו.
  { title: "פוסטר — כיצד להשתמש במד זווית", section: "coords", kind: "content", content: "protractor-poster", toc: { label: "פוסטר — כיצד להשתמש במד זווית", sub: "מד זווית משמש למדידת גודל של זוויות · צפייה, הורדה והדפסה" } },
  // ——— שער 3: דפי עבודה — כל 30 דפי העבודה ברצף אחד, בלי עמודי ביניים
  //     (דרישת יניב 17.7.2026: רצף אמיתי, הפוסטרים והלימוד מחוץ לרצף) ———
  { title: "סוגי זוויות — זוויות סביבנו", section: "angles", kind: "content", content: "around-us", worksheet: true, groupStart: "דפי עבודה", toc: { label: "זוויות סביבנו", sub: "זיהוי, מיון ומדידה של זוויות מן הסביבה" } },
  { title: "השלימו את ההיגדים — הזוויות שבין העצים", section: "angles", kind: "image", img: 4, worksheet: true },
  { title: "ציור של שני עטים — סימון ההיגדים הנכונים", section: "angles", kind: "image", img: 5, worksheet: true },
  { title: "התבוננו בכל זוג עטים — התאמה למידת הזווית", section: "angles", kind: "image", img: 6, worksheet: true },
  { title: "מי אני? — חידות על גודל הזווית", section: "angles", kind: "image", img: 8, worksheet: true },
  { title: "הזווית שבין העץ הנטוי למישור הדשא", section: "angles", kind: "image", img: 9, worksheet: true },
  { title: "מספריים פתוחים — היגדים והשלמת משפטים", section: "angles", kind: "image", img: 10, worksheet: true },
  { title: "זוויות על פני השעון", section: "angles", kind: "image", img: 11, worksheet: true },
  // עותק חי של דף הקנבה "מה גודל הזווית בין מחוגי השעון" (נמסר מיניב 17.7.2026) —
  // ממוקם ברצף מיד אחרי דף השעון הקיים, באותו נושא.
  { title: "מה גודל הזווית בין מחוגי השעון", section: "angles", kind: "content", content: "clock-angles", worksheet: true },
  { title: "זוויות ברחובות העיר — מפת הרחובות", section: "angles", kind: "image", img: 12, worksheet: true },
  { title: "זוויות ברחובות העיר — שאלות", section: "angles", kind: "image", img: 13, worksheet: true },
  { title: "השלימו את המשפטים בעזרת מחסן המילים — חלק א", section: "angles", kind: "image", img: 15, worksheet: true },
  { title: "שרטוט ומדידת זוויות", section: "coords", kind: "content", content: "draw-measure", worksheet: true },
  { title: "השלימו את המשפטים בעזרת מחסן המילים — חלק ב", section: "coords", kind: "image", img: 16, worksheet: true, toc: { label: "זוויות במערכת צירים", sub: "זוויות על גבי מערכת הצירים" } },
  { title: "קרניים מאונכות וזווית ישרה — נכון, לא נכון או אי אפשר לדעת", section: "coords", kind: "image", img: 17, worksheet: true },
  { title: "הזווית AOB במערכת הצירים — חלק א", section: "coords", kind: "image", img: 18, worksheet: true },
  { title: "הזווית AOB במערכת הצירים — חלק ב", section: "coords", kind: "image", img: 19, worksheet: true },
  { title: "השוואת זוויות מן הראשית אל נקודות שונות", section: "coords", kind: "image", img: 20, worksheet: true },
  { title: "הזזת הנקודה B ימינה — חקירת הזווית, חלק א", section: "coords", kind: "image", img: 21, worksheet: true },
  { title: "הזזת הנקודה B ימינה — חקירת הזווית, חלק ב", section: "coords", kind: "image", img: 22, worksheet: true },
  { title: "הזזת הנקודה B ימינה ומעלה — חקירת הזווית", section: "coords", kind: "image", img: 23, worksheet: true },
  { title: "הנקודה F — קרבה לציר וגודל הזווית", section: "coords", kind: "image", img: 24, worksheet: true },
  { title: "הנקודות C ו-D על אותה קרן — הזווית נשמרת", section: "coords", kind: "image", img: 25, worksheet: true },
  { title: "הנקודה E — רביעים וגודל הזווית", section: "coords", kind: "image", img: 26, worksheet: true },
  { title: "קרניים של 30° ו-60° — מיקום נקודות ביחס לקרן", section: "coords", kind: "image", img: 27, worksheet: true },
  { title: "חקירת נקודות ביחס למחוג", section: "coords", kind: "image", img: 28, worksheet: true },
  // דף האומדן (Canva DAHPnYtSLbE, שוחזר 1:1) — "אומדן של זווית ביחס לזווית ישרה"
  { title: "זוויות ישרות, חדות וקהות", section: "coords", kind: "content", content: "right-angle-estimate", worksheet: true, toc: { label: "אומדן של זווית ביחס לזווית ישרה", sub: "זוויות ישרות, חדות וקהות · בדיקה בעזרת דף מקופל" } },
  // ארבעת דפי "שאלות כמו בתוכנית הלימודים" (מ-parabula-next) — ההפניה אליהם
  // היא השורה האחרונה בתוכן העניינים (דרישת יניב).
  { title: "שאלות כמו בתוכנית הלימודים", section: "coords", kind: "content", content: "angle7-1", worksheet: true, toc: { label: "שאלות כמו בתוכנית הלימודים", sub: "זווית ישרה במערכת צירים · מאגר התרגילים, תרגול והעשרה" } },
  { title: "שאלות כמו בתוכנית הלימודים", section: "coords", kind: "content", content: "angle7-2", worksheet: true },
  { title: "שאלות כמו בתוכנית הלימודים", section: "coords", kind: "content", content: "angle7-3", worksheet: true },
  { title: "שאלות כמו בתוכנית הלימודים", section: "coords", kind: "content", content: "angle7-4", worksheet: true },
  // ——— סוף החוברת: הפוסטר הצבעוני (הוצא מתוך רצף דפי העבודה לבקשת יניב;
  //     ללא שורת תוכן-עניינים — כדי ש"שאלות כמו בתוכנית הלימודים" תישאר אחרונה) ———
  { title: "פוסטר — סוגי זוויות ומדידתן", section: "angles", kind: "image", img: 14 },
];

export const WS_TOTAL = WS_PAGES.length;

// כתובת התמונה לעמוד תמונה מספר n (1-based לפי הסדר בחוברת).
export function wsPageImage(n: number): string {
  const p = WS_PAGES[n - 1];
  const img = p && p.kind === "image" ? p.img : n;
  return `/booklet-worksheets/page-${String(img).padStart(2, "0")}.webp`;
}

// עמודי התמונה בלבד (לבורר ההורדה/הדפסה — ממופים לעמודי ה-PDF לפי img).
export const WS_IMAGE_PAGES = WS_PAGES
  .map((p, i) => ({ page: p, slot: i + 1 }))
  .filter((e): e is { page: Extract<WsPage, { kind: "image" }>; slot: number } => e.page.kind === "image")
  .map((e) => ({ title: e.page.title, section: e.page.section, img: e.page.img, slot: e.slot }));

// תוכן העניינים — נגזר אוטומטית מהעמודים שסומנו ב-toc (page = מיקום 1-based).
export const TOC_ENTRIES = WS_PAGES
  .map((p, i) => (p.toc ? { ...p.toc, page: i + 1 } : null))
  .filter((e): e is { label: string; sub: string; page: number } => e !== null);

// שערי החוברת (קבוצות נושא) — נגזרים מסימוני groupStart; from/to כוללניים, 1-based.
export type WsGroup = { title: string; from: number; to: number };
export const WS_GROUPS: WsGroup[] = WS_PAGES.reduce<WsGroup[]>((acc, p, i) => {
  if (p.groupStart) {
    if (acc.length) acc[acc.length - 1].to = i; // השער הקודם נסגר בעמוד שלפני
    acc.push({ title: p.groupStart, from: i + 1, to: WS_PAGES.length });
  }
  return acc;
}, []);

/** השער שאליו שייך עמוד (1-based). כל עמוד שייך לשער — העמוד הראשון פותח שער. */
export function wsGroupOf(page1Based: number): WsGroup {
  const g = WS_GROUPS.find((gr) => page1Based >= gr.from && page1Based <= gr.to);
  if (!g) throw new Error(`page ${page1Based} is outside all WS_GROUPS`);
  return g;
}

// תוכן העניינים מקובץ לשערים — הפרקים שומרים מספור גלובלי רציף (ordinal, 1-based).
export type TocGroup = { title: string; entries: { label: string; sub: string; page: number; ordinal: number }[] };
export const TOC_GROUPS: TocGroup[] = WS_GROUPS.map((g) => ({
  title: g.title,
  entries: TOC_ENTRIES
    .map((e, i) => ({ ...e, ordinal: i + 1 }))
    .filter((e) => e.page >= g.from && e.page <= g.to),
}));

// ===== דפי העבודה — מקור-אמת לעמוד "דפי עבודה" (/worksheets) =====
// נגזר אוטומטית מהעמודים שסומנו worksheet: true, לפי סדר ההופעה בחוברת בלבד:
// דף עבודה 1 = הראשון ברצף, וכן הלאה אחד אחרי השני (דרישת יניב 17.7.2026 —
// המספור עוקב אחר החוברת; מנגנון worksheetOrder הקודם הוסר).
// num = המספור הרץ (דף עבודה 1, 2, ...) — מתחיל ב-1, רציף, בלי כפילויות;
// שינוי סדר/סימון ברישום מעדכן את המספור מעצמו. id יציב לכל דף (content-id
// או img-N), thumb = תמונה ממוזערת לעמודי תמונה, printModes = אפשרויות ההדפסה.
export type WorksheetEntry = {
  id: string;
  num: number;
  slot: number; // מיקום העמוד בחוברת (1-based) — לקישור אל הקורא של החוברת
  title: string;
  kind: "image" | "content";
  thumb?: string;
  printModes: readonly ["color", "bw"];
};
export const WORKSHEETS: WorksheetEntry[] = WS_PAGES
  .map((p, i) => ({ p, slot: i + 1 }))
  .filter((e) => e.p.worksheet)
  .map((e, idx) => ({
    id: e.p.kind === "image" ? `img-${e.p.img}` : e.p.kind === "content" ? e.p.content : `page-${e.slot}`,
    num: idx + 1,
    slot: e.slot,
    title: e.p.title,
    kind: e.p.kind === "image" ? ("image" as const) : ("content" as const),
    thumb: e.p.kind === "image" ? wsPageImage(e.slot) : undefined,
    printModes: ["color", "bw"] as const,
  }));
export const WORKSHEETS_TOTAL = WORKSHEETS.length;

// ה-PDF המלא של החוברת (עמודי התמונה, מערכת צירים בסוף) — להורדה.
export const WS_PDF_URL = "/booklet-worksheets/zaviyot-worksheets.pdf";
export const WS_PDF_DOWNLOAD_NAME = "זוויות בכיתה ז׳ — חוברת דפי עבודה.pdf";

// המצגת המוטמעת (גאומטריה קדם-היסקית).
export const WS_PRESENTATION_TITLE = "מצגת ההוראה — גאומטריה קדם-היסקית";
