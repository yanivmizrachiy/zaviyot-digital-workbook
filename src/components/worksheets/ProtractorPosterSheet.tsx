// פוסטר — "כיצד להשתמש במד זווית" (מקור: עיצוב Canva DAHPn7_umZ8 של יניב).
// שוחזר אחד-לאחד בשפת העיצוב של החוברת (ws-sheet), כמו "זוויות ישרות, חדות
// וקהות": הכותרת, כותרת המשנה, ארבעת השלבים — מילה במילה; האיור המרכזי הוא
// מד-זווית וקטורי מדויק (שנתות אמת של °1/°5/°10, שני קני-מידה 0–180 בשני
// הכיוונים) עם הדגמת מדידה חיה — קרן ב-°50 שנקראת °50 בקנה הפנימי ו-°130
// בקנה החיצוני, בדיוק כמו בפוסטר המקורי. בלי תמונות צרובות ובלי סימני מים —
// SVG חד בכל זום, בהדפסה וב-PDF.
//
// כפתורי הפעולה (הורדה מיידית של ה-PDF, תצוגה מלאה, הדפסה) חיים בעמוד עצמו —
// תוכן העניינים מפנה ישירות לעמוד הזה — ומוסתרים בהדפסה/ב-PDF (ws-noprint
// מקומי), כך שקובץ הפוסטר שיורד נשאר נקי.
import { WS_PAGES } from "./registry";

const FONT_R = "var(--font-rubik), sans-serif";
const FONT_A = "var(--font-assistant), sans-serif";
const INK = "var(--wsink)";
const SOFT = "var(--wssoft)";
const TEAL = "var(--wsteal)";
const GOLD = "var(--wsgold)";

// קובץ ההורדה המיידית (נוצר מעמוד זה ומקומט ל-public/booklet).
export const POSTER_PDF_URL = "/booklet/poster-mad-zavit.pdf";
export const POSTER_PDF_DOWNLOAD_NAME = "פוסטר — כיצד להשתמש במד זווית.pdf";

// מיקום העמוד בחוברת — נגזר מהרישום (לא קשיח), לקישורי תצוגה מלאה/הדפסה.
const POSTER_SLOT =
  WS_PAGES.findIndex((p) => p.kind === "content" && p.content === "protractor-poster") + 1;

// נקודה על מעגל: deg נגד כיוון השעון מציר ה-x החיובי (מסך: y הפוך)
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
const f = (v: number) => Math.round(v * 100) / 100;

// ── גאומטריית מד-הזווית ──
const CX = 360;
const CY = 332;
const R = 292; // רדיוס השפה החיצונית
const MEASURED = 50; // הזווית המודגמת: °50 פנימי / °130 חיצוני

// שנתות: כל °1 קצרה, כל °5 בינונית, כל °10 ארוכה — מדידה אמיתית, לא קישוט.
const TICKS = Array.from({ length: 181 }, (_, deg) => {
  const len = deg % 10 === 0 ? 24 : deg % 5 === 0 ? 16 : 9;
  const [x1, y1] = pt(CX, CY, R, deg);
  const [x2, y2] = pt(CX, CY, R - len, deg);
  return { deg, x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), major: deg % 10 === 0 };
});

// תוויות שני קני-המידה (°10–°170): חיצוני = 180 פחות הזווית, פנימי = הזווית.
const LABELS = Array.from({ length: 17 }, (_, i) => {
  const deg = (i + 1) * 10;
  const [ox, oy] = pt(CX, CY, R - 46, deg);
  const [ix, iy] = pt(CX, CY, R - 76, deg);
  return {
    deg,
    outer: 180 - deg,
    inner: deg,
    ox: f(ox), oy: f(oy), ix: f(ix), iy: f(iy),
    rot: f(90 - deg), // התווית מיושרת רדיאלית, כמו במד-זווית אמיתי
  };
});

const [rayX, rayY] = pt(CX, CY, R + 34, MEASURED);
const arcStart = pt(CX, CY, 46, 0);
const arcEnd = pt(CX, CY, 46, MEASURED);
const tag50 = pt(CX, CY, R + 56, 38);
const tag130 = pt(CX, CY, R + 52, 141);
const arrow50 = { from: pt(CX, CY, R + 34, 43), to: pt(CX, CY, R + 4, MEASURED) };
const arrow130 = { from: pt(CX, CY, R + 30, 137), to: pt(CX, CY, R + 2, 130) };

