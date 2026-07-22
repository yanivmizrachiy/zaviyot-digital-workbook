// עמוד "דפי עבודה" — הרשימה המלאה והממוספרת של דפי העבודה מתוך החוברת
// הדיגיטלית, ורק הם (בלי עמודי שער, הסבר, פוסטרים או היישומון). המספור
// (דף עבודה 1..N) והסדר נגזרים אוטומטית מ-WORKSHEETS שברישום — מקור-אמת אחד.
// כל כרטיס נפתח לקורא הייעודי (/worksheets/w/[k]) עם הדפסה צבעונית ושחור-לבן.
import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionHead } from "@/components/SectionHead";
import { WORKSHEETS, WORKSHEETS_TOTAL } from "@/components/worksheets/registry";

export const metadata: Metadata = {
  title: "דפי עבודה — הוראת זוויות בכיתה ז׳",
  description: `כל ${WORKSHEETS_TOTAL} דפי העבודה מתוך החוברת הדיגיטלית להוראת זוויות בכיתה ז׳ — ממוספרים לפי סדר הופעתם בחוברת, לצפייה ולהדפסה בצבע או בשחור-לבן.`,
};

// אייקון-זווית עדין לכרטיסי דפי-עבודה חיים (בלי תמונה ממוזערת) — בשפת האתר.
function AngleThumb() {
  return (
    <svg viewBox="0 0 84 84" fill="none" aria-hidden="true">
      <path d="M14 66 H72" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 66 58 22" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 66 A22 22 0 0 0 29.6 50.4" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="14" cy="66" r="4" fill="var(--gold)" />
    </svg>
  );
}

export default function WorksheetsIndexPage() {
  return (
    <>
      <TopBar />
      <SiteNav />
      <main id="main">
        <section className="section" id="worksheets-list">
          <div className="container">
            <SectionHead eyebrow="חוברת דפי העבודה" title="דפי עבודה" />
            <p className="wslist__lead">
              כל {WORKSHEETS_TOTAL} דפי העבודה מתוך החוברת הדיגיטלית, ממוספרים לפי סדר הופעתם בחוברת.
              לחיצה על דף פותחת אותו לצפייה מלאה — ומשם מדפיסים בצבע או בשחור-לבן.
            </p>
            {/* כפתור ההורדה של כל הדפים — כאן, בתפריט הפנימי, במקום כפתור שני
                בסרגל הניווט (דרישת יניב 17.7.2026). */}
            <p style={{ margin: "0 0 18px" }}>
              <Link
                className="btn btn--gold"
                href="/worksheets/booklet"
                title="כל דפי העבודה כחוברת אחת ממוספרת — צפייה, הדפסה והורדה בצבע או בשחור-לבן"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M4 19h16" />
                </svg>
                {" "}הורדת כל דפי העבודה
              </Link>
            </p>
            <ol className="wslist">
              {WORKSHEETS.map((w) => (
                <li key={w.id} className="wscard">
                  <Link className="wscard__open" href={`/worksheets/w/${w.num}`} title={`פתיחת דף עבודה ${w.num} — ${w.title}`}>
                    <span className="wscard__thumb" aria-hidden="true">
                      {w.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.thumb} alt="" loading="lazy" />
                      ) : (
                        <AngleThumb />
                      )}
                    </span>
                    <span className="wscard__text">
                      <span className="wscard__num">דף עבודה {w.num}</span>
                      <span className="wscard__title">{w.title}</span>
                    </span>
                  </Link>
                  <span className="wscard__acts">
                    <Link className="btn btn--ghost btn--sm" href={`/worksheets/w/${w.num}?print=1`}>
                      הדפסה צבעונית
                    </Link>
                    <Link className="btn btn--ghost btn--sm" href={`/worksheets/w/${w.num}?bw=1&print=1`}>
                      הדפסה בשחור-לבן
                    </Link>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
