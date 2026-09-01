"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOK95_TOTAL, clampBook95Page } from "@/lib/book95";
import styles from "./printDialog.module.css";

type Scope = "all" | "current" | "range";
type Tone = "color" | "bw";

export function Book95PrintDialog({
  currentPage,
  open,
  onClose,
}: {
  currentPage: number;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scope, setScope] = useState<Scope>("all");
  const [tone, setTone] = useState<Tone>("color");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(BOOK95_TOTAL);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const handleClose = () => onClose();
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  const pages = useMemo(() => {
    if (scope === "all") return "all";
    if (scope === "current") return String(currentPage);
    const a = clampBook95Page(from);
    const b = clampBook95Page(to);
    return `${Math.min(a, b)}-${Math.max(a, b)}`;
  }, [scope, currentPage, from, to]);

  const previewPage = scope === "current" ? currentPage : scope === "range" ? Math.min(clampBook95Page(from), clampBook95Page(to)) : 1;

  const print = () => {
    const query = new URLSearchParams({ pages, tone, autoprint: "1" });
    window.open(`/book95/print?${query.toString()}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} dir="rtl" aria-labelledby="book95-print-title">
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 id="book95-print-title">הדפסת חוברת העבודה</h2>
            <p>95 דפי עבודה · A4 · מספור רציף</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="סגירה">×</button>
        </div>

        <div className={styles.content}>
          <figure className={styles.preview}>
            <iframe title={`תצוגה מקדימה של עמוד ${previewPage}`} src={`/api/book95/${previewPage}?embed=1`} />
            <figcaption>תצוגה מקדימה · עמוד {previewPage}</figcaption>
          </figure>

          <div className={styles.options}>
            <fieldset>
              <legend>היקף ההדפסה</legend>
              <label><input type="radio" name="book95-scope" checked={scope === "all"} onChange={() => setScope("all")} /> כל החוברת — 95 עמודים</label>
              <label><input type="radio" name="book95-scope" checked={scope === "current"} onChange={() => setScope("current")} /> העמוד הנוכחי — {currentPage}</label>
              <label className={styles.rangeChoice}>
                <span><input type="radio" name="book95-scope" checked={scope === "range"} onChange={() => setScope("range")} /> טווח עמודים</span>
                <span className={styles.rangeInputs}>
                  <span>מעמוד</span>
                  <input type="number" min={1} max={BOOK95_TOTAL} value={from} onFocus={() => setScope("range")} onChange={(e) => setFrom(clampBook95Page(Number(e.target.value) || 1))} />
                  <span>עד</span>
                  <input type="number" min={1} max={BOOK95_TOTAL} value={to} onFocus={() => setScope("range")} onChange={(e) => setTo(clampBook95Page(Number(e.target.value) || BOOK95_TOTAL))} />
                </span>
              </label>
            </fieldset>

            <fieldset>
              <legend>צבע</legend>
              <label><input type="radio" name="book95-tone" checked={tone === "color"} onChange={() => setTone("color")} /> צבע מלא</label>
              <label><input type="radio" name="book95-tone" checked={tone === "bw"} onChange={() => setTone("bw")} /> שחור־לבן</label>
            </fieldset>

            <div className={styles.note}>הדפדפן יפתח חלון הדפסה. להורדת PDF בחרו בו „שמירה כ־PDF”.</div>
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
