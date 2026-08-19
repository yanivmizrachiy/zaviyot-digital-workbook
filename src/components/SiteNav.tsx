"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessoriesNavMenu } from "./AccessoriesNavMenu";
import "./sitenav.css";

// ניווט פנימי דביק — עיצוב זהה לאתר מספרים מכוונים.
// מודע-נתיב (usePathname): בעמוד הבית קישורי העוגן נשארים "#..." (ומקבלים את
// ה-crossfade של InPageTransitions); מכל עמוד אחר הם הופכים ל-"/#..." — כך
// "החוברת הדיגיטלית" מגיע לעמוד החוברת מכל מקום באתר, כולל אחרי רענון ישיר,
// בלי טעינה מיותרת כשכבר נמצאים בעמוד הבית. "דפי עבודה" מוביל לעמוד הייעודי
// /worksheets (החליף את "הורדת החוברת (PDF)" — ההורדה זמינה בתוך החוברת עצמה).
// מצב active מסומן ב-aria-current לפי הנתיב (מעוצב ב-globals.css).
// "אביזרים נלווים להמחשה" נשאר תפריט נפתח (AccessoriesNavMenu), זהה למספרים מכוונים.
// "עמוד הבית" — כפתור-גלולה קבוע בקצה ההתחלה של הסרגל, בכל עמודי האתר: חזרה
// ברורה ואחידה לעמוד הראשי מכל מקום (בעמוד הבית עצמו הוא מסומן כ-active).
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/";

  // מצב active: עמוד הרשימה (/worksheets) וקורא דף-עבודה (/worksheets/w/[k])
  // שייכים ל"דפי עבודה"; קורא עמוד-בודד של החוברת (/worksheets/[n]) שייך
  // ל"חוברת הדיגיטלית".
  const inWorksheetsList = pathname === "/worksheets" || pathname.startsWith("/worksheets/w/");
  const inBooklet = !inWorksheetsList && pathname.startsWith("/worksheets");
  const inVideos = pathname === "/videos" || pathname.startsWith("/videos/");

  return (
    <nav className="sitenav" aria-label="ניווט בעמוד">
      <div className="container sitenav__inner">
        <Link className="sitenav__home" href="/" aria-current={onHome ? "page" : undefined}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
          </svg>
          עמוד הבית
        </Link>
        <a className="sitenav__link" href={onHome ? "#presentation" : "/#presentation"}>
          מצגת
        </a>
        {onHome ? (
          <a className="sitenav__link" href="#worksheets">
            החוברת הדיגיטלית
          </a>
        ) : (
          <Link className="sitenav__link" href="/#worksheets" aria-current={inBooklet ? "page" : undefined}>
            החוברת הדיגיטלית
          </Link>
        )}
        {/* "הורדת כל דפי העבודה" עבר לתוך עמוד "דפי עבודה" עצמו (דרישת יניב
            17.7.2026: כפתור אחד בתפריט — ההורדה בתפריט הפנימי). */}
        <Link className="sitenav__link" href="/worksheets" aria-current={inWorksheetsList ? "page" : undefined}>
          דפי עבודה
        </Link>
        <Link className="sitenav__link" href="/videos" aria-current={inVideos ? "page" : undefined}>
          סרטוני המחשה
        </Link>
        <AccessoriesNavMenu />
      </div>
    </nav>
  );
}
