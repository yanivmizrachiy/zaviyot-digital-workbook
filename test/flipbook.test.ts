import test from "node:test";
import assert from "node:assert/strict";
import { WS_TOTAL, TOC_ENTRIES } from "../src/components/worksheets/registry.ts";
import {
  backCoverPos,
  bookShift,
  clampPos,
  colophonPos,
  lastOpenSpread,
  pageAtPos,
  pagesAtSpread,
  posOfSpread,
  spreadCount,
  spreadOfPos,
  visiblePagesAtSpread,
} from "../src/components/flipbook/spreads.ts";

// בדיקות מנוע הדפדוף — סדר עברי (RTL): השער = עמוד 1 האמיתי (מכתב המורה),
// זוגיים מימין, אי-זוגיים משמאל, וכריכה אחורית בסוף.

test("the closed booklet shows page 1 (the real cover) and shifts right", () => {
  assert.deepEqual(pagesAtSpread(0, WS_TOTAL), { right: { kind: "none" }, left: { kind: "page", page: 1 } });
  assert.equal(spreadOfPos(1, WS_TOTAL), 0);
  assert.equal(bookShift(0, WS_TOTAL), 0.5);
});

test("opening the cover shows pages 2 (right) and 3 (left) — hebrew book order", () => {
  const s1 = pagesAtSpread(1, WS_TOTAL);
  assert.deepEqual(s1.right, { kind: "page", page: 2 });
  assert.deepEqual(s1.left, { kind: "page", page: 3 });
});

test("even pages sit on the right, odd pages on the left, across the whole book", () => {
  const last = lastOpenSpread(WS_TOTAL) + 1;
  for (let s = 1; s < last; s++) {
    const { right, left } = pagesAtSpread(s, WS_TOTAL);
    if (right.kind === "page") assert.equal(right.page % 2, 0, `spread ${s}: right page must be even`);
    if (left.kind === "page") assert.equal(left.page % 2, 1, `spread ${s}: left page must be odd`);
    if (right.kind === "page" && left.kind === "page") {
      assert.equal(left.page, right.page + 1, `spread ${s}: pages must be consecutive right→left`);
    }
  }
});

test("every inner page is visible in exactly one spread, in reading order", () => {
  const seen: number[] = [];
  for (let s = 0; s < spreadCount(WS_TOTAL); s++) seen.push(...visiblePagesAtSpread(s, WS_TOTAL));
  assert.deepEqual(seen, Array.from({ length: WS_TOTAL }, (_, i) => i + 1));
});

test("the book ends with a closed back cover shifted left", () => {
  const last = lastOpenSpread(WS_TOTAL) + 1;
  assert.deepEqual(pagesAtSpread(last, WS_TOTAL), { right: { kind: "back-cover" }, left: { kind: "none" } });
  assert.equal(bookShift(last, WS_TOTAL), -0.5);
  assert.equal(spreadOfPos(backCoverPos(WS_TOTAL), WS_TOTAL), last);
});

test("pos ↔ spread round-trips for every position", () => {
  for (let pos = 1; pos <= backCoverPos(WS_TOTAL); pos++) {
    const s = spreadOfPos(pos, WS_TOTAL);
    const back = posOfSpread(s, WS_TOTAL);
    assert.equal(spreadOfPos(back, WS_TOTAL), s, `pos ${pos}: spread must survive the round-trip`);
    const visible = visiblePagesAtSpread(s, WS_TOTAL);
    if (pos >= 1 && pos <= WS_TOTAL) {
      assert.ok(visible.includes(pos), `pos ${pos} must be visible in its own spread (${s})`);
    }
  }
});

test("single-page (mobile) sequence covers page 1 → all pages → colophon → back cover", () => {
  for (let p = 1; p <= WS_TOTAL; p++) assert.deepEqual(pageAtPos(p, WS_TOTAL), { kind: "page", page: p });
  assert.deepEqual(pageAtPos(colophonPos(WS_TOTAL), WS_TOTAL), { kind: "back-inner" });
  assert.deepEqual(pageAtPos(backCoverPos(WS_TOTAL), WS_TOTAL), { kind: "back-cover" });
});

test("clampPos guards out-of-range navigation (no double-flip glitches past the ends)", () => {
  assert.equal(clampPos(-5, WS_TOTAL), 1);
  assert.equal(clampPos(999, WS_TOTAL), backCoverPos(WS_TOTAL));
});

test("odd totals get a blank verso on the right + colophon on the left, and no page is lost", () => {
  const total = 7;
  const seen: number[] = [];
  for (let s = 0; s < spreadCount(total); s++) seen.push(...visiblePagesAtSpread(s, total));
  assert.deepEqual(seen, [1, 2, 3, 4, 5, 6, 7]);
  const lastOpen = lastOpenSpread(total);
  assert.deepEqual(pagesAtSpread(lastOpen, total), { right: { kind: "blank" }, left: { kind: "back-inner" } });
  // כפולת הקולופון חייבת round-trip משלה — דפדוף אליה לא "נשאב" חזרה לכפולה הקודמת.
  assert.equal(spreadOfPos(posOfSpread(lastOpen, total), total), lastOpen);
});

test("even totals — the colophon shares the last page's spread", () => {
  const total = 8;
  const lastOpen = lastOpenSpread(total);
  assert.deepEqual(pagesAtSpread(lastOpen, total), { right: { kind: "page", page: 8 }, left: { kind: "back-inner" } });
  assert.equal(spreadOfPos(colophonPos(total), total), lastOpen);
});

test("WS_TOTAL (odd) — the colophon spread round-trips and follows the last page", () => {
  const lastPageSpread = spreadOfPos(WS_TOTAL, WS_TOTAL);
  const colophonSpread = spreadOfPos(colophonPos(WS_TOTAL), WS_TOTAL);
  assert.equal(spreadOfPos(posOfSpread(colophonSpread, WS_TOTAL), WS_TOTAL), colophonSpread);
  assert.ok(colophonSpread >= lastPageSpread, "colophon must not precede the last page");
});

test("every TOC entry jumps to a spread that actually shows its page", () => {
  for (const e of TOC_ENTRIES) {
    const s = spreadOfPos(e.page, WS_TOTAL);
    assert.ok(visiblePagesAtSpread(s, WS_TOTAL).includes(e.page), `TOC "${e.label}" → page ${e.page} not visible in spread ${s}`);
  }
});
