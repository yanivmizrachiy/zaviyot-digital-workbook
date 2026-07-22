import type { CSSProperties, ReactNode } from "react";

// עמוד "סוגי זוויות" — עמוד A4 חי (React) בשפת העיצוב של החוברת (ws-sheet), במבנה
// עמודי הקריאה האחיד: כותרת ממורכזת נקייה, קו-ראש אחיד (ws-headline) ופוטר קרדיט אחיד.
// מקור התוכן: הפוסטר "סוגי זוויות" של איילת קריספין (Canva DAHC3zPKIH8) — שישה
// סוגי זוויות עם ההגדרה המילולית, מילה-במילה מהמקור. תיקון יחיד לבקשת יניב: שם
// הזווית בת 180° הוא "זווית שטוחה" (במקור-Canva נכתב בטעות "זווית ישרה" — מונח
// השמור לזווית בת 90°). האיורים שורטטו מחדש כ-SVG חד בפלטת האתר (קרן=דיו,
// קשת=טורקיז, קודקוד=זהב) במקום עיצוב הפסים הכהה של הפוסטר — לשמירה על אחידות האתר.

const INK = "var(--wsink)";
const TEAL = "var(--wsteal)";
const GOLD = "var(--wsgold)";
const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";

// נקודה על מעגל: deg נמדד נגד כיוון השעון מציר ה-x החיובי (מסך: y הפוך)
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const f = (v: number) => Math.round(v * 100) / 100;

// קרן עם ראש-חץ מהקודקוד (v) בכיוון deg
function Ray({ v, deg, len }: { v: [number, number]; deg: number; len: number }) {
  const [x2, y2] = pt(v[0], v[1], len, deg);
  const [b1x, b1y] = pt(v[0], v[1], len - 9, deg + 5.4);
  const [b2x, b2y] = pt(v[0], v[1], len - 9, deg - 5.4);
  return (
    <g>
      <line x1={f(v[0])} y1={f(v[1])} x2={f(x2)} y2={f(y2)} stroke={INK} strokeWidth={3.1} strokeLinecap="round" />
      <polygon points={`${f(x2)},${f(y2)} ${f(b1x)},${f(b1y)} ${f(b2x)},${f(b2y)}`} fill={INK} stroke="none" />
    </g>
  );
}

