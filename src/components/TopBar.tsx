import Image from "next/image";

// כותרת עליונה — מבנה זהה לחלוטין ל«מספרים מכוונים»: הלוגו בעמודת ההתחלה
// בגודל קבוע וחד (--logo-s), והטקסט ממורכז בדף; עמודות הצד ברשת שומרות
// מינימום ברוחב הלוגו — חפיפה עם הטקסט בלתי אפשרית. אחידות מלאה בין האתרים.
export function TopBar() {
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <span className="topbar__logobox">
          <Image
            className="topbar__logo"
            src="/logo.png"
            alt="יחידת מתמטיקה — מחוז ירושלים והעיר ירושלים"
            width={220}
            height={220}
            sizes="(max-width: 760px) 100px, 124px"
            quality={90}
            priority
          />
        </span>
        <div className="topbar__text">
          <span className="topbar__lead">
            הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין
          </span>
          <span className="topbar__year">שנה״ל התשפ״ז</span>
          <span className="topbar__credit">האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים</span>
        </div>
      </div>
    </header>
  );
}
