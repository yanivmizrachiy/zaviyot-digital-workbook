"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOK95_PAGES, BOOK95_TOTAL, clampBook95Page } from "@/lib/book95";
import { Book95PrintDialog } from "./Book95PrintDialog";
import styles from "./book95.module.css";

const STORAGE_KEY = "zaviyot:book95:page";
const BOOKLET_PDF = "/booklet/hoveret-zaviyot-95.pdf";

export function Book95Viewer() {
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [downloadingBooklet, setDownloadingBooklet] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = Number(params.get("page"));
    let initial = Number.isFinite(fromUrl) && fromUrl >= 1 && fromUrl <= BOOK95_TOTAL ? fromUrl : 1;
    try {
      if (initial === 1) {
        const saved = Number(localStorage.getItem(STORAGE_KEY));
        if (Number.isFinite(saved) && saved >= 1 && saved <= BOOK95_TOTAL) initial = saved;
      }
    } catch {}
    setPage(clampBook95Page(initial));
  }, []);

  useEffect(() => {
    setReady(false);
    try { localStorage.setItem(STORAGE_KEY, String(page)); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    window.history.replaceState({}, "", url);
  }, [page]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setPage((p) => clampBook95Page(p + 1));
      if (event.key === "ArrowRight") setPage((p) => clampBook95Page(p - 1));
      if (event.key === "Home") setPage(1);
      if (event.key === "End") setPage(BOOK95_TOTAL);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const neighbors = [page - 1, page + 1].filter((n) => n >= 1 && n <= BOOK95_TOTAL);
    const timer = window.setTimeout(() => {
      neighbors.forEach((n) => {
        void fetch(`/api/book95/${n}?embed=1`, {
          cache: "force-cache",
          signal: controller.signal,
          priority: "low",
        } as RequestInit).catch(() => undefined);
      });
    }, 120);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [page, ready]);

  const src = useMemo(() => `/api/book95/${page}?embed=1`, [page]);
  const source = BOOK95_PAGES[page - 1];
  const previous = () => setPage((p) => clampBook95Page(p - 1));
  const next = () => setPage((p) => clampBook95Page(p + 1));

  const downloadCurrent = () => {
    const a = document.createElement("a");
    a.href = `/api/book95/${page}?download=1`;
    a.download = `זוויות-עמוד-${page}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadBooklet = async () => {
    if (downloadingBooklet) return;
    setDownloadingBooklet(true);
    try {
      const response = await fetch(BOOKLET_PDF, { method: "HEAD", cache: "no-store" });
      if (response.ok) {
        const a = document.createElement("a");
        a.href = BOOKLET_PDF;
        a.download = "חוברת-עבודה-זוויות-95-דפים.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      window.open("/book95/print?pages=all&tone=color&autoprint=1", "_blank", "noopener,noreferrer");
    } catch {
      window.open("/book95/print?pages=all&tone=color&autoprint=1", "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingBooklet(false);
    }
  };

  return (
    <div className={styles.shell} dir="rtl">
      <div className={styles.toolbar} aria-label="כלי החוברת">
        <button className={styles.primary} onClick={previous} disabled={page === 1} aria-label="לעמוד הקודם">הקודם</button>
        <label className={styles.counter}>
          <span>עמוד</span>
          <input
            aria-label="מספר עמוד"
            inputMode="numeric"
            min={1}
            max={BOOK95_TOTAL}
            value={page}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setPage(clampBook95Page(n));
            }}
          />
          <span>מתוך {BOOK95_TOTAL}</span>
        </label>
        <button className={styles.primary} onClick={next} disabled={page === BOOK95_TOTAL} aria-label="לעמוד הבא">הבא</button>
        <span className={styles.spacer} />
        <button onClick={() => setPrintOpen(true)}>הדפסה</button>
        <button onClick={downloadCurrent}>הורדת דף</button>
        <button className={styles.bookletDownload} onClick={() => void downloadBooklet()} disabled={downloadingBooklet}>
          {downloadingBooklet ? "מכין חוברת…" : "הורדת חוברת עבודה"}
        </button>
        <a className={styles.linkButton} href={source.sourceUrl} target="_blank" rel="noreferrer">פתח מלא</a>
      </div>

      <div className={styles.stage}>
        {!ready && <div className={styles.loading} aria-live="polite">טוען את עמוד {page}…</div>}
        <iframe
          ref={frameRef}
          key={page}
          className={`${styles.pageFrame} ${ready ? styles.ready : ""}`}
          src={src}
          title={`דף עבודה ${page} מתוך ${BOOK95_TOTAL}`}
          onLoad={() => setReady(true)}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className={styles.mobileNav}>
        <button onClick={previous} disabled={page === 1}>הקודם</button>
        <strong>{page} / {BOOK95_TOTAL}</strong>
        <button onClick={next} disabled={page === BOOK95_TOTAL}>הבא</button>
      </div>

      <Book95PrintDialog currentPage={page} open={printOpen} onClose={() => setPrintOpen(false)} />
    </div>
  );
}
