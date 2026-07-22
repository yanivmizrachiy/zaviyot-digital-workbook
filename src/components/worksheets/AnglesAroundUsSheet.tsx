import type { CSSProperties, ReactNode } from "react";

// עמוד "סוגי זוויות" — דף מיון זוויות מהעולם שסביבנו (פרק "סוגי זוויות ומדידתן").
// עוצב מחדש מההתחלה 1:1 לפי דף העבודה של איילת קריספין בקנבה (DAHPdFDhokk,
// "עותק של זוויות סביבנו — A4"): שורת שֵׁם למילוי, כותרת ממורכזת, הוראה, ורשת
// 3×3 — בכל תא סצנה מהמציאות שעליה זווית מסומנת בצהוב (שתי קרניים עם ראשי-חץ
// ונקודת קודקוד, בלי קשת — בדיוק כבמקור), ומתחתיה תיבת תשובה.
// תמונות הסטוק של קנבה אינן ניתנות לשימוש, לכן כל סצנה שורטטה כאיור צבעוני מלא
// המשחזר את התמונה המקורית — אותה סצנה, אותו מיקום קודקוד ואותו סוג זווית.
// המלל מילה-במילה מהמקור; רק "או ישרה" הכפול בהוראה תוקן ל"או שטוחה" (המונח
// ל-180°, ההכרעה שאושרה כבר בעמוד "סוגי זוויות" — בחוברת יש זווית שטוחה: הקרש).
//
// מפתח התשובות (לפי סדר הרשת במקור, משמאל לימין בכל שורה):
//   1 מתעמל (פיסוק רגליים)=חדה · 2 עץ (גזע וענף)=חדה · 3 רמפת סקייטבורד=קהה
//   4 גג רעפים (קודקוד)=חדה · 5 קרש עץ=שטוחה · 6 טורבינת רוח=ישרה
//   7 מגדל פיזה (נטוי)=חדה · 8 בית מודרני (פינת גג-קיר)=ישרה · 9 מדרגות ומעקה=קהה

const FONT_A = "var(--font-assistant), sans-serif";

// צהוב הסימון — כמו בעיצוב המקורי בקנבה, עם הילה כהה עדינה לניגודיות על כל רקע
const YEL = "#ffd84d";
const HALO = "rgba(17, 32, 60, 0.28)";

function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const f = (v: number) => Math.round(v * 100) / 100;

