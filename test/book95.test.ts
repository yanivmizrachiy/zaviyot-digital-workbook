import assert from "node:assert/strict";
import test from "node:test";
import {
  BOOK95_PAGES,
  BOOK95_TOTAL,
  clampBook95Page,
  parseBook95PageList,
} from "../src/lib/book95.ts";

test("book95 has exactly 95 canonical pages in stable order", () => {
  assert.equal(BOOK95_TOTAL, 95);
  assert.equal(BOOK95_PAGES.length, 95);
  assert.deepEqual(BOOK95_PAGES.map((page) => page.number), Array.from({ length: 95 }, (_, i) => i + 1));
  assert.equal(new Set(BOOK95_PAGES.map((page) => page.sourceFile)).size, 95);
  assert.equal(BOOK95_PAGES[0].sourceFile, "עמוד-1.html");
  assert.equal(BOOK95_PAGES[94].sourceFile, "עמוד-95.html");
});

test("book95 page source and proxy URLs are deterministic", () => {
  for (const page of [1, 2, 48, 94, 95]) {
    const entry = BOOK95_PAGES[page - 1];
    assert.equal(entry.number, page);
    assert.equal(entry.proxyUrl, `/api/book95/${page}`);
    assert.match(entry.sourceUrl, new RegExp(`%D7%A2%D7%9E%D7%95%D7%93-${page}\\.html$`));
  }
});

test("book95 range parsing is bounded, sorted and unique", () => {
  assert.deepEqual(parseBook95PageList("1-3,3,95"), [1, 2, 3, 95]);
  assert.deepEqual(parseBook95PageList("5-3"), [3, 4, 5]);
  assert.equal(parseBook95PageList("all").length, 95);
  assert.equal(parseBook95PageList(null).length, 95);
  assert.equal(clampBook95Page(-7), 1);
  assert.equal(clampBook95Page(500), 95);
});
