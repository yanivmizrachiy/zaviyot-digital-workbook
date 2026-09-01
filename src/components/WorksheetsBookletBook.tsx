import { SectionHead } from "./SectionHead";
import { Book95Viewer } from "./book95/Book95Viewer";

// החוברת הדיגיטלית של הזוויות: זהו המקטע היחיד שהוחלף בשדרוג הנוכחי.
// 95 דפי המקור נטענים לקריאה בלבד דרך proxy מקומי; כל יתר חלקי האתר נשארים ללא שינוי.
export function WorksheetsBookletBook() {
  return (
    <section className="section" id="worksheets">
      <div className="container container--book">
        <SectionHead eyebrow="החוברת הדיגיטלית" title="הוראת זוויות בכיתה ז׳" />
        <Book95Viewer />
      </div>
    </section>
  );
}
