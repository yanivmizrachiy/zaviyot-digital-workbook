"use client";

import Link from "next/link";
import { useEffect } from "react";

// סרגל עליון של חוברת כל דפי העבודה (/worksheets/booklet) — אותה שפה בדיוק
// כמו סרגל דף-העבודה הבודד (wsbar): חזרה לרשימה, מעבר צבע/שחור-לבן (משמר
// את המסלול), והורדה/הדפסה של כל החוברת דרך חלון ההדפסה — כל דף בעמוד A4
// משלו, ממוספר לפי המספור הרץ. autoPrint ‏(?print=1) פותח את חלון ההדפסה מיד.
export function WsBookletAllBar({ total, bw, autoPrint = false }: { total: number; bw: boolean; autoPrint?: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  return (
    <div className="wsbar" data-noprint>
      <span className="wsbar__side">
        <Link className="btn btn--ghost btn--sm" href="/worksheets">
          ‹ לרשימת דפי העבודה
        </Link>
      </span>

      <span className="wsbar__title">{`חוברת דפי העבודה · ${total} דפים ממוספרים`}</span>

      <span className="wsbar__side wsbar__side--acts">
        <Link className="btn btn--ghost btn--sm" href={bw ? "/worksheets/booklet" : "/worksheets/booklet?bw=1"}>
          {bw ? "תצוגה צבעונית" : "תצוגת שחור-לבן"}
        </Link>
        <button type="button" className="btn btn--gold btn--sm" onClick={() => window.print()}>
          הורדה / הדפסה
        </button>
      </span>
    </div>
  );
}
