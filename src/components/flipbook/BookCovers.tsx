// גב החוברת המדפדפת — קולופון (פנים הכריכה האחורית) וכריכה אחורית.
// השער הקדמי של החוברת הוא עמוד 1 האמיתי (מכתב המורה, BookletCoverPage) —
// אין כאן עמוד שער נוסף. כל הטקסטים הם קרדיטים אמיתיים מתוך החוברת.

/** פנים הכריכה האחורית — קולופון: קרדיטים אמיתיים מתוך החוברת. */
export function InsideBackCover() {
  return (
    <div className="lx-cover lx-cover--colophon" lang="he" dir="rtl">
      <svg className="lx-cover__innermark" viewBox="0 0 120 84" fill="none" aria-hidden="true">
        <line x1="12" y1="66" x2="108" y2="66" className="lxa-ray" />
        <line x1="12" y1="66" x2="92" y2="14" className="lxa-ray" />
        <path d="M 48 66 A 36 36 0 0 0 41.8 45.9" className="lxa-arc" />
      </svg>
      <h4 className="lx-colophon__title">הוראת זוויות בכיתה ז׳</h4>
      <p className="lx-colophon__line">
        החוברת נכתבה ונערכה ע״י <strong>איילת קריספין</strong>
      </p>
      <p className="lx-colophon__line">הדרכה במחוז ירושלים והעיר ירושלים — מנח״י</p>
      <p className="lx-colophon__line">עיבוד דיגיטלי: יניב רז · מדריך מחוזי חט״ב בעיר ירושלים</p>
      <p className="lx-colophon__year">שנה״ל תשפ״ז</p>
    </div>
  );
}

/** הכריכה האחורית (חוץ). */
export function BackCover() {
  return (
    <div className="lx-cover lx-cover--back" lang="he" dir="rtl">
      <svg className="lx-cover__backmark" viewBox="0 0 160 112" fill="none" aria-hidden="true">
        <line x1="16" y1="88" x2="144" y2="88" className="lxa-ray" />
        <line x1="16" y1="88" x2="122" y2="18" className="lxa-ray" />
        <path d="M 64 88 A 48 48 0 0 0 55.7 61.2" className="lxa-arc" />
        <circle cx="16" cy="88" r="2.6" className="lxa-vertex" />
      </svg>
      <p className="lx-cover__backtitle">הוראת זוויות בכיתה ז׳</p>
      <p className="lx-cover__org">איילת קריספין · מחוז ירושלים — מנח״י · תשפ״ז</p>
    </div>
  );
}
