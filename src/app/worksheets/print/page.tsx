import type { Metadata } from "next";
import { WS_PAGES, WS_TOTAL } from "@/components/worksheets/registry";
import { PrintAutoTrigger } from "@/components/worksheets/PrintAutoTrigger";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";

export const metadata: Metadata = {
  title: "הוראת זוויות בכיתה ז׳ — החוברת המלאה (הדפסה / PDF)",
  robots: { index: false },
};

function parsePages(raw?: string) {
  if (!raw || raw === "all") return Array.from({ length: WS_TOTAL }, (_, i) => i + 1);
  const pages = new Set<number>();
  for (const tokenRaw of raw.split(",")) {
    const token = tokenRaw.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const a = Math.max(1, Math.min(WS_TOTAL, Number(range[1])));
      const b = Math.max(1, Math.min(WS_TOTAL, Number(range[2])));
      for (let n = Math.min(a, b); n <= Math.max(a, b); n++) pages.add(n);
      continue;
    }
    const n = Number(token);
    if (Number.isInteger(n) && n >= 1 && n <= WS_TOTAL) pages.add(n);
  }
  return pages.size ? [...pages].sort((a, b) => a - b) : Array.from({ length: WS_TOTAL }, (_, i) => i + 1);
}

export default async function BookletPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ print?: string; pages?: string }>;
}) {
  const sp = await searchParams;
  const pages = parsePages(sp.pages);

  return (
    <div className="bkprint">
      {sp.print === "1" && <PrintAutoTrigger />}
      {pages.map((n) => {
        const page = WS_PAGES[n - 1];
        const node = worksheetContentNode(page, {
          slot: n,
          presentation: "link",
          tocHrefFor: (p) => `#bk-page-${p}`,
        });
        return (
          <section className="bkprint__page" id={`bk-page-${n}`} key={n}>
            {page.kind === "cover" ? (
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