// קרן זווית: קו צהוב עבה עם ראש-חץ בקצה ונקודת קודקוד — נאמן לסימון בקנבה
function Ray({ v, deg, len }: { v: [number, number]; deg: number; len: number }) {
  const [x2, y2] = pt(v[0], v[1], len, deg);
  const [tx, ty] = pt(v[0], v[1], len + 4, deg);
  const [b1x, b1y] = pt(v[0], v[1], len - 6, deg + 7);
  const [b2x, b2y] = pt(v[0], v[1], len - 6, deg - 7);
  return (
    <g>
      <line x1={f(v[0])} y1={f(v[1])} x2={f(x2)} y2={f(y2)} stroke={HALO} strokeWidth={6.4} strokeLinecap="round" />
      <line x1={f(v[0])} y1={f(v[1])} x2={f(x2)} y2={f(y2)} stroke={YEL} strokeWidth={3.8} strokeLinecap="round" />
      <polygon
        points={`${f(tx)},${f(ty)} ${f(b1x)},${f(b1y)} ${f(b2x)},${f(b2y)}`}
        fill={YEL}
        stroke={HALO}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Vertex({ v }: { v: [number, number] }) {
  return <circle cx={f(v[0])} cy={f(v[1])} r={4.6} fill={YEL} stroke={HALO} strokeWidth={1.4} />;
}

// עטיפת סצנה אחידה: ריבוע 120×120 שממלא את התא עד הקצה — כמו תמונה במקור
function Fig({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

// ── תשע הסצנות, כסדר הרשת במקור. בכל אחת: רקע → אובייקט → סימון הזווית ──

// 1) מתעמל בעמידת ידיים בחדר משחקים — פיסוק הרגליים יוצר זווית חדה (56°)
function FigGymnast() {
  const v: [number, number] = [60, 60];
  return (
    <Fig>
      <rect width={120} height={120} fill="#fdeedd" />
      <rect y={88} width={120} height={32} fill="#ecd2ae" />
      <line x1={0} y1={88} x2={120} y2={88} stroke="#dcbf97" strokeWidth={2} />
      <rect x={78} y={14} width={28} height={32} rx={3} fill="#cbe7f7" stroke="#e0c9a4" strokeWidth={3} />
      <line x1={92} y1={16} x2={92} y2={44} stroke="#e0c9a4" strokeWidth={2} />
      <line x1={80} y1={30} x2={104} y2={30} stroke="#e0c9a4" strokeWidth={2} />
      <rect x={8} y={32} width={26} height={3.5} rx={1.5} fill="#d9b98c" />
      <circle cx={14} cy={28} r={3.5} fill="#e58f8f" />
      <circle cx={23} cy={28} r={3.5} fill="#7fb0d9" />
      <rect x={28} y={24} width={5} height={7} rx={1} fill="#8fbf8a" />
      <ellipse cx={60} cy={103} rx={37} ry={9.5} fill="#f2b3a1" />
      <ellipse cx={60} cy={103} rx={26} ry={6.5} fill="#f6c9bb" />
      {/* הילד: ידיים על השטיח, ראש למטה, גו כלפי מעלה — הרגליים לאורך קרני הזווית */}
      <line x1={47} y1={100} x2={55} y2={83} stroke="#f0b98d" strokeWidth={4} strokeLinecap="round" />
      <line x1={73} y1={100} x2={65} y2={83} stroke="#f0b98d" strokeWidth={4} strokeLinecap="round" />
      <circle cx={60} cy={91} r={7} fill="#f7cfa8" />
      {/* ראש הפוך — השיער "נשפך" כלפי מטה: כיפה ממלאת את חצי הראש התחתון */}
      <path d="M53.2 93.5 A7 7 0 0 0 66.8 93.5 Q60 99.5 53.2 93.5 Z" fill="#7a5236" />
      <line x1={60} y1={84} x2={60} y2={60} stroke="#5a8fc4" strokeWidth={8} strokeLinecap="round" />
      <line x1={60} y1={60} x2={f(pt(60, 60, 27, 62)[0])} y2={f(pt(60, 60, 27, 62)[1])} stroke="#d95f76" strokeWidth={6} strokeLinecap="round" />
      <line x1={60} y1={60} x2={f(pt(60, 60, 27, 118)[0])} y2={f(pt(60, 60, 27, 118)[1])} stroke="#d95f76" strokeWidth={6} strokeLinecap="round" />
      <circle cx={f(pt(60, 60, 30, 62)[0])} cy={f(pt(60, 60, 30, 62)[1])} r={3.2} fill="#b8455c" />
      <circle cx={f(pt(60, 60, 30, 118)[0])} cy={f(pt(60, 60, 30, 118)[1])} r={3.2} fill="#b8455c" />
      <Ray v={v} deg={62} len={44} />
      <Ray v={v} deg={118} len={44} />
      <Vertex v={v} />
    </Fig>
  );
}

// 2) עץ בשלכת — הזווית בין הגזע לענף היוצא ממנו: חדה (64°)
function FigTree() {
  const v: [number, number] = [70, 76];
  return (
    <Fig>
      <rect width={120} height={120} fill="#cfe9fa" />
      <rect y={98} width={120} height={22} fill="#d9c7a0" />
      <path d="M74 104 L70 76 L67 30" fill="none" stroke="#7d5b40" strokeWidth={7} strokeLinecap="round" />
      <line x1={70} y1={76} x2={24} y2={57} stroke="#7d5b40" strokeWidth={4} strokeLinecap="round" />
      <line x1={68} y1={46} x2={95} y2={22} stroke="#7d5b40" strokeWidth={3} strokeLinecap="round" />
      <line x1={67} y1={34} x2={46} y2={14} stroke="#7d5b40" strokeWidth={2.6} strokeLinecap="round" />
      <line x1={40} y1={64} x2={28} y2={50} stroke="#7d5b40" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={52} y1={68} x2={46} y2={56} stroke="#7d5b40" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={84} y1={32} x2={94} y2={36} stroke="#7d5b40" strokeWidth={1.6} strokeLinecap="round" />
      <line x1={57} y1={24} x2={50} y2={28} stroke="#7d5b40" strokeWidth={1.6} strokeLinecap="round" />
      <Ray v={v} deg={94} len={50} />
      <Ray v={v} deg={158} len={50} />
      <Vertex v={v} />
    </Fig>
  );
}

// 3) רמפת סקייטבורד על רקע הים — בין שיפוע הרמפה לקרקע: זווית קהה (148°)
function FigRamp() {
  const v: [number, number] = [58, 88];
  return (
    <Fig>
      <rect width={120} height={120} fill="#c4e2f4" />
      <rect y={58} width={120} height={12} fill="#8ec3de" />
      <rect y={70} width={120} height={50} fill="#ddd8cd" />
      <rect y={92} width={120} height={28} fill="#cfc9bc" />
      <path d="M97 70 Q99 54 106 44" fill="none" stroke="#96714e" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M106 44 q-10 -4 -16 2 M106 44 q-2 -10 -10 -12 M106 44 q6 -8 14 -6 M106 44 q10 0 13 8" fill="none" stroke="#4f9c63" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M113 70 Q114 60 118 54" fill="none" stroke="#96714e" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M118 54 q-7 -3 -11 1 M118 54 q0 -7 -6 -9 M118 54 q6 -5 10 -3" fill="none" stroke="#4f9c63" strokeWidth={2} strokeLinecap="round" />
      <path d="M4 34 Q12 80 58 88 L4 88 Z" fill="#d3a06b" stroke="#b07f4e" strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={0} y={28} width={9} height={7} rx={2} fill="#b07f4e" />
      <Ray v={v} deg={0} len={52} />
      <Ray v={v} deg={148} len={56} />
      <Vertex v={v} />
    </Fig>
  );
}

// 4) גג רעפים מחודד — הזווית בקודקוד הגג: חדה (78°)
function FigRoof() {
  const v: [number, number] = [60, 22];
  return (
    <Fig>
      <rect width={120} height={120} fill="#d2eafb" />
      <rect y={104} width={120} height={16} fill="#b9d29a" />
      <rect x={30} y={62} width={60} height={42} fill="#f0e7d3" stroke="#d8cbb0" strokeWidth={2} />
      <rect x={74} y={30} width={9} height={16} fill="#9a6a4f" />
      <path d="M26 64 L60 22 L94 64 Z" fill="#c96f4a" stroke="#a85538" strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M43.5 43 L76.5 43 M35 53.5 L85 53.5" fill="none" stroke="#a85538" strokeWidth={1.4} />
      <rect x={37} y={71} width={14} height={14} fill="#bfe3f7" stroke="#d8cbb0" strokeWidth={2} />
      <line x1={44} y1={71} x2={44} y2={85} stroke="#d8cbb0" strokeWidth={1.6} />
      <rect x={69} y={71} width={14} height={14} fill="#bfe3f7" stroke="#d8cbb0" strokeWidth={2} />
      <line x1={76} y1={71} x2={76} y2={85} stroke="#d8cbb0" strokeWidth={1.6} />
      <rect x={54} y={80} width={12} height={24} fill="#a87b53" />
      <Ray v={v} deg={231} len={60} />
      <Ray v={v} deg={309} len={60} />
      <Vertex v={v} />
    </Fig>
  );
}

// 5) קורת עץ — הזווית על שפת הקורה הישרה: שטוחה (180°)
function FigPlank() {
  const v: [number, number] = [60, 60];
  return (
    <Fig>
      <rect width={120} height={120} fill="#f2e4cb" />
      <line x1={30} y1={0} x2={30} y2={120} stroke="#e0cfae" strokeWidth={2} />
      <line x1={60} y1={0} x2={60} y2={120} stroke="#e0cfae" strokeWidth={2} />
      <line x1={90} y1={0} x2={90} y2={120} stroke="#e0cfae" strokeWidth={2} />
      <path d="M8 22 q10 3 20 0 M70 30 q12 -3 24 0 M14 96 q12 3 22 0 M76 104 q12 -3 22 0" fill="none" stroke="#e6d5b5" strokeWidth={1.8} strokeLinecap="round" />
      <rect x={0} y={50} width={120} height={20} fill="#6f4c33" />
      <line x1={0} y1={51.5} x2={120} y2={51.5} stroke="#8a6547" strokeWidth={1.6} />
      <path d="M6 57 q18 2.5 36 0 t36 0 t36 0 M2 64 q16 -2.5 34 0 t36 0 t40 0" fill="none" stroke="#5a3c28" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={9} cy={60} r={1.9} fill="#3f2a1c" />
      <circle cx={111} cy={60} r={1.9} fill="#3f2a1c" />
      <Ray v={v} deg={0} len={52} />
      <Ray v={v} deg={180} len={52} />
      <Vertex v={v} />
    </Fig>
  );
}

// 6) טורבינת רוח בשדה — בין העמוד האנכי לקרקע: זווית ישרה (90°)
function FigTurbine() {
  const hub: [number, number] = [46, 34];
  const v: [number, number] = [46, 90];
  const blade = (deg: number) => {
    const [x2, y2] = pt(hub[0], hub[1], 24, deg);
    return (
      <g key={deg}>
        <line x1={hub[0]} y1={hub[1]} x2={f(x2)} y2={f(y2)} stroke="#b9c7d1" strokeWidth={5.6} strokeLinecap="round" />
        <line x1={hub[0]} y1={hub[1]} x2={f(x2)} y2={f(y2)} stroke="#eef3f6" strokeWidth={3.4} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <Fig>
      <rect width={120} height={120} fill="#c9e6f8" />
      <ellipse cx={92} cy={20} rx={13} ry={4.5} fill="#ffffff" opacity={0.85} />
      <ellipse cx={18} cy={44} rx={10} ry={3.5} fill="#ffffff" opacity={0.75} />
      <rect y={86} width={120} height={34} fill="#93c06d" />
      <rect y={86} width={120} height={5} fill="#7fae5c" />
      <g stroke="#a9bcc9" strokeWidth={1.6} strokeLinecap="round">
        <line x1={17} y1={84} x2={17} y2={72} />
        <line x1={17} y1={72} x2={12} y2={68} />
        <line x1={17} y1={72} x2={22} y2={68} />
        <line x1={17} y1={72} x2={17} y2={65} />
        <line x1={103} y1={84} x2={103} y2={74} />
        <line x1={103} y1={74} x2={99} y2={71} />
        <line x1={103} y1={74} x2={107} y2={71} />
        <line x1={103} y1={74} x2={103} y2={68} />
      </g>
      <line x1={46} y1={90} x2={46} y2={34} stroke="#b9c7d1" strokeWidth={6.4} strokeLinecap="round" />
      <line x1={46} y1={90} x2={46} y2={34} stroke="#eef3f6" strokeWidth={4.2} strokeLinecap="round" />
      {blade(90)}
      {blade(210)}
      {blade(330)}
      <circle cx={hub[0]} cy={hub[1]} r={3.6} fill="#dfe7ec" stroke="#b9c7d1" strokeWidth={1.6} />
      <Ray v={v} deg={90} len={50} />
      <Ray v={v} deg={0} len={58} />
      <Vertex v={v} />
    </Fig>
  );
}

// 7) מגדל פיזה הנטוי — בין המגדל לקרקע (בצד הנטייה): זווית חדה (81°)
function FigPisa() {
  const v: [number, number] = [67, 88];
  // חמש קומות-טבעות בין בסיס (58–76, y=88) לראש (49–64, y=26)
  const ring = (t: number) => {
    const y = 88 - 62 * t;
    const xl = 58 - 9 * t;
    const xr = 76 - 12 * t;
    // קו מקווקו — מרמז על שדרת הקשתות (הארקדות) של קומות המגדל, בלי מראה "סולם"
    return <line key={t} x1={f(xl)} y1={f(y)} x2={f(xr)} y2={f(y)} stroke="#cfbd97" strokeWidth={2.2} strokeDasharray="2.2 2" />;
  };
  return (
    <Fig>
      <rect width={120} height={120} fill="#ead9c4" />
      <circle cx={20} cy={20} r={11} fill="#f7e6c0" />
      <rect y={84} width={120} height={36} fill="#8dbd6d" />
      <circle cx={20} cy={83} r={4.5} fill="#6ea254" />
      <circle cx={30} cy={84} r={3.5} fill="#6ea254" />
      <circle cx={104} cy={83} r={4} fill="#6ea254" />
      <path d="M58 88 L76 88 L64 26 L49 26 Z" fill="#f4ecdb" stroke="#cfbd97" strokeWidth={2} strokeLinejoin="round" />
      {[1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6].map(ring)}
      <path d="M50 26 L63 26 L61 19 L52 19 Z" fill="#f4ecdb" stroke="#cfbd97" strokeWidth={1.8} strokeLinejoin="round" />
      <Ray v={v} deg={180} len={48} />
      <Ray v={v} deg={99} len={62} />
      <Vertex v={v} />
    </Fig>
  );
}

// 8) בית מודרני בשעת ערב — פינת הגג השטוח והקיר: זווית ישרה (90°)
function FigModernHouse() {
  const v: [number, number] = [92, 36];
  return (
    <Fig>
      <rect width={120} height={120} fill="#cbb8dc" />
      <rect y={70} width={120} height={28} fill="#dcc3ce" />
      <rect y={98} width={120} height={22} fill="#7c6f92" />
      <rect x={24} y={66} width={68} height={32} fill="#5f5678" stroke="#4a4363" strokeWidth={2} />
      <rect x={36} y={36} width={56} height={30} fill="#6c628a" stroke="#4a4363" strokeWidth={2} />
      <line x1={33} y1={36} x2={95} y2={36} stroke="#4a4363" strokeWidth={3} strokeLinecap="round" />
      <rect x={42} y={42} width={16} height={18} fill="#ffd9a0" stroke="#4a4363" strokeWidth={1.8} />
      <rect x={64} y={42} width={16} height={18} fill="#ffd9a0" stroke="#4a4363" strokeWidth={1.8} />
      <rect x={30} y={72} width={14} height={20} fill="#f7c97e" stroke="#4a4363" strokeWidth={1.8} />
      <rect x={50} y={72} width={26} height={20} fill="#f7c97e" stroke="#4a4363" strokeWidth={1.8} />
      <line x1={63} y1={72} x2={63} y2={92} stroke="#4a4363" strokeWidth={1.6} />
      <rect x={82} y={76} width={8} height={22} fill="#3f3855" />
      <Ray v={v} deg={180} len={58} />
      <Ray v={v} deg={270} len={48} />
      <Vertex v={v} />
    </Fig>
  );
}

// 9) גרם מדרגות ומעקה — בין הרצפה למעקה העולה: זווית קהה (142°)
function FigStairs() {
  const v: [number, number] = [36, 88];
  return (
    <Fig>
      <rect width={120} height={120} fill="#f6efe3" />
      <rect y={92} width={120} height={28} fill="#e5d5bc" />
      <line x1={0} y1={92} x2={120} y2={92} stroke="#d3c3a4" strokeWidth={2} />
      <path
        d="M44 92 L44 81 L58 81 L58 70 L72 70 L72 59 L86 59 L86 48 L100 48 L100 37 L114 37 L114 92 Z"
        fill="#efe4cf"
        stroke="#d3c3a4"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <g stroke="#a9825f" strokeWidth={2.4} strokeLinecap="round">
        <line x1={52} y1={74} x2={52} y2={81} />
        <line x1={70} y1={60} x2={70} y2={70} />
        <line x1={88} y1={46} x2={88} y2={59} />
      </g>
      <line x1={30} y1={91} x2={102} y2={35} stroke="#8a6547" strokeWidth={4.4} strokeLinecap="round" />
      <Ray v={v} deg={180} len={30} />
      <Ray v={v} deg={38} len={62} />
      <Vertex v={v} />
    </Fig>
  );
}

// סדר הרשת — אחד-לאחד כמו בעיצוב המקורי (משמאל לימין, שורה אחר שורה)
const FIGS: (() => ReactNode)[] = [
  FigGymnast,
  FigTree,
  FigRamp,
  FigRoof,
  FigPlank,
  FigTurbine,
  FigPisa,
  FigModernHouse,
  FigStairs,
];

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const figFrame: CSSProperties = {
  aspectRatio: "1 / 1", // תמונות ריבועיות — כמו במקור
  borderRadius: 12,
  border: "1.5px solid var(--wsborder)",
  overflow: "hidden",
  background: "#fff",
};
const ansBox: CSSProperties = {
  height: 30,
  borderRadius: 8,
  border: "1.5px solid var(--wsgold)",
  background: "#fff",
};

export function AnglesAroundUsSheet() {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
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
        <div style={{ textAlign: "center" }}>
          <h1 className="ws-title" style={{ margin: 0 }}>
            סוגי זוויות
          </h1>
          <p className="ws-subtitle" style={{ margin: "6px 0 0" }}>
            רשמו האם הזווית המוצגת היא חדה, ישרה, קהה או שטוחה.
          </p>
          <div className="ws-headline" style={{ marginTop: 8 }} aria-hidden="true" />
        </div>
      </header>

      <div className="ws-body">
        <div
          className="ws-aru-grid"
          dir="ltr"
          style={{
            flex: "1 1 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "1fr",
            gap: 14,
            alignContent: "space-between",
          }}
        >
          {FIGS.map((Figure, i) => (
            <div key={i} style={cardStyle}>
              <div style={figFrame}>
                <Figure />
              </div>
              <div style={ansBox} />
            </div>
          ))}
        </div>
      </div>

      <footer className="ws-foot" style={{ marginTop: 14 }}>
        <p className="ws-credit">
          <strong>יניב רז · מדריך מחוזי חט״ב בעיר ירושלים</strong>
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}
