import type { Metadata } from "next";
import { WS_PAGES } from "@/components/worksheets/registry";
import { PrintAutoTrigger } from "@/components/worksheets/PrintAutoTrigger";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";

// חוברת מלאה להדפסה / שמירה כ-PDF — כל העמודים ברצף, A4 לכל עמוד.
// הקישורים נשמרים לחיצים ב-PDF: חיצוניים (מייל/אתר/Matific) כ-<a>, ותוכן
// העניינים כעוגנים פנימיים (#bk-page-N). ?print=1 פותח מיד את חלון ההדפסה.
// המיפוי (איזה רכיב לכל עמוד) מגיע מ-WorksheetPageRenderer המשותף — המצגת
// מוצגת כעמוד-קישור (presentation: "link") כי אינה ניתנת להטמעה ב-PDF.
export const metadata: Metadata = {
  title: "הוראת זוויות בכיתה ז׳ — החוברת המלאה (הדפסה / PDF)",
  robots: { index: false },
};

export default async function BookletPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="bkprint">
      {sp.print === "1" && <PrintAutoTrigger />}
      {WS_PAGES.map((page, i) => {
        const n = i + 1;
        const node = worksheetContentNode(page, {
          slot: n,
          presentation: "link",
          tocHrefFor: (p) => `#bk-page-${p}`,
        });
        return (
          <section className="bkprint__page" id={`bk-page-${n}`} key={i}>
            {page.kind === "cover" ? (
              // עטיפת שער בהדפסה — כפי שהיה לפני איחוד ה-renderer (חיתוך overflow ורקע לבן)
              <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "#fff" }}>{node}</div>
            ) : (
              node
            )}
          </section>
        );
      })}
    </div>
  );
}
