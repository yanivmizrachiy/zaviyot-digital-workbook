// מצב קריאה לדף בודד בחוברת — A4 אמיתי, ממורכז.
// ?embed=1 מסיר את סרגל הדף כדי שהעמוד יוכל להיטען בתוך מנוע הספר.
// ?print=1 פותח את חלון ההדפסה לעמוד הבודד.
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
  searchParams: Promise<{ print?: string; embed?: string }>;
}) {
  const { n: nRaw } = await params;
  const sp = await searchParams;
  const n = Number(nRaw);
  if (!Number.isInteger(n) || n < 1 || n > WS_TOTAL) notFound();

  const page = WS_PAGES[n - 1];
  const embedded = sp.embed === "1";
  const node = worksheetContentNode(page, {
    slot: n,
    presentation: "embed",
    tocHrefFor: (p) => embedded ? `/worksheets/${p}?embed=1` : `/worksheets/${p}`,
  });

  return (
    <div className={`ws-page${embedded ? " ws-page--embed" : ""}`}>
      {!embedded && (
        <WsReaderBar n={n} total={WS_TOTAL} autoPrint={isPrintablePage(page) && sp.print === "1"} />
      )}
      <div className="ws-page__sheets">
        {page.kind === "presentation" ? (
          <div style={{ width: "min(1280px, 96vw)", margin: "0 auto" }}>{node}</div>
        ) : page.kind === "image" ? (
          <div
            className="ws-imgsheet"
            style={{ width: "210mm", height: "297mm", background: "#fff", boxShadow: embedded ? "none" : "0 10px 40px rgba(15,23,42,.14)" }}
          >
            {node}
          </div>
        ) : page.kind === "cover" ? (
          <div
            style={{ width: "210mm", height: "297mm", overflow: "hidden", background: "#fff", boxShadow: embedded ? "none" : "0 10px 40px rgba(15,23,42,.14)" }}
          >
            {node}
          </div>
        ) : (
          node
        )}
      </div>
    </div>
  );
}
