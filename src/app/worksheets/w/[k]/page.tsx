// קורא דף-עבודה בודד לפי המספור הרץ (דף עבודה 1..N) — A4 אמיתי, ממורכז.
// ?bw=1 — תצוגת/הדפסת שחור-לבן ייעודית (משתני --ws* מוחלפים לדיו כהה, תמונות
// עוברות grayscale); ?print=1 פותח מיד את חלון ההדפסה (הורדה כ-PDF / הדפסה).
// הרינדור עצמו מגיע מאותו renderer משותף של החוברת (WorksheetPageRenderer),
// כך שהדף זהה אחד-לאחד לעמוד בחוברת; נוסף רק תג "דף עבודה N" עדין בפינה —
// גלוי גם בהדפסה, במקום שאינו מסתיר תוכן.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WsWorksheetBar } from "@/components/worksheets/WsWorksheetBar";
import { WORKSHEETS, WORKSHEETS_TOTAL, WS_PAGES } from "@/components/worksheets/registry";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";

export const metadata: Metadata = {
  title: "דף עבודה — הוראת זוויות בכיתה ז׳",
  robots: { index: false },
};

export default async function WorksheetByNumberPage({
  params,
  searchParams,
}: {
  params: Promise<{ k: string }>;
  searchParams: Promise<{ bw?: string; print?: string }>;
}) {
  const { k: kRaw } = await params;
  const sp = await searchParams;
  const k = Number(kRaw);
  if (!Number.isInteger(k) || k < 1 || k > WORKSHEETS_TOTAL) notFound();

  const ws = WORKSHEETS[k - 1];
  const page = WS_PAGES[ws.slot - 1];
  const bw = sp.bw === "1";
  const node = worksheetContentNode(page, {
    slot: ws.slot,
    presentation: "embed",
    tocHrefFor: (p) => `/worksheets/${p}`,
  });

  return (
    <div className="ws-page">
      <WsWorksheetBar num={k} total={WORKSHEETS_TOTAL} title={ws.title} bw={bw} autoPrint={sp.print === "1"} />
      <div className={`ws-page__sheets${bw ? " ws-bw" : ""}`}>
        <div className="ws-wsframe">
          {page.kind === "image" ? <div className="ws-imgpage">{node}</div> : node}
          <span className="ws-wsnum">{`דף עבודה ${k}`}</span>
        </div>
      </div>
    </div>
  );
}
