import type { CSSProperties, ReactNode } from "react";

// עמודי "מתוך עדכון ת״ל" — תוכן אמיתי שנמסר מיניב מילה-במילה (רק פיסוק תקין).
// לפי דרישת יניב: «מתוך עדכון ת״ל» היא הכותרת הראשית בשני העמודים;
// עמוד 1 — כותרת משנה "גאומטריה קדם-היסקית: לומדים ומלמדים להבנה"
//          (מטרת-העל + דגש על הוראת הזוויות);
// עמוד 2 — כותרת משנה "למה ללמוד להבנה?" (פסקת ההבנה).
// אחריהם עמוד "מה אנחנו מלמדים?" (WhatWeTeachSheet) — כותרתו הראשית באותו עיצוב
// בדיוק, ותוכנו הועבר לכאן מהמקטע שנמחק מעמוד הבית (CurriculumSection לשעבר).
// ואחריו עמוד "למה נשתמש בהמחשות?" (WhyModelsSheet) — גם תוכנו הועבר לכאן
// מעמוד הבית (WhyModelsSection לשעבר, נמחק לבקשת יניב 17.7.2026).

type Block = { head?: string; body: string; tint: "gold" | "teal" | "rose" };

const PART1: Block[] = [
  {
    head: "מטרת העל של התוכנית",
    body:
      "להרחיב את עולם הידע הגאומטרי במישור ובמרחב כהמשך ישיר לבית הספר היסודי, " +
      "תוך הדגשת השימושיות והקשר לעולם הממשי שבו אנו חיים. המעבר לחשיבה היסקית " +
      "וכתיבת הוכחות פורמליות ייעשה באופן מדורג רק בהמשך, כשכיתה ז׳ מהווה את תשתית " +
      "ההבנה האינטואיטיבית הנדרשת.",
    tint: "gold",
  },
  {
    head: "דגש על הוראת הזוויות",
    body:
      "בתוכנית זו, נושא הזוויות ומדידתן מקבל הרחבה משמעותית. הלמידה יוצאת מהיכרות " +
      "אינטואיטיבית עם מושגי המאונכות וההקבלה, ועוברת לחקירה מעמיקה של סוגי זוויות, " +
      "אומדן מדויק, חוצי זווית וקשרים בין זוויות — צמודות, קודקודיות וסכומי זוויות " +
      "במשולשים ובמרובעים.",
    tint: "teal",
  },
];

// עמוד 2 — הכותרת "למה ללמוד להבנה?" עברה לכותרת המשנה שבראש העמוד,
// ולכן הבלוק נשאר בלי כותרת פנימית (למניעת כפילות).
const PART2: Block[] = [
  {
    body:
      "התוכנית שמה דגש על פיתוח מיומנויות מתמטיות ולא רק על שינון נוסחאות. למידה " +
      "להבנה, המשלבת כלים חווייתיים כמו קיפולי נייר וגזירה, מאפשרת לתלמידים להפנים " +
      "את התכונות הגאומטריות באמת. המטרה היא להעניק לתלמידים כלים שישרתו אותם כבוגרים " +
      "בחיי היומיום ובהמשך לימודיהם, ולהכין אותם למעבר הטבעי לחשיבה לוגית והוכחתית.",
    tint: "rose",
  },
];

const TINT: Record<NonNullable<Block["tint"]>, { bar: string; bg: string; border: string }> = {
  gold: { bar: "var(--wsgold)", bg: "#fbf6ea", border: "#ecdcb4" },
  teal: { bar: "var(--wsteal)", bg: "#e9f4f2", border: "#bcdcd7" },
  rose: { bar: "#b0396b", bg: "#fbedf3", border: "#eccbdb" },
};

const headStyle: CSSProperties = {
  margin: "0 0 8px",
  fontFamily: "var(--font-rubik), sans-serif",
  fontWeight: 800,
  fontSize: 21,
  color: "var(--wsink)",
};
const bodyStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-assistant), sans-serif",
  fontWeight: 500,
  fontSize: 18,
  lineHeight: 1.62,
  color: "var(--wsink)",
};
// טיפוגרפיה מוגדלת לעמודי המבוא (mode="spread") — מנצלת את מלוא שטח העמוד
const headStyleLg: CSSProperties = { ...headStyle, fontSize: 27, margin: "0 0 14px" };
const bodyStyleLg: CSSProperties = { ...bodyStyle, fontSize: 22, lineHeight: 1.9 };

