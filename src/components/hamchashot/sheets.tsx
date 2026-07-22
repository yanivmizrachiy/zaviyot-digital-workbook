// תשעת דפי ההמחשה — עיצוב מחדש מדויק, וקטורי וחד, של קובצי "המחשות - להדפסה"
// (מקור: איילת קריספין). כל איור מצויר SVG בקוד — הזוויות, השנתות והרשתות מחושבות
// מתמטית (לולאות), כך שהדיוק מובטח מבנייה. אין תוכן חדש — רק שרטוט מחדש של המקור.
import type { ReactNode } from "react";

const INK = "var(--wsink)";
const GRID = "#9099a8"; // קווי רשת אפורים (רביע ראשון) — כהים מספיק להדפסה
const GRAY = "#98a0ad"; // סקאלה פנימית במד הזווית העדין

// נקודה על מעגל: זווית במעלות נגד כיוון השעון מציר ה-x החיובי (מסך: y הפוך)
function P(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const F = (v: number) => Math.round(v * 100) / 100;

/* ============ עיגול מחולק לגזרות זווית (דפים 1–2) ============ */
function AngleCircle({
  cx,
  cy,
  r,
  bounds,
  thick,
  labels,
}: {
  cx: number;
  cy: number;
  r: number;
  bounds: number[]; // זוויות הגבול (נגד כיוון השעון, כולל 0)
  thick: number[]; // רדיוסים מודגשים
  labels: { text: string; at: number; f: number }[]; // תווית בזווית-אמצע וברדיוס יחסי
}) {
  return (
    <g stroke={INK} fill="none">
      <circle cx={cx} cy={cy} r={r} strokeWidth={2.5} />
      {bounds.map((a) => {
        const [x, y] = P(cx, cy, r, a);
        return (
          <line
            key={a}
            x1={cx}
            y1={cy}
            x2={F(x)}
            y2={F(y)}
            strokeWidth={thick.includes(a) ? 5.5 : 2.5}
          />
        );
      })}
      {labels.map((l, i) => {
        const [x, y] = P(cx, cy, r * l.f, l.at);
        return (
          <text
            key={i}
            x={F(x)}
            y={F(y)}
            fill={INK}
            stroke="none"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={34}
            fontWeight={500}
            style={{ fontFamily: "var(--font-rubik), sans-serif", direction: "ltr", unicodeBidi: "isolate" }}
          >
            {l.text}
          </text>
        );
      })}
    </g>
  );
}

// דף 1 — שני עיגולים: 135°/135°/60°/30° ו-120°/120°/45°/45°/30° (כמקור, עמוד 1)
export function AidCircles1() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="שני עיגולים מחולקים לגזרות זווית">
        <AngleCircle
          cx={350}
          cy={245}
          r={218}
          bounds={[0, 135, 270, 330]}
          thick={[0, 270]}
          labels={[
            { text: "135°", at: 67.5, f: 0.55 },
            { text: "135°", at: 202.5, f: 0.55 },
            { text: "60°", at: 300, f: 0.63 },
            { text: "30°", at: 345, f: 0.76 },
          ]}
        />
        <AngleCircle
          cx={350}
          cy={725}
          r={218}
          bounds={[0, 120, 240, 285, 330]}
          thick={[0]}
          labels={[
            { text: "120°", at: 60, f: 0.55 },
            { text: "120°", at: 180, f: 0.55 },
            { text: "45°", at: 262.5, f: 0.68 },
            { text: "45°", at: 307.5, f: 0.68 },
            { text: "30°", at: 345, f: 0.78 },
          ]}
        />
      </svg>
    </div>
  );
}

// דף 2 — עיגול אחד: 120°/90°/90°/60° (כמקור, עמוד 2)
export function AidCircles2() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="עיגול מחולק לגזרות זווית">
        <AngleCircle
          cx={350}
          cy={485}
          r={330}
          bounds={[0, 120, 210, 300]}
          thick={[0]}
          labels={[
            { text: "120°", at: 60, f: 0.55 },
            { text: "90°", at: 165, f: 0.58 },
            { text: "90°", at: 255, f: 0.58 },
            { text: "60°", at: 330, f: 0.62 },
          ]}
        />
      </svg>
    </div>
  );
}

