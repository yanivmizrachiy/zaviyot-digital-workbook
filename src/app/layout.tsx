import type { Metadata, Viewport } from "next";
import { Rubik, Assistant } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { InPageTransitions } from "@/components/InPageTransitions";
import { SITE_DESC, SITE_URL } from "@/lib/site";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

// גופן כתב-יד עברי עגול לשימוש נקודתי בחוברת.
const gveretLevin = localFont({
  src: "../fonts/GveretLevin-Regular.ttf",
  variable: "--font-gveret",
  display: "swap",
});

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