// מסגרת משותפת: כותרת ראשית ממורכזת נקייה + כותרת משנה אופציונלית + קו-ראש
// אחיד (ws-headline) + גוף + כותרת-תחתית הקרדיט — באותו מבנה כמו שאר עמודי
// הקריאה של החוברת. לפי דרישת יניב: שתי הכותרות שבראש העמוד — הראשית וכותרת
// המשנה — באותו הגופן ובאותו הגודל בדיוק (שתיהן ws-title).
function SheetFrame({
  title,
  subtitle,
  bodyStyle: bodyBoxStyle,
  children,
}: {
  title: string;
  subtitle?: string;
  bodyStyle?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">{title}</h1>
        {subtitle && <p className="ws-title" style={{ marginTop: 8 }}>{subtitle}</p>}
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body" style={{ justifyContent: "center", gap: 22, ...bodyBoxStyle }}>{children}</div>

      <footer className="ws-foot">
        <p className="ws-credit">
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}

// spread — הבלוק נמתח לחלקו היחסי בגובה העמוד, תוכנו ממורכז אנכית והטיפוגרפיה
// מוגדלת; כך שני עמודי המבוא מנצלים את מלוא שטח ה-A4 בפריסה אוורירית ומאוזנת.
function TintedBlock({ block, mode = "compact" }: { block: Block; mode?: "compact" | "spread" }) {
  const t = TINT[block.tint];
  const spread = mode === "spread";
  return (
    <section
      style={{
        position: "relative",
        background: t.bg,
        border: `1.5px solid ${t.border}`,
        borderRadius: 16,
        padding: spread ? "34px 40px 34px 44px" : "22px 26px 22px 30px",
        ...(spread
          ? { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }
          : null),
      }}
    >
      <span
        aria-hidden="true"
        style={{ position: "absolute", insetInlineStart: 0, top: 16, bottom: 16, width: 5, borderRadius: 999, background: t.bar }}
      />
      {block.head && <h2 style={spread ? headStyleLg : headStyle}>{block.head}</h2>}
      <p style={spread ? bodyStyleLg : bodyStyle}>{block.body}</p>
    </section>
  );
}

export function IntroUnderstandingSheet({ part }: { part: 1 | 2 }) {
  const blocks = part === 1 ? PART1 : PART2;
  const subtitle =
    part === 1 ? "גאומטריה קדם-היסקית: לומדים ומלמדים להבנה" : "למה ללמוד להבנה?";
  return (
    <SheetFrame title="מתוך עדכון ת״ל" subtitle={subtitle} bodyStyle={{ gap: 30 }}>
      {blocks.map((b, idx) => (
        <TintedBlock key={idx} block={b} mode="spread" />
      ))}
    </SheetFrame>
  );
}

// "מה אנחנו מלמדים?" — פסקת הרציונל של תוכנית הלימודים ורשימת הנושאים,
// מילה-במילה מהחומר של יניב (הועבר מהמקטע המתקפל שנמחק מעמוד הבית).
const WHAT_WE_TEACH_LEAD =
  "כהמשך של תוכנית הגאומטריה ביסודי, הוצאו הנושאים הראשונים שהיו בתוכנית הקודמת " +
  "ואשר נלמדו ביסודי. יש להתבסס על כך שהתלמידים מכירים באופן אינטואיטיבי, על סמך " +
  "לימודיהם בבית הספר היסודי, את המאונכות וההקבלה בין קטעים במישור ובמרחב. לעומת " +
  "זאת, נושא הזוויות ומדידתן מקבל הרחבה בתוכנית זו ביחס לקודמתה. בתוך כל אחד " +
  "מהנושאים המופיעים בתוכנית ישנו דגש על פיתוח מיומנויות מתמטיות שתידרשנה בהמשך " +
  "הלמידה. תוכנית הלימודים מדגישה פיתוח מדורג של מיומנויות אשר התלמידים יעזרו בהן " +
  "בהמשך לימודיהם ובחייהם כבוגרים, גם מחוץ לשימושים מתמטיים.";

const WHAT_WE_TEACH_TOPICS = [
  "מדידה של זוויות בעזרת מד זווית",
  "אומדן של זוויות",
  "היכרות עם זוויות בדגש על זוויות שהן כפולות של 30 מעלות או 45 מעלות",
  "היכרות של זווית בת 45 מעלות על גבי מערכת צירים",
  "היכרות של זווית בת 30 מעלות בהקשר של מחציתה של הזווית בת 60 מעלות",
  "זוויות קהות – היכרות מספרית של זוויות קהות במשולשים, כולל מדידתן בעזרת מד זווית",
  "היכרות של זווית בת 135 מעלות על גבי מערכת צירים, לאו דווקא כאשר הקודקוד בראשית הצירים",
  "היכרות של זווית בת 120 מעלות בהקשר של זווית חיצונית למשולש שווה צלעות",
];

// "למה נשתמש בהמחשות?" — שלוש הנקודות והשורה התחתונה, מילה-במילה מהמקטע
// שהוסר מעמוד הבית (WhyModelsSection לשעבר). כל נקודה בבלוק-גוון נמתח
// (mode="spread") — שלושת הבלוקים + תיבת "השורה התחתונה" ממלאים את מלוא ה-A4.
const WHY_MODELS: Block[] = [
  {
    head: "הגבלה של הדו-ממד",
    body:
      "שרטוטים על דף הם ייצוג חלקי שעלול להטעות תלמידים, במיוחד אלו שזקוקים " +
      "לחיזוק היכולת המרחבית.",
    tint: "gold",
  },
  {
    head: "פעולה במקום דמיון",
    body:
      "המחשות מאפשרות לתלמידים לפעול במרחב – לבנות, להזיז ולחוות צורות מכל " +
      "הכיוונים. הן הופכות את הלמידה מפאסיבית לאקטיבית.",
    tint: "teal",
  },
  {
    head: "החיבור המנצח",
    body:
      "שילוב של המחשה מוחשית יחד עם תיווך ושיח מתמטי הוא זה שיוצר את הגשר בין " +
      "האינטואיציה לבין הידע הפורמלי.",
    tint: "rose",
  },
];

export function WhyModelsSheet() {
  return (
    <SheetFrame title="למה נשתמש בהמחשות?" bodyStyle={{ gap: 26 }}>
      {WHY_MODELS.map((b, idx) => (
        <TintedBlock key={idx} block={b} mode="spread" />
      ))}
      {/* השורה התחתונה — תיבת סיכום ממוסגרת, כמו במקור בעמוד הבית */}
      <p
        style={{
          margin: 0,
          padding: "22px 30px",
          borderRadius: 16,
          border: "1.5px solid var(--wsgoldline)",
          background: "#fdfaf1",
          textAlign: "center",
          fontFamily: "var(--font-assistant), sans-serif",
          fontWeight: 500,
          fontSize: 21,
          lineHeight: 1.6,
          color: "var(--wsink)",
        }}
      >
        <strong style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 800 }}>השורה התחתונה:</strong>{" "}
        לא רק מדמיינים גאומטריה – פועלים בתוכה כדי להבין אותה.
      </p>
    </SheetFrame>
  );
}