function ProtractorFigure() {
  return (
    <svg
      viewBox="0 0 720 372"
      style={{ width: "100%", maxWidth: 640, height: "auto", display: "block", direction: "ltr" }}
      role="img"
      aria-label={`מד זווית שמודדת קרן בזווית של ${MEASURED} מעלות: בקנה המידה הפנימי קוראים 50 מעלות, ובקנה המידה החיצוני 130 מעלות`}
    >
      <defs>
        <marker id="pp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={TEAL} />
        </marker>
        <marker id="pp-arrow-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={INK} />
        </marker>
      </defs>

      {/* גוף מד-הזווית: חצי-דיסקה שקופה-בהירה עם שפה */}
      <path
        d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} Z`}
        fill="var(--wsgreen)"
        stroke="var(--wsgreenline)"
        strokeWidth={2.5}
      />
      {/* חלון המרכז של מד-הזווית */}
      <path
        d={`M ${CX - 60} ${CY} A 60 60 0 0 1 ${CX + 60} ${CY} Z`}
        fill="#fff"
        stroke="var(--wsgreenline)"
        strokeWidth={1.6}
      />

      {/* שנתות */}
      {TICKS.map((t) => (
        <line
          key={t.deg}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major ? INK : SOFT}
          strokeWidth={t.major ? 1.7 : 0.8}
        />
      ))}

      {/* שני קני-המידה */}
      {LABELS.map((l) => (
        <g key={l.deg}>
          <text
            x={l.ox} y={l.oy}
            transform={`rotate(${l.rot} ${l.ox} ${l.oy})`}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily={FONT_R} fontWeight={700} fontSize={15.5} fill={INK}
          >
            {l.outer}
          </text>
          <text
            x={l.ix} y={l.iy}
            transform={`rotate(${l.rot} ${l.ix} ${l.iy})`}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily={FONT_R} fontWeight={600} fontSize={12} fill={SOFT}
          >
            {l.inner}
          </text>
        </g>
      ))}

      {/* קו הבסיס — עובר דרך נקודת המרכז לשני הכיוונים */}
      <line x1={16} y1={CY} x2={704} y2={CY} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />

      {/* הקרן הנמדדת — °50 */}
      <line
        x1={CX} y1={CY} x2={f(rayX)} y2={f(rayY)}
        stroke={INK} strokeWidth={3.4} strokeLinecap="round" markerEnd="url(#pp-arrow-ink)"
      />
      {/* קשת הזווית + קודקוד */}
      <path
        d={`M ${f(arcStart[0])} ${f(arcStart[1])} A 46 46 0 0 0 ${f(arcEnd[0])} ${f(arcEnd[1])}`}
        fill="none" stroke={TEAL} strokeWidth={3}
      />
      <circle cx={CX} cy={CY} r={6} fill={GOLD} stroke="#fff" strokeWidth={1.6} />

      {/* תגית °50 (הקנה הפנימי) + חץ אל הקריאה על השפה */}
      <path
        d={`M ${f(arrow50.from[0])} ${f(arrow50.from[1])} Q ${f((arrow50.from[0] + arrow50.to[0]) / 2 + 14)} ${f((arrow50.from[1] + arrow50.to[1]) / 2 - 10)} ${f(arrow50.to[0])} ${f(arrow50.to[1])}`}
        fill="none" stroke={TEAL} strokeWidth={2.4} markerEnd="url(#pp-arrow)"
      />
      <g transform={`translate(${f(tag50[0])} ${f(tag50[1])}) rotate(-14)`}>
        <rect x={-38} y={-21} width={76} height={42} rx={12} fill={GOLD} />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT_R} fontWeight={800} fontSize={23} fill="#fff">
          50°
        </text>
      </g>

      {/* תגית °130 (הקנה החיצוני) + חץ אל הקריאה על השפה */}
      <path
        d={`M ${f(arrow130.from[0])} ${f(arrow130.from[1])} Q ${f((arrow130.from[0] + arrow130.to[0]) / 2 - 14)} ${f((arrow130.from[1] + arrow130.to[1]) / 2 - 10)} ${f(arrow130.to[0])} ${f(arrow130.to[1])}`}
        fill="none" stroke={TEAL} strokeWidth={2.4} markerEnd="url(#pp-arrow)"
      />
      <g transform={`translate(${f(tag130[0])} ${f(tag130[1])}) rotate(12)`}>
        <rect x={-44} y={-21} width={88} height={42} rx={12} fill="var(--wsred)" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT_R} fontWeight={800} fontSize={23} fill="#fff">
          130°
        </text>
      </g>
    </svg>
  );
}

// ארבעת השלבים — מילה במילה מהפוסטר המקורי.
const STEPS = [
  "מקם את נקודת המרכז של מד הזווית מעל קודקוד הזווית",
  "יישרו את קו הבסיס של מד הזווית עם הקו התחתון של הזווית",
  "זהה את האפס על מד הזווית והשתמש בקנה מידה זה",
  "קרא את הזווית בזהירות",
];

const BTN_BASE = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "12px 26px",
  borderRadius: 13,
  fontFamily: FONT_R,
  fontWeight: 700 as const,
  fontSize: 17,
  textDecoration: "none",
  lineHeight: 1,
} as const;

export function ProtractorPosterSheet() {
  const readerHref = `/worksheets/${POSTER_SLOT}`;
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">פוסטר — כיצד להשתמש במד זווית</h1>
        <p className="ws-subtitle">מד זווית משמש למדידת גודל של זוויות</p>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body" style={{ alignItems: "center", justifyContent: "space-evenly", gap: 14 }}>
        <ProtractorFigure />

        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 9, maxWidth: "44rem" }}>
          {STEPS.map((step, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 30, height: 30, borderRadius: "50%", flex: "0 0 auto",
                  background: TEAL, color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_R, fontWeight: 800, fontSize: 16,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontFamily: FONT_A, fontWeight: 600, fontSize: 19.5, lineHeight: 1.45, color: INK }}>
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* כפתורי הפעולה — הורדה מיידית, תצוגה מלאה והדפסה. data-noprint =
            מוסתרים בהדפסה וב-PDF, כך שקובץ הפוסטר שיורד נשאר נקי. */}
        <div data-noprint style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <a href={POSTER_PDF_URL} download={POSTER_PDF_DOWNLOAD_NAME} style={{ ...BTN_BASE, background: TEAL, color: "#fff" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
            </svg>
            הורדת הפוסטר (PDF)
          </a>
          <a href={readerHref} target="_blank" rel="noopener noreferrer" style={{ ...BTN_BASE, background: "#fff", color: TEAL, border: "2px solid var(--wsteal)" }}>
            תצוגה מלאה
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <a href={`${readerHref}?print=1`} target="_blank" rel="noopener noreferrer" style={{ ...BTN_BASE, background: "#fff", color: INK, border: "2px solid var(--wsborder)" }}>
            הדפסה
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-3h12v6H6z" />
            </svg>
          </a>
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
