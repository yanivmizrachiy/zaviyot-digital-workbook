import { ANGLE7_QUESTION_HTML, ANGLE7_SUBTITLES } from "./angle7-content";

// ארבעת דפי העבודה "זווית לכיתה ז׳" — נשאבו 1:1 מהפרויקט parabula-next של יניב
// (עמוד-268 … עמוד-271). התוכן הלימודי לא שוּנה; הדפים הותאמו לחוברת: כותרת
// בשפת ה-ws-sheet, מספור רץ של החוברת (במקום המספור המקומי 1–4 של המקור),
// ופוטר הקרדיט האחיד. העיצוב הפנימי (angle7-page) scoped ב-globals.css.

export function Angles7Sheet({ part }: { part: 1 | 2 | 3 | 4 }) {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 6, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
          <h1 className="ws-title" style={{ margin: 0, textAlign: "right" }}>זווית לכיתה ז׳</h1>
          <p className="ws-subtitle" style={{ margin: 0 }}>
            {ANGLE7_SUBTITLES[part - 1]} · דף {part} מתוך 4
          </p>
        </div>
        <div className="ws-headline" style={{ marginTop: 0 }} aria-hidden="true" />
      </header>
      <div
        className={`ws-body angle7-page angle7-page--${part}`}
        // תוכן סטטי מהפרויקט של יניב (angle7-content.ts) — לא קלט משתמש
        dangerouslySetInnerHTML={{ __html: ANGLE7_QUESTION_HTML[part - 1] }}
      />
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
