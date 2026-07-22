"use client";

import Link from "next/link";
import { useEffect } from "react";

// סרגל עליון של מצב הקריאה של דף המחשה — זהה במבנה לסרגל דפי העבודה במספרים
// מכוונים: חזרה לנושא ולרשימת הנושאים, ניווט קודם/הבא בתוך הנושא (משמר את
// מצב הצבע), מעבר תצוגה צבעונית/שחור-לבן, והורדה/הדפסה דרך חלון ההדפסה של
// הדפדפן. autoPrint פותח את חלון ההדפסה מיד עם הטעינה (?print=1).
export function AidReaderBar({
  n,
  title,
  topicTitle,
  topicHref,
  prevN,
  nextN,
  bw,
  autoPrint = false,
}: {
  n: number; // מספר הדף הנוכחי (נתיב /hamchashot/[n])
  title: string;
  topicTitle: string;
  topicHref: string;
  prevN: number | null; // הדף הקודם בנושא (n של הנתיב), או null בקצה
  nextN: number | null;
  bw: boolean;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  const hrefFor = (target: number, toBw: boolean) => `/hamchashot/${target}${toBw ? "?bw=1" : ""}`;

  return (
    <div className="wsbar" data-noprint>
      <span className="wsbar__side">
        <Link className="btn btn--ghost btn--sm" href={topicHref}>
          {`‹ לנושא: ${topicTitle}`}
        </Link>
        <Link className="btn btn--ghost btn--sm" href="/hamchashot">
          כל הנושאים
        </Link>
        <span className="wsbar__nav">
          <Link
            className={`btn btn--ghost btn--sm${prevN == null ? " btn--disabled" : ""}`}
            href={prevN != null ? hrefFor(prevN, bw) : "#"}
            aria-disabled={prevN == null}
          >
            › הקודם
          </Link>
          <Link
            className={`btn btn--ghost btn--sm${nextN == null ? " btn--disabled" : ""}`}
            href={nextN != null ? hrefFor(nextN, bw) : "#"}
            aria-disabled={nextN == null}
          >
            הבא ‹
          </Link>
        </span>
      </span>

      <span className="wsbar__title">{title}</span>

      <span className="wsbar__side wsbar__side--acts">
        <Link className="btn btn--ghost btn--sm" href={hrefFor(n, !bw)}>
          {bw ? "תצוגה צבעונית" : "תצוגת שחור-לבן"}
        </Link>
        <button type="button" className="btn btn--gold btn--sm" onClick={() => window.print()}>
          הורדה / הדפסה
        </button>
      </span>
    </div>
  );
}
