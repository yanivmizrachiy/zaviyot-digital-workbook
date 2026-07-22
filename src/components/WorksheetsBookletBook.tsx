import { SectionHead } from "./SectionHead";
import { FlipbookViewer } from "./flipbook/FlipbookViewer";

// החוברת הדיגיטלית של הזוויות — חוויית חוברת דפדוף יוקרתית ("הגאומטריה של
// היוקרה"): במה קולנועית כהה, כריכה קשה, דפדוף תלת-ממדי אמיתי בסדר עברי,
// שני עמודים במחשב ועמוד יחיד בנייד. כל התוכן מגיע מאותו רישום (WS_PAGES)
// ומאותו renderer משותף כמו הקורא (/worksheets/[n]) וההדפסה (/worksheets/print),
// כך ששום עמוד, קישור או פונקציה לא השתנו — רק חוויית הדפדוף.
export function WorksheetsBookletBook() {
  return (
    <section className="section" id="worksheets">
      {/* מכל מורחב לחוברת בלבד — הדפים מנצלים גם מסכים רחבים, בלי לשנות את
          רוחב שאר המקטעים באתר */}
      <div className="container container--book">
        <SectionHead eyebrow="החוברת הדיגיטלית" title="הוראת זוויות בכיתה ז׳" />
        <FlipbookViewer />
      </div>
    </section>
  );
}