/* ============ דף 3 — זווית ישרה להשוואת זוויות ============ */
export function AidRightAngle() {
  // קודקוד, שתי קרניים (מעלה + ימינה) עם ראשי חץ, וסימון ריבוע לזווית ישרה
  const x0 = 168;
  const y0 = 780;
  const sq = 62;
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="זווית ישרה עם שתי קרניים וסימון ריבוע">
        <g stroke={INK} strokeWidth={8} fill="none">
          <line x1={x0} y1={y0} x2={x0} y2={216} />
          <line x1={x0} y1={y0} x2={594} y2={y0} />
          <polyline points={`${x0},${y0 - sq} ${x0 + sq},${y0 - sq} ${x0 + sq},${y0}`} />
        </g>
        <g fill={INK} stroke="none">
          <polygon points={`${x0},170 ${x0 - 17},222 ${x0 + 17},222 `} />
          <polygon points={`640,${y0} 588,${y0 - 17} 588,${y0 + 17}`} />
        </g>
      </svg>
    </div>
  );
}

/* ============ דף 4 — מד זווית להדפסה על שקף (שני דגמים) ============ */
// קשת חצי-מעגל מ-180° (שמאל) דרך 90° (למעלה) אל 0° (ימין)
function semiArc(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

// דגם א׳ — קלאסי: פס שנתות רחב, סקאלה כפולה וחישורים פנימיים כל ‎10°‎
function ProtractorClassic({ cx, cy }: { cx: number; cy: number }) {
  const R = 290;
  const ticks: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 2) {
    const long = a % 10 === 0;
    const [x1, y1] = P(cx, cy, R, a);
    const [x2, y2] = P(cx, cy, long ? 252 : 272, a);
    ticks.push(
      <line key={`t${a}`} x1={F(x1)} y1={F(y1)} x2={F(x2)} y2={F(y2)} strokeWidth={long ? 2.2 : 1.6} />
    );
  }
  const spokes: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 10) {
    const [x1, y1] = P(cx, cy, 64, a);
    const [x2, y2] = P(cx, cy, 178, a);
    spokes.push(<line key={`s${a}`} x1={F(x1)} y1={F(y1)} x2={F(x2)} y2={F(y2)} strokeWidth={1.8} />);
  }
  const nums: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 10) {
    const [xo, yo] = P(cx, cy, 230, a);
    nums.push(
      <text key={`o${a}`} x={F(xo)} y={F(yo)} transform={`rotate(${90 - a} ${F(xo)} ${F(yo)})`} fontSize={21} fontWeight={600}>
        {a}
      </text>
    );
    if (a >= 10 && a <= 170) {
      const [xi, yi] = P(cx, cy, 196, a);
      nums.push(
        <text key={`i${a}`} x={F(xi)} y={F(yi)} transform={`rotate(${90 - a} ${F(xi)} ${F(yi)})`} fontSize={18} fontWeight={500}>
          {180 - a}
        </text>
      );
    }
  }
  return (
    <g stroke={INK} fill="none">
      {/* צללית: חצי-מעגל + בסיס ישר רחב */}
      <path
        d={`M ${cx - 306} ${cy + 34} L ${cx - 306} ${cy} L ${cx - 290} ${cy} A 290 290 0 0 1 ${cx + 290} ${cy} L ${cx + 306} ${cy} L ${cx + 306} ${cy + 34} Z`}
        strokeWidth={3}
      />
      <line x1={cx - 290} y1={cy} x2={cx + 290} y2={cy} strokeWidth={2.4} />
      <path d={semiArc(cx, cy, 252)} strokeWidth={1.6} />
      <path d={semiArc(cx, cy, 178)} strokeWidth={1.6} />
      <path d={semiArc(cx, cy, 64)} strokeWidth={1.8} />
      {ticks}
      {spokes}
      <g fill={INK} stroke="none" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {nums}
      </g>
    </g>
  );
}

