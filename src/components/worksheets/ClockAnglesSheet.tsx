import type { CSSProperties } from "react";

// דף עבודה "מה גודל הזווית בין מחוגי השעון" — עותק נאמן של דף העבודה שמסר יניב
// (קנבה, שעונים סגולים), מעוצב מחדש בשפת החוברת (ws-sheet): שורת שֵׁם, כותרת
// ממורכזת עם קו-הראש האחיד, הוראה, ורשת 3×2 שעונים עם תיבת תשובה מתחת לכל שעון.
// המלל מילה-במילה מהמקור. זוויות המחוגים נמדדו מהמקור גיאומטרית (חיתוך והגדלה
// של כל שעון) ועוגלו לכפולות 5° ידידותיות למד-זווית:
//   שורה 1 (משמאל לימין): 12&3 = 90° ישרה · 12&~1:20 = 40° חדה · 6&~7:30 = 45° חדה
//   שורה 2: 12&~7 = 145° קהה · 12&10 = 60° חדה · 9&~7:30 = 45° חדה
// הקודקוד תמיד במרכז השעון, כמו במקור. צבעוניות: טבעת ומחוגים בדיו, ספרות
// רכות, קודקוד זהב — פלטת החוברת במקום הסגול של המקור.

const FONT_A = "var(--font-assistant), sans-serif";
const FONT_R = "var(--font-rubik), sans-serif";

// נקודה על מעגל לפי זווית שעון: deg נמדד עם כיוון השעון מ-12 (מסך: y כלפי מטה)
function pt(cx: number, cy: number, r: number, clockDeg: number): [number, number] {
  const a = ((clockDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
const f = (v: number) => Math.round(v * 100) / 100;

// שעון בודד: טבעת, ספרות 1–12, שני מחוגים מהמרכז (בזוויות-שעון נתונות) וקודקוד
function ClockFigure({ hands }: { hands: [number, number] }) {
  const C = 70; // מרכז ב-viewBox ‏140×140
  const numbers = [];
  for (let h = 1; h <= 12; h++) {
    const [x, y] = pt(C, C, 54, h * 30);
    numbers.push(
      <text
        key={h}
        x={f(x)}
        y={f(y)}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={FONT_R}
        fontSize={10.5}
        fontWeight={600}
        fill="var(--wssoft)"
      >
        {h}
      </text>
    );
  }
  return (
    <svg viewBox="0 0 140 140" width="100%" height="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
      <circle cx={C} cy={C} r={65} fill="#fff" stroke="var(--wsink)" strokeWidth={3.2} />
      {numbers}
      {hands.map((deg, i) => {
        const [x, y] = pt(C, C, 42, deg);
        return <line key={i} x1={C} y1={C} x2={f(x)} y2={f(y)} stroke="var(--wsink)" strokeWidth={3.4} strokeLinecap="round" />;
      })}
      <circle cx={C} cy={C} r={3.6} fill="var(--wsgold)" />
    </svg>
  );
}

// ששת השעונים — כסדר הרשת במקור (משמאל לימין בכל שורה); זוויות בכיוון השעון מ-12
const CLOCKS: [number, number][] = [
  [0, 90], // ישרה 90°
  [0, 40], // חדה 40°
  [180, 225], // חדה 45°
  [0, 215], // קהה 145°
  [0, 300], // חדה 60°
  [270, 225], // חדה 45°
];

const cellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  minHeight: 0,
};
const ansBox: CSSProperties = {
  width: "78%",
  height: 32,
  borderRadius: 9,
  border: "1.5px solid var(--wsgoldline)",
  background: "#fff",
};

export function ClockAnglesSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center" style={{ marginBottom: 14 }}>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            fontFamily: FONT_A,
            fontWeight: 600,
            fontSize: 17,
            color: "var(--wsink)",
          }}
        >
          <span>שֵׁם:</span>
          <span style={{ width: 220, borderBottom: "1.6px solid var(--wsink)" }} aria-hidden="true" />
        </div>
        <h1 className="ws-title">מה גודל הזווית בין מחוגי השעון</h1>
        <p className="ws-subtitle">ליד כל שעון כתבו את סוג הזווית שנוצרה בין מחוגי השעון ומדדו את גודלה.</p>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body">
        <div
          dir="ltr"
          style={{
            flex: "1 1 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "1fr",
            gap: "18px 22px",
            alignContent: "space-between",
            minHeight: 0,
          }}
        >
          {CLOCKS.map((hands, i) => (
            <div key={i} style={cellStyle}>
              <div style={{ flex: "1 1 auto", minHeight: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClockFigure hands={hands} />
              </div>
              <div style={ansBox} />
            </div>
          ))}
        </div>
      </div>

      <footer className="ws-foot" style={{ marginTop: 16 }}>
        <p className="ws-credit">
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}
