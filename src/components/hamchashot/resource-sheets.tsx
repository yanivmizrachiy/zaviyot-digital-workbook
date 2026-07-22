// ארגז המשאבים — מדידת זוויות במד זווית (פרק ג בחוברת): 10 עמודי A4, בנייה מחדש
// מדויקת של משאבי ה-Canva של החוברת (מקור: איילת קריספין). דף «שרטוט ומדידת
// זוויות» עבר לחוברת דפי העבודה (DrawMeasureSheet). כל איור מצויר SVG
// בקוד — מדי הזווית, השנתות, הסקאלות והקרניים מחושבים מתמטית (לולאות), והמלל
// הועתק מהמקור אחד-לאחד (אין שינוי מלל). אלמנטים דקורטיביים של המקור הוחלפו
// בשפת העיצוב האחידה של האתר; זוויות הקרניים נמדדו מקובצי המקור (מטריצות סיבוב).
import type { ReactNode } from "react";

const INK = "var(--wsink)";
const GOLD = "var(--wsgold)";
const BLUE = "var(--wsblue)";
const RED = "var(--wsred)";
const TEAL = "var(--wsteal)";
const SOFT = "#98a0ad"; // סקאלה פנימית אפורה
const GRID = "#dfe5ee"; // רשת רקע עדינה (דף "הזוויות")

const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";

// נקודה על מעגל: זווית במעלות נגד כיוון השעון מציר ה-x החיובי (מסך: y הפוך)
function P(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const F = (v: number) => Math.round(v * 100) / 100;

/* ============ טקסט SVG אחיד (RTL כברירת מחדל; ltr למספרים/סימנים) ============ */
function T({
  x,
  y,
  children,
  size = 16,
  weight = 500,
  color = INK,
  anchor = "middle",
  fam = FONT_A,
  ltr = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  fam?: string;
  ltr?: boolean;
}) {
  return (
    <text
      x={F(x)}
      y={F(y)}
      fill={color}
      stroke="none"
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      style={{
        fontFamily: fam,
        direction: ltr ? "ltr" : "rtl",
        unicodeBidi: "isolate",
      }}
    >
      {children}
    </text>
  );
}

/* ============ מד זווית פרמטרי — הרכיב המרכזי של כל הדפים ============
   וֶרְטֶקְס (נקודת המרכז) ב-(cx,cy); r = רדיוס הקשת החיצונית; rot = סיבוב במעלות
   (חיובי = נגד כיוון השעון). סקאלה כפולה: חיצונית 0 משמאל (0→180 עם כיוון השעון),
   פנימית אפורה 0 מימין — כמו מד זווית בית-ספרי אמיתי. שנתה כל מעלה. */
export function Protractor({
  cx,
  cy,
  r,
  rot = 0,
  spokes = true,
  ruler = false,
  cross = false,
  stroke = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  rot?: number;
  spokes?: boolean;
  ruler?: boolean;
  cross?: boolean;
  stroke?: number;
}) {
  const base = r * 0.115; // גובה פס הבסיס מתחת לקו האפס
  const tickR: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 1) {
    const len = a % 10 === 0 ? r * 0.115 : a % 5 === 0 ? r * 0.08 : r * 0.05;
    const [x1, y1] = P(0, 0, r, a);
    const [x2, y2] = P(0, 0, r - len, a);
    tickR.push(
      <line
        key={`t${a}`}
        x1={F(x1)}
        y1={F(y1)}
        x2={F(x2)}
        y2={F(y2)}
        strokeWidth={a % 10 === 0 ? stroke * 1.15 : stroke * 0.6}
      />
    );
  }
  const nums: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 10) {
    // חיצונית: 0 משמאל (זווית מתמטית 180) → הערך a מוצג בזווית 180-a.
    // ב-0/180 מרימים מעט את התווית כדי שלא תתנגש בקו הבסיס (כמקור).
    const edge = a === 0 || a === 180;
    const [xo, yo] = P(0, 0, r * 0.795, 180 - a);
    nums.push(
      <text
        key={`o${a}`}
        x={F(xo)}
        y={F(yo - (edge ? r * 0.03 : 0))}
        transform={`rotate(${90 - (180 - a)} ${F(xo)} ${F(yo - (edge ? r * 0.03 : 0))})`}
        fontSize={r * 0.072}
        fontWeight={600}
        fill={INK}
      >
        {a}
      </text>
    );
    if (a >= 10 && a <= 170) {
      // פנימית (אפורה, הפוכה): 180 משמאל → בזווית מתמטית a מוצג הערך a (כמקור)
      const [xi, yi] = P(0, 0, r * 0.66, a);
      nums.push(
        <text
          key={`i${a}`}
          x={F(xi)}
          y={F(yi)}
          transform={`rotate(${90 - a} ${F(xi)} ${F(yi)})`}
          fontSize={r * 0.06}
          fontWeight={500}
          fill={SOFT}
        >
          {a}
        </text>
      );
    }
  }
  const spokesEls: ReactNode[] = [];
  if (spokes) {
    for (let a = 10; a <= 170; a += 10) {
      const [x1, y1] = P(0, 0, r * 0.17, a);
      const [x2, y2] = P(0, 0, r * 0.585, a);
      spokesEls.push(
        <line key={`s${a}`} x1={F(x1)} y1={F(y1)} x2={F(x2)} y2={F(y2)} strokeWidth={stroke * 0.55} />
      );
    }
  }
  const rulerEls: ReactNode[] = [];
  if (ruler) {
    // סרגל מ"מ על הבסיס — 5 יח' לכל מ"מ ביחס לרדיוס (מכויל לרוחב הפנימי)
    const mmW = (r * 1.62) / 100;
    const x0 = -mmW * 50;
    for (let mm = 0; mm <= 100; mm += 1) {
      const x = x0 + mm * mmW;
      const len = mm % 10 === 0 ? base * 0.62 : mm % 5 === 0 ? base * 0.44 : base * 0.28;
      rulerEls.push(
        <line key={`r${mm}`} x1={F(x)} y1={0} x2={F(x)} y2={F(len)} strokeWidth={mm % 10 === 0 ? stroke * 0.7 : stroke * 0.45} />
      );
      if (mm % 10 === 0) {
        rulerEls.push(
          <text key={`rn${mm}`} x={F(x)} y={F(base * 0.92)} fontSize={r * 0.05} fontWeight={600} fill={INK} stroke="none" textAnchor="middle" style={{ fontFamily: FONT_R }}>
            {mm}
          </text>
        );
      }
    }
  }
  return (
    <g transform={`translate(${F(cx)} ${F(cy)}) rotate(${F(-rot)})`} stroke={INK} fill="none">
      {/* צללית חיצונית: קשת + פס בסיס */}
      <path
        d={`M ${F(-r - r * 0.05)} ${F(base)} L ${F(-r - r * 0.05)} 0 L ${F(-r)} 0 A ${F(r)} ${F(r)} 0 0 1 ${F(r)} 0 L ${F(r + r * 0.05)} 0 L ${F(r + r * 0.05)} ${F(base)} Z`}
        strokeWidth={stroke * 1.3}
      />
      <line x1={F(-r)} y1={0} x2={F(r)} y2={0} strokeWidth={stroke} />
      {/* קשתות עזר: בסיס שנתות + קשת פנימית */}
      <path d={`M ${F(-r * 0.885)} 0 A ${F(r * 0.885)} ${F(r * 0.885)} 0 0 1 ${F(r * 0.885)} 0`} strokeWidth={stroke * 0.6} />
      <path d={`M ${F(-r * 0.62)} 0 A ${F(r * 0.62)} ${F(r * 0.62)} 0 0 1 ${F(r * 0.62)} 0`} strokeWidth={stroke * 0.6} />
      {tickR}
      {spokesEls}
      {/* מרכז: חצי-עיגול קטן (מפתח כוונון) */}
      <path d={`M ${F(-r * 0.115)} 0 A ${F(r * 0.115)} ${F(r * 0.115)} 0 0 1 ${F(r * 0.115)} 0`} strokeWidth={stroke * 0.9} />
      {cross ? (
        <g strokeWidth={stroke * 0.8}>
          <line x1={0} y1={F(-r * 0.06)} x2={0} y2={F(-r * 0.005)} />
          <line x1={F(-r * 0.028)} y1={F(-r * 0.033)} x2={F(r * 0.028)} y2={F(-r * 0.033)} />
        </g>
      ) : null}
      {rulerEls}
      <g stroke="none" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: FONT_R }}>
        {nums}
      </g>
    </g>
  );
}

