"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCESSORY_GROUPS, ACCESSORIES_INDEX_HREF } from "@/lib/accessoriesItems";

// פריט הניווט "אביזרים נלווים להמחשה" כתפריט נפתח — אותה שפה בדיוק כמו תפריט
// האביזרים במספרים מכוונים (מחלקות accnav, portal ל-body במיקום fixed).
// התפריט מקובץ לפי הנושאים הפדגוגיים (aidTopics): כותרת-נושא לחיצה שפותחת את
// עמוד הנושא, ותחתיה הפריטים לפי סדרם. "כל הנושאים" מוביל לעמוד האינדקס.
// סגירה: לחיצה בחוץ / Escape / בחירת פריט.
export function AccessoriesNavMenu() {
  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const menuW = menuRef.current?.offsetWidth ?? 300;
    const vw = window.innerWidth;
    const left = Math.max(8, Math.min(b.right - menuW, vw - menuW - 8));
    setPos({ top: Math.round(b.bottom + 6), left: Math.round(left) });
    setPlaced(true);
  }, []);

  useEffect(() => {
    if (!open) {
      // סנכרון דגל-המיקום עם סגירת התפריט (מצב UI, לא cascading render).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaced(false);
      return;
    }
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMove = () => place();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  return (
    <div className="accnav">
      <button
        ref={btnRef}
        type="button"
        className={`sitenav__link accnav__btn${open ? " accnav__btn--open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        אביזרים נלווים להמחשה
        <svg className="accnav__chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="accnav__menu"
              role="menu"
              aria-label="אביזרים נלווים להמחשה — לפי נושאים"
              style={{ position: "fixed", top: pos.top, left: pos.left, visibility: placed ? undefined : "hidden", maxHeight: "72vh", overflowY: "auto" }}
            >
              <span className="accnav__head">בחרו נושא או דף</span>
              <Link className="accnav__item accnav__item--all" href={ACCESSORIES_INDEX_HREF} role="menuitem" onClick={() => setOpen(false)}>
                כל הנושאים
              </Link>
              {ACCESSORY_GROUPS.map((group) => (
                <div key={group.topicHref} className="accnav__group">
                  <Link className="accnav__grouphead" href={group.topicHref} role="menuitem" onClick={() => setOpen(false)}>
                    {group.head}
                  </Link>
                  {group.items.map((it) => (
                    <Link key={it.href} className="accnav__item" href={it.href} role="menuitem" onClick={() => setOpen(false)}>
                      {it.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
