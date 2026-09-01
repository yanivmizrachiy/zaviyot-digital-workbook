"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./book95.module.css";

const TOTAL = 95;
const STORAGE_KEY = "zaviyot:book95:page";

function clamp(n: number) {
  return Math.min(TOTAL, Math.max(1, Math.trunc(n)));
}

export function Book95Viewer() {
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = Number(params.get("page"));
    let initial = Number.isFinite(fromUrl) && fromUrl >= 1 && fromUrl <= TOTAL ? fromUrl : 1;
    try {
      if (initial === 1) {
        const saved = Number(localStorage.getItem(STORAGE_KEY));
        if (Number.isFinite(saved) && saved >= 1 && saved <= TOTAL) initial = saved;
      }
    } catch {}
    setPage(clamp(initial));
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
      if (event.key === "ArrowLeft") setPage((p) => clamp(p + 1));
      if (event.key === "ArrowRight") setPage((p) => clamp(p - 1));
      if (event.key === "Home") setPage(1);
      if (event.key === "End") setPage(TOTAL);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const src = useMemo(() => `/api/book95/${page}`, [page]);
  const previous = () => setPage((p) => clamp(p - 1));
  const next = () => setPage((p) => clamp(p + 1));
  const printCurrent = () => window.open(`/api/book95/${page}?print=1`, "_blank", "noopener,noreferrer");
  const downloadCurrent = () => {
    const a = document.createElement("a");
    a.href = `/api/book95/${page}?download=1`;
    a.download = `זוויות-עמוד-${page}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            max={TOTAL}
            value={page}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setPage(clamp(n));
            }}
          />
          <span>מתוך {TOTAL}</span>
        </label>
        <button className={styles.primary} onClick={next} disabled={page === TOTAL} aria-label="לעמוד הבא">הבא</button>
        <span className={styles.spacer} />
        <button onClick={printCurrent}>הדפסה / שמירה כ־PDF</button>
        <button onClick={downloadCurrent}>הורדה</button>
        <a className={styles.linkButton} href={`https://yanivmizrachiy.github.io/razpages/${encodeURIComponent(`עמוד-${page}.html`)}`} target="_blank" rel="noreferrer">פתח מלא</a>
      </div>

      <div className={styles.stage}>
        {!ready && <div className={styles.loading} aria-live="polite">טוען את עמוד {page}…</div>}
        <iframe
          ref={frameRef}
          key={page}
          className={`${styles.pageFrame} ${ready ? styles.ready : ""}`}
          src={src}
          title={`דף עבודה ${page} מתוך ${TOTAL}`}
          onLoad={() => setReady(true)}
          loading="eager"
        />
      </div>

      <div className={styles.mobileNav}>
        <button onClick={previous} disabled={page === 1}>הקודם</button>
        <strong>{page} / {TOTAL}</strong>
        <button onClick={next} disabled={page === TOTAL}>הבא</button>
      </div>
    </div>
  );
}
