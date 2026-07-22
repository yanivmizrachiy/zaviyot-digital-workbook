import { Frank_Ruhl_Libre, Heebo } from "next/font/google";

// טיפוגרפיית החוברת המדפדפת בלבד (לא משנה את גופני האתר):
//   Frank Ruhl Libre — כותרות סריפיות (כריכה, שערים, פאנלים);
//   Heebo — טקסט ממשק. שניהם תומכי עברית, נטענים self-hosted דרך next/font
//   עם fallback מלא (מוגדר ב-flipbook.css: Noto Serif Hebrew/Georgia · Assistant/Arial).
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-frank",
  display: "swap",
});

export const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-heebo",
  display: "swap",
});
