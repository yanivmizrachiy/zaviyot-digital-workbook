// עמוד השער: הזמנה נקייה עם CTA יחיד — עיצוב זהה לאתר מספרים מכוונים.
// TODO(תוכן): הכותרת, התיאור ותגי הפינה הם מצייני-מקום עד קבלת התוכן האמיתי של הזוויות.
// תגי הפינה (signbadges) שומרים על אותו מבנה/עיצוב בדיוק; הערכים (45°/90°) זמניים.
// לצד הכותרת (בעמודה השנייה) — אנימציית הזוויות angles_v2 בפאנל כהה ממוסגר
// (HeroAngleVideo): הרקע השחור של הסרטון משולב כמסגרת כהה בשפת ה-pdfframe,
// והקומפוזיציה נשברת לעמודה אחת במסכים צרים.
import { HeroAngleVideo } from "./HeroAngleVideo";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__grid hero__grid--media">
        <div className="reveal">
          <div className="signbadges" aria-hidden="true">
            <span className="signbadge signbadge--pos">45°</span>
            <span className="signbadge signbadge--neg">90°</span>
          </div>
          <span className="hero__eyebrow">מתמטיקה · יחידת לימוד</span>
          <h1 className="hero__title">זוויות</h1>
        </div>
        <HeroAngleVideo />
      </div>
    </section>
  );
}
