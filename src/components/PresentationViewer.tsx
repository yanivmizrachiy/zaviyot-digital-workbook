"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHead } from "./SectionHead";

// מצגת הוראת זוויות — מצג שקופיות בעיצוב ובכפתורי הפעולה של מצגת "מספרים מכוונים"
// (סרגל עליון כהה עם כותרת + מסך מלא + הורדה, במת שקופית 16:9, סרגל תחתון עם
// "הקודם / שקופית N מתוך M / הבא" + ניווט במקלדת). התוכן הוא PDF — מרונדר עם
// PDF.js ישירות, כולל שכבת קישורים לחיצה במקומם המדויק (עובד גם ב-PDF שמורידים).
const WORKER_URL = "/pdf.worker.min.mjs";
// ברירות המחדל = מצגת הוראת הזוויות. אפשר להזריק מצגת אחרת (PDF) דרך ה-props, כך
// שאותו נגן משרת כמה מצגות בחוברת (למשל "גאומטריה קדם-היסקית") — עם כפתורי פעולה זהים.
const DEFAULT_PDF_URL = "/presentation/geometria-kdam-hesekit.pdf";
const DEFAULT_DOWNLOAD_NAME = "גאומטריה קדם-היסקית — מצגת.pdf";
const DEFAULT_TITLE = "מצגת ההוראה — גאומטריה קדם-היסקית";

type Viewport = {
  width: number;
  height: number;
  convertToViewportRectangle: (rect: number[]) => number[];
};
type RenderTask = { promise: Promise<void>; cancel: () => void };
type PdfPage = {
  getViewport: (opts: { scale: number }) => Viewport;
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: Viewport }) => RenderTask;
  getAnnotations: () => Promise<Array<{ subtype?: string; url?: string; dest?: unknown; rect?: number[] }>>;
};
type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  getDestination: (name: string) => Promise<unknown[] | null>;
  getPageIndex: (ref: unknown) => Promise<number>;
};
// אזור לחיץ מעל הקנבס: קישור חיצוני (url) או קפיצה לשקופית בתוך המסמך (page, 0-based)
type LinkBox = { left: number; top: number; width: number; height: number; url?: string; page?: number };

