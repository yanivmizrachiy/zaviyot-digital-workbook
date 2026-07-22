// חוברת כל דפי העבודה — כל N דפי העבודה הממוספרים (WORKSHEETS, מקור-אמת אחד)
// ברצף אחד לצפייה ולהדפסה/הורדה כ-PDF: כל דף בעמוד A4 משלו עם תג "דף עבודה k".
// ?bw=1 — תצוגת/הדפסת שחור-לבן (החלפת משתני ‎--ws*‎ + grayscale לתמונות);
// ?print=1 פותח מיד את חלון ההדפסה. דפי התוכן מודפסים וקטוריים (חדים בכל
// רזולוציה), עמודי הסריקה מודפסים כתמונה במלוא הרוחב.
import type { Metadata } from "next";
import { WsBookletAllBar } from "@/components/worksheets/WsBookletAllBar";
import { WORKSHEETS, WORKSHEETS_TOTAL, WS_PAGES } from "@/components/worksheets/registry";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";

export const metadata: Metadata = {
  title: "חוברת דפי העבודה — הוראת זוויות בכיתה ז׳",
  robots: { index: false },
};

export default async function WorksheetsBookletPage({
  searchParams,
}: {
  searchParams: Promise<{ bw?: string; print?: string }>;
}) {
  const sp = await searchParams;
  const bw = sp.bw === "1";

  return (
    <div className="ws-page">
      <WsBookletAllBar total={WORKSHEETS_TOTAL} bw={bw} autoPrint={sp.print === "1"} />
      <div className={`ws-page__sheets${bw ? " ws-bw" : ""}`}>
        {WORKSHEETS.map((w) => {
          const page = WS_PAGES[w.slot - 1];
          const node = worksheetContentNode(page, {
            slot: w.slot,
            presentation: "embed",
            tocHrefFor: (p) => `/worksheets/${p}`,
          });
          return (
            <div key={w.num} className="ws-wsframe">
              {page.kind === "image" ? <div className="ws-imgpage">{node}</div> : node}
              <span className="ws-wsnum">{`דף עבודה ${w.num}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
