import type { ReactNode } from "react";

// שני עמודי "קישור ליישומונים" בחוברת — זוג עמודים תאומים, צמודים זה לזה, עם
// כותרת זהה (דרישת יניב, 17.7.2026), בלי כינויי א׳/ב׳ — רק שם היישומון:
//   · מד זווית לאומדן זוויות (Matific)
//   · יצירת דפי עבודה של זוויות (StoryboardThat)
// שני האתרים חוסמים iframe, לכן כל עמוד הוא כרטיס-שיגור הפותח את היישומון
// בכרטיסייה חדשה: גם האיור/התמונה וגם הכפתור לחיצים ומובילים ישירות ליישומון.
// הפריסה משותפת (AppletLinkSheet): כיתובים גדולים, איור נדיב והכפתור במרכז —
// התוכן פרוש על מלוא גובה העמוד (space-evenly), ברור וקריא.
const MATIFIC_URL =
  "https://www.matific.com/isr/he/home/maths/episode/island-expedition/?grade=grade-3";
const MAKER_URL =
  "https://www.storyboardthat.com/he/%D7%A6%D7%95%D7%A8/%D7%93%D7%A4%D7%99-%D7%A2%D7%91%D7%95%D7%93%D7%94-%D7%A9%D7%9C-%D7%96%D7%95%D7%95%D7%99%D7%95%D7%AA";

// ── מסגרת-צילום משותפת לשני היישומונים: התמונה בתוך מסגרת זהב, ומתחתיה —
// באותה מסגרת — רצועת הכוונה כהה "לחיצה על התמונה פותחת את היישומון ↗".
// כך ברור במבט אחד שהתמונה עצמה לחיצה ולאן היא מובילה. ──
function ShotFrame({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        border: "2px solid var(--wsgoldline)",
        boxShadow: "0 6px 22px rgba(17, 32, 60, 0.12)",
        lineHeight: 0,
      }}
    >
      {children}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          padding: "10px 16px",
          background: "var(--wsteal)",
          color: "#fff",
          fontFamily: "var(--font-rubik), sans-serif",
          fontWeight: 700,
          fontSize: 17,
          lineHeight: 1.2,
        }}
      >
        לחיצה על התמונה פותחת את היישומון
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </span>
  );
}

// ── תמונת היישומון של Matific: "המסע לאיים" — הנכס הרשמי מאתר Matific
// (static1.matific.com/v1/346x242/BoatAnglesBasic.png), עם שכבת "נגן" שמסמנת
// שהתמונה לחיצה ומובילה ישירות ליישומון — כמו בכרטיס המקורי באתר. ──
function MatificEpisodeArt() {
  return (
    <ShotFrame>
      <span style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
        {/* <img> ולא next/image — נכס סטטי קטן בעמוד A4 מוקטן, בלי אופטימיזציה */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/applets/matific-island-expedition.png"
          alt="שימוש במד זווית לאומדן זוויות — פעילות «המסע לאיים» מבית Matific"
          style={{ width: 430, maxWidth: "100%", height: "auto", display: "block" }}
        />
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.93)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 16px rgba(17, 32, 60, 0.3)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--wsteal)" style={{ marginInlineStart: 4 }}>
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </span>
      </span>
    </ShotFrame>
  );
}

// ── תמונת היישומון של StoryboardThat: צילום אמיתי של כותרת עמוד "דפי עבודה
// על זוויות" (נלכד ברזולוציה כפולה — 3100×372 — לחדות מלאה בעמוד ובזום).
// לחיצה על התמונה מובילה בדיוק לעמוד הזה — מה שרואים זה מה שנפתח. ──
function WorksheetMakerArt() {
  return (
    <ShotFrame>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/applets/storyboardthat-angles-worksheets.png"
        alt="«דפי עבודה על זוויות» — עמוד היישומון באתר StoryboardThat"
        style={{ width: 660, maxWidth: "100%", height: "auto", display: "block" }}
      />
    </ShotFrame>
  );
}

// ── הפריסה המשותפת: כיתובים גדולים, תוכן פרוש על מלוא העמוד ──
function AppletLinkSheet({
  subtitle,
  art,
  description,
  url,
  note,
}: {
  subtitle: string;
  art: ReactNode;
  description: string;
  url: string;
  note: string;
}) {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      {/* כותרת במבנה האחיד של עמודי הקריאה — ws-title + ws-subtitle בברירת
          המחדל, בלי הגדלות מקומיות (דרישת יניב: עיצוב אחיד במקסימום) */}
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">קישור ליישומונים</h1>
        <p className="ws-subtitle">{subtitle}</p>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body" style={{ alignItems: "center", justifyContent: "space-evenly", gap: 16 }}>
        {/* גם האיור לחיץ — לחיצה עליו מובילה מייד ליישומון, כמו הכפתור */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="פתיחת היישומון"
          style={{ display: "flex", justifyContent: "center", textDecoration: "none" }}
        >
          {art}
        </a>

        <p
          style={{
            margin: 0,
            maxWidth: "42rem",
            textAlign: "center",
            fontFamily: "var(--font-assistant), sans-serif",
            fontWeight: 600,
            fontSize: 23,
            lineHeight: 1.6,
            color: "var(--wsink)",
          }}
        >
          {description}
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 46px",
            borderRadius: 16,
            background: "var(--wsteal)",
            color: "#fff",
            fontFamily: "var(--font-rubik), sans-serif",
            fontWeight: 700,
            fontSize: 24,
            textDecoration: "none",
          }}
        >
          פתיחת היישומון
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>

        <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-assistant), sans-serif", fontWeight: 500, fontSize: 17, color: "var(--wssoft)" }}>
          {note}
        </p>
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

// עמוד "מד זווית לאומדן זוויות" (Matific)
export function AppletBookletSheet() {
  return (
    <AppletLinkSheet
      subtitle="מד זווית לאומדן זוויות · Matific"
      art={<MatificEpisodeArt />}
      description="מתרגלים אומדן זוויות ומדידה במד זווית בסביבה אינטראקטיבית וחווייתית — גשר בין האינטואיציה למדידה המדויקת."
      url={MATIFIC_URL}
      note="נפתח באתר Matific בכרטיסייה חדשה · ייתכן שתידרש התחברות לחשבון Matific."
    />
  );
}

// עמוד "יצירת דפי עבודה של זוויות" (StoryboardThat)
export function AppletMakerBookletSheet() {
  return (
    <AppletLinkSheet
      subtitle="יצירת דפי עבודה של זוויות · StoryboardThat"
      art={<WorksheetMakerArt />}
      description="יוצרים דפי עבודה חדשים של זוויות: בוחרים תבנית מוכנה, מתאימים את התרגילים לכיתה — ומדפיסים דף עבודה משלכם."
      url={MAKER_URL}
      note="נפתח באתר StoryboardThat בכרטיסייה חדשה · תבניות בעברית לעריכה ולהדפסה."
    />
  );
}