// דגם ב׳ — עדין: שנתות כל מעלה, סקאלה כפולה (פנימית אפורה) וסרגל מ״מ על הבסיס
function ProtractorFine({ cx, cy }: { cx: number; cy: number }) {
  const R = 290;
  const ticks: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 1) {
    const r2 = a % 10 === 0 ? 262 : a % 5 === 0 ? 274 : 282;
    const [x1, y1] = P(cx, cy, R, a);
    const [x2, y2] = P(cx, cy, r2, a);
    ticks.push(
      <line key={`t${a}`} x1={F(x1)} y1={F(y1)} x2={F(x2)} y2={F(y2)} strokeWidth={a % 10 === 0 ? 1.8 : a % 5 === 0 ? 1.3 : 1} />
    );
  }
  const nums: ReactNode[] = [];
  for (let a = 0; a <= 180; a += 10) {
    const [xo, yo] = P(cx, cy, 240, a);
    nums.push(
      <text key={`o${a}`} x={F(xo)} y={F(yo)} transform={`rotate(${90 - a} ${F(xo)} ${F(yo)})`} fontSize={22} fontWeight={700} fill={INK}>
        {a}
      </text>
    );
    if (a >= 10 && a <= 170) {
      const [xi, yi] = P(cx, cy, 212, a);
      nums.push(
        <text key={`i${a}`} x={F(xi)} y={F(yi)} transform={`rotate(${90 - a} ${F(xi)} ${F(yi)})`} fontSize={19} fontWeight={500} fill={GRAY}>
          {180 - a}
        </text>
      );
    }
  }
  // סרגל מ״מ על הבסיס: 100 מ״מ ברוחב 500 (5px למ״מ), ממורכז
  const ruler: ReactNode[] = [];
  for (let mm = 0; mm <= 100; mm += 1) {
    const x = cx - 250 + mm * 5;
    const len = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 7;
    ruler.push(<line key={`r${mm}`} x1={x} y1={cy} x2={x} y2={cy + len} strokeWidth={mm % 10 === 0 ? 1.4 : 0.9} />);
    if (mm % 10 === 0) {
      ruler.push(
        <text key={`rn${mm}`} x={x} y={cy + 27} fontSize={13.5} fontWeight={600} fill={INK} stroke="none" textAnchor="middle" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {mm}
        </text>
      );
    }
  }
  return (
    <g stroke={INK} fill="none">
      <path
        d={`M ${cx - 306} ${cy + 34} L ${cx - 306} ${cy} L ${cx - 290} ${cy} A 290 290 0 0 1 ${cx + 290} ${cy} L ${cx + 306} ${cy} L ${cx + 306} ${cy + 34} Z`}
        strokeWidth={3}
      />
      <line x1={cx - 290} y1={cy} x2={cx + 290} y2={cy} strokeWidth={2} />
      <path d={semiArc(cx, cy, 150)} strokeWidth={2} />
      {/* סימון מרכז — צלב עדין מעל נקודת האמצע של הבסיס (כמו במקור) */}
      <line x1={cx} y1={cy - 16} x2={cx} y2={cy - 2} strokeWidth={1.6} />
      <line x1={cx - 7} y1={cy - 9} x2={cx + 7} y2={cy - 9} strokeWidth={1.6} />
      {ticks}
      {ruler}
      <g stroke="none" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {nums}
      </g>
    </g>
  );
}

export function AidProtractors() {
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="שני מדי זווית להדפסה על שקף">
        <ProtractorClassic cx={350} cy={330} />
        <ProtractorFine cx={350} cy={700} />
      </svg>
    </div>
  );
}

/* ============ דף 5 — מעגל ליצירת זווית (שני עיגולים לגזירה) ============ */
export function AidAngleCircles() {
  const circle = (cy: number, key: string) => {
    const [x, y] = P(350, cy, 216, 218); // חריץ הגזירה — רדיוס אחד כלפי מטה-שמאל
    return (
      <g key={key} stroke={INK} fill="none">
        <circle cx={350} cy={cy} r={216} strokeWidth={2} />
        <line x1={350} y1={cy} x2={F(x)} y2={F(y)} strokeWidth={2.5} />
        <circle cx={350} cy={cy} r={7} fill={INK} stroke="none" />
      </g>
    );
  };
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="שני עיגולים עם חריץ רדיוס ליצירת זווית">
        {circle(248, "a")}
        {circle(718, "b")}
      </svg>
    </div>
  );
}

