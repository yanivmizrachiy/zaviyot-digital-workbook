import type { Metadata } from "next";
import { BookletCoverPage } from "@/components/BookletCoverPage";

// מצב טיוטה — עמוד 1 בחוברת (עמוד פתיחה). לא מקושר בניווט; לסקירת יניב בלבד.
export const metadata: Metadata = {
  title: "טיוטה — עמוד 1 בחוברת",
  robots: { index: false },
};

export default function BookletDesignPage1() {
  return (
    <div className="ws-page">
      <div className="ws-page__sheets">
        <div className="bkopen__sheet">
          <BookletCoverPage />
        </div>
      </div>
    </div>
  );
}