/* ============ קרן זווית + קשת סימון ============ */
export function Ray({
  cx,
  cy,
  deg,
  len,
  color = GOLD,
  width = 3.4,
  arrow = false,
  fromR = 0,
}: {
  cx: number;
  cy: number;
  deg: number;
  len: number;
  color?: string;
  width?: number;
  arrow?: boolean;
  fromR?: number;
}) {
  const [x1, y1] = P(cx, cy, fromR, deg);
  const [x2, y2] = P(cx, cy, len, deg);
  const head: ReactNode = arrow ? (
    <polygon
      points={(() => {
        const [hx, hy] = P(cx, cy, len + 9, deg);
        const [b1x, b1y] = P(cx, cy, len - 4, deg + 4.2);
        const [b2x, b2y] = P(cx, cy, len - 4, deg - 4.2);
        return `${F(hx)},${F(hy)} ${F(b1x)},${F(b1y)} ${F(b2x)},${F(b2y)}`;
      })()}
      fill={color}
      stroke="none"
    />
  ) : null;
  return (
    <g>
      <line x1={F(x1)} y1={F(y1)} x2={F(x2)} y2={F(y2)} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {head}
    </g>
  );
}

export function AngleArc({
  cx,
  cy,
  r,
  from,
  to,
  color = INK,
  width = 2,
  full = false,
}: {
  cx: number;
  cy: number;
  r: number;
  from: number;
  to: number;
  color?: string;
  width?: number;
  full?: boolean;
}) {
  if (full) {
    // סימון זווית נישאה — מעגל שלם קטן סביב הקודקוד
    return <circle cx={F(cx)} cy={F(cy)} r={F(r)} stroke={color} strokeWidth={width} fill="none" />;
  }
  const [x1, y1] = P(cx, cy, r, from);
  const [x2, y2] = P(cx, cy, r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  // sweep=0 ב-SVG הוא נגד כיוון השעון במסך (y הפוך) — מ-from ל-to בזוויות עולות
  return (
    <path
      d={`M ${F(x1)} ${F(y1)} A ${F(r)} ${F(r)} 0 ${large} 0 ${F(x2)} ${F(y2)}`}
      stroke={color}
      strokeWidth={width}
      fill="none"
    />
  );
}

/* ============ תג-אות עגול (אותיות על איורים; כמו במקור — עיגול כהה ואות בהירה) ============ */
function Badge({ x, y, r = 13, label, size = 15 }: { x: number; y: number; r?: number; label: string; size?: number }) {
  return (
    <g>
      <circle cx={F(x)} cy={F(y)} r={r} fill={INK} stroke="none" />
      <text
        x={F(x)}
        y={F(y)}
        fill="#fff"
        stroke="none"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={700}
        style={{ fontFamily: FONT_R, direction: "ltr", unicodeBidi: "isolate" }}
      >
        {label}
      </text>
    </g>
  );
}

/* ============ שדות "שם / כיתה / תאריך" — קו מילוי אחיד ============
   הערה: ב-SVG עם direction:rtl, anchor="start" = הקצה הימני (יישור לימין). */
function Field({ x, y, label, line = 92 }: { x: number; y: number; label: string; line?: number }) {
  return (
    <g>
      <T x={x} y={y} size={17} weight={700} anchor="start">
        {label}
      </T>
      <line x1={F(x - label.length * 8 - line - 8)} y1={F(y + 4)} x2={F(x - label.length * 8 - 8)} y2={F(y + 4)} stroke={INK} strokeWidth={1} />
    </g>
  );
}

/* ================================================================
   דפים 1–2: «מד זווית להדפסה על שקף» (מקור: DAHC0dgJes0, ללא מלל)
   ================================================================ */
// דגם א — מד זווית מסובב (כמקור עמ' 1: מוטה ~38°), חישורים וסקאלה כפולה
export function ResProtractorTilted() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="מד זווית מוטה להדפסה על שקף">
        <Protractor cx={350} cy={520} r={300} rot={38} spokes stroke={1.6} />
      </svg>
    </div>
  );
}

