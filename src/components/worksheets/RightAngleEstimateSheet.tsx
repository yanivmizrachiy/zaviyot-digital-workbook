import type { CSSProperties, ReactNode } from "react";

// דף עבודה "זוויות ישרות, חדות וקהות" — אומדן של זווית ביחס לזווית ישרה
// (מקור: איילת קריספין, Canva DAHPnYtSLbE). שוחזר אחד-לאחד מצילום העיצוב:
// כל המלל מילה-במילה, כל האיורים (נייר מקופל + חץ "זווית ישרה", שתי השוואות
// "יותר/פחות מזווית ישרה", ושש זוויות ממוספרות למיון) — בשפת העיצוב של
// החוברת (ws-sheet): קרן=דיו, קשת=טורקיז, קודקוד=זהב, הדגשי-משנה בטורקיז.
// הזוויות המצוירות משחזרות את המקור: 1 חדה · 2 ישרה מוטה · 3 קהה · 4 קהה
// מוטה · 5 חדה צרה · 6 ישרה מוטה מעט — כך שהבדיקה בדף מקופל באמת נדרשת.

const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";
const INK = "var(--wsink)";
const TEAL = "var(--wsteal)";
const GOLD = "var(--wsgold)";

// נקודה על מעגל: deg נגד כיוון השעון מציר ה-x החיובי (מסך: y הפוך)
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const f = (v: number) => Math.round(v * 100) / 100;

