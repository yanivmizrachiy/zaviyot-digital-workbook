"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WS_TOTAL } from "@/components/worksheets/registry";
import styles from "@/components/book95/printDialog.module.css";

type Tone = "color" | "bw";

export function ZaviyotPrintDialog({
  open,
  pages,
  label,
  onClose,
}: {
  open: boolean;
  pages: number[];
  label: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tone, setTone] = useState<Tone>("color");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const cancel = (event: Event) => { event.preventDefault(); onClose(); };
    const close = () => onClose();
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", close);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("close", close);
    };
  }, [onClose]);

  const safePages = useMemo(
    () => [...new Set(pages)].filter((n) => Number.isInteger(n) && n >= 1 && n <= WS_TOTAL).sort((a, b) => a - b),
    [pages],
  );
  const previewPage = safePages[0] ?? 1;

  const print = () => {
    const query = new URLSearchParams({
      pages: safePages.length === WS_TOTAL ? "all" : safePages.join(","),
      tone,
      print: "1",
    });
    window.open(`/worksheets/print?${query.toString()}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} dir="rtl" aria-labelledby="zaviyot-print-title">
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 id="zaviyot-print-title">הדפסה</h2>
            <p>{label} · {safePages.length} {safePages.length === 1 ? "עמוד" : "עמודים"} · A4</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="סגירה">×</button>
        </div>

        <div className={styles.content}>
          <figure className={styles.preview}>
            <iframe title={`תצוגה מקדימה של עמוד ${previewPage}`} src={`/worksheets/${previewPage}?embed=1`} />
            <figcaption>תצוגה מקדימה · עמוד {previewPage}</figcaption>
          </figure>

          <div className={styles.options}>
            <fieldset>
              <legend>צבע</legend>
              <label><input type="radio" name="zaviyot-tone" checked={tone === "color"} onChange={() => setTone("color")} /> צבע מלא</label>
              <label><input type="radio" name="zaviyot-tone" checked={tone === "bw"} onChange={() => setTone("bw")} /> שחור־לבן</label>
            </fieldset>
            <div className={styles.note}>לאחר הלחיצה ייפתח חלון ההדפסה. להורדת PDF בחרו „שמירה כ־PDF”.</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.print} onClick={print}>הדפסה / שמירה כ־PDF</button>
          <button type="button" className={styles.cancel} onClick={onClose}>ביטול</button>
        </div>
      </div>
    </dialog>
  );
}