// דגם ב — מד זווית קלאסי חזיתי עם סרגל מ"מ וצלב מרכז (כמקור עמ' 2)
export function ResProtractorClassic() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="מד זווית קלאסי להדפסה על שקף">
        <Protractor cx={350} cy={560} r={310} spokes ruler cross stroke={1.6} />
      </svg>
    </div>
  );
}

/* ================================================================
   דף 3: «כיצד להשתמש במד זווית» (מקור: DAHC6WSjlQc)
   ================================================================ */
export function ResHowToUse() {
  const cx = 350;
  const cy = 470;
  const r = 235;
  const steps = [
    "מקם את נקודת המרכז של מד הזווית מעל קודקוד הזווית",
    "יישרו את קו הבסיס של מד הזווית עם הקו התחתון של הזווית",
    "זהה את האפס על מד הזווית והשתמש בקנה מידה זה",
    "קרא את הזווית בזהירות",
  ];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="כיצד להשתמש במד זווית — מדריך מאויר">
        <T x={350} y={64} size={34} weight={800} color={TEAL} fam={FONT_R}>
          כיצד להשתמש במד זווית
        </T>
        <T x={350} y={104} size={19} weight={600} color={TEAL}>
          מד זווית משמש למדידת גודל של זוויות
        </T>

        {/* מד הזווית + שתי דוגמאות קריאה: 130° ו-50° (כמקור) */}
        <Protractor cx={cx} cy={cy} r={r} spokes stroke={1.4} />
        <Ray cx={cx} cy={cy} deg={0} len={r * 0.585} color={GOLD} width={3.2} />
        <Ray cx={cx} cy={cy} deg={50} len={r * 0.585} color={GOLD} width={3.2} arrow />
        <AngleArc cx={cx} cy={cy} r={44} from={0} to={50} color={GOLD} width={2.4} />
        <Ray cx={cx} cy={cy} deg={180} len={r * 0.585} color={TEAL} width={3.2} />
        <Ray cx={cx} cy={cy} deg={130} len={r * 0.585} color={TEAL} width={3.2} arrow />
        <AngleArc cx={cx} cy={cy} r={58} from={130} to={180} color={TEAL} width={2.4} />

        {/* תוויות הקריאה עם קווים מנחים אל הסקאלה */}
        <T x={140} y={182} size={26} weight={800} color={TEAL} fam={FONT_R} ltr>
          130°
        </T>
        <line x1={158} y1={192} x2={F(P(cx, cy, r + 14, 130)[0])} y2={F(P(cx, cy, r + 14, 130)[1])} stroke={TEAL} strokeWidth={1.6} />
        <T x={562} y={182} size={26} weight={800} color={GOLD} fam={FONT_R} ltr>
          50°
        </T>
        <line x1={548} y1={192} x2={F(P(cx, cy, r + 14, 50)[0])} y2={F(P(cx, cy, r + 14, 50)[1])} stroke={GOLD} strokeWidth={1.6} />

        {/* ארבעת השלבים — המלל המקורי, אחד-לאחד */}
        {steps.map((s, i) => (
          <g key={i}>
            <circle cx={636} cy={618 + i * 78} r={17} fill="none" stroke={TEAL} strokeWidth={2} />
            <text x={636} y={618 + i * 78} fill={TEAL} stroke="none" textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={800} style={{ fontFamily: FONT_R }}>
              {i + 1}
            </text>
            <T x={604} y={625 + i * 78} size={20.5} weight={600} anchor="start" color={TEAL}>
              {s}
            </T>
            {i < steps.length - 1 ? <line x1={96} y1={657 + i * 78} x2={604} y2={657 + i * 78} stroke="var(--wsgoldline)" strokeWidth={1} /> : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ================================================================
   דף 4: «פוסטר — זוויות ומדידה באמצעות מד זווית» (מקור: DAHC-c4hS5k)
   ================================================================ */
function MiniAngleFig({ cx, cy, deg, size = 60, label }: { cx: number; cy: number; deg: number; size?: number; label?: string }) {
  return (
    <g>
      <Ray cx={cx} cy={cy} deg={0} len={size} color={INK} width={2.6} arrow />
      <Ray cx={cx} cy={cy} deg={deg} len={size} color={INK} width={2.6} arrow />
      <AngleArc cx={cx} cy={cy} r={size * 0.34} from={0} to={deg} color={RED} width={2} />
      <circle cx={F(cx)} cy={F(cy)} r={3} fill={RED} stroke="none" />
      {label ? (
        <T x={cx + size * 0.52} y={cy - size * 0.3} size={13.5} weight={600} color={INK} ltr>
          {label}
        </T>
      ) : null}
    </g>
  );
}

function MiniProtractorRead({ cx, cy, deg, r = 62, caption, capW }: { cx: number; cy: number; deg: number; r?: number; caption?: string; capW?: number }) {
  return (
    <g>
      <Protractor cx={cx} cy={cy} r={r} spokes={false} stroke={0.9} />
      <Ray cx={cx} cy={cy} deg={0} len={r * 1.12} color={INK} width={2.2} arrow />
      <Ray cx={cx} cy={cy} deg={deg} len={r * 1.12} color={INK} width={2.2} arrow />
      <AngleArc cx={cx} cy={cy} r={r * 0.3} from={0} to={deg} color={RED} width={1.8} />
      {caption ? (
        <T x={cx} y={cy + 30} size={15} weight={600}>
          {caption}
        </T>
      ) : null}
      {capW ? null : null}
    </g>
  );
}

export function ResPoster() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="פוסטר — זוויות ומדידה באמצעות מד זווית">
        {/* כותרת-על + פתיח */}
        <T x={350} y={56} size={31} weight={800} fam={FONT_R}>
          זוויות ומדידה באמצעות מד זווית
        </T>
        <T x={350} y={92} size={18} weight={700} color="var(--wssoft)">
          האם אתה רוצה לבנות משהו?
        </T>
        <T x={350} y={116} size={18} weight={700} color="var(--wssoft)">
          הבנה ומדידת זוויות חיוניים
        </T>
        <line x1={70} y1={136} x2={630} y2={136} stroke="var(--wsgoldline)" strokeWidth={1.4} />

        {/* מהן זוויות? */}
        <T x={630} y={180} size={24} weight={800} anchor="start" fam={FONT_R} color={TEAL}>
          מהן זוויות?
        </T>
        <T x={630} y={208} size={17} weight={600} anchor="start">
          גודל המפתח בין שתי קרניים
        </T>
        {/* איור זווית 60° עם תוויות קרניים/קדקוד (כמקור) */}
        <MiniAngleFig cx={170} cy={250} deg={60} size={92} />
        <T x={286} y={200} size={14.5} weight={600}>
          קרניים
        </T>
        <line x1={276} y1={206} x2={F(P(170, 250, 70, 60)[0])} y2={F(P(170, 250, 70, 60)[1])} stroke="var(--wssoft)" strokeWidth={1} />
        <T x={116} y={288} size={14.5} weight={600}>
          קָדקוֹד
        </T>
        <line x1={136} y1={278} x2={166} y2={254} stroke="var(--wssoft)" strokeWidth={1} />
        <T x={252} y={262} size={13.5} weight={600} color={RED}>
          60 מעלות
        </T>
        <line x1={70} y1={318} x2={630} y2={318} stroke="var(--wsgoldline)" strokeWidth={1.4} />

        {/* איך מודדים זווית בעזרת מד זווית? — שלושת השלבים כמקור */}
        <T x={630} y={358} size={24} weight={800} anchor="start" fam={FONT_R} color={TEAL}>
          איך מודדים זווית בעזרת מד זווית?
        </T>
        <T x={630} y={396} size={17.5} weight={800} anchor="start">
          <tspan style={{ fontFamily: FONT_R }}>שלב 1:</tspan>
        </T>
        <T x={548} y={396} size={16.5} weight={500} anchor="start">
          מקם את נקודת המרכז של מד הזווית בקודקוד הזווית.
        </T>
        <MiniProtractorRead cx={112} cy={448} deg={30} r={44} />
        <T x={630} y={478} size={17.5} weight={800} anchor="start">
          <tspan style={{ fontFamily: FONT_R }}>שלב 2:</tspan>
        </T>
        <T x={548} y={478} size={16.5} weight={500} anchor="start">
          יישר את הקו התחתון של מד הזווית עם הקרן התחתונה של הזווית בסימון 0.
        </T>
        <MiniProtractorRead cx={112} cy={530} deg={30} r={44} />
        <T x={630} y={560} size={17.5} weight={800} anchor="start">
          <tspan style={{ fontFamily: FONT_R }}>שלב 3:</tspan>
        </T>
        <T x={548} y={560} size={16.5} weight={500} anchor="start">
          מצא את מידת הזווית על ידי קריאת המספר שבו הקרן השנייה חותכת את מד הזווית.
        </T>
        <MiniProtractorRead cx={112} cy={612} deg={30} r={44} />
        <T x={112} y={652} size={15} weight={600}>
          הזווית היא 30°
        </T>
        <line x1={70} y1={668} x2={630} y2={668} stroke="var(--wsgoldline)" strokeWidth={1.4} />

        {/* שליטה בזוויות בעזרת מד זווית */}
        <T x={630} y={708} size={24} weight={800} anchor="start" fam={FONT_R} color={TEAL}>
          שליטה בזוויות בעזרת מד זווית
        </T>
        <MiniProtractorRead cx={210} cy={800} deg={50} r={92} />
        <T x={210} y={868} size={16} weight={600}>
          הזווית היא 50°.
        </T>
        <MiniProtractorRead cx={492} cy={800} deg={130} r={92} />
        <T x={492} y={868} size={16} weight={600}>
          הזווית היא 130°.
        </T>
      </svg>
    </div>
  );
}

/* ================================================================
   דף 5: «הזוויות» — בת כמה מעלות כל זווית + סוג הזווית (מקור: DAHC6dmwq6g, הגרסה העברית)
   ================================================================ */
function AngleOnProtractor({
  cx,
  cy,
  r,
  deg,
  reflex = false,
  letter,
  example,
}: {
  cx: number;
  cy: number;
  r: number;
  deg: number;
  reflex?: boolean;
  letter: string;
  example?: string;
}) {
  return (
    <g>
      <Protractor cx={cx} cy={cy} r={r} spokes={false} stroke={0.9} />
      <Ray cx={cx} cy={cy} deg={0} len={r * 1.1} color={INK} width={2.4} arrow />
      <Ray cx={cx} cy={cy} deg={deg} len={r * 1.1} color={INK} width={2.4} arrow />
      {reflex ? (
        <AngleArc cx={cx} cy={cy} r={r * 0.24} from={0} to={0} full color={INK} width={1.8} />
      ) : (
        <AngleArc cx={cx} cy={cy} r={r * 0.3} from={0} to={deg} color={INK} width={1.8} />
      )}
      <Badge x={cx - r - 22} y={cy + 12} r={12} label={letter} size={14} />
      {example ? (
        <T x={cx - r * 0.4} y={cy + 26} size={15} weight={700} ltr>
          {example}
        </T>
      ) : null}
    </g>
  );
}

export function ResGeometryAngles() {
  // רשת רקע עדינה (כמקור — דף משבצות)
  const gridLines: ReactNode[] = [];
  for (let x = 30; x <= 670; x += 32) gridLines.push(<line key={`v${x}`} x1={x} y1={26} x2={x} y2={944} />);
  for (let y = 26; y <= 944; y += 32) gridLines.push(<line key={`h${y}`} x1={30} y1={y} x2={670} y2={y} />);
  // שישה מדי זווית A–F: הזוויות כפי שנמדדו במקור
  const items: { deg: number; reflex?: boolean; letter: string; example?: string }[] = [
    { deg: 75, letter: "A", example: "75º" },
    { deg: 150, letter: "B" },
    { deg: 30, letter: "C" },
    { deg: 115, letter: "D" },
    { deg: 65, letter: "E" },
    { deg: 65, reflex: true, letter: "F" },
  ];
  const answers = ["A", "B", "C", "D", "E", "F"];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="הזוויות — בת כמה מעלות כל זווית וסוג הזווית">
        <g stroke={GRID} strokeWidth={0.8} fill="none">
          {gridLines}
        </g>
        {/* כותרת בצד שמאל + שדות בצד ימין — כפריסת המקור (תבנית מיושרת לשמאל) */}
        <T x={144} y={64} size={17} weight={800} anchor="end" color={TEAL} fam={FONT_R}>
          גֵאוֹמֶטרִיָה
        </T>
        <T x={144} y={94} size={26} weight={800} anchor="end" fam={FONT_R}>
          הזוויות
        </T>
        <Field x={630} y={58} label="שֵׁם:" line={110} />
        <Field x={630} y={92} label="תַאֲרִיך:" line={88} />

        {/* חלק ① — התג משמאל וההוראה נמשכת ימינה, כמקור */}
        <Badge x={60} y={130} r={11} label="1" size={13} />
        <T x={82} y={136} size={18} weight={700} anchor="end">
          כתבו בת כמה מעלות כל זווית
        </T>
        {items.map((it, i) => {
          const col = i % 2; // כמקור: A משמאל, B מימין
          const row = Math.floor(i / 2);
          const cx = col === 0 ? 190 : 490;
          const cy = 236 + row * 172;
          return <AngleOnProtractor key={i} cx={cx} cy={cy} r={92} deg={it.deg} reflex={it.reflex} letter={it.letter} example={it.example} />;
        })}

        {/* חלק ② */}
        <Badge x={60} y={742} r={11} label="2" size={13} />
        <T x={82} y={748} size={18} weight={700} anchor="end">
          כתבו את סוג הזווית שכל אות מייצגת.
        </T>
        {answers.map((l, i) => {
          const col = Math.floor(i / 3); // כמקור: A,B,C משמאל; D,E,F מימין
          const row = i % 3;
          const bx = col === 0 ? 135 : 400;
          const by = 796 + row * 44;
          return (
            <g key={l}>
              <Badge x={bx} y={by} r={11} label={l} size={13} />
              <line x1={bx + 18} y1={by + 8} x2={bx + 205} y2={by + 8} stroke={INK} strokeWidth={1} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================================================================
   דפים 6–7: «מדידת זוויות» — באמצעות מד זווית נתון (מקור: DAHC6SCOXbw)
   ================================================================ */
export function ResMeasureGivenA() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="מדידת זוויות — דוגמה ותרגילים א–ב">
        {/* שדות כמקור: שם מימין, כיתה במרכז-ימין */}
        <Field x={605} y={44} label="שֵׁם:" line={130} />
        <Field x={335} y={44} label="כיתה:" line={100} />
        {/* כותרת ממורכזת על פס זהוב (במקור — פס צהוב) */}
        <rect x={230} y={70} width={240} height={46} rx={8} fill="var(--wsgoldline)" opacity={0.45} stroke="none" />
        <T x={350} y={103} size={31} weight={800} fam={FONT_R}>
          מדידת זוויות
        </T>

        {/* הוראה משמאל + דוגמה מימין — כפריסת המקור */}
        <T x={180} y={168} size={17.5} weight={800} anchor="start">
          הוֹרָאָה:
        </T>
        <T x={364} y={196} size={16.5} weight={500} anchor="start">
          קראו את גודל הזוויות בין הקווים הצהובים.
        </T>
        <T x={584} y={168} size={17.5} weight={800} anchor="start">
          דוּגמָה
        </T>
        <Protractor cx={522} cy={346} r={94} spokes stroke={0.95} />
        <Ray cx={522} cy={346} deg={0} len={66} color={GOLD} width={3.4} />
        <Ray cx={522} cy={346} deg={72} len={68} color={GOLD} width={3.4} />
        <T x={510} y={424} size={16.5} weight={800} anchor="start">
          תְשׁוּבָה:
        </T>
        <line x1={380} y1={430} x2={446} y2={430} stroke={INK} strokeWidth={1} />
        <T x={372} y={420} size={14} weight={600} ltr>
          °
        </T>

        {/* תרגיל — כמקור: התווית משמאל והמלל נמשך ימינה */}
        <T x={180} y={522} size={17.5} weight={800} anchor="start">
          תַרגִיל:
        </T>
        <T x={575} y={522} size={16.5} weight={500} anchor="start">
          כתבו את גודל הזוויות באמצעות מד הזווית המצורף.
        </T>

        {/* א) משמאל — מד זווית מוטה 19.16° עם קרניים 114.92°/64.62° (זווית 50°) */}
        <T x={100} y={562} size={17} weight={800}>
          א)
        </T>
        <Protractor cx={222} cy={735} r={112} rot={19.16} spokes stroke={0.95} />
        <Ray cx={222} cy={735} deg={114.92} len={122} color={GOLD} width={3.6} />
        <Ray cx={222} cy={735} deg={64.62} len={122} color={GOLD} width={3.6} />
        <text x={206} y={714} fill={BLUE} stroke="none" textAnchor="middle" fontSize={54} fontWeight={800} style={{ fontFamily: FONT_R }}>
          ב
        </text>
        <T x={190} y={912} size={16.5} weight={800} anchor="start">
          תְשׁוּבָה:
        </T>
        <line x1={62} y1={918} x2={126} y2={918} stroke={INK} strokeWidth={1} />

        {/* ב) מימין — קרניים 180°/106.15° (זווית 74°) */}
        <T x={385} y={562} size={17} weight={800}>
          ב)
        </T>
        <Protractor cx={512} cy={737} r={112} spokes stroke={0.95} />
        <Ray cx={512} cy={737} deg={180} len={122} color={GOLD} width={3.6} />
        <Ray cx={512} cy={737} deg={106.15} len={122} color={GOLD} width={3.6} />
        <text x={530} y={700} fill={BLUE} stroke="none" textAnchor="middle" fontSize={54} fontWeight={800} style={{ fontFamily: FONT_R }}>
          א
        </text>
        <T x={506} y={912} size={16.5} weight={800} anchor="start">
          תְשׁוּבָה:
        </T>
        <line x1={378} y1={918} x2={442} y2={918} stroke={INK} strokeWidth={1} />
      </svg>
    </div>
  );
}

export function ResMeasureGivenB() {
  // עמוד ב (עמ' 3 במקור): 4 תרגילים i–iv בפריסת המקור (i משמאל, ii מימין);
  // תוויות «Answer:» נשמרו כמקור (שריד תבנית — לתשומת לב יניב).
  const cells: { tag: string; letter: string; lx: number; ly: number; degs: number[]; rot?: number; straight?: boolean; cx: number; cy: number }[] = [
    { tag: "i)", letter: "A", lx: 206, ly: 296, degs: [180, 106.15], cx: 223, cy: 318 },
    { tag: "ii)", letter: "B", lx: 522, ly: 308, degs: [0, 90], cx: 507, cy: 317 },
    { tag: "iii)", letter: "C", lx: 218, ly: 655, degs: [], rot: 90, straight: true, cx: 230, cy: 666 },
    { tag: "iv)", letter: "D", lx: 513, ly: 658, degs: [0, 90], cx: 507, cy: 692 },
  ];
  const tags = [
    { t: "i)", x: 82, y: 168 },
    { t: "ii)", x: 367, y: 168 },
    { t: "iii)", x: 78, y: 505 },
    { t: "iv)", x: 367, y: 505 },
  ];
  const answers = [
    { x: 100, y: 404 },
    { x: 417, y: 404 },
    { x: 110, y: 844 },
    { x: 418, y: 843 },
  ];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="מדידת זוויות — תרגילים i–iv">
        <Field x={592} y={44} label="שֵׁם:" line={120} />
        <Field x={330} y={44} label="כיתה:" line={95} />
        <T x={547} y={87} size={18} weight={600} anchor="start">
          כתבו את גודל הזוויות באמצעות מד הזווית המצורף.
        </T>
        {cells.map((c, i) => (
          <g key={c.tag}>
            <text x={tags[i].x} y={tags[i].y} fill={INK} stroke="none" textAnchor="start" fontSize={17} fontWeight={800} style={{ fontFamily: FONT_A, direction: "ltr" }}>
              {tags[i].t}
            </text>
            <Protractor cx={c.cx} cy={c.cy} r={112} rot={c.rot ?? 0} spokes stroke={0.95} />
            {c.straight ? (
              <Ray cx={c.cx} cy={c.cy} deg={90} len={122} fromR={-122} color={GOLD} width={3.6} />
            ) : (
              <g>
                {c.degs.map((d) => (
                  <Ray key={d} cx={c.cx} cy={c.cy} deg={d} len={122} color={GOLD} width={3.6} />
                ))}
              </g>
            )}
            <text x={c.lx} y={c.ly} fill={BLUE} stroke="none" textAnchor="middle" fontSize={54} fontWeight={800} style={{ fontFamily: FONT_R, direction: "ltr" }}>
              {c.letter}
            </text>
            <text x={answers[i].x} y={answers[i].y} fill={INK} stroke="none" textAnchor="start" fontSize={16.5} fontWeight={800} style={{ fontFamily: FONT_A, direction: "ltr" }}>
              Answer:
            </text>
            <line x1={answers[i].x + 72} y1={answers[i].y + 6} x2={answers[i].x + 182} y2={answers[i].y + 6} stroke={INK} strokeWidth={1} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ================================================================
   דף 8: «בת כמה מעלות כל זווית המסומנת על מד הזווית?» (מקור: DAHC4M9rvWE)
   ================================================================ */
export function ResWhatSizeAngles() {
  const cx = 350;
  const cy = 476;
  const r = 268;
  // הקרניים המסומנות באותיות — כפי שנמדדו במקור (ערכים עגולים על הסקאלה)
  const rays: { letter: string; deg: number }[] = [
    { letter: "B", deg: 180 },
    { letter: "C", deg: 160 },
    { letter: "D", deg: 140 },
    { letter: "E", deg: 120 },
    { letter: "F", deg: 90 },
    { letter: "G", deg: 60 },
    { letter: "H", deg: 40 },
    { letter: "I", deg: 0 },
  ];
  // 12 התרגילים כמקור (אותיות קטנות; ∡iag מופיע פעמיים ו-«fab=» ללא רווח — נאמן למקור)
  const ex: string[][] = [
    ["bai =", "iah =", "bac ="],
    ["iag =", "iaf =", "iae ="],
    ["bad =", "fab=", "iag ="],
    ["gah =", "caf =", "hae ="],
  ];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="בת כמה מעלות כל זווית המסומנת על מד הזווית">
        <Field x={664} y={44} label="שֵׁם:" line={150} />
        <T x={350} y={106} size={30} weight={800} color={BLUE} fam={FONT_R}>
          מה גודל הזוויות הבאות?
        </T>

        {/* מד הזווית הגדול עם קרניים מסומנות A–I */}
        <Protractor cx={cx} cy={cy} r={r} spokes stroke={1.35} />
        {rays.map((ry) => (
          <g key={ry.letter}>
            <Ray cx={cx} cy={cy} deg={ry.deg} len={r * 0.605} color={INK} width={3.2} fromR={r * 0.115} />
            <Badge x={P(cx, cy, r * 0.42, ry.deg + (ry.deg === 0 ? 4 : ry.deg === 180 ? -4 : 0))[0]} y={P(cx, cy, r * 0.42, ry.deg + (ry.deg === 0 ? 4 : ry.deg === 180 ? -4 : 0))[1]} r={12.5} label={ry.letter} size={14} />
          </g>
        ))}
        <Badge x={cx} y={cy - 16} r={12.5} label="A" size={14} />

        <T x={350} y={548} size={17.5} weight={700}>
          השתמשו במד זווית שלמעלה כדי למצוא את מידות הזוויות הבאות:
        </T>

        {/* 12 תרגילים — 4 עמודות × 3 שורות; קו התשובה אחרי ה-«=» */}
        {ex.map((colEx, c) =>
          colEx.map((name, rIdx) => {
            const x = 566 - c * 152;
            const y = 612 + rIdx * 56;
            return (
              <g key={`${c}-${rIdx}`}>
                <text x={x} y={y} fill={INK} stroke="none" textAnchor="end" fontSize={19} fontWeight={600} style={{ fontFamily: FONT_A, direction: "ltr", unicodeBidi: "isolate" }}>
                  {`∡${name}`}
                </text>
                <line x1={x + 8} y1={y + 6} x2={x + 62} y2={y + 6} stroke={INK} strokeWidth={1} />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

/* ================================================================
   דפים 9–10: «קריאת זוויות» (מקור: DAHC6YQOp_g) — קטעים על מדי זווית
   ================================================================ */
// קטעי הדמות (עמ' א) — קואורדינטות שנמדדו מהמקור (דף 509×720 → קנה 700×990 ≈ ×1.375)
const READ1_SEGS: [number, number, number, number][] = [
  [369.3, 625.1, 378.1, 487.0], // עמוד שדרה
  [427.1, 499.3, 327.0, 508.1], // כתפיים
  [423.8, 538.6, 323.7, 547.4], // צלע אמצע
  [423.8, 578.5, 323.7, 587.3], // צלע תחתונה
  [468.1, 542.6, 426.7, 503.3], // זרוע ימין-עליון
  [503.8, 506.1, 461.5, 544.4], // אמה ימין
  [288.5, 546.4, 328.9, 506.0], // זרוע שמאל-עליון
  [251.5, 506.1, 291.9, 546.6], // אמה שמאל
  [432.2, 663.3, 378.5, 621.2], // ירך שמאל
  [364.8, 618.3, 313.8, 664.0], // ירך ימין
  [447.7, 721.6, 426.5, 661.4], // שוק ימין
  [298.7, 720.0, 317.4, 659.6], // שוק שמאל
  [303.2, 726.6, 267.4, 700.8], // כף רגל שמאל
  [478.2, 737.6, 442.1, 713.0], // כף רגל ימין
  [119.2, 652.2, 152.1, 585.2], // קו הדוגמה (תחתון-ימין באיור)
  [389.3, 874.1, 458.2, 856.4], // קטע תשובה תחתון
];
const READ1_ANSWER_LINES: [number, number, number, number][] = [
  [100.4, 670.3, 242.2, 739.2],
  [267.9, 779.4, 409.7, 848.3],
];

export function ResReadingAnglesA() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="קריאת זוויות — עמוד א">
        <T x={350} y={78} size={40} weight={800} fam={FONT_R}>
          קריאת זוויות
        </T>
        <T x={350} y={126} size={18} weight={600}>
          כתבו את גודל הזוויות בין הקווים למטה.
        </T>
        <T x={350} y={152} size={18} weight={600}>
          וכתבו האם הזווית ישרה, חדה או קהה
        </T>
        <g>
          <rect x={452} y={318} width={120} height={34} rx={17} fill={INK} stroke="none" />
          <text x={512} y={341} fill="#fff" stroke="none" textAnchor="middle" fontSize={17} fontWeight={700} style={{ fontFamily: FONT_A, direction: "rtl" }}>
            לְדוּגמָה:
          </text>
        </g>

        {/* שני מדי הזווית (מיקומי המקור, קנה 1.375) */}
        <Protractor cx={246} cy={618} r={134} spokes stroke={1.05} />
        <Protractor cx={508} cy={806} r={92} spokes stroke={0.95} />

        {/* קטעי הדמות — הזוויות נקראות היכן שהקטעים נפגשים על המדים */}
        <g>
          {READ1_SEGS.map((s, i) => (
            <line key={i} x1={F(s[0])} y1={F(s[1])} x2={F(s[2])} y2={F(s[3])} stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>

        {/* קווי תשובה + ° (כמקור) */}
        {READ1_ANSWER_LINES.map((l, i) => (
          <line key={i} x1={F(l[0])} y1={F(l[1])} x2={F(l[2])} y2={F(l[3])} stroke={INK} strokeWidth={1.6} />
        ))}
        <T x={190} y={692} size={16} weight={600} ltr>
          °
        </T>
        <T x={362} y={800} size={16} weight={600} ltr>
          °
        </T>
      </svg>
    </div>
  );
}

// עמוד ב (עמ' 3 במקור) — וריאנט מוגדל, תרגיל «1.»
const READ2_SEGS: [number, number, number, number][] = [
  [369.3, 511.2, 379.9, 348.2], // עמוד שדרה
  [437.5, 362.5, 319.4, 373.1], // כתפיים
  [433.7, 408.9, 315.6, 419.5], // צלע אמצע
  [433.7, 455.9, 315.6, 466.5], // צלע תחתונה
  [486.2, 413.7, 437.1, 367.1], // זרוע ימין
  [494.7, 352.3, 480.4, 409.9], // אמה ימין
  [273.9, 418.4, 321.8, 370.6], // זרוע שמאל
  [219.7, 426.7, 277.6, 409.9], // אמה שמאל
  [443.7, 556.3, 380.3, 506.4], // ירך שמאל
  [364.1, 503.1, 303.9, 557.2], // ירך ימין
  [462.1, 625.1, 437.0, 553.9], // שוק ימין
  [285.9, 623.2, 308.0, 552.0], // שוק שמאל
  [243.7, 603.3, 287.7, 620.8], // כף רגל שמאל
  [497.9, 594.0, 458.6, 629.9], // כף רגל ימין
  [121.6, 605.7, 154.4, 538.7], // קו הדוגמה
  [386.9, 804.1, 455.8, 786.4], // קטע תשובה תחתון
];
const READ2_ANSWER_LINES: [number, number, number, number][] = [
  [102.7, 623.7, 244.5, 692.6],
  [265.5, 709.5, 407.3, 778.4],
];

export function ResReadingAnglesB() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="קריאת זוויות — עמוד ב">
        {/* תג תרגיל «1.» (כמקור — ספרה בהירה על עיגול כהה) */}
        <g>
          <circle cx={106} cy={158} r={26} fill={INK} stroke="none" />
          <text x={106} y={158} fill="#fff" stroke="none" textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} style={{ fontFamily: FONT_R, direction: "ltr" }}>
            1.
          </text>
        </g>

        {/* שני מדי הזווית הגדולים (מיקומי המקור, קנה 1.375) */}
        <Protractor cx={222} cy={490} r={156} spokes stroke={1.1} />
        <Protractor cx={534} cy={726} r={112} spokes stroke={1} />

        <g>
          {READ2_SEGS.map((s, i) => (
            <line key={i} x1={F(s[0])} y1={F(s[1])} x2={F(s[2])} y2={F(s[3])} stroke={BLUE} strokeWidth={4.6} strokeLinecap="round" />
          ))}
        </g>

        {READ2_ANSWER_LINES.map((l, i) => (
          <line key={i} x1={F(l[0])} y1={F(l[1])} x2={F(l[2])} y2={F(l[3])} stroke={INK} strokeWidth={1.6} />
        ))}
        <T x={192} y={646} size={16} weight={600} ltr>
          °
        </T>
        <T x={360} y={732} size={16} weight={600} ltr>
          °
        </T>
      </svg>
    </div>
  );
}
