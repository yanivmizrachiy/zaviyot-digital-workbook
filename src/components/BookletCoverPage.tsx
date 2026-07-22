import Image from "next/image";

// עמוד 1 בחוברת "חוברת הוראת הזוויות לכיתה ז׳" — דף פתיחה:
//   מסטהד  → כותרת בשורת הלוגו (לוגו מסתובב בפינה הימנית)
//   אמצע   → מכתב איילת בכתב-יד עגול ובוורוד כהה יפה + דיוקן עגול יוקרתי
//   פוטר   → קו-רוחב דק יוקרתי + קרדיט/תארים/שנה״ל/קשר בצורת כותרת-תחתית נקייה
//   גרפיקה → מוטיב-זווית מעוצב (הפוך, פתיחה כלפי מטה) כאקצנט צד
// כל התוכן ממקור איילת קריספין; המייל והאתר הם הקישורים האמיתיים מתוך ה-PDF.
export function BookletCoverPage() {
  return (
    <article className="bkopen" dir="rtl">
      {/* מסטהד — הכותרת בשורת הלוגו */}
      <header className="bkopen__masthead">
        <Image
          src="/logo.png"
          alt="יחד מתמטיקה — מחוז ירושלים והעיר ירושלים"
          width={120}
          height={120}
          className="bkopen__logo"
          priority
        />
        <div className="bkopen__heading">
          <h1 className="bkopen__title">חוברת הוראת הזוויות לכיתה ז׳</h1>
          <p className="bkopen__subtitle">לאור עדכון ת״ל לקראת תשפ״ז</p>
        </div>
      </header>

      {/* מוטיב-זווית מעוצב — זווית קלאסית נוטה מעט, רקע בהיר מאוד מאחורי הכותרת */}
      <svg className="bkopen__angle" viewBox="0 0 172 124" fill="none" aria-hidden="true">
        <path className="bkopen__angle-ray" d="M22 100 H158" />
        <path className="bkopen__angle-ray" d="M22 100 L132 26" />
        <path className="bkopen__angle-arc" d="M70 100 A48 48 0 0 0 58 66" />
        <circle className="bkopen__angle-vertex" cx="22" cy="100" r="3.6" />
      </svg>

      {/* אמצע — המכתב והדיוקן */}
      <div className="bkopen__middle">
        <div className="bkopen__letter">
          <p className="bkopen__greeting">מורים יקרים,</p>
          <p className="bkopen__body">
            מוגשת לכם חוברת בנושא זוויות כיתה ז׳ לאור עדכון ת״ל
            <br />
            במטרה לסייע לכם בהוראת הנושא.
          </p>
          <p className="bkopen__body">מוזמנים להשתמש ולפנות אלי בכל שאלה ובקשה,</p>
          <p className="bkopen__signoff">שלכם,</p>
          <p className="bkopen__signature">איילת קריספין</p>
        </div>

        <figure className="bkopen__portrait">
          <Image
            src="/team/ayelet-krispin-portrait.png"
            alt="איילת קריספין"
            width={430}
            height={430}
            className="bkopen__portrait-img"
            priority
          />
        </figure>
      </div>

      {/* פוטר — קו יוקרה + קרדיט, תארים, שנה״ל ופרטי קשר בצורת כותרת-תחתית */}
      <footer className="bkopen__footer">
        <div className="bkopen__rule" aria-hidden="true" />
        <p className="bkopen__byline">
          החוברת נכתבה ונערכה ע״י <strong>איילת קריספין</strong>
        </p>
        <ul className="bkopen__credentials">
          <li>מתכללת את תחום המתמטיקה בעל יסודי בעיר ירושלים ובמחוז ירושלים</li>
          <li>מדריכה מחוזית למתמטיקה על יסודי מחוז ירושלים</li>
          <li>דוקטורנטית בחינוך מתמטי באוניברסיטה העברית</li>
        </ul>
        <div className="bkopen__meta">
          <span className="bkopen__year">שנה״ל תשפ״ז</span>
          <span className="bkopen__contact">
            <a className="bkopen__contact-link" href="mailto:ayeletk59@gmail.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" strokeWidth="1.7" />
                <path d="M4 7l8 6 8-6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span dir="ltr">ayeletk59@gmail.com</span>
            </a>
            <a
              className="bkopen__contact-link"
              href="https://mamhishim.my.canva.site/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
                <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" strokeWidth="1.7" />
              </svg>
              <span dir="ltr">mamhishim.my.canva.site</span>
            </a>
          </span>
        </div>
      </footer>
    </article>
  );
}