/* ============ דף 6 — משולשים קהיי זווית (ארבעה, למדידה) ============ */
export function AidObtuseTriangles() {
  const tris = [
    "300,90 560,75 660,240",
    "210,265 400,370 45,490",
    "340,480 600,645 690,775",
    "285,660 440,645 115,905",
  ];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ארבעה משולשים קהי-זווית">
        <g stroke={INK} strokeWidth={3.5} fill="none" strokeLinejoin="miter">
          {tris.map((p) => (
            <polygon key={p} points={p} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ============ דף 7 — קרניים לזוויות במערכת הצירים ============ */
export function AidRays() {
  const segYs = [100, 180, 260, 340, 420];
  const rayYs = [570, 650, 730, 810, 890];
  return (
    <div className="aid-fig">
      <svg viewBox="0 0 700 970" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="חמישה קטעים וחמש קרניים עם ראשי חץ">
        <g stroke={INK} strokeWidth={5} fill="none">
          {segYs.map((y) => (
            <line key={`s${y}`} x1={55} y1={y} x2={645} y2={y} />
          ))}
          {rayYs.map((y) => (
            <line key={`r${y}`} x1={55} y1={y} x2={606} y2={y} />
          ))}
        </g>
        <g fill={INK} stroke="none">
          {rayYs.map((y) => (
            <polygon key={`a${y}`} points={`645,${y} 600,${y - 13} 600,${y + 13}`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ============ דפים 8–9 — רביע ראשון של מערכת הצירים ============
   נבנה מחדש (לבקשת יניב, 2026-07): הגרפיקה הקודמת הצמידה את המספרים לצירים
   (שורת ה-x במרחק ~10px מקצה ציר בעובי 6). העקרונות של הגרסה החדשה:
   • רשת 13×13 בתא 40px — מרווחים שווים מחושבים בלולאה, יישור מושלם מובנה.
   • צירים בעובי 4.5 (מאוזן מול המספרים), נמשכים סימטרית מעבר לרשת עד בסיס
     חיצים משולשים מדויקים (26×30).
   • מרווח נשימה קבוע וברור בין כל מספר לציר שלו (אין מספר נוגע/נחתך):
     מספרי ה-x במרחק 30px מתחת לציר, מספרי ה-y במרחק 20px משמאלו, ו-"0"
     בראשית — באותה טיפוגרפיה (Rubik 22/600) על שני הצירים.
   • שוליים בטוחים ב-viewBox — חד במסך, בהדפסה ובהגדלה (וקטורי טהור). */
function Quadrant({ numbers }: { numbers: boolean }) {
  const N = 13; // תאים בכל כיוון
  const cell = 40;
  const ox = 92; // ראשית הצירים
  const oy = 668;
  const gx = ox + N * cell; // 612 — קצה הרשת ימינה
  const gy = oy - N * cell; // 148 — קצה הרשת למעלה
  const NUM_GAP_X = 30; // מרחק שורת מספרי ציר-x מתחת לציר
  const NUM_GAP_Y = 20; // מרחק מספרי ציר-y משמאל לציר

  const lines: ReactNode[] = [];
  for (let k = 1; k <= N; k++) {
    lines.push(<line key={`v${k}`} x1={ox + k * cell} y1={gy} x2={ox + k * cell} y2={oy} />);
    lines.push(<line key={`h${k}`} x1={ox} y1={oy - k * cell} x2={gx} y2={oy - k * cell} />);
  }
  const nums: ReactNode[] = [];
  if (numbers) {
    for (let k = 1; k <= N; k++) {
      nums.push(
        <text key={`x${k}`} x={ox + k * cell} y={oy + NUM_GAP_X} textAnchor="middle" dominantBaseline="hanging">
          {k}
        </text>
      );
      nums.push(
        <text key={`y${k}`} x={ox - NUM_GAP_Y} y={oy - k * cell} textAnchor="end" dominantBaseline="central">
          {k}
        </text>
      );
    }
    nums.push(
      <text key="o" x={ox - NUM_GAP_Y} y={oy + NUM_GAP_X} textAnchor="end" dominantBaseline="hanging">
        0
      </text>
    );
  }
  return (
    <svg viewBox="0 0 700 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={numbers ? "רביע ראשון עם מספרים" : "רביע ראשון ללא מספרים"}>
      <g stroke={GRID} strokeWidth={1.4} fill="none">
        {lines}
      </g>
      <g stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round">
        <line x1={ox - 14} y1={oy} x2={gx + 34} y2={oy} />
        <line x1={ox} y1={oy + 14} x2={ox} y2={gy - 34} />
      </g>
      <g fill={INK} stroke="none">
        <polygon points={`${gx + 62},${oy} ${gx + 32},${oy - 13} ${gx + 32},${oy + 13}`} />
        <polygon points={`${ox},${gy - 62} ${ox - 13},${gy - 32} ${ox + 13},${gy - 32}`} />
        <circle cx={ox} cy={oy} r={6} />
      </g>
      {numbers ? (
        // direction:ltr חובה: בהקשר dir=rtl של הדף textAnchor="end" מתהפך,
        // והמספרים הדו-ספרתיים (10–13) גולשים ימינה אל תוך הציר — הבאג
        // שבגללו נגעו המספרים בצירים בגרסה הקודמת.
        <g fill={INK} stroke="none" fontSize={22} fontWeight={600} style={{ fontFamily: "var(--font-rubik), sans-serif", direction: "ltr" }}>
          {nums}
        </g>
      ) : null}
    </svg>
  );
}

export function AidQuadrantBlank() {
  return (
    <div className="aid-fig">
      <Quadrant numbers={false} />
    </div>
  );
}

export function AidQuadrantNumbers() {
  return (
    <div className="aid-fig">
      <Quadrant numbers={true} />
    </div>
  );
}
