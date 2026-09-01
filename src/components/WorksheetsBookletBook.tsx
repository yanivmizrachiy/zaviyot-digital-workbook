import { SectionHead } from "./SectionHead";
import { RazPagesZaviyotReader } from "./reader/RazPagesZaviyotReader";

// מנוע הספר החדש מחליף רק את תצוגת החוברת. התוכן עצמו נשאר קנוני ב-WS_PAGES,
// ולכן גם הספר וגם אזור "דפי עבודה" ממשיכים להיגזר מאותו מקור אמת.
export function WorksheetsBookletBook() {
  return (
    <section className="section" id="worksheets">
      <div className="container container--book">
        <SectionHead eyebrow="החוברת הדיגיטלית" title="הוראת זוויות בכיתה ז׳" />
        <RazPagesZaviyotReader />
      </div>
    </section>
  );
}
