"use client";

import Link from "next/link";
import { useEffect } from "react";

// סרגל עליון של קורא דף-עבודה בודד (/worksheets/w/[k]) — אותה שפה בדיוק כמו
// סרגל דפי העבודה של "מספרים מכוונים" (wsbar / btn--ghost / btn--gold):
// חזרה לרשימת דפי העבודה + חזרה לחוברת הדיגיטלית, ניווט קודם/הבא בין דפי
// העבודה (משמר את מצב הצבע), מעבר תצוגה צבעונית/שחור-לבן, והורדה/הדפסה דרך
// חלון ההדפסה של הדפדפן. autoPrint פותח את חלון ההדפסה מיד עם הטעינה (?print=1).
export function WsWorksheetBar({
  num,
  total,
  title,
  bw,
  autoPrint = false,
}: {
  num: number;
  total: number;
  title: string;
  bw: boolean;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  const hrefFor = (k: number, toBw: boolean) => `/worksheets/w/${k}${toBw ? "?bw=1" : ""}`;

  return (
    <div className="wsbar" data-noprint>
      <span className="wsbar__side">
        <Link className="btn btn--ghost btn--sm" href="/worksheets">
          ‹ לרשימת דפי העבודה
        </Link>
        <Link className="btn btn--ghost btn--sm" href="/#worksheets">
          לחוברת הדיגיטלית
        </Link>
        <span className="wsbar__nav">
          <Link
            className={`btn btn--ghost btn--sm${num <= 1 ? " btn--disabled" : ""}`}
            href={num > 1 ? hrefFor(num - 1, bw) : "#"}
            aria-disabled={num <= 1}
          >
            › הקודם
          </Link>
          <Link
            className={`btn btn--ghost btn--sm${num >= total ? " btn--disabled" : ""}`}
            href={num < total ? hrefFor(num + 1, bw) : "#"}
            aria-disabled={num >= total}
          >
            הבא ‹
          </Link>
        </span>
      </span>

      <span className="wsbar__title">{`דף עבודה ${num} מתוך ${total} · ${title}`}</span>

      <span className="wsbar__side wsbar__side--acts">
        <Link className="btn btn--ghost btn--sm" href={hrefFor(num, !bw)}>
          {bw ? "תצוגה צבעונית" : "תצוגת שחור-לבן"}
        </Link>
        <button type="button" className="btn btn--gold btn--sm" onClick={() => window.print()}>
          הורדה / הדפסה
        </button>
      </span>
    </div>
  );
}
