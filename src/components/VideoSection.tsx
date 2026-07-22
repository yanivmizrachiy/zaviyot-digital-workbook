// סרטון "זוויות - המירוץ למיליון" (מקור: העיצוב של יניב ב-Canva) — מוגש כקובץ
// MP4 מקומי מ-public/video (1080p/60fps, החיתוך המדויק של העיצוב המקורי).
// יושב בראש העמוד, מתחת לשער, ומעליו כותרת-השראה בכתב-יד עגול (Gveret Levin)
// עם אקצנט זווית 45° — התאמה ישירה לנושא האתר. הכותרת בכתב-היד היא כותרת
// המקטע (aria-labelledby). הנגן במסגרת הכהה האחידה (pdfframe) של החוברת
// והמצגת: סרגל עם הורדה, ונגן 16:9.
const VIDEO_URL = "/video/zaviyot-race-lamillion.mp4";
const POSTER_URL = "/video/zaviyot-race-poster.jpg";

export function VideoSection() {
  return (
    <section className="section section--video" id="video" aria-labelledby="video-tagline">
      <div className="container">
        {/* כותרת-ההשראה: כתב-יד עגול. ציור זווית 45° יושב ברקע, מלוכסן ובהיר,
            מאחורי המספר "45°" (נושא האתר) */}
        <p className="vtag" id="video-tagline">
          <span className="vtag__line">הדרך למיליון לא תמיד ישרה —</span>
          <span className="vtag__line">
            לפעמים היא עוברת בזווית של{" "}
            <span className="vtag__deg">
              <svg className="vtag__deg-bg" viewBox="0 0 96 64" fill="none" aria-hidden="true">
                <path d="M12 52 H88" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M12 52 56 8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M40 52 A28 28 0 0 0 31.8 32.2" stroke="var(--gold)" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
              <span className="vtag__hi" dir="ltr">45°</span>
            </span>
          </span>
        </p>

        <div className="pdfframe">
          <div className="pdfframe__bar">
            <span className="pdfframe__title vtag__credit">קטע מתוך התוכנית „המירוץ למיליון”, קשת 12</span>
            <span className="pdfframe__acts">
              <a className="pdfframe__sheet" href={VIDEO_URL} download="זוויות - המירוץ למיליון.mp4">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M8 1.5v8.5M4.5 7 8 10.5 11.5 7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 13.5h11" strokeLinecap="round" />
                </svg>
                הורדת הסרטון (MP4)
              </a>
            </span>
          </div>

          <div className="videobox">
            <video controls playsInline preload="metadata" poster={POSTER_URL}>
              <source src={VIDEO_URL} type="video/mp4" />
              הדפדפן שלך אינו תומך בניגון וידאו.{" "}
              <a href={VIDEO_URL} download="זוויות - המירוץ למיליון.mp4">
                להורדת הסרטון
              </a>
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
