"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { WS_PAGES, WS_TOTAL, wsPageImage } from "@/components/worksheets/registry";
import { worksheetContentNode } from "@/components/worksheets/WorksheetPageRenderer";
import { WorksheetPicker } from "@/components/worksheets/WorksheetPicker";
import {
  backCoverPos,
  bookShift,
  clampPos,
  lastOpenSpread,
  pageAtPos,
  pagesAtSpread,
  posOfSpread,
  spreadOfPos,
  type PageRef,
} from "./spreads";
import { BackCover, InsideBackCover } from "./BookCovers";
import { TableOfContentsPanel } from "./TableOfContentsPanel";
import { frankRuhl, heebo } from "./fonts";
import "./flipbook.css";

// ============================================================================
// FlipbookViewer — חוברת דפדוף תלת-ממדית, RTL אמיתי (עמוד 1 משמאל, הדף
// מתהפך סביב השדרה ימינה). השער = עמוד 1 האמיתי של החוברת (מכתב המורה של
// איילת). גרירת דף, מקלדת, swipe, זום, מסך מלא, תוכן עניינים צף ושמירת
// העמוד הנוכחי. מימוש עצמי (ללא ספרייה): react-pageflip אינו תומך רשמית
// ב-React 19, ו-StPageFlip משכפל DOM ולכן שובר את העמודים החיים
// (מצגת PDF.js, תוכן עניינים לחיץ, עמוד היישומון).
// ============================================================================

const SHEET_W = 860;
const SHEET_H = (860 * 297) / 210; // A4 מדויק
const STORAGE_KEY = "zaviyot:lxbook:pos";
const FLIP_MS = 900;
const COVER_MS = 1000;

type Flip = { dir: "fwd" | "back"; A: number; B: number };

const easeInOutQuart = (x: number) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/** תוכן של פנים-דף אחד: כריכות, פנים-כריכות או עמוד חוברת (דרך ה-renderer המשותף). */
function LxPageContent({
  pr,
  scale,
  onJump,
}: {
  pr: PageRef;
  scale: number;
  onJump: (page1Based: number) => void;
}) {
  switch (pr.kind) {
    case "none":
      return null;
    case "blank":
      return <div className="lx-blankpage" aria-hidden="true" />;
    case "back-inner":
      return <InsideBackCover />;
    case "back-cover":
      return <BackCover />;
    case "page": {
      const page = WS_PAGES[pr.page - 1];
      if (!page) return null;
      const node = worksheetContentNode(page, {
        slot: pr.page,
        presentation: "embed",
        tocOnJump: onJump,
      });
      const content =
        page.kind === "presentation" ? (
          <div className="lx-preswrap">
            <h4 className="lx-preswrap__title">מצגת ההוראה</h4>
            <p className="lx-preswrap__sub">גאומטריה קדם-היסקית · לצפייה, לדפדוף ולהורדה</p>
            <div>{node}</div>
          </div>
        ) : (
          node
        );
      return (
        <>
          <div className="lx-pagescale" style={{ width: SHEET_W, height: SHEET_H, transform: `scale(${scale})` }}>
            {content}
          </div>
          {/* מספור עמודים ברור על העמוד עצמו (השער — עמוד 1 — נשאר נקי, כמו בדפוס).
              ספר עברי: עמוד זוגי יושב מימין ⇒ המספר בפינה הימנית-תחתונה; עמוד
              אי-זוגי יושב משמאל ⇒ המספר בפינה השמאלית-תחתונה. */}
          {pr.page > 1 && (
            <span
              className={`lx-pagenum ${pr.page % 2 === 0 ? "lx-pagenum--right" : "lx-pagenum--left"}`}
              aria-hidden="true"
            >
              {pr.page}
            </span>
          )}
        </>
      );
    }
  }
}

