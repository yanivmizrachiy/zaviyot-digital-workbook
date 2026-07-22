// מקור-אמת יחיד ל"אביזרים נלווים להמחשה": הנושאים הפדגוגיים והפריטים.
// נתונים טהורים בלבד (בלי JSX) — לייבוא גם בקומפוננטות לקוח (תפריט הניווט)
// וגם ברישום הרכיבים (hamchashot/registry שמצמיד לכל id את רכיב-האיור).
//
// עקרונות:
// • n (מספר הנתיב /hamchashot/[n]) = מיקום הפריט במערך AID_ITEMS ‏(1-based) —
//   הסדר כאן קבוע כדי שקישורים קיימים לא יישברו. אין לשנות את סדר המערך.
// • שיוך לנושא וסדר-בתוך-נושא נשלטים בשדות topic / order בלבד — העברת פריט
//   לנושא אחר או שינוי סדר תצוגה נעשים כאן, בקובץ אחד, בלי לגעת בשום רכיב.
// • title = הכותרת המודפסת על הדף עצמו (נשמרת כמקור); label = הכיתוב בתפריט,
//   בכרטיסים ובקטלוג. הסיווג לנושאים נעשה לפי תוכן הדפים (לא לפי שמות קבצים).

export type AidTopicId = "concept" | "measure" | "coords";

export type AidTopic = {
  id: AidTopicId;
  title: string;
  blurb: string; // שורת הסבר קצרה בכרטיס הנושא
};

// סדר הנושאים = הסדר הפדגוגי של היחידה: מושג הזווית ← מדידה ← מערכת צירים.
export const AID_TOPICS: AidTopic[] = [
  {
    id: "concept",
    title: "מושג הזווית והשוואת זוויות",
    blurb: "עיגולי המחשה לגזירה, השוואה לזווית ישרה, מעגל ליצירת זווית ומשולשים קהיי-זווית",
  },
  {
    id: "measure",
    title: "מדידת זוויות במד זווית",
    blurb: "מדי זווית להדפסה על שקף, הסבר שימוש, פוסטר ותרגול מדידה וקריאה של זוויות",
  },
  {
    id: "coords",
    title: "זוויות במערכת הצירים — רביע ראשון",
    blurb: "קרניים לזוויות והרביע הראשון של מערכת הצירים, עם מספרים ובלעדיהם",
  },
];

export type AidItemMeta = {
  id: string; // מזהה יציב
  title: string; // הכותרת המודפסת בראש הדף (מקור)
  label: string; // הכיתוב בתפריט/בכרטיסים
  topic: AidTopicId;
  order: number; // סדר התצוגה בתוך הנושא
  source: string; // מקור הדף
  printModes: readonly ["color", "bw"]; // אפשרויות ההדפסה הנתמכות
};

const DRIVE = "תיקיית «המחשות - להדפסה» (איילת קריספין)";
const RESOURCES = "ארגז המשאבים — מדידת זוויות במד זווית (איילת קריספין)";
const PRINT_BOTH = ["color", "bw"] as const;

