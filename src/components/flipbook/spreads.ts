// מודל הכפולות של החוברת המדפדפת (RTL) — לוגיקה טהורה, ללא React/JSX, כדי
// שניתן לבדוק אותה ישירות ב-node --experimental-strip-types (test/flipbook.test.ts).
//
// הכריכה הקדמית של החוברת היא עמוד 1 האמיתי (מכתב המורה של איילת) — אין עמוד
// שער נוסף. כמו בחוברת מודפסת שדף השער שלה הוא הדף הראשון: כשהחוברת סגורה
// רואים את עמוד 1; פותחים — ועמוד 2 מימין, עמוד 3 משמאל (ספר עברי: זוגיים
// מימין, אי-זוגיים משמאל, הדף מתהפך ימינה).
//
// מונחים:
//   pos    — המצב הקנוני (נשמר/משוחזר): 1 = שער סגור (עמוד 1),
//            2..total = עמוד פנימי, total+1 = קולופון (פנים הכריכה האחורית),
//            total+2 = כריכה אחורית סגורה.
//   spread — אינדקס כפולה בתצוגת שני עמודים: 0 = סגור-קדימה,
//            1..lastOpen = כפולות פתוחות, lastOpen+1 = סגור-אחורה.
//
// בסך עמודים אי-זוגי, הדף הפיזי האחרון מקבל verso ריק (blank) — כמו בדפוס אמיתי.

export type PageRef =
  | { kind: "page"; page: number } // 1-based; עמוד 1 = השער
  | { kind: "blank" } // verso ריק של הדף האחרון (סך עמודים אי-זוגי)
  | { kind: "back-inner" } // קולופון
  | { kind: "back-cover" }
  | { kind: "none" };

/** אינדקס הכפולה הפתוחה האחרונה. */
export function lastOpenSpread(total: number): number {
  return Math.ceil(total / 2);
}

/** מספר מצבי הכפולה: סגור-קדימה + כפולות פתוחות + סגור-אחורה. */
export function spreadCount(total: number): number {
  return lastOpenSpread(total) + 2;
}

/** ה-pos של הקולופון (פנים הכריכה האחורית). */
export function colophonPos(total: number): number {
  return total + 1;
}

/** ה-pos של הכריכה האחורית הסגורה. */
export function backCoverPos(total: number): number {
  return total + 2;
}

export function clampPos(pos: number, total: number): number {
  return Math.min(backCoverPos(total), Math.max(1, Math.round(pos)));
}

/** הכפולה שמציגה את pos בתצוגת שני עמודים. */
export function spreadOfPos(pos: number, total: number): number {
  const p = clampPos(pos, total);
  if (p <= 1) return 0; // עמוד 1 = השער הסגור
  if (p === backCoverPos(total)) return lastOpenSpread(total) + 1;
  // עמוד פנימי או קולופון — עמוד זוגי p יושב בכפולה p/2 (מימין).
  return Math.min(lastOpenSpread(total), Math.floor(p / 2));
}

/** המצב הקנוני (pos) שמייצג כפולה — עמוד הימין אם קיים, אחרת הקולופון. */
export function posOfSpread(spread: number, total: number): number {
  const last = lastOpenSpread(total) + 1;
  const s = Math.min(last, Math.max(0, Math.round(spread)));
  if (s === 0) return 1;
  if (s === last) return backCoverPos(total);
  const right = 2 * s;
  // בכפולת הסיום (סך אי-זוגי) עמוד הימין הוא ה-verso הריק — הקולופון מייצג אותה.
  return Math.min(right, colophonPos(total));
}

/** תוכן שני חצאי הכפולה. עמוד זוגי מימין, אי-זוגי משמאל (ספר עברי). */
export function pagesAtSpread(spread: number, total: number): { right: PageRef; left: PageRef } {
  const last = lastOpenSpread(total) + 1;
  if (spread <= 0) return { right: { kind: "none" }, left: { kind: "page", page: 1 } };
  if (spread >= last) return { right: { kind: "back-cover" }, left: { kind: "none" } };
  const rightPage = 2 * spread;
  const leftPage = 2 * spread + 1;
  // מעבר לעמוד האחרון: הצד הימני הוא verso ריק של הדף האחרון; הצד השמאלי — הקולופון.
  const right: PageRef = rightPage > total ? { kind: "blank" } : { kind: "page", page: rightPage };
  const left: PageRef = leftPage > total ? { kind: "back-inner" } : { kind: "page", page: leftPage };
  return { right, left };
}

/** תוכן עמוד יחיד (מובייל): שער → עמודים → קולופון → כריכה אחורית. */
export function pageAtPos(pos: number, total: number): PageRef {
  const p = clampPos(pos, total);
  if (p === backCoverPos(total)) return { kind: "back-cover" };
  if (p === colophonPos(total)) return { kind: "back-inner" };
  return { kind: "page", page: p };
}

/** מספרי העמודים האמיתיים הנראים בכפולה (לסרגל). */
export function visiblePagesAtSpread(spread: number, total: number): number[] {
  const { right, left } = pagesAtSpread(spread, total);
  const out: number[] = [];
  if (right.kind === "page") out.push(right.page);
  if (left.kind === "page") out.push(left.page);
  return out.sort((a, b) => a - b);
}

/** הסטת מרכז הספר: סגור-קדימה יושב בחצי שמאל ⇒ מוסט ימינה בחצי-עמוד, וההפך. */
export function bookShift(spread: number, total: number): -0.5 | 0 | 0.5 {
  const last = lastOpenSpread(total) + 1;
  if (spread <= 0) return 0.5;
  if (spread >= last) return -0.5;
  return 0;
}
