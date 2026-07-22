import type { Metadata, Viewport } from "next";
import { Rubik, Assistant } from "next/font/google";
import localFont from "next/font/local";
import { InPageTransitions } from "@/components/InPageTransitions";
import Script from "next/script";
import "./globals.css";

// עיצוב בהשראת Oak National Academy: גופן גיאומטרי-מעוגל אחד לכל האתר
// (Oak משתמשים ב-Lexend בלבד; Lexend לא תומך בעברית, לכן Rubik — קרוב לו
// באופי — הוא הגופן היחיד כאן. globals.css מכוון גם את --font-assistant
// לאותו גופן, כך שאין עוד שימוש בגופן שני.
const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

// מערכת עיצוב אחידה: Assistant לגוף הטקסט (זהה ל«מספרים מכוונים»), Rubik לכותרות.
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

// גופן כתב-יד עברי עגול "Gveret Levin" (AlefAlefAlef, רישיון OFL) — מאורח
// עצמית (הקובץ ב-src/fonts) כי הגופן אינו ברשימת next/font/google של Next.
// לשימוש נקודתי בלבד: כותרת-ההשראה מעל סרטון "המירוץ למיליון". לא מחליף את
// גופן האתר.
const gveretLevin = localFont({
  src: "../fonts/GveretLevin-Regular.ttf",
  variable: "--font-gveret",
  display: "swap",
});

// TODO(תוכן): כתובת האתר תתעדכן לפי דומיין ה-Vercel של פרויקט הזוויות.
const SITE_URL = "https://zaviyot.vercel.app";
// TODO(תוכן): התיאור זמני — יוחלף בתוכן האמיתי שיינתן.
const SITE_DESC =
  "יחידת לימוד מתוקשבת במתמטיקה בנושא זוויות. הדרכה במחוז ירושלים — מנח״י, בהובלת איילת קריספין.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "זוויות — יחידת לימוד מתוקשבת",
    template: "%s · זוויות",
  },
  description: SITE_DESC,
  applicationName: "זוויות",
  authors: [{ name: "איילת קריספין" }],
  keywords: [
    "זוויות",
    "מתמטיקה",
    "מדידת זוויות",
    "סוגי זוויות",
    "תוכנית הלימודים",
    "איילת קריספין",
    "מנח״י",
    "מחוז ירושלים",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "זוויות — יחידת לימוד מתוקשבת",
    description: "יחידת לימוד מתוקשבת במתמטיקה בנושא זוויות.",
    url: SITE_URL,
    siteName: "זוויות",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "זוויות — יחידת לימוד מתוקשבת",
    description: "יחידת לימוד מתוקשבת במתמטיקה בנושא זוויות.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1830",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${assistant.variable} ${gveretLevin.variable}`}>
      <body className="site-numbers">
        {children}
        <InPageTransitions />
        <Script src="/reveal.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