// הסדר במערך = n של הנתיב (1-based). קבוע — אין לשנות/למחוק, רק להוסיף בסוף.
export const AID_ITEMS: AidItemMeta[] = [
  { id: "circles-1", title: "זוויות", label: "זוויות — עיגולי המחשה", topic: "concept", order: 1, source: DRIVE, printModes: PRINT_BOTH },
  { id: "circles-2", title: "זוויות", label: "זוויות — עיגולי המחשה (המשך)", topic: "concept", order: 2, source: DRIVE, printModes: PRINT_BOTH },
  { id: "right-angle", title: "זווית ישרה להשוואת זוויות", label: "זווית ישרה להשוואת זוויות", topic: "concept", order: 3, source: DRIVE, printModes: PRINT_BOTH },
  { id: "protractor-sheet", title: "מד זווית להדפסה על שקף", label: "מד זווית להדפסה על שקף", topic: "measure", order: 1, source: DRIVE, printModes: PRINT_BOTH },
  { id: "angle-circle", title: "מעגל ליצירת זווית", label: "מעגל ליצירת זווית", topic: "concept", order: 4, source: DRIVE, printModes: PRINT_BOTH },
  { id: "obtuse-triangles", title: "משולשים קהיי זווית", label: "משולשים קהיי זווית", topic: "concept", order: 5, source: DRIVE, printModes: PRINT_BOTH },
  { id: "rays", title: "קרניים לזוויות במערכת הצירים", label: "קרניים לזוויות במערכת הצירים", topic: "coords", order: 1, source: DRIVE, printModes: PRINT_BOTH },
  { id: "quadrant-blank", title: "רביע ראשון ללא מספרים", label: "רביע ראשון ללא מספרים", topic: "coords", order: 2, source: DRIVE, printModes: PRINT_BOTH },
  { id: "quadrant-numbers", title: "רביע ראשון עם מספרים", label: "רביע ראשון עם מספרים", topic: "coords", order: 3, source: DRIVE, printModes: PRINT_BOTH },
  { id: "protractor-a", title: "מד זווית להדפסה על שקף · דגם א", label: "מד זווית להדפסה על שקף · דגם א", topic: "measure", order: 2, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "protractor-b", title: "מד זווית להדפסה על שקף · דגם ב", label: "מד זווית להדפסה על שקף · דגם ב", topic: "measure", order: 3, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "how-to-use", title: "כיצד להשתמש במד זווית", label: "כיצד להשתמש במד זווית", topic: "measure", order: 4, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "poster-measure", title: "פוסטר — איך מודדים זווית?", label: "פוסטר — איך מודדים זווית?", topic: "measure", order: 5, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "measure-worksheet", title: "דף עבודה — מדידת זוויות", label: "דף עבודה — מדידת זוויות", topic: "measure", order: 6, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "measure-given-a", title: "מדידת זווית באמצעות מד זווית נתונה · עמוד א", label: "מדידת זווית במד זווית נתונה · עמוד א", topic: "measure", order: 7, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "measure-given-b", title: "מדידת זווית באמצעות מד זווית נתונה · עמוד ב", label: "מדידת זווית במד זווית נתונה · עמוד ב", topic: "measure", order: 8, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "what-size", title: "בת כמה מעלות כל זווית המסומנת על מד הזווית?", label: "בת כמה מעלות כל זווית?", topic: "measure", order: 9, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "reading-a", title: "קריאת זוויות עם מד זווית · עמוד א", label: "קריאת זוויות עם מד זווית · עמוד א", topic: "measure", order: 10, source: RESOURCES, printModes: PRINT_BOTH },
  { id: "reading-b", title: "קריאת זוויות עם מד זווית · עמוד ב", label: "קריאת זוויות עם מד זווית · עמוד ב", topic: "measure", order: 11, source: RESOURCES, printModes: PRINT_BOTH },
];

/** n של הנתיב /hamchashot/[n] לפריט (1-based, לפי מיקומו הקבוע במערך). */
export function aidNumberOf(id: string): number {
  const i = AID_ITEMS.findIndex((it) => it.id === id);
  if (i < 0) throw new Error(`unknown aid item id: ${id}`);
  return i + 1;
}

/** פריטי נושא, ממוינים לפי סדר-בתוך-נושא, עם n של הנתיב. */
export function aidItemsOfTopic(topic: AidTopicId): (AidItemMeta & { n: number })[] {
  return AID_ITEMS.map((it, i) => ({ ...it, n: i + 1 }))
    .filter((it) => it.topic === topic)
    .sort((a, b) => a.order - b.order);
}

/** הנושא של פריט מספר n (1-based). */
export function aidTopicOf(n: number): AidTopic {
  const item = AID_ITEMS[n - 1];
  const topic = item && AID_TOPICS.find((t) => t.id === item.topic);
  if (!topic) throw new Error(`aid item ${n} has no topic`);
  return topic;
}
