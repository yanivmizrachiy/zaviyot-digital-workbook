import type { CSSProperties } from "react";
import { TOC_GROUPS } from "./registry";
import { tocColor, tocInkOn } from "./tocPalette";

// עמוד תוכן העניינים של החוברת — לחיץ: לחיצה על שורה מדפדפת מיד לעמוד המבוקש.
// הפרקים מקובצים לשערים (WS_GROUPS שב-registry) עם כותרת שער אחידה (ws-tocgroup),
// והמספור הגלובלי (01…) רץ ברצף על פני כל השערים. הצבעוניות לפי פלטת
// "נועזת וקונטרסטית" של יניב (tocPalette): לכל פרק גוון משלו — תג מספר מלא,
// מספר עמוד וחץ באותו גוון. אותו עמוד משמש גם את הקורא (/worksheets/[n]) וגם
// את ההדפסה.

const INK = "#29292d";
const MUTED = "#6d6962";

const badgeStyle = (color: string): CSSProperties => ({
  flex: "none",
  width: 56,
  height: 56,
  borderRadius: 15,
  background: color,
  color: tocInkOn(color),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-rubik), sans-serif",
  fontWeight: 800,
  fontSize: 24,
  direction: "ltr",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.16)",
});

export function BookletTocSheet({
  onJump,
  hrefFor,
}: {
  onJump?: (page1Based: number) => void;
  // מצב הדפסה/PDF: מרנדר עוגן <a href> במקום כפתור — נשמר כקישור פנימי לחיץ ב-PDF.
  hrefFor?: (page1Based: number) => string;
}) {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">תוכן העניינים</h1>
        <p className="ws-subtitle">לחצו על פרק כדי לעבור אליו · הוראת זוויות בכיתה ז׳</p>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      {/* ניצול מלא של שטח העמוד: כל שער תופס נתח יחסי למספר פרקיו, וכל שורה
          נמתחת (flex: 1) כך שהשורות מתחלקות שווה על כל גובה ה-A4 — בלי שטח מת. */}
      <div className="ws-body" style={{ justifyContent: "space-between", gap: 20 }}>
        {TOC_GROUPS.map((group) => (
          <section key={group.title} style={{ display: "flex", flexDirection: "column", gap: 10, flex: group.entries.length, minHeight: 0 }}>
            <h2 className="ws-tocgroup" style={{ fontSize: 17.5 }}>{group.title}</h2>
            {group.entries.map((e) => {
              const color = tocColor(e.ordinal - 1);
              const rowStyle: CSSProperties = {
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                gap: 18,
                width: "100%",
                textAlign: "start",
                padding: "12px 20px",
                borderRadius: 16,
                border: "1px solid rgba(17, 32, 60, 0.1)",
                borderInlineStart: `6px solid ${color}`,
                background: "#fff",
                cursor: "pointer",
                font: "inherit",
                textDecoration: "none",
                transition: "transform .16s ease, box-shadow .2s ease",
              };
              const inner = (
                <>
                  <span style={badgeStyle(color)}>{String(e.ordinal).padStart(2, "0")}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-rubik), sans-serif", fontWeight: 800, fontSize: 23, color: INK, lineHeight: 1.25 }}>
                      {e.label}
                    </span>
                    <span style={{ display: "block", fontFamily: "var(--font-assistant), sans-serif", fontWeight: 500, fontSize: 17, color: MUTED, marginTop: 4 }}>
                      {e.sub}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      fontFamily: "var(--font-rubik), sans-serif",
                      fontWeight: 700,
                      fontSize: 19,
                      color: color === "#FFD60A" ? "#b89600" : color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    עמ׳ {e.page}
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </span>
                </>
              );
              return hrefFor ? (
                <a key={e.ordinal} href={hrefFor(e.page)} className="toc-row" style={rowStyle}>
                  {inner}
                </a>
              ) : (
                <button key={e.ordinal} type="button" onClick={() => onJump?.(e.page)} className="toc-row" style={rowStyle}>
                  {inner}
                </button>
              );
            })}
          </section>
        ))}
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