// קרן עם ראש-חץ קטן מהקודקוד — שפת האיור של "סוגי זוויות"
function Ray({ v, deg, len }: { v: [number, number]; deg: number; len: number }) {
  const [x2, y2] = pt(v[0], v[1], len, deg);
  const [b1x, b1y] = pt(v[0], v[1], len - 9, deg + 5.4);
  const [b2x, b2y] = pt(v[0], v[1], len - 9, deg - 5.4);
  return (
    <g>
      <line x1={f(v[0])} y1={f(v[1])} x2={f(x2)} y2={f(y2)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M ${f(x2)} ${f(y2)} L ${f(b1x)} ${f(b1y)} M ${f(x2)} ${f(y2)} L ${f(b2x)} ${f(b2y)}`} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

// קשת הזווית בין שתי קרניים
function Arc({ v, from, to, r }: { v: [number, number]; from: number; to: number; r: number }) {
  const [sx, sy] = pt(v[0], v[1], r, from);
  const [ex, ey] = pt(v[0], v[1], r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return <path d={`M ${f(sx)} ${f(sy)} A ${r} ${r} 0 ${large} 0 ${f(ex)} ${f(ey)}`} stroke={TEAL} strokeWidth={2.6} fill="none" strokeLinecap="round" />;
}

// זווית ממוספרת למיון: שתי קרניים + קשת + קודקוד זהב
function AngleFig({ v, a, b, len = 118 }: { v: [number, number]; a: number; b: number; len?: number }) {
  return (
    <g>
      <Ray v={v} deg={a} len={len} />
      <Ray v={v} deg={b} len={len} />
      <Arc v={v} from={Math.min(a, b)} to={Math.max(a, b)} r={30} />
      <circle cx={f(v[0])} cy={f(v[1])} r={4.6} fill={GOLD} />
    </g>
  );
}

// פיסת הנייר המקופלת פעמיים — שני גיליונות חופפים, פינת הזווית הישרה מסומנת.
// הפינות חדות (בלי rx): קודקוד של זווית ישרה חייב להיות חד — פינה מעוגלת
// מציגה קודקוד שגוי גיאומטרית (דרישת יניב, 17.7.2026).
function FoldedPaper() {
  return (
    <svg viewBox="0 0 190 150" width={172} role="img" aria-label="פיסת נייר מקופלת פעמיים — הפינה היא זווית ישרה" style={{ flex: "none" }}>
      {/* הגיליון האחורי — מוטה מעט */}
      <g transform="rotate(-9 95 78)">
        <rect x={40} y={22} width={118} height={92} fill="#fff" stroke={INK} strokeWidth={2.2} strokeLinejoin="miter" opacity={0.55} />
      </g>
      {/* הגיליון הקדמי */}
      <rect x={28} y={40} width={122} height={94} fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="miter" />
      {/* סימון ריבוע הזווית הישרה בפינה השמאלית-תחתונה של הגיליון הקדמי */}
      <path d="M 28 116 h 18 v 18" stroke={TEAL} strokeWidth={2.6} fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// חץ טורקיז מלא המצביע שמאלה — מ"זווית ישרה" אל פינת הנייר (כמו במקור)
function LabelArrow() {
  return (
    <svg viewBox="0 0 84 26" width={72} aria-hidden="true" style={{ flex: "none" }}>
      <line x1={78} y1={13} x2={26} y2={13} stroke={TEAL} strokeWidth={5} strokeLinecap="round" />
      <path d="M 6 13 L 30 3 L 30 23 Z" fill={TEAL} />
    </svg>
  );
}

// איור השוואה: פינת נייר (שתי שפות בדיו + גיליון ברקע) וקרן טורקיז לבדיקה.
// deg > 90 — הקרן נפתחת מעבר לשפת הנייר (קהה); deg < 90 — בתוך הפינה (חדה).
function CompareFig({ deg }: { deg: number }) {
  const v: [number, number] = [54, 118];
  const [rx, ry] = pt(v[0], v[1], 96, deg);
  return (
    <svg viewBox="0 0 190 140" width={168} role="img" aria-label={deg > 90 ? "זווית הגדולה מזווית ישרה" : "זווית הקטנה מזווית ישרה"}>
      {/* גיליון הנייר — הפינה השמאלית-תחתונה שלו היא הזווית הישרה להשוואה;
          פינות חדות (בלי rx) — הקודקוד יושב על פינת הנייר ואסור שתהיה מעוגלת */}
      <rect x={v[0]} y={30} width={112} height={88} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="miter" opacity={0.9} />
      {/* קרן ההשוואה הטורקיזית + הקשת מן השפה התחתונה */}
      <line x1={v[0]} y1={v[1]} x2={f(rx)} y2={f(ry)} stroke={TEAL} strokeWidth={3.4} strokeLinecap="round" />
      <Arc v={v} from={0} to={deg} r={30} />
      <circle cx={v[0]} cy={v[1]} r={4.2} fill={GOLD} />
      {/* השפה התחתונה של הפינה (קרן הבסיס) */}
      <line x1={v[0]} y1={v[1]} x2={v[0] + 126} y2={v[1]} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

// שש הזוויות למיון — כמו במקור: שתי שורות של שלושה, ממוספרות 1–6 משמאל לימין.
// (וקטורים לפי צורתן בעיצוב המקורי: חדה · ישרה מוטה · קהה · קהה מוטה · חדה צרה · ישרה)
// כל הקודקודים והאורכים נבחרו כך ששתי הקרניים וראשי-החץ נכנסים במלואם
// ב-viewBox ‏240×160 (שוליים בטוחים ≥6px) — אין קרן נחתכת.
const SORT_ANGLES: { v: [number, number]; a: number; b: number; len?: number }[] = [
  { v: [40, 138], a: 10, b: 62 }, // 1 — חדה
  { v: [64, 123], a: -15, b: 75, len: 110 }, // 2 — ישרה מוטה
  { v: [74, 126], a: -5, b: 125, len: 112 }, // 3 — קהה
  { v: [150, 134], a: 85, b: 185, len: 112 }, // 4 — קהה מוטה
  { v: [36, 130], a: 3, b: 25 }, // 5 — חדה צרה
  { v: [70, 140], a: 8, b: 98, len: 112 }, // 6 — ישרה
];

const capStrong: CSSProperties = {
  margin: 0,
  fontFamily: FONT_A,
  fontWeight: 700,
  fontSize: 16,
  lineHeight: 1.35,
  color: INK,
  textAlign: "center",
};
const capTeal: CSSProperties = {
  margin: 0,
  fontFamily: FONT_A,
  fontWeight: 600,
  fontSize: 14.5,
  lineHeight: 1.45,
  color: TEAL,
  textAlign: "center",
  maxWidth: 230,
};

export function RightAngleEstimateSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, marginBottom: 10 }}>
        {/* שדה השם — בקצה השמאלי, כמו בעיצוב המקורי */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, width: 250 }}>
            <span style={{ fontFamily: FONT_A, fontWeight: 700, fontSize: 16, color: INK }}>שם:</span>
            <span aria-hidden="true" style={{ flex: 1, borderBottom: "1.5px dotted var(--wssoft)", transform: "translateY(-3px)" }} />
          </span>
        </div>
        <h1 className="ws-title" style={{ margin: 0, textAlign: "center" }}>
          זוויות ישרות, חדות וקהות
        </h1>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body" style={{ gap: 10, minHeight: 0 }}>
        {/* כותרת המשנה — מילה-במילה מהמקור */}
        <p style={{ ...capStrong, fontSize: 17.5, textAlign: "center" }}>
          ניתן לקפל פיסת נייר פעמיים כדי ליצור זווית ישרה
        </p>

        {/* הנייר המקופל + התווית "זווית ישרה" עם חץ המצביע אל הפינה */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontFamily: FONT_A, fontWeight: 700, fontSize: 16.5, color: INK, flex: "none" }}>זווית ישרה</span>
          <LabelArrow />
          <FoldedPaper />
        </div>

        {/* ההסבר הטורקיזי — בקצה השמאלי, כמו במקור */}
        <p style={{ ...capTeal, alignSelf: "flex-end", textAlign: "center", maxWidth: 210 }}>
          ניתן להשתמש בנייר המקופל כדי לבדוק את גודל הזוויות
        </p>

        {/* שתי ההשוואות: יותר מזווית ישרה (מימין) · פחות מזווית ישרה (משמאל) */}
        <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "flex-start", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <CompareFig deg={118} />
            <p style={capStrong}>יותר מזווית ישרה</p>
            <p style={capTeal}>זוויות שהן גדולות מזווית ישרה נקראות זוויות קהות</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <CompareFig deg={52} />
            <p style={capStrong}>פחות מזווית ישרה</p>
            <p style={capTeal}>זוויות הקטנות מזווית ישרה נקראות זוויות חדות.</p>
          </div>
        </div>

        {/* הוראת התרגיל — מילה-במילה מהמקור */}
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: FONT_A,
            fontWeight: 700,
            fontSize: 17,
            lineHeight: 1.5,
            color: INK,
            textAlign: "right",
          }}
        >
          בדקו כל אחת מהזוויות הללו בעזרת דף מקופל וכתבו את סוג הזוויות: זוויות ישרות, זוויות חדות או זוויות קהות
        </p>

        {/* שש הזוויות למיון — רשת 3×2, ממוספרות 1–6 משמאל לימין כמו במקור */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 8,
            direction: "ltr",
          }}
        >
          {SORT_ANGLES.map((ang, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <svg
                viewBox="0 0 240 160"
                role="img"
                aria-label={`זווית מספר ${i + 1} למיון`}
                style={{ display: "block", width: "100%", height: "100%", minHeight: 0 }}
              >
                <AngleFig v={ang.v} a={ang.a} b={ang.b} len={ang.len} />
              </svg>
              <span
                style={{
                  fontFamily: FONT_R,
                  fontWeight: 800,
                  fontSize: 16,
                  color: INK,
                  direction: "ltr",
                  unicodeBidi: "isolate",
                  paddingInlineStart: 14,
                }}
              >
                {i + 1}.
              </span>
            </div>
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
