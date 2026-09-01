"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  WORKSHEETS_TOTAL,
  WS_GROUPS,
  WS_PAGES,
  WS_TOTAL,
} from "@/components/worksheets/registry";
import styles from "./reader.module.css";

const A4_W = 794;
const A4_H = 1123;
const MODE_KEY = "zaviyot:reader:mode";
const PAGE_KEY = "zaviyot:reader:last-page";
const SELECTED_KEY = "zaviyot:reader:selected";

type ReaderMode = "single" | "spread" | "scroll";

type HistoryKind = "push" | "replace";

function clampPage(value: number) {
  return Math.min(WS_TOTAL, Math.max(1, Math.trunc(value)));
}

function validMode(value: string | null): ReaderMode | null {
  return value === "single" || value === "spread" || value === "scroll" ? value : null;
}

function groupFor(page: number) {
  return WS_GROUPS.find((group) => page >= group.from && page <= group.to) ?? WS_GROUPS[0];
}

function frameUrl(page: number) {
  return `/worksheets/${page}?embed=1`;
}

function PageFrame({ page, scale, lazy = false }: { page: number; scale: number; lazy?: boolean }) {
  const meta = WS_PAGES[page - 1];
  return (
    <div
      className={styles.sheetSlot}
      data-book-page={page}
      style={{ width: `${A4_W * scale}px`, height: `${A4_H * scale}px` }}
    >
      <iframe
        className={styles.sheetFrame}
        src={frameUrl(page)}
        title={`עמוד ${page}: ${meta.title}`}
        loading={lazy ? "lazy" : "eager"}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function RazPagesZaviyotReader() {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<ReaderMode>("single");
  const [query, setQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [tocOpen, setTocOpen] = useState(false);
  const [mobileActions, setMobileActions] = useState(false);
  const [stageWidth, setStageWidth] = useState(1000);
  const [viewportHeight, setViewportHeight] = useState(900);
  const searchRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const writeUrl = useCallback((nextPage: number, nextMode: ReaderMode, kind: HistoryKind) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(nextPage));
    url.searchParams.set("mode", nextMode);
    if (kind === "push") window.history.pushState({ page: nextPage, mode: nextMode }, "", url);
    else window.history.replaceState({ page: nextPage, mode: nextMode }, "", url);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = Number(params.get("page"));
    const urlMode = validMode(params.get("mode"));
    let initialPage = Number.isInteger(urlPage) && urlPage >= 1 && urlPage <= WS_TOTAL ? urlPage : 1;
    let initialMode: ReaderMode = urlMode ?? "single";
    try {
      if (initialPage === 1) {
        const savedPage = Number(localStorage.getItem(PAGE_KEY));
        if (Number.isInteger(savedPage) && savedPage >= 1 && savedPage <= WS_TOTAL) initialPage = savedPage;
      }
      if (!urlMode) initialMode = validMode(localStorage.getItem(MODE_KEY)) ?? "single";
      const savedSelected = JSON.parse(localStorage.getItem(SELECTED_KEY) ?? "[]") as number[];
      setSelected(new Set(savedSelected.filter((n) => Number.isInteger(n) && n >= 1 && n <= WS_TOTAL)));
    } catch {}
    setPage(initialPage);
    setMode(initialMode);
    writeUrl(initialPage, initialMode, "replace");
  }, [writeUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_KEY, String(page));
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(SELECTED_KEY, JSON.stringify([...selected].sort((a, b) => a - b)));
    } catch {}
  }, [page, mode, selected]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextPage = Number(params.get("page"));
      const nextMode = validMode(params.get("mode"));
      if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= WS_TOTAL) setPage(nextPage);
      if (nextMode) setMode(nextMode);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const update = () => setStageWidth(node.clientWidth || 1000);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((value: number, history: HistoryKind = "push") => {
    const next = clampPage(value);
    setPage(next);
    writeUrl(next, mode, history);
    if (window.matchMedia("(max-width: 820px)").matches) setTocOpen(false);
  }, [mode, writeUrl]);

  const changeMode = useCallback((next: ReaderMode) => {
    setMode(next);
    writeUrl(page, next, "push");
  }, [page, writeUrl]);

  const step = mode === "spread" ? 2 : 1;
  const previous = useCallback(() => goTo(page - step), [goTo, page, step]);
  const next = useCallback(() => goTo(page + step), [goTo, page, step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        target?.matches("input, textarea, select, button, [contenteditable='true']")
      ) return;
      if (event.key === "ArrowRight" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      } else if (event.key === "ArrowLeft" || event.key === "PageDown") {
        event.preventDefault();
        next();
      } else if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous]);

  const currentGroup = groupFor(page);
  const perRow = mode === "spread" ? 2 : 1;
  const horizontalScale = Math.max(
    0.25,
    Math.min(1, (stageWidth - (perRow === 2 ? 42 : 24)) / (A4_W * perRow)),
  );
  const fittedScale = mode === "scroll"
    ? horizontalScale
    : Math.max(0.25, Math.min(horizontalScale, (viewportHeight * 0.72) / A4_H));

  const spreadPages = useMemo(() => {
    const result = [page];
    if (page + 1 <= WS_TOTAL) result.push(page + 1);
    return result;
  }, [page]);

  const scrollPages = useMemo(
    () => Array.from({ length: currentGroup.to - currentGroup.from + 1 }, (_, i) => currentGroup.from + i),
    [currentGroup.from, currentGroup.to],
  );

  useEffect(() => {
    if (mode !== "scroll") return;
    const root = stageRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-book-page]")];
    const observer = new IntersectionObserver((entries) => {
      const best = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const nextPage = Number((best.target as HTMLElement).dataset.bookPage);
      if (!Number.isInteger(nextPage) || nextPage === page) return;
      setPage(nextPage);
      writeUrl(nextPage, "scroll", "replace");
    }, { threshold: [0.35, 0.55, 0.75] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [mode, scrollPages, page, writeUrl]);

  const pageRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("he");
    return WS_PAGES.map((meta, index) => {
      const number = index + 1;
      const group = groupFor(number);
      return { number, meta, group };
    }).filter(({ meta, group, number }) => {
      if (!needle) return true;
      return `${number} ${meta.title} ${group.title}`.toLocaleLowerCase("he").includes(needle);
    });
  }, [query]);

  const toggleSelected = (number: number) => {
    setSelected((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(number)) nextSet.delete(number);
      else nextSet.add(number);
      return nextSet;
    });
  };

  const selectGroup = (from: number, to: number) => {
    setSelected((prev) => {
      const nextSet = new Set(prev);
      for (let n = from; n <= to; n++) nextSet.add(n);
      return nextSet;
    });
  };

  const openPrint = (pages: number[] | "all") => {
    const value = pages === "all" ? "all" : pages.join(",");
    window.open(`/worksheets/print?pages=${encodeURIComponent(value)}&print=1`, "_blank", "noopener,noreferrer");
  };

  const downloadHtml = async () => {
    const response = await fetch(frameUrl(page), { cache: "no-store" });
    if (!response.ok) return;
    const html = await response.text();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `זוויות-עמוד-${page}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const currentTitle = WS_PAGES[page - 1]?.title ?? `עמוד ${page}`;
  const selectedPages = [...selected].sort((a, b) => a - b);

  return (
    <div className={styles.reader} dir="rtl">
      <header className={styles.header}>
        <button className={styles.tocToggle} onClick={() => setTocOpen((value) => !value)} aria-expanded={tocOpen}>☰ תוכן</button>
        <div className={styles.brand}>
          <strong>הוראת זוויות בכיתה ז׳</strong>
          <span>ספר דיגיטלי · {WS_TOTAL} עמודים · {WORKSHEETS_TOTAL} דפי עבודה</span>
        </div>
        <div className={styles.searchWrap}>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש בספר…"
            aria-label="חיפוש בספר"
          />
          {query && (
            <div className={styles.searchResults}>
              {pageRows.slice(0, 10).map(({ number, meta, group }) => (
                <button key={number} onClick={() => { goTo(number); setQuery(""); }}>
                  <b>{meta.title}</b><span>{group.title} · עמ׳ {number}</span>
                </button>
              ))}
              {!pageRows.length && <div className={styles.empty}>לא נמצאו תוצאות</div>}
            </div>
          )}
        </div>
        <div className={styles.modeSwitch} aria-label="מצב תצוגה">
          <button className={mode === "single" ? styles.activeMode : ""} onClick={() => changeMode("single")}>עמוד</button>
          <button className={mode === "spread" ? styles.activeMode : ""} onClick={() => changeMode("spread")}>כפולה</button>
          <button className={mode === "scroll" ? styles.activeMode : ""} onClick={() => changeMode("scroll")}>גלילה</button>
        </div>
        <div className={styles.stats}>עמ׳ {page}/{WS_TOTAL}</div>
      </header>

      <div className={styles.layout}>
        <aside className={`${styles.toc} ${tocOpen ? styles.tocOpen : ""}`} aria-label="תוכן העניינים">
          <div className={styles.tocHead}>
            <strong>תוכן העניינים</strong>
            <button onClick={() => setSelectionMode((value) => !value)}>{selectionMode ? "סיום בחירה" : "☑ בחירה"}</button>
          </div>
          <div className={styles.tocList}>
            {WS_GROUPS.map((group) => {
              const rows = pageRows.filter(({ number }) => number >= group.from && number <= group.to);
              if (!rows.length) return null;
              return (
                <section className={styles.tocGroup} key={group.title}>
                  <div className={styles.groupHead}>
                    {selectionMode && (
                      <input
                        type="checkbox"
                        aria-label={`בחירת ${group.title}`}
                        checked={Array.from({ length: group.to - group.from + 1 }, (_, i) => group.from + i).every((n) => selected.has(n))}
                        onChange={() => selectGroup(group.from, group.to)}
                      />
                    )}
                    <button onClick={() => goTo(group.from)}>{group.title}</button>
                    <span>{group.to - group.from + 1}</span>
                  </div>
                  <div className={styles.groupPages}>
                    {rows.map(({ number, meta }) => (
                      <div className={`${styles.pageRow} ${number === page ? styles.currentRow : ""}`} key={number}>
                        {selectionMode ? (
                          <input type="checkbox" checked={selected.has(number)} onChange={() => toggleSelected(number)} aria-label={`בחירת עמוד ${number}`} />
                        ) : <span className={styles.pageNumber}>{number}</span>}
                        <button onClick={() => goTo(number)} title={meta.title}>{meta.title}</button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageMeta}>
            <div><strong>{currentTitle}</strong><span>{currentGroup.title} · עמוד {page} מתוך {WS_TOTAL}</span></div>
            <div className={styles.actions}>
              <button onClick={() => openPrint([page])}>🖨 הדפסה</button>
              <button onClick={() => openPrint([page])}>⬇ PDF</button>
              <button onClick={() => void downloadHtml()}>HTML</button>
              <button onClick={() => window.open(`/worksheets/${page}`, "_blank", "noopener,noreferrer")}>↗ פתח</button>
              <button onClick={() => openPrint(Array.from({ length: currentGroup.to - currentGroup.from + 1 }, (_, i) => currentGroup.from + i))}>🖨 פרק</button>
            </div>
          </div>

          <div ref={stageRef} className={`${styles.stage} ${styles[`mode_${mode}`]}`}>
            {mode === "single" && <PageFrame page={page} scale={fittedScale} />}
            {mode === "spread" && (
              <div className={styles.spread}>
                {spreadPages.map((number) => <PageFrame key={number} page={number} scale={fittedScale} />)}
              </div>
            )}
            {mode === "scroll" && (
              <div className={styles.scrollStack}>
                {scrollPages.map((number) => <PageFrame key={number} page={number} scale={fittedScale} lazy />)}
              </div>
            )}
            {mode !== "scroll" && (
              <>
                <button className={`${styles.edgeNav} ${styles.edgePrev}`} onClick={previous} disabled={page <= 1} aria-label="לעמוד הקודם">›</button>
                <button className={`${styles.edgeNav} ${styles.edgeNext}`} onClick={next} disabled={page >= WS_TOTAL} aria-label="לעמוד הבא">‹</button>
              </>
            )}
          </div>

          <div className={styles.bottomNav}>
            <button onClick={previous} disabled={page <= 1}>הקודם</button>
            <span>{page} / {WS_TOTAL}</span>
            <button onClick={next} disabled={page >= WS_TOTAL}>הבא</button>
          </div>
        </main>
      </div>

      {selectionMode && (
        <div className={styles.selectionBar}>
          <strong>{selected.size} נבחרו</strong>
          <button disabled={!selected.size} onClick={() => openPrint(selectedPages)}>הדפסת הנבחרים</button>
          <button disabled={!selected.size} onClick={() => openPrint(selectedPages)}>PDF לנבחרים</button>
          <button onClick={() => setSelected(new Set())}>נקה בחירה</button>
        </div>
      )}

      <div className={styles.mobileNav}>
        <button onClick={previous} disabled={page <= 1}>הקודם</button>
        <button onClick={() => setMobileActions(true)}>⚙ פעולות</button>
        <button onClick={() => window.open(`/worksheets/${page}`, "_blank", "noopener,noreferrer")}>פתח מלא</button>
        <button onClick={next} disabled={page >= WS_TOTAL}>הבא</button>
      </div>

      {mobileActions && (
        <div className={styles.sheetBackdrop} onClick={() => setMobileActions(false)}>
          <section className={styles.mobileSheet} onClick={(event) => event.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h3>פעולות</h3>
            <div className={styles.mobileModes}>
              <button className={mode === "single" ? styles.activeMode : ""} onClick={() => { changeMode("single"); setMobileActions(false); }}>עמוד</button>
              <button className={mode === "scroll" ? styles.activeMode : ""} onClick={() => { changeMode("scroll"); setMobileActions(false); }}>גלילה רציפה</button>
            </div>
            <button onClick={() => openPrint([page])}>הדפסת העמוד / PDF</button>
            <button onClick={() => void downloadHtml()}>הורדת HTML</button>
            <button onClick={() => window.open(`/worksheets/${page}`, "_blank", "noopener,noreferrer")}>פתיחה בכרטיסייה</button>
            <button onClick={() => openPrint(Array.from({ length: currentGroup.to - currentGroup.from + 1 }, (_, i) => currentGroup.from + i))}>הדפסת הפרק</button>
            <button onClick={() => { selectGroup(currentGroup.from, currentGroup.to); setSelectionMode(true); setMobileActions(false); }}>בחירת הפרק</button>
            <button className={styles.closeSheet} onClick={() => setMobileActions(false)}>סגירה</button>
          </section>
        </div>
      )}
    </div>
  );
}
