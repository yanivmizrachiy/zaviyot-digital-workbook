"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./book95Print.module.css";

declare global {
  interface Window {
    __BOOK95_READY?: boolean;
  }
}

export function Book95PrintPages({
  pages,
  tone,
  autoPrint,
}: {
  pages: number[];
  tone: "color" | "bw";
  autoPrint: boolean;
}) {
  const refs = useRef(new Map<number, HTMLIFrameElement>());
  const [loaded, setLoaded] = useState(0);
  const fired = useRef(false);

  const waitForFrame = useCallback(async (frame: HTMLIFrameElement) => {
    const doc = frame.contentDocument;
    if (!doc) return;
    try { await doc.fonts?.ready; } catch {}
    const images = [...doc.images];
    await Promise.all(images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }
      try { if (img.decode) await img.decode(); } catch {}
    }));
  }, []);

  const printWhenReady = useCallback(async () => {
    if (fired.current || loaded !== pages.length || pages.length === 0) return;
    fired.current = true;
    await Promise.all([...refs.current.values()].map(waitForFrame));
    window.__BOOK95_READY = true;
    if (autoPrint) window.setTimeout(() => window.print(), 120);
  }, [autoPrint, loaded, pages.length, waitForFrame]);

  useEffect(() => {
    void printWhenReady();
  }, [printWhenReady]);

  return (
    <main className={`${styles.root} ${tone === "bw" ? styles.bw : ""}`} dir="rtl">
      <div className={styles.screenBar}>
        <div>
          <strong>חוברת העבודה — זוויות</strong>
          <span>{pages.length} עמודי A4 · {tone === "bw" ? "שחור־לבן" : "צבע מלא"}</span>
        </div>
        <div className={styles.status} aria-live="polite">
          {loaded < pages.length ? `מכין להדפסה: ${loaded} מתוך ${pages.length}` : "החוברת מוכנה"}
        </div>
        <button type="button" disabled={loaded < pages.length} onClick={() => void printWhenReady().then(() => window.print())}>
          הדפסה / שמירה כ־PDF
        </button>
      </div>

      <div className={styles.pages}>
        {pages.map((page) => (
          <section className={`${styles.sheet} bkprint__page`} data-book95-print-page={page} key={page}>
            <iframe
              ref={(node) => {
                if (node) refs.current.set(page, node);
                else refs.current.delete(page);
              }}
              title={`עמוד ${page}`}
              src={`/api/book95/${page}?embed=1`}
              loading="eager"
              onLoad={() => setLoaded((count) => Math.min(pages.length, count + 1))}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
