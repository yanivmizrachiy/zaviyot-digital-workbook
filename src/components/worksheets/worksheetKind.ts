import type { WsPage } from "./registry";

// מפתח הרכיב שיוצג לעמוד חוברת — מיפוי טהור (בלי JSX) המשמש גם את
// WorksheetPageRenderer וגם את הבדיקות. מקור-אמת יחיד שמבטיח שכל kind/content
// ממופה בדיוק פעם אחת, עם exhaustive check (assertNever) שנכשל בזמן קומפילציה
// אם נוסף ערך שלא טופל.
export type WsComponentKey =
  | "cover"
  | "toc"
  | "presentation"
  | "image"
  | "intro-a"
  | "intro-b"
  | "what-we-teach"
  | "why-models"
  | "around-us"
  | "angles-types"
  | "measurement"
  | "draw-measure"
  | "applet"
  | "protractor-poster"
  | "clock-angles"
  | "right-angle-estimate"
  | "applet-maker"
  | "angle7-1"
  | "angle7-2"
  | "angle7-3"
  | "angle7-4";

function assertNever(x: never): never {
  throw new Error(`Unhandled worksheet variant: ${JSON.stringify(x)}`);
}

export function worksheetComponentKey(page: WsPage): WsComponentKey {
  switch (page.kind) {
    case "cover":
      return "cover";
    case "toc":
      return "toc";
    case "presentation":
      return "presentation";
    case "image":
      return "image";
    case "content":
      switch (page.content) {
        case "intro-a":
          return "intro-a";
        case "intro-b":
          return "intro-b";
        case "what-we-teach":
          return "what-we-teach";
        case "why-models":
          return "why-models";
        case "around-us":
          return "around-us";
        case "angles-types":
          return "angles-types";
        case "measurement":
          return "measurement";
        case "draw-measure":
          return "draw-measure";
        case "applet":
          return "applet";
        case "protractor-poster":
          return "protractor-poster";
        case "clock-angles":
          return "clock-angles";
        case "right-angle-estimate":
          return "right-angle-estimate";
        case "applet-maker":
          return "applet-maker";
        case "angle7-1":
          return "angle7-1";
        case "angle7-2":
          return "angle7-2";
        case "angle7-3":
          return "angle7-3";
        case "angle7-4":
          return "angle7-4";
        default:
          return assertNever(page.content);
      }
    default:
      return assertNever(page);
  }
}

// האם העמוד ניתן להדפסה/הורדה כ-PDF דרך window.print(). החלטה מפורשת לכל kind
// (exhaustive) — kind עתידי חדש יידרש להכרעה מפורשת ולא יהיה printable כברירת מחדל.
export function isPrintableKind(page: WsPage): boolean {
  switch (page.kind) {
    case "cover":
    case "toc":
    case "image":
    case "content":
      return true;
    // המצגת מוטמעת חיה — ההורדה שלה נעשית מתוך הנגן, לא דרך window.print().
    case "presentation":
      return false;
    default:
      return assertNever(page);
  }
}
