import type { ReactNode } from "react";
import type { WsPage } from "./registry";
import { wsPageImage } from "./registry";
import { worksheetComponentKey, isPrintableKind } from "./worksheetKind";
import { PresentationViewer } from "@/components/PresentationViewer";
import { BookletCoverPage } from "@/components/BookletCoverPage";
import { BookletTocSheet } from "./BookletTocSheet";
import { IntroUnderstandingSheet, WhatWeTeachSheet, WhyModelsSheet } from "./IntroUnderstandingSheet";
import { AnglesAroundUsSheet } from "./AnglesAroundUsSheet";
import { AnglesTypesSheet } from "./AnglesTypesSheet";
import { MeasurementEstimationSheet } from "./MeasurementEstimationSheet";
import { DrawMeasureSheet } from "./DrawMeasureSheet";
import { AppletBookletSheet, AppletMakerBookletSheet } from "./AppletBookletSheet";
import { ProtractorPosterSheet } from "./ProtractorPosterSheet";
import { ClockAnglesSheet } from "./ClockAnglesSheet";
import { Angles7Sheet } from "./Angles7Sheet";
import { RightAngleEstimateSheet } from "./RightAngleEstimateSheet";

// ‏מקור-רינדור יחיד לעמודי חוברת הזוויות. שלושת הצרכנים — הקורא (/worksheets/[n]),
// ההדפסה (/worksheets/print) והספר הדיגיטלי (WorksheetsBookletBook) — משתמשים בו,
// כדי שכל kind/content ימופה במקום אחד בלבד, עם exhaustive check שמונע נפילה שקטה
// לרכיב שגוי (הבאג שבו intro-a/intro-b/applet הוצגו כ-ObjectivesSheet).

function assertNever(x: never): never {
  throw new Error(`Unhandled worksheet variant: ${JSON.stringify(x)}`);
}

// עמוד-קישור למצגת (בהקשר הדפסה — המצגת אינה ניתנת להטמעה ב-PDF).
// src חובה — אין fallback שקט לנתיב קשיח; עמוד presentation בלי presentationSrc
// נכשל כבר בקומפילציה (discriminated union) ובבדיקות.
export function PresentationLinkSheet({ src, title }: { src: string; title: string }) {
  const href = src;
  return (
    <article className="ws-sheet" lang="he" dir="rtl">
      <header className="ws-head ws-head--center">
        <h1 className="ws-title">{title}</h1>
        <p className="ws-subtitle">מצגת ההוראה · גאומטריה קדם-היסקית</p>
        <div className="ws-headline" aria-hidden="true" />
      </header>
      <div className="ws-body" style={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
        <p style={{ margin: 0, maxWidth: "38rem", textAlign: "center", fontFamily: "var(--font-assistant), sans-serif", fontSize: 19, lineHeight: 1.6, color: "var(--wsink)" }}>
          מצגת ההוראה המלאה זמינה לצפייה ולהורדה בקישור הבא — נפתחת בכרטיסייה חדשה.
        </p>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 30px", borderRadius: 14, background: "var(--wsteal)", color: "#fff", fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
          פתיחת המצגת ↗
        </a>
      </div>
      <footer className="ws-foot">
        <p className="ws-credit">
          <span>הדרכה במחוז ירושלים והעיר ירושלים – מנח״י, בהובלת איילת קריספין</span>
        </p>
        <div className="ws-footline" aria-hidden="true" />
      </footer>
    </article>
  );
}

// האם העמוד ניתן להדפסה/הורדה כ-PDF דרך window.print(). (re-export מהמיפוי הטהור.)
export const isPrintablePage = isPrintableKind;

export type WorksheetRenderOpts = {
  /** מיקום העמוד בחוברת (1-based) — משמש לתמונה. */
  slot: number;
  /** אופן הצגת המצגת: 'embed' = נגן חי; 'link' = עמוד-קישור (הדפסה). */
  presentation: "embed" | "link";
  /** ניווט תוכן-העניינים: onJump (ספר דיגיטלי) או hrefFor (קורא/הדפסה). */
  tocOnJump?: (page1Based: number) => void;
  tocHrefFor?: (page1Based: number) => string;
};

// מחזיר את רכיב התוכן הפנימי הנכון לעמוד. העטיפה (A4 / scale / stacking) נשארת
// באחריות כל צרכן — כאן ממופה אך ורק *איזה* רכיב מוצג.
export function worksheetContentNode(page: WsPage, opts: WorksheetRenderOpts): ReactNode {
  const key = worksheetComponentKey(page);
  switch (key) {
    case "cover":
      return <BookletCoverPage />;
    case "toc":
      return <BookletTocSheet onJump={opts.tocOnJump} hrefFor={opts.tocHrefFor} />;
    case "presentation": {
      // key === "presentation" ⇔ page.kind === "presentation"; הצמצום נדרש ל-TS.
      if (page.kind !== "presentation") return assertNever(key as never);
      return opts.presentation === "embed" ? (
        <PresentationViewer
          embed
          pdfUrl={page.presentationSrc}
          downloadName={page.downloadName}
          title={page.title}
        />
      ) : (
        <PresentationLinkSheet src={page.presentationSrc} title={page.title} />
      );
    }
    case "image":
      return (
        // <img> ולא next/image — עמוד החוברת מוקטן מדויק ל-A4 מלא, בלי אופטימיזציה
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wsPageImage(opts.slot)}
          alt={`${page.title} — דף ${opts.slot}`}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      );
    case "intro-a":
      return <IntroUnderstandingSheet part={1} />;
    case "intro-b":
      return <IntroUnderstandingSheet part={2} />;
    case "what-we-teach":
      return <WhatWeTeachSheet />;
    case "why-models":
      return <WhyModelsSheet />;
    case "around-us":
      return <AnglesAroundUsSheet />;
    case "angles-types":
      return <AnglesTypesSheet />;
    case "measurement":
      return <MeasurementEstimationSheet />;
    case "draw-measure":
      return <DrawMeasureSheet />;
    case "applet":
      return <AppletBookletSheet />;
    case "applet-maker":
      return <AppletMakerBookletSheet />;
    case "protractor-poster":
      return <ProtractorPosterSheet />;
    case "clock-angles":
      return <ClockAnglesSheet />;
    case "right-angle-estimate":
      return <RightAngleEstimateSheet />;
    case "angle7-1":
      return <Angles7Sheet part={1} />;
    case "angle7-2":
      return <Angles7Sheet part={2} />;
    case "angle7-3":
      return <Angles7Sheet part={3} />;
    case "angle7-4":
      return <Angles7Sheet part={4} />;
    default:
      return assertNever(key);
  }
}
