"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { WS_GROUPS, WS_IMAGE_PAGES, WS_PDF_URL } from "./registry";

// בורר עמודים ידידותי — המורה בוחר בדיוק אילו עמודים להוריד כ-PDF או להדפיס.
// פועל על עמודי התמונה של החוברת בלבד (עמוד המצגת מוטמע ומורד בנפרד מתוכו).
// הרשת מקובצת לשערי החוברת (WS_GROUPS) עם כותרת שער אחידה, ולכל שער פריסט
// בחירה משלו; פריסטים נוספים: כל החוברת / ניקוי.
// הורדה = PDF אמיתי של הנבחרים (pdf-lib). הדפסה = חלון הדפסה עם הנבחרים בלבד.
const imgUrl = (img: number) => `/booklet-worksheets/page-${String(img).padStart(2, "0")}.webp`;

export function WorksheetPicker({
  initial,
  onClose,
}: {
  initial?: number[]; // מספרי תמונה (img)
  onClose: () => void;
}) {
  const validInitial = useMemo(
    () => (initial ?? []).filter((im) => WS_IMAGE_PAGES.some((p) => p.img === im)),
    [initial]
  );
  const [sel, setSel] = useState<Set<number>>(() => new Set(validInitial));
  const [busy, setBusy] = useState<null | "download" | "print">(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const TOTAL = WS_IMAGE_PAGES.length;
  // שערי החוברת שיש בהם עמודי תמונה — לכותרות הרשת ולפריסטים (שמות אחידים לשערים).
  const groups = useMemo(
    () =>
      WS_GROUPS
        .map((g) => ({ title: g.title, pages: WS_IMAGE_PAGES.filter((p) => p.slot >= g.from && p.slot <= g.to) }))
        .filter((g) => g.pages.length > 0),
    []
  );
  const count = sel.size;
  const ordered = useMemo(() => [...sel].sort((a, b) => a - b), [sel]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const toggle = (im: number) =>
    setSel((s) => {
      const next = new Set(s);
      if (next.has(im)) next.delete(im);
      else next.add(im);
      return next;
    });
  const selectOnly = (imgs: number[]) => setSel(new Set(imgs));

  async function download() {
    if (!count || busy) return;
    setBusy("download");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await fetch(WS_PDF_URL).then((r) => r.arrayBuffer());
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, ordered.map((im) => im - 1));
      pages.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        ordered.length === TOTAL
          ? "זוויות בכיתה ז׳ — חוברת דפי עבודה.pdf"
          : `זוויות — עמודים נבחרים (${ordered.length}).pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      console.error("[WorksheetPicker] download failed:", e);
      alert("לא הצלחנו להכין את קובץ ההורדה. נסו שוב.");
    } finally {
      setBusy(null);
    }
  }

  function print() {
    if (!count || busy) return;
    setBusy("print");
    const origin = window.location.origin;
    const imgs = ordered.map((im) => `<img src="${origin}${imgUrl(im)}" alt="דף ${im}" />`).join("");
    const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>זוויות — עמודים נבחרים</title>
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #fff; }
  img { display: block; width: 210mm; height: 297mm; object-fit: contain; page-break-after: always; break-after: page; }
  img:last-child { page-break-after: auto; break-after: auto; }
</style></head><body>${imgs}
<script>
  (function () {
    var imgs = Array.prototype.slice.call(document.images);
    var left = imgs.length;
    function done() { if (--left <= 0) { window.focus(); window.print(); } }
    if (!imgs.length) { window.print(); return; }
    imgs.forEach(function (im) {
      if (im.complete) done();
      else { im.addEventListener('load', done); im.addEventListener('error', done); }
    });
  })();
<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      alert("החלון נחסם. אפשרו חלונות קופצים כדי להדפיס.");
      setBusy(null);
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => setBusy(null), 800);
  }

  // ---- סגנון עצמאי (inline) כדי לא לגעת ב-globals.css המשותף ----
  const overlay: CSSProperties = { position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 };
  const modal: CSSProperties = { width: "min(960px, 98vw)", maxHeight: "94vh", background: "#fff", borderRadius: 16, boxShadow: "0 24px 70px rgba(15,23,42,.35)", display: "flex", flexDirection: "column", overflow: "hidden", direction: "rtl" };
  const head: CSSProperties = { padding: "16px 20px", background: "#0f1e3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, zIndex: 11 };
  const presetBar: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 20px 8px", position: "sticky", top: "56px", background: "#fff", borderBottom: "1px solid var(--border, #e7eaf1)", zIndex: 10 };
  const chip = (active = false): CSSProperties => ({ border: `1.5px solid ${active ? "#0f1e3a" : "var(--border, #d8dbe4)"}`, background: active ? "#0f1e3a" : "#f4f6fb", color: active ? "#fff" : "#1f2a44", borderRadius: 999, padding: "7px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" });
  const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, padding: 20, overflowY: "auto", flex: 1 };
  const foot: CSSProperties = { padding: "14px 20px", borderTop: "1px solid var(--border, #e7eaf1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#fbfcfe" };
  const btn = (kind: "gold" | "ghost", disabled = false): CSSProperties => ({ border: kind === "gold" ? "none" : "1.5px solid var(--border, #d8dbe4)", background: disabled ? "#cbd2e0" : kind === "gold" ? "#d4a53a" : "#fff", color: kind === "gold" ? "#1a1204" : "#1f2a44", borderRadius: 10, padding: "10px 18px", fontSize: 15, fontWeight: 700, cursor: disabled ? "default" : "pointer" });

  const allSel = count === TOTAL;
  const groupSel = (imgs: number[]) => count === imgs.length && imgs.every((im) => sel.has(im));

  return (
    <div style={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal} role="dialog" aria-modal="true" aria-label="בחירת עמודים להורדה או הדפסה">
        <div style={head}>
          <strong style={{ fontSize: 18 }}>בחירת עמודים — הורדה או הדפסה</strong>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="סגירה" style={{ ...btn("ghost"), padding: "6px 12px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)" }}>
            סגירה ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <div style={presetBar}>
            <button type="button" style={chip(allSel)} onClick={() => selectOnly(WS_IMAGE_PAGES.map((p) => p.img))}>כל החוברת ({TOTAL})</button>
            {groups.map((g) => {
              const imgs = g.pages.map((p) => p.img);
              return (
                <button key={g.title} type="button" style={chip(groupSel(imgs))} onClick={() => selectOnly(imgs)}>
                  רק {g.title} ({imgs.length})
                </button>
              );
            })}
            <button type="button" style={chip(false)} onClick={() => setSel(new Set())}>ניקוי הבחירה</button>
          </div>

          <div style={grid}>
          {groups.map((g) => (
            <div key={g.title} style={{ display: "contents" }}>
              <p className="ws-tocgroup" style={{ gridColumn: "1 / -1", marginTop: 4 }}>{g.title}</p>
              {g.pages.map((p) => {
                const active = sel.has(p.img);
                return (
                  <button
                    key={p.img}
                    type="button"
                    onClick={() => toggle(p.img)}
                    aria-pressed={active}
                    title={`${p.title} — עמוד ${p.slot}`}
                    style={{ border: `2px solid ${active ? "#d4a53a" : "var(--border, #e0e3ec)"}`, background: active ? "#fffaf0" : "#fff", borderRadius: 12, padding: 6, cursor: "pointer", textAlign: "center", position: "relative" }}
                  >
                    <span aria-hidden="true" style={{ position: "absolute", insetInlineEnd: 8, insetBlockStart: 8, width: 22, height: 22, borderRadius: 6, border: `2px solid ${active ? "#d4a53a" : "#c3c9d6"}`, background: active ? "#d4a53a" : "#fff", color: "#1a1204", fontSize: 14, fontWeight: 800, lineHeight: "18px" }}>
                      {active ? "✓" : ""}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl(p.img)} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "210 / 297", objectFit: "contain", borderRadius: 6, background: "#fff", border: "1px solid var(--border,#eef0f5)" }} />
                    <span style={{ display: "block", marginTop: 5, fontSize: 12.5, fontWeight: 700, color: "#1f2a44" }}>עמוד {p.slot}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "#5b657a", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          </div>
        </div>

        <div style={foot}>
          <span style={{ fontSize: 15, fontWeight: 700, color: count ? "#1f2a44" : "#8892a6" }}>
            {count ? `נבחרו ${count} עמודים` : "לא נבחרו עמודים"}
          </span>
          <span style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" style={btn("ghost", !count || !!busy)} disabled={!count || !!busy} onClick={print}>
              {busy === "print" ? "מכין…" : "הדפסת הנבחרים"}
            </button>
            <button type="button" style={btn("gold", !count || !!busy)} disabled={!count || !!busy} onClick={download}>
              {busy === "download" ? "מכין PDF…" : "הורדת הנבחרים (PDF)"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