// עיצוב אחיד עם עמודי "מתוך עדכון ת״ל" (דרישת יניב, 17.7.2026): פסקת הפתיחה
// בבלוק-גוון זהב נמתח, ורשימת הנושאים בתוך בלוק-גוון טורקיז נמתח באותה שפה
// בדיוק — פס-צד, מסגרת ופינות זהים, והשניים יחד ממלאים את מלוא ה-A4.
export function WhatWeTeachSheet() {
  const teal = TINT.teal;
  return (
    <SheetFrame title="מה אנחנו מלמדים?" bodyStyle={{ gap: 26 }}>
      <TintedBlock block={{ body: WHAT_WE_TEACH_LEAD, tint: "gold" }} mode="spread" />
      <section
        style={{
          position: "relative",
          background: teal.bg,
          border: `1.5px solid ${teal.border}`,
          borderRadius: 16,
          padding: "26px 40px 26px 44px",
          flex: 1.4,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span
          aria-hidden="true"
          style={{ position: "absolute", insetInlineStart: 0, top: 16, bottom: 16, width: 5, borderRadius: 999, background: teal.bar }}
        />
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", justifyContent: "space-evenly", flex: 1, gap: 8 }}>
          {WHAT_WE_TEACH_TOPICS.map((topic, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                fontFamily: "var(--font-assistant), sans-serif",
                fontWeight: 500,
                fontSize: 19,
                lineHeight: 1.5,
                color: "var(--wsink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: idx % 2 === 0 ? "var(--wsteal)" : "var(--wsgold)",
                  transform: "translateY(-1px)",
                }}
              />
              <span style={{ direction: "rtl", unicodeBidi: "plaintext" }}>{topic}</span>
            </li>
          ))}
        </ul>
      </section>
    </SheetFrame>
  );
}
