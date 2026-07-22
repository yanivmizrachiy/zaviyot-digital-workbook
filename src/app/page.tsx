import { TopBar } from "@/components/TopBar";
import { SiteNav } from "@/components/SiteNav";
import { HeroSection } from "@/components/HeroSection";
import { JerusalemPanoramaSection } from "@/components/JerusalemPanoramaSection";
import { VideoSection } from "@/components/VideoSection";
import { WorksheetsBookletBook } from "@/components/WorksheetsBookletBook";
import { PresentationViewer } from "@/components/PresentationViewer";
import { FinaleSection } from "@/components/FinaleSection";
import { SiteFooter } from "@/components/SiteFooter";

// עמוד הבית של אתר הזוויות — עיצוב זהה לחלוטין לאתר מספרים מכוונים.
// הסדר: שער → סרטון "זוויות — המירוץ למיליון" (בראש, מתחת לשער) →
// החוברת הדיגיטלית → מצגת ההוראה (מקטע עצמאי מתחת לחוברת) →
// "הזירה" (FinaleSection) — מקטע סיום חי עם התמונה שמסר יניב, אחרון לפני הפוטר.
// "מה אנחנו מלמדים?" ו"למה נשתמש בהמחשות?" הוסרו מעמוד הבית לבקשת יניב —
// תוכנם עבר לעמודים ייעודיים בחוברת (WhatWeTeachSheet, WhyModelsSheet),
// אחרי שני עמודי "מתוך עדכון ת״ל".
export default function HomePage() {
  return (
    <>
      <TopBar />
      <SiteNav />
      <main id="main">
        <HeroSection />
        {/* פנורמת "זוויות בין חומות ירושלים" — תמונת הזהות של המחוז, נבנית כפאזל */}
        <JerusalemPanoramaSection />
        <VideoSection />
        <WorksheetsBookletBook />
        <PresentationViewer />
        <FinaleSection />
      </main>
      <SiteFooter />
    </>
  );
}
