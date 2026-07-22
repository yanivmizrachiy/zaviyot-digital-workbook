import type { ReactNode } from "react";

// מסגרת אחידה לדפי ההמחשה — נקייה כמו דפי האביזרים במספרים מכוונים:
//   • כותרת ראשית ממורכזת בלבד — בלי לוגו ובלי מספור עמוד.
//   • קרדיט מקור עדין בתחתית (איילת קריספין) — בלי "נערך ע״י".
//   • כל דף הוא A4 אמיתי (יחס מדויק בצפייה, עמוד שלם בהדפסה).
export const AID_CREDIT_SOURCE = "הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין";

export function AidSheet({ title, children }: { n?: number; title: string; children: ReactNode }) {
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">{title}</h1>
        <div className="ws-headline" aria-hidden="true" />
      </header>

      <div className="ws-body">{children}</div>

      <footer className="ws-foot">
        <p className="ws-credit">
          <span>{AID_CREDIT_SOURCE}</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}
