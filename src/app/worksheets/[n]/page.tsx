// מצב קריאה לדף בודד בחוברת דפי־העבודה — A4 אמיתי, ממורכז.
// ?print=1 פותח מיד את חלון ההדפסה (הורדה כ-PDF / הדפסה) — כמו דפי המשאבים.
// כל המיפוי (איזה רכיב לכל kind/content) מגיע מ-WorksheetPageRenderer המשותף.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WsReaderBar } from "@/components/worksheets/WsReaderBar";
import { WS_TOTAL, WS_PAGES } from "@/components/worksheets/registry";
import { worksheetContentNode, isPrintablePage } from "@/components/worksheets/WorksheetPageRenderer";

export const metadata: Metadata = {
  title: "חוברת דפי העבודה — זוויות בכיתה ז׳",
  robots: { index: false },
};

export default async function WsReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { n: nRaw } = await params;
  const sp = await searchParams;
  const n = Number(nRaw);
  if (!Number.isInteger(n) || n < 1 || n > WS_TOTAL) notFound();

  const page = WS_PAGES[n - 1];
  const node = worksheetContentNode(page, {
    slot: n,
    presentation: "embed",
    tocHrefFor: (p) => `/worksheets/${p}`,
  });

  return (
    <div className="ws-page">
      <WsReaderBar n={n} total={WS_TOTAL} autoPrint={isPrintablePage(page) && sp.print === "1"} />
      <div className="ws-page__sheets">
        {page.kind === "presentation" ? (
          <div style={{ width: "min(1280px, 96vw)", margin: "0 auto" }}>{node}</div>
        ) : page.kind === "image" ? (
          <div
            className="ws-imgsheet"
            style={{ width: "210mm", height: "297mm", background: "#fff", boxShadow: "0 10px 40px rgba(15,23,42,.14)" }}
          >
            {node}
          </div>
        ) : page.kind === "cover" ? (
          // שער בקורא — מסגרת A4 עם חיתוך overflow (כמו עטיפת השער בספר/בהדפסה)
          <div
            style={{ width: "210mm", height: "297mm", overflow: "hidden", background: "#fff", boxShadow: "0 10px 40px rgba(15,23,42,.14)" }}
          >
            {node}
          </div>
        ) : (
          // toc / content — הרכיבים עצמם הם A4 מלא (ws-sheet)
          node
        )}
      </div>
    </div>
  );
}
