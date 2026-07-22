import type { Metadata } from "next";
import { WsBookletAllBar } from "@/components/worksheets/WsBookletAllBar";
import { WORKSHEETS, WORKSHEETS_TOTAL, WS_PAGES } from "@/components/worksheets/registry";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";

export const metadata: Metadata = {
  title: "חוברת דפי עבודה — זוויות",
  description: "חוברת דיגיטלית בעברית הכוללת את כל דפי העבודה בנושא זוויות, לצפייה, דפדוף והדפסה.",
};

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61562668603240";
const INSTAGRAM_URL = "https://www.instagram.com/yani__raz";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ bw?: string; print?: string }>;
}) {
  const sp = await searchParams;
  const bw = sp.bw === "1";

  return (
    <main className="ws-page" dir="rtl">
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

      <section
        aria-labelledby="follow-title"
        style={{
          width: "min(760px, calc(100% - 32px))",
          margin: "42px auto 64px",
          padding: "clamp(28px, 6vw, 48px)",
          borderRadius: "28px",
          textAlign: "center",
          color: "#fff",
          background: "linear-gradient(145deg, #17376f, #091a3e)",
          boxShadow: "0 22px 60px rgba(5, 18, 48, 0.28)",
        }}
      >
        <h2 id="follow-title" style={{ margin: 0, fontSize: "clamp(1.7rem, 5vw, 2.8rem)" }}>
          לדפי עבודה נוספים
        </h2>
        <p style={{ margin: "14px 0 26px", fontSize: "clamp(1rem, 3vw, 1.25rem)" }}>
          תעקבו אחריי באינסטגרם ובפייסבוק
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="פתיחת דף הפייסבוק"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minWidth: "150px",
              minHeight: "54px",
              padding: "10px 20px",
              borderRadius: "16px",
              background: "#fff",
              color: "#17376f",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="27" height="27" fill="currentColor">
              <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
            </svg>
            פייסבוק
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="פתיחת עמוד האינסטגרם"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minWidth: "150px",
              minHeight: "54px",
              padding: "10px 20px",
              borderRadius: "16px",
              background: "#fff",
              color: "#17376f",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            אינסטגרם
          </a>
        </div>
      </section>
    </main>
  );
}