export function PresentationViewer({
  embed = false,
  pdfUrl = DEFAULT_PDF_URL,
  downloadName = DEFAULT_DOWNLOAD_NAME,
  title = DEFAULT_TITLE,
}: {
  embed?: boolean;
  pdfUrl?: string;
  downloadName?: string;
  title?: string;
} = {}) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [num, setNum] = useState(0);
  const [i, setI] = useState(0); // שקופית נוכחית (0-based)
  const [links, setLinks] = useState<LinkBox[]>([]);
  const [max, setMax] = useState(false); // מסך מלא בתוך האתר
  const [error, setError] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const taskRef = useRef<RenderTask | null>(null);

  // טעינת ה-PDF פעם אחת
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
        const loaded = (await pdfjs.getDocument({ url: pdfUrl }).promise) as unknown as PdfDoc;
        if (cancelled) return;
        setDoc(loaded);
        setNum(loaded.numPages);
      } catch (e) {
        console.error("[PresentationViewer] load failed:", e);
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // רינדור השקופית הנוכחית + שכבת הקישורים
  const render = useCallback(async () => {
    const holder = pageRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!doc || !holder || !stage || !canvas) return;
    try {
      const page = await doc.getPage(i + 1);
      const base = page.getViewport({ scale: 1 });
      const r = base.height / base.width;

      // 1) חילוץ הקישורים תחילה — בלתי-תלוי ברינדור הקנבס (שעלול להתבטל ב-re-render).
      // המרת מלבן הקישור (מרחב PDF, מקור שמאל-תחתון) לאחוזים (מקור שמאל-עליון).
      const annots = await page.getAnnotations();
      const boxes: LinkBox[] = [];
      for (const a of annots) {
        if (a.subtype !== "Link" || !a.rect || a.rect.length !== 4) continue;
        let target: { url?: string; page?: number } | null = null;
        if (a.url) {
          target = { url: a.url };
        } else if (a.dest) {
          try {
            const d = typeof a.dest === "string" ? await doc.getDestination(a.dest) : (a.dest as unknown[]);
            if (Array.isArray(d) && d.length) target = { page: await doc.getPageIndex(d[0]) };
          } catch {
            /* יעד לא פתיר — מדלגים */
          }
        }
        if (!target) continue;
        const x0 = Math.min(a.rect[0], a.rect[2]);
        const x1 = Math.max(a.rect[0], a.rect[2]);
        const y0 = Math.min(a.rect[1], a.rect[3]);
        const y1 = Math.max(a.rect[1], a.rect[3]);
        boxes.push({
          left: (x0 / base.width) * 100,
          top: ((base.height - y1) / base.height) * 100,
          width: ((x1 - x0) / base.width) * 100,
          height: ((y1 - y0) / base.height) * 100,
          ...target,
        });
      }
      setLinks(boxes);

      // 2) התאמת גודל השקופית ל-stage (contain), ממורכזת
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      const pw = Math.max(1, Math.min(sw, sh / r));
      const ph = pw * r;
      holder.style.width = `${pw}px`;
      holder.style.height = `${ph}px`;

      // 3) רינדור הקנבס (ניתן לביטול אם מגיע render חדש)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (pw / base.width) * dpr });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (taskRef.current) {
        try {
          taskRef.current.cancel();
        } catch {
          /* noop */
        }
      }
      const task = page.render({ canvasContext: ctx, viewport });
      taskRef.current = task;
      await task.promise;
    } catch (e) {
      const name = (e as { name?: string })?.name;
      if (name !== "RenderingCancelledException") console.error("[PresentationViewer] render failed:", e);
    }
  }, [doc, i]);

  useEffect(() => {
    // render() אסינכרוני — מסנכרן קנבס PDF.js חיצוני ומעדכן links אחרי I/O;
    // אין setState סינכרוני בגוף ה-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void render();
  }, [render, max]);

  // רינדור מחדש בשינוי גודל (שומר חדות ומיקום קישורים)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => void render(), 150);
    });
    ro.observe(stage);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [render]);

  const go = useCallback(
    (delta: number) => setI((p) => Math.min(num - 1, Math.max(0, p + delta))),
    [num]
  );

  // ניווט במקלדת — הבא = שמאלה ב-RTL, הקודם = ימינה
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(1);
      else if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // מסך מלא בתוך האתר — יציאה ב-Esc, נעילת גלילת הרקע
  useEffect(() => {
    if (!max) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMax(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [max]);

  const frame = (
    <div className={max ? "pdfframe pdfframe--max" : "pdfframe"}>
          <div className="pdfframe__bar">
            <span className="pdfframe__title">{title}</span>
            <span className="pdfframe__acts">
              <button
                type="button"
                onClick={() => setMax((m) => !m)}
                aria-label={max ? "יציאה ממסך מלא" : "פתיחת המצגת במסך מלא"}
              >
                {max ? "יציאה ממסך מלא ✕" : "פתיחה במסך מלא"}
              </button>
              <a href={pdfUrl} download={downloadName}>
                הורדה
              </a>
            </span>
          </div>

          <div className="slideshow">
            <div className="slideshow__stage" ref={stageRef}>
              {error ? (
                <div className="pdfviewer__status" role="alert" style={{ padding: 24, textAlign: "center" }}>
                  לא הצלחנו להציג את המצגת כאן.{" "}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    לפתיחת ה-PDF בכרטיסייה חדשה
                  </a>
                </div>
              ) : (
                <div ref={pageRef} style={{ position: "relative", width: 1, height: 1 }}>
                  <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
                  {/* שכבת הקישורים — אזורים שקופים לחיצים מעל הקנבס, במיקום מדויק לפי ה-PDF.
                      קישור חיצוני נפתח בטאב חדש; יעד פנימי מדפדף לשקופית. */}
                  {links.map((l, idx) => {
                    const boxStyle = {
                      position: "absolute" as const,
                      left: `${l.left}%`,
                      top: `${l.top}%`,
                      width: `${l.width}%`,
                      height: `${l.height}%`,
                      zIndex: 2,
                      borderRadius: 6,
                      cursor: "pointer",
                    };
                    return l.url ? (
                      <a
                        key={idx}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="קישור מהמסמך"
                        title="פתיחת הקישור"
                        style={boxStyle}
                      />
                    ) : (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`מעבר לשקופית ${(l.page ?? 0) + 1}`}
                        title={`מעבר לשקופית ${(l.page ?? 0) + 1}`}
                        onClick={() => setI(Math.min(num - 1, Math.max(0, l.page ?? 0)))}
                        style={{ ...boxStyle, background: "transparent", border: 0, padding: 0, appearance: "none" }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="slideshow__bar">
              <button type="button" className="slidebtn" onClick={() => go(-1)} disabled={i === 0}>
                › הקודם
              </button>
              <span className="slideshow__count">
                {num ? `שקופית ${i + 1} מתוך ${num}` : "טוען…"}
              </span>
              <button type="button" className="slidebtn" onClick={() => go(1)} disabled={num === 0 || i === num - 1}>
                הבא ‹
              </button>
            </div>
          </div>
        </div>
  );

  if (embed) return frame;

  // מקטע עצמאי בעמוד הבית — כותרת מקטע במבנה הזהה למצגת של "מספרים מכוונים"
  // (eyebrow "מצגת" + שם המצגת), ומסגרת pdfframe זהה.
  return (
    <section className="section" id="presentation">
      <div className="container">
        <SectionHead eyebrow="מצגת" title="גאומטריה קדם-היסקית" />
        {frame}
      </div>
    </section>
  );
}
