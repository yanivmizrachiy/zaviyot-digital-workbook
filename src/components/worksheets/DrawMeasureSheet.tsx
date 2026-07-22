import type { CSSProperties } from "react";
import { Protractor, Ray, AngleArc } from "@/components/hamchashot/resource-sheets";

// דף עבודה "שרטוט ומדידת זוויות" — פרק ב · מדידה ואומדן (מקור: איילת קריספין,
// Canva DAHC6WmKTrY). עוצב מחדש בשפת העיצוב של החוברת (ws-sheet): כותרת אחת,
// שדות שם/כיתה, ושישה מדי זווית גדולים בתצוגה 2×3 — הראשון דוגמה פתורה (30°)
// והשאר עם ערך-מטרה בגלולה. הזוויות לתרגול לקוחות מרצף ההוראה של פרק ב
// (45° · 60° · 90° · 120° · 135°); הוראת התרגיל — המלל המקורי אחד-לאחד.

const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";

const EXAMPLE_DEG = 30;
const TARGET_DEGS = [45, 60, 90, 120, 135];

// שדה "שם: ___" — תווית + קו מילוי שנמתח עד סוף השורה
function Field({ label }: { label: string }) {
  return (
    <span style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: FONT_A, fontWeight: 700, fontSize: 17, color: "var(--wsink)" }}>{label}</span>
      <span aria-hidden="true" style={{ flex: 1, borderBottom: "1.5px solid var(--wsink)", transform: "translateY(-3px)" }} />
    </span>
  );
}

// תג-פרק "ב" — זהה לעמוד "מדידה ואומדן של זוויות" (אותו פרק בחוברת)
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

const cellStyle: CSSProperties = {
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  border: "1.5px solid var(--wsborder)",
  borderRadius: 14,
  background: "#fff",
  padding: "10px 12px 4px",
};

// גלולת המעלות — ערך-המטרה לציור; מספר+° תמיד LTR מבודד בתוך עמוד RTL
function DegPill({ deg, example }: { deg: number; example?: boolean }) {
  const color = example ? "var(--wsred)" : "var(--wsink)";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 76,
          padding: "3px 18px",
          borderRadius: 999,
          border: `2px solid ${example ? "var(--wsred)" : "var(--wsgold)"}`,
          background: "#fff",
          fontFamily: FONT_R,
          fontWeight: 800,
          fontSize: 19,
          color,
          direction: "ltr",
          unicodeBidi: "isolate",
        }}
      >
        {deg}°
      </span>
      {example ? (
        <span style={{ fontFamily: FONT_A, fontWeight: 700, fontSize: 13.5, color: "var(--wsred)" }}>דוגמה</span>
      ) : null}
    </span>
  );
}

// תא ציור: גלולת מעלות + מד זווית ריק (בתא הדוגמה — הזווית מצוירת באדום)
function DrawCell({ deg, example }: { deg: number; example?: boolean }) {
  const cx = 160;
  const cy = 160;
  const r = 128;
  return (
    <div style={cellStyle}>
      <DegPill deg={deg} example={example} />
      <svg
        viewBox="0 0 320 186"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={example ? `דוגמה — זווית בת ${deg} מעלות מצוירת על מד זווית` : `מד זווית ריק לציור זווית בת ${deg} מעלות`}
        style={{ display: "block", width: "100%", height: "100%", minHeight: 0 }}
      >
        <Protractor cx={cx} cy={cy} r={r} spokes={false} stroke={1} />
        {example ? (
          <g>
            <Ray cx={cx} cy={cy} deg={0} len={r * 1.04} color="var(--wsred)" width={3} arrow />
            <Ray cx={cx} cy={cy} deg={deg} len={r * 1.04} color="var(--wsred)" width={3} arrow />
            <AngleArc cx={cx} cy={cy} r={38} from={0} to={deg} color="var(--wsred)" width={2.2} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}

export function DrawMeasureSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, marginBottom: 14 }}>
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
          פרק ב · מדידה ואומדן של זוויות
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ChapterBadge />
          <h1 className="ws-title" style={{ margin: 0, textAlign: "right" }}>
            שרטוט ומדידת זוויות
          </h1>
        </div>
        <div className="ws-headline" aria-hidden="true" />
        <div style={{ display: "flex", gap: 36, marginTop: 4 }}>
          <Field label="שם:" />
          <Field label="כיתה:" />
        </div>
      </header>

      <div className="ws-body" style={{ gap: 12 }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_A,
            fontWeight: 600,
            fontSize: 17.5,
            lineHeight: 1.5,
            color: "var(--wsink)",
            textAlign: "right",
          }}
        >
          צייר זווית לפי המעלות המוצגות, ולאחר מכן מדוד אותה שוב בעזרת מד זווית כדי להבטיח דיוק!
        </p>
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <DrawCell deg={EXAMPLE_DEG} example />
          {TARGET_DEGS.map((deg) => (
            <DrawCell key={deg} deg={deg} />
          ))}
        </div>
      </div>

      <footer className="ws-foot">
        <p className="ws-credit">
          <strong>יניב רז · מדריך מחוזי חט״ב בעיר ירושלים</strong>
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}