export function FlipbookViewer() {
  const total = WS_TOTAL;
  const backPos = backCoverPos(total);
  const lastSpread = lastOpenSpread(total) + 1;

  const [pos, setPos] = useState(1);
  const [view, setView] = useState<"double" | "single">("double");
  const [pw, setPw] = useState(0); // רוחב עמוד בפיקסלים (0 = טרם נמדד)
  const [flip, setFlip] = useState<Flip | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fade, setFade] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fsActive, setFsActive] = useState(false);
  const [fsFallback, setFsFallback] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);

  const ph = pw * (297 / 210);
  const scale = pw ? pw / SHEET_W : 0;
  const single = view === "single";
  const bookW = single ? pw : pw * 2;

  // המצב הלוגי הנוכחי במונחי המנוע: אינדקס כפולה (דסקטופ) או pos (מובייל).
  const spread = spreadOfPos(pos, total);
  const cur = single ? pos : spread;
  const lastState = single ? backPos : lastSpread;
  const isClosed = pos <= 1;

  const reducedMotion = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (reducedMotion.current = mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // ---- מדידת הבמה: גודל עמוד + מצב תצוגה (כפולה/יחיד) ----
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      // clientWidth/Height כוללים padding — מפחיתים אותו כדי שהספר יישאר
      // בתוך אזור התוכן ולא יגלוש מתחת לסרגלים.
      const cs = window.getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      // ‏!(w > 0) ולא ‏w <= 0‏: על אלמנט מנותק getComputedStyle מחזיר padding ריק,
      // ‏parseFloat("") = NaN, ו-NaN <= 0 הוא false — כך NaN חלחל עד
      // ‏style.width של הספר ("NaN is an invalid value for width") והחוברת נשברה.
      if (!(w > 0) || !(h > 0)) return;
      const canDouble = w >= 680 && w / h >= 0.95;
      // בתצוגת כפולה נשמרת רצועת-צד לחצי הדפדוף — כך הספר גדל עד קצה השטח
      // הפנוי בלי שהחצים יחפפו את הדפים לעולם. במסכים צרים החצים מוקטנים
      // (flipbook.css, ‏≤1100px) והרצועה מצטמצמת בהתאם.
      const ARROW_GUTTER = w >= 1100 ? 128 : 92;
      const nextPw = canDouble
        ? Math.min((w - ARROW_GUTTER) / 2, (h - 6) * (210 / 297))
        : Math.min(w - 8, (h - 4) * (210 / 297));
      setView(canDouble ? "double" : "single");
      setPw(Math.max(200, Math.floor(nextPw)));
    };
    // מדידה ראשונית אסינכרונית: ResizeObserver לא מופעל ב-tab מוסתר (הוא קשור
    // ל-rendering frames), ולכן טעינה ב-background tab הייתה משאירה את הספר נסתר.
    const t = window.setTimeout(measure, 0);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  // ---- שחזור ושמירת העמוד הנוכחי ----
  const restored = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = Number(window.localStorage.getItem(STORAGE_KEY));
        if (Number.isFinite(saved) && saved > 1) setPos(clampPos(saved, total));
      } catch {
        /* private mode */
      }
      restored.current = true;
    }, 0);
    return () => window.clearTimeout(id);
    // רץ פעם אחת אחרי mount בלבד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // לא לשמור לפני שהשחזור הסתיים — אחרת ערך ההתחלה דורס את העמוד השמור.
    if (!restored.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(pos));
    } catch {
      /* private mode */
    }
  }, [pos]);

  // ---- חימום מוקדם של תמונות העמודים השכנים — דפדוף בלי הבזקי טעינה ----
  useEffect(() => {
    for (let p = pos - 4; p <= pos + 4; p++) {
      if (p < 1 || p > total) continue;
      if (WS_PAGES[p - 1]?.kind === "image") {
        const img = new window.Image();
        img.src = wsPageImage(p);
      }
    }
  }, [pos, total]);

  // ---- מנוע האנימציה: q = התקדמות הקיפול (0 = הדף שטוח על צד המקור) ----
  const engine = useRef({ q: 0, raf: 0, dragging: false, didDrag: false, lastX: 0, lastT: 0, vel: 0 });

  const shiftFor = useCallback(
    (state: number) => (single ? 0 : bookShift(state, total) * pw),
    [single, total, pw]
  );
  const tiltFor = useCallback(
    (state: number) => (single ? 0 : state <= 0 ? -8 : state >= lastSpread ? 8 : 0),
    [single, lastSpread]
  );

  const applyFrame = useCallback(
    (f: Flip, q: number) => {
      const stage = stageRef.current;
      const book = bookRef.current;
      const leaf = leafRef.current;
      if (leaf) leaf.style.transform = `rotateY(${(-180 * q).toFixed(3)}deg)`;
      if (book) {
        const shift = shiftFor(f.A) + (shiftFor(f.B) - shiftFor(f.A)) * q;
        const tilt = tiltFor(f.A) * (1 - q) + tiltFor(f.B) * q;
        book.style.transform = `translateX(${shift.toFixed(2)}px)${tilt ? ` rotateY(${tilt.toFixed(2)}deg)` : ""}`;
      }
      stage?.style.setProperty("--fold-shade", Math.sin(q * Math.PI).toFixed(3));
    },
    [shiftFor, tiltFor]
  );

  const commitFlip = useCallback(
    (f: Flip, landedState: number) => {
      cancelAnimationFrame(engine.current.raf);
      stageRef.current?.style.setProperty("--fold-shade", "0");
      setPos(single ? clampPos(landedState, total) : posOfSpread(landedState, total));
      setFlip(null);
    },
    [single, total]
  );

  const animateTo = useCallback(
    (f: Flip, target: 0 | 1, easing: (x: number) => number, baseMs: number) => {
      cancelAnimationFrame(engine.current.raf);
      const from = engine.current.q;
      const span = Math.abs(target - from);
      if (span < 0.001) {
        commitFlip(f, target === 1 ? f.B : f.A);
        return;
      }
      const dur = Math.max(240, baseMs * span);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const q = from + (target - from) * easing(t);
        engine.current.q = q;
        applyFrame(f, q);
        if (t < 1) {
          engine.current.raf = requestAnimationFrame(step);
        } else {
          commitFlip(f, target === 1 ? f.B : f.A);
        }
      };
      engine.current.raf = requestAnimationFrame(step);
    },
    [applyFrame, commitFlip]
  );

  // קפיצה עם מעבר עדין (ללא קיפול) — ל-TOC ולמצב reduced motion.
  const fadeTimer = useRef<number | undefined>(undefined);
  const fadeJump = useCallback((nextPos: number) => {
    cancelAnimationFrame(engine.current.raf);
    setFlip(null);
    setPos(nextPos);
    setFade(true);
    window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => setFade(false), 380);
  }, []);

  /** פתיחת דפדוף. viaDrag: הדף נצמד לאצבע במקום לרוץ לבד. */
  const startFlip = useCallback(
    (dir: "fwd" | "back", viaDrag: boolean): Flip | null => {
      if (flip || fade) return null; // מניעת דפדוף כפול מהיר
      const A = dir === "fwd" ? cur : cur - 1;
      const B = A + 1;
      if (A < (single ? 1 : 0) || B > lastState) return null;
      if (reducedMotion.current) {
        const landed = dir === "fwd" ? B : A;
        fadeJump(single ? landed : posOfSpread(landed, total));
        return null;
      }
      const f: Flip = { dir, A, B };
      engine.current.q = dir === "fwd" ? 0 : 1;
      setFlip(f);
      if (!viaDrag) {
        const coverFlip = A === (single ? 1 : 0) || B === lastState;
        animateTo(f, dir === "fwd" ? 1 : 0, easeInOutQuart, coverFlip ? COVER_MS : FLIP_MS);
      }
      return f;
    },
    [flip, fade, cur, lastState, single, total, animateTo, fadeJump]
  );

  const next = useCallback(() => startFlip("fwd", false), [startFlip]);
  const prev = useCallback(() => startFlip("back", false), [startFlip]);

  // ---- גרירת דף (עכבר/מגע) מאזורי הקצה + swipe מגע על העמוד ----
  const dragState = useRef<{ f: Flip; x0: number } | null>(null);

  const beginDrag = useCallback(
    (dir: "fwd" | "back", e: ReactPointerEvent) => {
      if (zoom > 1) return;
      const f = startFlip(dir, true);
      if (!f) return;
      dragState.current = { f, x0: e.clientX };
      engine.current.dragging = true;
      engine.current.didDrag = false;
      engine.current.lastX = e.clientX;
      engine.current.lastT = performance.now();
      engine.current.vel = 0;
      setDragging(true);
      applyFrame(f, engine.current.q);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom, startFlip, applyFrame]
  );

  const moveDrag = useCallback(
    (e: ReactPointerEvent) => {
      const d = dragState.current;
      if (!d || !engine.current.dragging) return;
      const span = Math.max(240, (single ? 1.05 : 1.2) * pw);
      const dx = e.clientX - d.x0;
      if (Math.abs(dx) > 5) engine.current.didDrag = true;
      const q = d.f.dir === "fwd" ? Math.min(1, Math.max(0, dx / span)) : Math.min(1, Math.max(0, 1 + dx / span));
      const now = performance.now();
      const dt = now - engine.current.lastT;
      if (dt > 0) engine.current.vel = (e.clientX - engine.current.lastX) / dt;
      engine.current.lastX = e.clientX;
      engine.current.lastT = now;
      engine.current.q = q;
      applyFrame(d.f, q);
    },
    [single, pw, applyFrame]
  );

  const endDrag = useCallback(() => {
    const d = dragState.current;
    if (!d) return;
    dragState.current = null;
    engine.current.dragging = false;
    setDragging(false);
    const { q, vel, didDrag } = engine.current;
    const f = d.f;
    if (!didDrag) {
      // לחיצה נקייה — דפדוף מלא באנימציה
      animateTo(f, f.dir === "fwd" ? 1 : 0, easeInOutQuart, f.A === 0 || f.B === lastState ? COVER_MS : FLIP_MS);
      return;
    }
    // השלמה לפי מרחק או מהירות (px/ms): גרירה ימינה משלימה קדימה, ושמאלה אחורה.
    const target: 0 | 1 = f.dir === "fwd" ? (q > 0.32 || vel > 0.45 ? 1 : 0) : (q < 0.68 || vel < -0.45 ? 0 : 1);
    animateTo(f, target, easeOutCubic, 480);
  }, [animateTo, lastState]);

  // swipe מגע על שטח העמוד (לא על רכיבים אינטראקטיביים ולא בזום)
  const swipeCandidate = useRef<{ x0: number; y0: number; id: number } | null>(null);
  const onViewportPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (e.pointerType !== "touch" || zoom > 1 || flip) return;
      const target = e.target as HTMLElement;
      if (target.closest("a,button,input,select,textarea,iframe,canvas,[data-lx-chrome]")) return;
      swipeCandidate.current = { x0: e.clientX, y0: e.clientY, id: e.pointerId };
    },
    [zoom, flip]
  );
  const onViewportPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const c = swipeCandidate.current;
      if (!c || e.pointerId !== c.id) return;
      const dx = e.clientX - c.x0;
      const dy = e.clientY - c.y0;
      if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      swipeCandidate.current = null;
      // גרירה ימינה = קדימה (הדף נודד ימינה בספר עברי); שמאלה = אחורה.
      const f = startFlip(dx > 0 ? "fwd" : "back", true);
      if (!f) return;
      dragState.current = { f, x0: c.x0 };
      engine.current.dragging = true;
      engine.current.didDrag = true;
      engine.current.lastX = e.clientX;
      engine.current.lastT = performance.now();
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [startFlip]
  );
  const onViewportPointerUp = useCallback(() => {
    swipeCandidate.current = null;
    endDrag();
  }, [endDrag]);

  // ---- מקלדת ----
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (tocOpen || pickerOpen) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        next(); // קדימה = שמאלה, כמו במצגת האתר (RTL)
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        prev();
      } else if ((e.key === "Enter" || e.key === " ") && isClosed) {
        e.preventDefault();
        next();
      } else if (e.key === "Home") {
        e.preventDefault();
        fadeJump(1);
      }
    },
    [tocOpen, pickerOpen, next, prev, isClosed, fadeJump]
  );

  // ---- תוכן עניינים: קפיצה לעמוד ----
  const jumpToPage = useCallback(
    (page1: number) => {
      setTocOpen(false);
      const targetPos = clampPos(page1, total);
      const targetState = single ? targetPos : spreadOfPos(targetPos, total);
      if (targetState === cur) return;
      if (Math.abs(targetState - cur) === 1) {
        startFlip(targetState > cur ? "fwd" : "back", false);
      } else {
        fadeJump(targetPos);
      }
    },
    [total, single, cur, startFlip, fadeJump]
  );

  // ---- זום ----
  const pan = useRef({ x: 0, y: 0 });
  const panDrag = useRef<{ x0: number; y0: number; px: number; py: number } | null>(null);
  const applyZoom = useCallback((z: number) => {
    const el = zoomerRef.current;
    if (el) el.style.transform = z === 1 ? "" : `scale(${z}) translate(${pan.current.x}px, ${pan.current.y}px)`;
  }, []);
  const setZoomClamped = useCallback(
    (z: number) => {
      const nz = Math.min(2.6, Math.max(1, Math.round(z * 100) / 100));
      if (nz === 1) pan.current = { x: 0, y: 0 };
      setZoom(nz);
      applyZoom(nz);
    },
    [applyZoom]
  );
  const onZoomPanDown = useCallback(
    (e: ReactPointerEvent) => {
      if (zoom <= 1) return;
      panDrag.current = { x0: e.clientX, y0: e.clientY, px: pan.current.x, py: pan.current.y };
      zoomerRef.current?.classList.add("lx-zoomer--panning");
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom]
  );
  const onZoomPanMove = useCallback(
    (e: ReactPointerEvent) => {
      const p = panDrag.current;
      if (!p) return;
      const limX = (bookW * (zoom - 1)) / (2 * zoom) + 80;
      const limY = (ph * (zoom - 1)) / (2 * zoom) + 80;
      pan.current.x = Math.min(limX, Math.max(-limX, p.px + (e.clientX - p.x0) / zoom));
      pan.current.y = Math.min(limY, Math.max(-limY, p.py + (e.clientY - p.y0) / zoom));
      applyZoom(zoom);
    },
    [zoom, bookW, ph, applyZoom]
  );
  const onZoomPanUp = useCallback(() => {
    panDrag.current = null;
    zoomerRef.current?.classList.remove("lx-zoomer--panning");
  }, []);
  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,input,iframe,canvas,[data-lx-chrome]")) return;
      setZoomClamped(zoom > 1 ? 1 : 1.8);
    },
    [zoom, setZoomClamped]
  );

  // ---- מסך מלא ----
  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (stage.requestFullscreen) {
        await stage.requestFullscreen();
      } else {
        setFsFallback((v) => !v); // iOS iPhone — אין Fullscreen API
      }
    } catch {
      setFsFallback((v) => !v);
    }
  }, []);
  useEffect(() => {
    const sync = () => setFsActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (!fsFallback) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setFsFallback(false);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [fsFallback]);

  // תוכן החצאים והדף המתהפך: בזמן דפדוף — ימין מציג את מצב A, שמאל את מצב B,
  // והדף המתהפך נושא את שני הפנים שביניהם (מתלכד פיקסל-מושלם בשני הקצוות).
  const { rightPage, leftPage, leafFront, leafBack } = useMemo(() => {
    if (single) {
      const base = pageAtPos(flip ? flip.B : pos, total);
      return {
        rightPage: { kind: "none" } as PageRef,
        leftPage: base,
        leafFront: flip ? pageAtPos(flip.A, total) : null,
        leafBack: null as PageRef | null,
      };
    }
    const shown = flip
      ? { right: pagesAtSpread(flip.A, total).right, left: pagesAtSpread(flip.B, total).left }
      : pagesAtSpread(spread, total);
    return {
      rightPage: shown.right,
      leftPage: shown.left,
      leafFront: flip ? pagesAtSpread(flip.A, total).left : null,
      leafBack: flip ? pagesAtSpread(flip.B, total).right : null,
    };
  }, [single, flip, pos, spread, total]);

  // ---- עובי הדפים שנותרו ----
  const openFrac = single ? (pos - 1) / (backPos - 1) : spread / lastSpread;
  const edgeMax = pw * 0.03;
  const isOpen = !isClosed && pos !== backPos;

  // ---- תווית העמודים הנראים (לסרגל) ----
  const visibleNums = useMemo(() => {
    if (pos > total) return [];
    if (single) return [pos];
    return [rightPage, leftPage]
      .filter((r): r is Extract<PageRef, { kind: "page" }> => r.kind === "page")
      .map((r) => r.page)
      .sort((a, b) => a - b);
  }, [pos, total, single, rightPage, leftPage]);

  const currentInnerPage = Math.min(total, Math.max(1, pos));
  const currentPage = pos >= 1 && pos <= total ? WS_PAGES[pos - 1] : null;

  const bookStyle: CSSProperties & Record<"--book-shift" | "--edge-w", string> = {
    width: bookW,
    height: ph,
    visibility: pw ? "visible" : "hidden",
    transform: `translateX(${shiftFor(cur)}px)${tiltFor(cur) ? ` rotateY(${tiltFor(cur)}deg)` : ""}`,
    "--book-shift": `${shiftFor(cur)}px`,
    "--edge-w": "0px",
  };

  const atStart = pos <= 1;
  const atEnd = pos === backPos;

  return (
    <div
      className={`lxbook ${frankRuhl.variable} ${heebo.variable}`}
      data-open={isClosed ? "false" : "true"}
      data-view={view}
      dir="rtl"
    >
      <div
        ref={stageRef}
        className={`lx-stage${fsFallback ? " lx-stage--fsfallback" : ""}`}
        role="region"
        aria-label="החוברת הדיגיטלית — הוראת זוויות בכיתה ז׳"
        aria-roledescription="חוברת דפדוף"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* רקע קולנועי */}
        <div className="lx-stage__glow" aria-hidden="true" />
        <svg className="lx-stage__lines" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <line x1="-40" y1="690" x2="1240" y2="560" />
          <line x1="-40" y1="120" x2="620" y2="-40" />
          <path d="M 1050 840 A 560 560 0 0 0 585 -60" />
          <path d="M -80 430 A 640 640 0 0 1 520 860" />
          <circle cx="1063" cy="577" r="2.2" />
          <circle cx="150" cy="662" r="2.2" />
        </svg>
        <div className="lx-stage__grain" aria-hidden="true" />

        {/* במת הספר */}
        <div
          ref={viewportRef}
          className="lx-viewport"
          onPointerDown={(e) => {
            onViewportPointerDown(e);
            onZoomPanDown(e);
          }}
          onPointerMove={(e) => {
            onViewportPointerMove(e);
            moveDrag(e);
            onZoomPanMove(e);
          }}
          onPointerUp={(e) => {
            onViewportPointerUp();
            onZoomPanUp();
            void e;
          }}
          onPointerCancel={() => {
            onViewportPointerUp();
            onZoomPanUp();
          }}
          onDoubleClick={onDoubleClick}
          style={zoom > 1 ? { cursor: "grab" } : undefined}
        >
          <div ref={zoomerRef} className="lx-zoomer">
            <div className="lx-scene">
              <div
                ref={bookRef}
                className={`lx-book${flip ? " lx-book--flipping" : ""}${dragging ? " lx-book--dragging" : ""}${fade ? " lx-book--fadeswap" : ""}`}
                style={bookStyle}
                onClick={isClosed ? () => next() : undefined}
              >
                {/* עובי הדפים שנותרו */}
                {isOpen && !single && (
                  <>
                    <div className="lx-edges lx-edges--left" style={{ "--edge-w": `${(edgeMax * (1 - openFrac)).toFixed(1)}px` } as CSSProperties} aria-hidden="true" />
                    <div className="lx-edges lx-edges--right" style={{ "--edge-w": `${(edgeMax * openFrac).toFixed(1)}px` } as CSSProperties} aria-hidden="true" />
                  </>
                )}

                {/* חצי ימין */}
                <div className="lx-half lx-half--right" aria-hidden={rightPage.kind === "none" ? "true" : undefined}>
                  {rightPage.kind !== "none" && (
                    <div className={`lx-paper${rightPage.kind === "page" ? " lx-paper--interactive" : ""}`}>
                      <LxPageContent pr={rightPage} scale={scale} onJump={jumpToPage} />
                      {flip && <div className="lx-undershade lx-undershade--right" />}
                    </div>
                  )}
                </div>

                {/* חצי שמאל */}
                <div className="lx-half lx-half--left" aria-hidden={leftPage.kind === "none" ? "true" : undefined}>
                  {leftPage.kind !== "none" && (
                    <div className={`lx-paper${leftPage.kind === "page" ? " lx-paper--interactive" : ""}`}>
                      <LxPageContent pr={leftPage} scale={scale} onJump={jumpToPage} />
                      {flip && <div className="lx-undershade lx-undershade--left" />}
                    </div>
                  )}
                </div>

                {/* קו השדרה */}
                {isOpen && <div className="lx-spineline" aria-hidden="true" />}

                {/* הדף המתהפך */}
                {flip && (
                  <div ref={leafRef} className="lx-leaf" aria-hidden="true">
                    <div className="lx-leaf__face lx-leaf__face--front">
                      {leafFront ? <LxPageContent pr={leafFront} scale={scale} onJump={jumpToPage} /> : <div className="lx-paper lx-paper--blank" />}
                      <div className="lx-leaf__sheen" />
                    </div>
                    <div className="lx-leaf__face lx-leaf__face--back">
                      {leafBack ? <LxPageContent pr={leafBack} scale={scale} onJump={jumpToPage} /> : <div className="lx-paper lx-paper--blank" />}
                      <div className="lx-leaf__sheen" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* אזורי גרירה בקצוות (קדימה משמאל, אחורה מימין — ספר עברי) */}
        {zoom === 1 && (
          <>
            <button
              type="button"
              className="lx-zone lx-zone--next"
              aria-label="הדף הבא"
              disabled={atEnd || Boolean(flip)}
              onPointerDown={(e) => beginDrag("fwd", e)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
            <button
              type="button"
              className="lx-zone lx-zone--prev"
              aria-label="הדף הקודם"
              disabled={atStart || Boolean(flip)}
              onPointerDown={(e) => beginDrag("back", e)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
          </>
        )}

        {/* חצים */}
        {!isClosed && (
          <div className="lx-chrome" data-lx-chrome="true">
            <button type="button" className="lx-arrow lx-arrow--next" onClick={() => { setZoomClamped(1); next(); }} disabled={atEnd} aria-label="הדף הבא" title="הדף הבא (חץ שמאלה)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" className="lx-arrow lx-arrow--prev" onClick={() => { setZoomClamped(1); prev(); }} disabled={atStart} aria-label="הדף הקודם" title="הדף הקודם (חץ ימינה)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* סרגל עליון — פעולות */}
        <div className="lx-topbar lx-chrome" data-lx-chrome="true">
          <span className="lx-topbar__title">הוראת זוויות בכיתה ז׳ · חוברת דיגיטלית</span>
          <span className="lx-topbar__acts">
            <a href={`/worksheets/${currentInnerPage}`} title="מצב קריאה נגיש — העמוד הנוכחי כדף רגיל">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
                <path d="M5 5.5h6M5 8h6M5 10.5h4" strokeLinecap="round" />
              </svg>
              מצב קריאה נגיש
            </a>
            {/* הורדה ישירה של קובץ מוכן (נוצר ב-npm run pdf ממנוע ההדפסה של Chrome) —
                מהירה, בלי חלון הדפסה, וכל הקישורים בחוברת נשארים לחיצים ב-PDF. */}
            <a
              href="/booklet/hoveret-zaviyot.pdf"
              download="הוראת זוויות בכיתה ז׳.pdf"
              title="הורדת החוברת המלאה כ-PDF (כולל קישורים לחיצים)"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M8 1.5v8.5M4.5 7 8 10.5 11.5 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 13.5h11" strokeLinecap="round" />
              </svg>
              הורדת החוברת (PDF)
            </a>
            <button type="button" onClick={() => setPickerOpen(true)} title="הדפסת דפי עבודה נבחרים">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M4 6V2.5h8V6M4 11h-1.5V6h11v5H12" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="9.5" width="8" height="4" rx="0.5" />
              </svg>
              דפים נבחרים
            </button>
          </span>
        </div>

        {/* סרגל תחתון — ניווט */}
        {!isClosed && (
          <div className="lx-toolbar lx-chrome" data-lx-chrome="true" role="toolbar" aria-label="ניווט בחוברת">
            <button type="button" className="lx-toolbar__btn" onClick={() => { setZoomClamped(1); prev(); }} disabled={atStart} aria-label="הדף הקודם" title="הדף הקודם">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <span className="lx-toolbar__pages" aria-live="polite">
              {pos === backPos ? (
                "כריכה אחורית"
              ) : visibleNums.length === 0 ? (
                "סוף החוברת"
              ) : visibleNums.length === 2 ? (
                <>
                  עמודים <b>{`${visibleNums[0]}–${visibleNums[1]}`}</b> מתוך <b>{total}</b>
                </>
              ) : (
                <>
                  עמוד <b>{visibleNums[0] ?? pos}</b> מתוך <b>{total}</b>
                </>
              )}
            </span>
            <button type="button" className="lx-toolbar__btn" onClick={() => { setZoomClamped(1); next(); }} disabled={atEnd} aria-label="הדף הבא" title="הדף הבא">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>

            <span className="lx-toolbar__sep" aria-hidden="true" />

            <button type="button" className="lx-toolbar__btn" onClick={() => setTocOpen(true)} aria-label="תוכן העניינים" title="תוכן העניינים">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
            </button>
            <button type="button" className="lx-toolbar__btn" onClick={() => setZoomClamped(zoom - 0.4)} disabled={zoom <= 1} aria-label="הקטנה" title="הקטנה">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M8 11h6M21 21l-4.3-4.3" /></svg>
            </button>
            <button type="button" className="lx-toolbar__btn" onClick={() => setZoomClamped(zoom + 0.4)} disabled={zoom >= 2.6} aria-label="הגדלה" title="הגדלה">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M21 21l-4.3-4.3" /></svg>
            </button>
            {zoom > 1 && (
              <button type="button" className="lx-toolbar__btn" onClick={() => setZoomClamped(1)} aria-label="איפוס תצוגה" title="איפוס תצוגה">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
              </button>
            )}
            <button type="button" className="lx-toolbar__btn" onClick={toggleFullscreen} aria-pressed={fsActive || fsFallback} aria-label="מסך מלא" title="מסך מלא">
              {fsActive || fsFallback ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" /></svg>
              )}
            </button>

            <span className="lx-toolbar__sep" aria-hidden="true" />

            <button type="button" className="lx-toolbar__btn" onClick={() => fadeJump(1)} aria-label="סגירת החוברת וחזרה לשער" title="סגירת החוברת">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
            </button>
          </div>
        )}

        {/* מסך כניסה — קריאה לפעולה: הכפתור בלבד (טקסט העזר הוסר לבקשת יניב —
            כל הרצועה שמורה עכשיו לכפתור «פתיחת החוברת») */}
        <div className="lx-entry" data-lx-chrome="true">
          <button type="button" className="lx-entry__btn" onClick={() => next()}>
            פתיחת החוברת
          </button>
        </div>

        {/* תוכן עניינים צף */}
        {tocOpen && <TableOfContentsPanel currentPos={pos} onJump={jumpToPage} onClose={() => setTocOpen(false)} />}
      </div>

      {pickerOpen && (
        <WorksheetPicker
          initial={currentPage?.kind === "image" ? [currentPage.img] : []}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