// קשת סימון הזווית — מ-from ל-to בזוויות עולות (sweep=0 = נגד כיוון השעון במסך)
function Arc({ v, r, from, to }: { v: [number, number]; r: number; from: number; to: number }) {
  const [x1, y1] = pt(v[0], v[1], r, from);
  const [x2, y2] = pt(v[0], v[1], r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return (
    <path
      d={`M ${f(x1)} ${f(y1)} A ${r} ${r} 0 ${large} 0 ${f(x2)} ${f(y2)}`}
      stroke={TEAL}
      strokeWidth={2.4}
      fill="none"
    />
  );
}

function Vertex({ v }: { v: [number, number] }) {
  return <circle cx={f(v[0])} cy={f(v[1])} r={3.4} fill={GOLD} stroke="none" />;
}

type AngleKind = "acute" | "right" | "obtuse" | "straight" | "reflex" | "full";

// איור מוקטן לכל סוג זווית — viewBox אחיד 132×104, הקודקוד ממוקם פרטנית לכל סוג
function AngleFigure({ kind }: { kind: AngleKind }) {
  let body: ReactNode = null;

  if (kind === "acute") {
    const v: [number, number] = [34, 80];
    body = (
      <>
        <Ray v={v} deg={0} len={78} />
        <Ray v={v} deg={46} len={78} />
        <Arc v={v} r={20} from={0} to={46} />
        <Vertex v={v} />
      </>
    );
  } else if (kind === "right") {
    const v: [number, number] = [40, 82];
    const c = 15;
    const a = pt(v[0], v[1], c, 0);
    const b = pt(v[0], v[1], c, 90);
    const corner: [number, number] = [v[0] + c, v[1] - c];
    body = (
      <>
        <Ray v={v} deg={0} len={74} />
        <Ray v={v} deg={90} len={74} />
        <polyline
          points={`${f(a[0])},${f(a[1])} ${f(corner[0])},${f(corner[1])} ${f(b[0])},${f(b[1])}`}
          fill="none"
          stroke={TEAL}
          strokeWidth={2.4}
        />
        <Vertex v={v} />
      </>
    );
  } else if (kind === "obtuse") {
    const v: [number, number] = [52, 82];
    body = (
      <>
        <Ray v={v} deg={0} len={72} />
        <Ray v={v} deg={130} len={72} />
        <Arc v={v} r={22} from={0} to={130} />
        <Vertex v={v} />
      </>
    );
  } else if (kind === "straight") {
    const v: [number, number] = [66, 60];
    body = (
      <>
        <Ray v={v} deg={0} len={60} />
        <Ray v={v} deg={180} len={60} />
        <Arc v={v} r={22} from={0} to={180} />
        <Vertex v={v} />
      </>
    );
  } else if (kind === "reflex") {
    const v: [number, number] = [56, 66];
    body = (
      <>
        <Ray v={v} deg={0} len={64} />
        <Ray v={v} deg={232} len={64} />
        <Arc v={v} r={22} from={0} to={232} />
        <Vertex v={v} />
      </>
    );
  } else {
    // full — קרן אחת + מעגל שלם סביב הקודקוד
    const v: [number, number] = [60, 56];
    body = (
      <>
        <circle cx={f(v[0])} cy={f(v[1])} r={22} stroke={TEAL} strokeWidth={2.4} fill="none" />
        <Ray v={v} deg={0} len={64} />
        <Vertex v={v} />
      </>
    );
  }

  return (
    <svg viewBox="0 0 132 104" width={132} height={104} fill="none" role="img" aria-hidden="true">
      {body}
    </svg>
  );
}

// בידוד מספרים ל-LTR בתוך משפט עברי (RTL) — כדי ש-"מ-90" / "180" יישארו תקינים
function withNums(text: string): ReactNode[] {
  return text.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={i} style={{ direction: "ltr", unicodeBidi: "isolate" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ששת סוגי הזוויות — הניסוח מהפוסטר "סוגי זוויות" (איילת קריספין); שם הזווית
// בת 180° תוקן ל"זווית שטוחה" (ראו הערת-הראש)
const TYPES: { kind: AngleKind; title: string; def: string }[] = [
  { kind: "acute", title: "זווית חדה", def: "זוויות קטנות מ-90 מעלות" },
  { kind: "right", title: "זווית ישרה", def: "זוויות של 90 מעלות בדיוק" },
  { kind: "obtuse", title: "זווית קהה", def: "זוויות גדולות מ-90 מעלות וקטנות מ-180 מעלות" },
  { kind: "straight", title: "זווית שטוחה", def: "זוויות של 180 מעלות בדיוק" },
  { kind: "reflex", title: "זווית נישאה", def: "זוויות גדולות מ-180 מעלות וקטנות מ-360 מעלות" },
  { kind: "full", title: "זווית מלאה", def: "זוויות של 360 מעלות בדיוק" },
];

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  padding: "10px 22px",
  borderRadius: 16,
  border: "1.5px solid var(--wsborder)",
  background: "#fff",
};
const figWrap: CSSProperties = {
  flex: "none",
  width: 132,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingInlineEnd: 6,
  borderInlineEnd: "1.5px solid var(--wsgoldline)",
};
const textWrap: CSSProperties = { flex: 1, textAlign: "right" };
const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: FONT_R,
  fontWeight: 800,
  fontSize: 22,
  color: "var(--wsink)",
  lineHeight: 1.2,
};
const defStyle: CSSProperties = {
  margin: "5px 0 0",
  fontFamily: FONT_A,
  fontWeight: 500,
  fontSize: 16,
  color: "var(--wssoft)",
  lineHeight: 1.4,
};

export function AnglesTypesSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">סוגי זוויות</h1>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body">
        {/* הרשימה נמתחת לכל גובה גוף הדף (space-between) — ניצול מלא של A4, בלי חלל ריק */}
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {TYPES.map((t, idx) => (
            <li key={idx} style={rowStyle}>
              <span style={figWrap}>
                <AngleFigure kind={t.kind} />
              </span>
              <span style={textWrap}>
                <p style={titleStyle}>{t.title}</p>
                <p style={defStyle}>{withNums(t.def)}</p>
              </span>
            </li>
          ))}
        </ol>
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
