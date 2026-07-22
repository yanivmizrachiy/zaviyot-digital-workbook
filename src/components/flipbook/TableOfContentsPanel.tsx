"use client";

import { useEffect, useRef } from "react";
import { TOC_ENTRIES, TOC_GROUPS, WS_GROUPS, WS_PAGES, wsPageImage } from "@/components/worksheets/registry";
import { tocColor, tocInkOn } from "@/components/worksheets/tocPalette";

// פאנל תוכן-עניינים צף של החוברת המדפדפת — נפתח מעל הבמה בלי להסתיר את הספר
// לגמרי: הפרקים והתמונות הממוזערות מקובצים לשערי החוברת (WS_GROUPS) עם כותרת
// שער אחידה, והמספור הגלובלי רץ ברצף. Escape סוגר; הפוקוס חוזר לכפתור הפותח.

function LiveThumbMark() {
  return (
    <svg viewBox="0 0 90 62" fill="none" aria-hidden="true">
      <line x1="8" y1="50" x2="82" y2="50" stroke="rgba(41,41,45,.4)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="50" x2="68" y2="10" stroke="rgba(41,41,45,.4)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 34 50 A 26 26 0 0 0 29.5 35.5" stroke="#a8874a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TableOfContentsPanel({
  currentPos,
  onJump,
  onClose,
}: {
  /** המצב הקנוני הנוכחי (0 = כריכה). */
  currentPos: number;
  onJump: (page1Based: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  // פוקוס נכנס לפאנל; Escape סוגר; Tab נשאר בתוך הפאנל (focus trap).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const opener = document.activeElement as HTMLElement | null;
    panel.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panel.querySelectorAll<HTMLElement>("button, a[href]");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onKey);
    return () => {
      panel.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  // הפרק הפעיל — הרשומה האחרונה שעמודה ≤ המצב הנוכחי.
  const activeChapter = TOC_ENTRIES.reduce((acc, e, i) => (e.page <= currentPos ? i : acc), -1);

  return (
    <>
      <button type="button" className="lx-scrim" aria-label="סגירת תוכן העניינים" onClick={onClose} />
      <aside ref={panelRef} className="lx-toc" role="dialog" aria-modal="true" aria-label="תוכן העניינים" dir="rtl">
        <div className="lx-toc__head">
          <h4 className="lx-toc__title">תוכן העניינים</h4>
          <button type="button" className="lx-toc__close" onClick={onClose} aria-label="סגירה" title="סגירה (Esc)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="lx-toc__scroll">
          {TOC_GROUPS.map((group) => (
            <section key={group.title}>
              <p className="lx-toc__group">{group.title}</p>
              <ol className="lx-toc__list">
                {group.entries.map((e) => {
                  const idx = e.ordinal - 1;
                  return (
                    <li key={e.page}>
                      <button
                        type="button"
                        className="lx-toc__row"
                        aria-current={idx === activeChapter ? "true" : undefined}
                        onClick={() => onJump(e.page)}
                        style={{ borderInlineStart: `3px solid ${tocColor(idx)}` }}
                      >
                        <span
                          className="lx-toc__num"
                          style={{
                            background: tocColor(idx),
                            color: tocInkOn(tocColor(idx)),
                            borderRadius: 7,
                            minWidth: 30,
                            textAlign: "center",
                            padding: "2px 0",
                            fontWeight: 500,
                          }}
                        >
                          {String(e.ordinal).padStart(2, "0")}
                        </span>
                        <span className="lx-toc__text">
                          <span className="lx-toc__label">{e.label}</span>
                          <span className="lx-toc__sub">{e.sub}</span>
                        </span>
                        <span className="lx-toc__page">עמ׳ {e.page}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          <p className="lx-toc__thumbstitle">כל העמודים</p>
          {WS_GROUPS.map((group) => (
            <section key={group.title}>
              <p className="lx-toc__group lx-toc__group--thumbs">{group.title}</p>
              <div className="lx-toc__thumbs">
                {WS_PAGES.slice(group.from - 1, group.to).map((p, i) => {
                  const num = group.from + i;
                  return (
                    <button
                      key={num}
                      type="button"
                      className="lx-thumb"
                      aria-current={num === currentPos ? "true" : undefined}
                      aria-label={`מעבר לעמוד ${num} — ${p.title}`}
                      title={p.title}
                      onClick={() => onJump(num)}
                    >
                      {p.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={wsPageImage(num)} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <span className="lx-thumb__live">
                          <LiveThumbMark />
                          <span>{p.title}</span>
                        </span>
                      )}
                      <span className="lx-thumb__num" aria-hidden="true">
                        {num}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
