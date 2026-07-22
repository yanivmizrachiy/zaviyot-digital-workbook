// עמוד "סוגי זוויות" — הדף שנפתח מקישור "סוגי זוויות" בחוברת. A4 אמיתי, ממורכז,
// בשפת העיצוב של החוברת (ws-sheet), בדיוק כמו שאר עמודי הקריאה.
import type { Metadata } from "next";
import { AnglesTypesSheet } from "@/components/worksheets/AnglesTypesSheet";

export const metadata: Metadata = {
  title: "סוגי זוויות — זוויות בכיתה ז׳",
  robots: { index: false },
};

export default function SugeiZaviyotPage() {
  return (
    <div className="ws-page">
      <div className="ws-page__sheets">
        <AnglesTypesSheet />
      </div>
    </div>
  );
}
