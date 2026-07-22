import type { CSSProperties, ReactNode } from "react";

// עמוד "מדידה ואומדן של זוויות" — פרק ב' · הרצף הדידקטי. עמוד A4 חי (React) בשפת
// העיצוב של החוברת (ws-sheet). מקור התוכן: הצילום שמסר יניב (חמש נקודות הרצף
// הדידקטי עם תגי-מעלות צבעוניים) — הניסוח נשמר מילה-במילה. שוחזר בשפת האתר:
// גופני Rubik/Assistant, פלטת --ws*, ותגי טבעת בצבעי המותג (זהב/טורקיז/אדום/כחול).

const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";
const GOLD = "var(--wsgold)";
const TEAL = "var(--wsteal)";
const RED = "var(--wsred)";
const BLUE = "var(--wsblue)";
const BRICK = "#9d332e"; // אדום-לבנה כהה (תג 135°) — נאמן לצילום, מתואם ל--wsred

// בידוד מספר/מעלות ל-LTR בתוך משפט עברי (RTL) — "30°"/"45°"/"135°" נשארים תקינים
function withNums(text: string): ReactNode[] {
  return text.split(/(\d+°?)/).map((part, i) =>
    /^\d+°?$/.test(part) ? (
      <span key={i} style={{ direction: "ltr", unicodeBidi: "isolate" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

type Seg = { t: string; b?: boolean };
type Row = { badge: string; color: string; segs: Seg[] };

// חמש נקודות הרצף — הטקסט מילה-במילה מהצילום; הדגשות (b) כפי שבמקור
const ROWS: Row[] = [
  {
    badge: "45°",
    color: GOLD,
    segs: [
      { t: "היכרות עם זוויות בדגש על זוויות שהן " },
      { t: "כפולות של 30° או 45°", b: true },
      { t: ", והיכרות של זווית בת 45° " },
      { t: "על גבי מערכת צירים", b: true },
      { t: "." },
    ],
  },
  {
    badge: "30°",
    color: TEAL,
    segs: [
      { t: "היכרות של זווית בת 30° בהקשר של " },
      { t: "מחציתה של הזווית בת 60°", b: true },
      { t: "." },
    ],
  },
  {
    badge: "קהה",
    color: RED,
    segs: [
      { t: "זוויות קהות", b: true },
      { t: " — היכרות מספרית של זוויות קהות במשולשים, כולל מדידתן בעזרת מד זווית." },
    ],
  },
  {
    badge: "135°",
    color: BRICK,
    segs: [
      { t: "היכרות של זווית בת 135° על גבי מערכת צירים — " },
      { t: "לאו דווקא כאשר הקודקוד בראשית הצירים", b: true },
      { t: "." },
    ],
  },
  {
    badge: "120°",
    color: BLUE,
    segs: [
      { t: "היכרות של זווית בת 120° בהקשר של " },
      { t: "זווית חיצונית למשולש שווה-צלעות", b: true },
      { t: "." },
    ],
  },
];

// תג-טבעת עגול לימין כל שורה — מספר-מעלות (LTR) או תווית עברית ("קהה", RTL)
function RingBadge({ label, color }: { label: string; color: string }) {
  const ltr = /[0-9°]/.test(label);
  return (
    <span
      style={{
        flex: "none",
        width: 66,
        height: 66,
        borderRadius: "50%",
        border: `2.5px solid ${color}`,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_R,
        fontWeight: 800,
        fontSize: 19,
        color,
        direction: ltr ? "ltr" : "rtl",
        unicodeBidi: "isolate",
      }}
    >
      {label}
    </span>
  );
}

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  padding: "6px 4px",
};
const textStyle: CSSProperties = {
  flex: 1,
  textAlign: "right",
  fontFamily: FONT_A,
  fontSize: 17.5,
  lineHeight: 1.5,
  color: "var(--wsink)",
};

// תג-פרק "ב" — ריבוע מעוגל כהה עם אות בהירה (כמו בצילום)
function ChapterBadge() {
  return (
    <span
      style={{
        flex: "none",
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "var(--wsink)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_R,
        fontWeight: 800,
        fontSize: 26,
      }}
    >
      ב
    </span>
  );
}

export function MeasurementEstimationSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, marginBottom: 22 }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_R,
            fontWeight: 700,
            fontSize: 15,
            color: "var(--wsteal)",
            textAlign: "right",
            letterSpacing: 0.2,
          }}
        >
          פרק ב · הרצף הדידקטי
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ChapterBadge />
          <h1 className="ws-title" style={{ margin: 0, textAlign: "right" }}>
            מדידה ואומדן של זוויות
          </h1>
        </div>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body">
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1.5px solid var(--wsborder)",
            borderRadius: 18,
            padding: "18px 26px",
            background: "#fff",
          }}
        >
          {ROWS.map((row, idx) => (
            <div
              key={idx}
              style={{
                ...rowStyle,
                borderTop: idx === 0 ? "none" : "1px solid var(--wsborder)",
                paddingTop: idx === 0 ? 6 : 16,
                paddingBottom: idx === ROWS.length - 1 ? 6 : 16,
              }}
            >
              <span style={textStyle}>
                {row.segs.map((s, i) => (
                  <span key={i} style={{ fontWeight: s.b ? 800 : 500 }}>
                    {withNums(s.t)}
                  </span>
                ))}
              </span>
              <RingBadge label={row.badge} color={row.color} />
            </div>
          ))}
        </div>
      </div>

      <footer className="ws-foot">
        <p className="ws-credit">
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}
