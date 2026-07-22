import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WS_PAGES, WS_TOTAL, TOC_ENTRIES, WS_GROUPS, TOC_GROUPS, wsGroupOf, WORKSHEETS, WORKSHEETS_TOTAL } from "../src/components/worksheets/registry.ts";
import { worksheetComponentKey, isPrintableKind, type WsComponentKey } from "../src/components/worksheets/worksheetKind.ts";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

test("WS_TOTAL is in sync with WS_PAGES length", () => {
  assert.equal(WS_TOTAL, WS_PAGES.length);
});

test("every page maps to a component key without throwing (exhaustive)", () => {
  for (const page of WS_PAGES) {
    const key = worksheetComponentKey(page);
    assert.ok(typeof key === "string" && key.length > 0, `bad key for ${page.title}`);
  }
});

test("content pages map to their own component — not a silent ObjectivesSheet fallback", () => {
  // הבאג שתוקן: intro-a / intro-b / applet הוצגו כ-ObjectivesSheet.
  const expected: Record<string, WsComponentKey> = {
    "intro-a": "intro-a",
    "intro-b": "intro-b",
    "what-we-teach": "what-we-teach",
    "why-models": "why-models",
    "clock-angles": "clock-angles",
    "applet": "applet",
    "protractor-poster": "protractor-poster",
    "right-angle-estimate": "right-angle-estimate",
    "applet-maker": "applet-maker",
    "around-us": "around-us",
    "angles-types": "angles-types",
    "measurement": "measurement",
    "draw-measure": "draw-measure",
    "angle7-1": "angle7-1",
    "angle7-2": "angle7-2",
    "angle7-3": "angle7-3",
    "angle7-4": "angle7-4",
  };
  for (const page of WS_PAGES) {
    if (page.kind !== "content" || !page.content) continue;
    assert.equal(
      worksheetComponentKey(page),
      expected[page.content],
      `content "${page.content}" mapped to the wrong component`
    );
  }
});

test("cover / toc / image map to the right keys", () => {
  const cover = WS_PAGES.find((p) => p.kind === "cover");
  const toc = WS_PAGES.find((p) => p.kind === "toc");
  const img = WS_PAGES.find((p) => p.kind === "image");
  assert.ok(cover && worksheetComponentKey(cover) === "cover", "cover page missing/mismapped");
  assert.ok(toc && worksheetComponentKey(toc) === "toc", "toc page missing/mismapped");
  assert.ok(img && worksheetComponentKey(img) === "image", "image page missing/mismapped");
});

test("the presentation is NOT a booklet page (it lives as its own section on the homepage)", () => {
  // דרישת יניב: המצגת הוצאה מתוך החוברת ומוצגת כמקטע עצמאי מתחת לה.
  assert.equal(
    WS_PAGES.find((p) => p.kind === "presentation"),
    undefined,
    "presentation page must not exist inside the booklet"
  );
});

test("every image page's img file exists in /public", () => {
  for (const page of WS_PAGES) {
    if (page.kind !== "image") continue;
    assert.ok(typeof page.img === "number", `image page "${page.title}" has no img number`);
    const file = path.join(publicDir, "booklet-worksheets", `page-${String(page.img).padStart(2, "0")}.webp`);
    assert.ok(fs.existsSync(file), `missing image asset: ${file}`);
  }
});

test("no duplicate img numbers", () => {
  const imgs = WS_PAGES.filter((p) => p.kind === "image").map((p) => p.img);
  assert.equal(new Set(imgs).size, imgs.length, "duplicate img numbers in registry");
});

test("every presentationSrc points to an existing file", () => {
  for (const page of WS_PAGES) {
    if (page.kind !== "presentation" || !page.presentationSrc) continue;
    const file = path.join(publicDir, page.presentationSrc.replace(/^\//, ""));
    assert.ok(fs.existsSync(file), `missing presentation asset: ${file}`);
  }
});

test("table of contents is in sync with toc-marked pages", () => {
  const marked = WS_PAGES.map((p, i) => (p.toc ? i + 1 : null)).filter((n): n is number => n !== null);
  const tocPages = TOC_ENTRIES.map((e) => e.page);
  assert.deepEqual(tocPages, marked, "TOC_ENTRIES order/pages differ from toc-marked pages");
  for (const e of TOC_ENTRIES) {
    assert.ok(e.page >= 1 && e.page <= WS_TOTAL, `TOC entry page ${e.page} out of range`);
    assert.ok(WS_PAGES[e.page - 1].toc, `TOC entry points to a non-toc page (${e.page})`);
  }
});

test("booklet groups cover every page exactly once, in order", () => {
  // השערים נגזרים מסימוני groupStart — חייבים לכסות את כל החוברת ברצף, בלי חורים.
  assert.ok(WS_GROUPS.length >= 2, "expected at least two groups");
  assert.equal(WS_GROUPS[0].from, 1, "first group must start at page 1");
  assert.equal(WS_GROUPS[WS_GROUPS.length - 1].to, WS_TOTAL, "last group must end at the last page");
  for (let i = 1; i < WS_GROUPS.length; i++) {
    assert.equal(WS_GROUPS[i].from, WS_GROUPS[i - 1].to + 1, `gap/overlap between groups ${i - 1} and ${i}`);
  }
  for (let p = 1; p <= WS_TOTAL; p++) {
    assert.ok(wsGroupOf(p), `page ${p} belongs to no group`);
  }
});

test("grouped TOC keeps every entry once with continuous global ordinals", () => {
  const flat = TOC_GROUPS.flatMap((g) => g.entries);
  assert.equal(flat.length, TOC_ENTRIES.length, "grouped TOC lost/duplicated entries");
  flat.forEach((e, i) => {
    assert.equal(e.ordinal, i + 1, `ordinal of "${e.label}" is not continuous`);
    assert.equal(e.page, TOC_ENTRIES[i].page, `entry order differs from flat TOC at ${i}`);
  });
  for (const g of TOC_GROUPS) {
    assert.ok(g.entries.length > 0, `group "${g.title}" has no TOC entries`);
  }
});

test("WORKSHEETS: numbering starts at 1, continuous, no duplicates", () => {
  // דרישת יניב: דף עבודה 1..N — בלי דילוגים, בלי כפילויות, והמספור נגזר
  // אוטומטית מהרישום (לא נכתב ידנית).
  assert.equal(WORKSHEETS_TOTAL, WORKSHEETS.length);
  assert.ok(WORKSHEETS.length > 0, "no worksheets derived from the registry");
  WORKSHEETS.forEach((w, i) => assert.equal(w.num, i + 1, `worksheet #${i + 1} has num ${w.num}`));
  const ids = WORKSHEETS.map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate worksheet ids");
});

test("WORKSHEETS: numbering follows booklet order — one after another, no jumps", () => {
  // דרישת יניב (17.7.2026): המספור עוקב אחר סדר החוברת בלבד — דף עבודה 1 הוא
  // הראשון ברצף, וכל מספר עוקב שייך לעמוד מאוחר יותר (worksheetOrder הוסר).
  for (let i = 1; i < WORKSHEETS.length; i++) {
    assert.ok(
      WORKSHEETS[i].slot > WORKSHEETS[i - 1].slot,
      `worksheet #${i + 1} (slot ${WORKSHEETS[i].slot}) is out of booklet order vs #${i} (slot ${WORKSHEETS[i - 1].slot})`
    );
  }
});

test("WORKSHEETS: every entry mirrors a worksheet-marked, printable booklet page", () => {
  const markedCount = WS_PAGES.filter((p) => p.worksheet).length;
  assert.equal(markedCount, WORKSHEETS.length, "worksheet-marked pages missing from WORKSHEETS");
  for (const w of WORKSHEETS) {
    const page = WS_PAGES[w.slot - 1];
    assert.ok(page?.worksheet, `slot ${w.slot} is not worksheet-marked`);
    assert.equal(page.title, w.title, `title mismatch at slot ${w.slot}`);
    assert.ok(isPrintableKind(page), `worksheet ${w.num} is not printable`);
    assert.ok(page.kind === "image" || page.kind === "content", `worksheet ${w.num} has kind ${page.kind}`);
    if (page.kind === "image") assert.ok(w.thumb, `image worksheet ${w.num} has no thumb`);
  }
});

test("the two applet pages share one open spread — Matific right (even), StoryboardThat left (odd)", () => {
  // דרישת יניב (17.7.2026): בחוברת הפתוחה שני היישומונים זה לצד זה — עמוד
  // זוגי (ימין בספר עברי) ומיד אחריו האי-זוגי (שמאל) — ולא בתוך דפי העבודה.
  const applet = WS_PAGES.findIndex((p) => p.kind === "content" && p.content === "applet") + 1;
  const maker = WS_PAGES.findIndex((p) => p.kind === "content" && p.content === "applet-maker") + 1;
  assert.ok(applet > 0 && maker > 0, "applet pages missing from the registry");
  assert.equal(maker, applet + 1, "applet pages must be adjacent");
  assert.equal(applet % 2, 0, `applet page ${applet} must be even (right side of the open spread)`);
  const between = WS_PAGES.slice(applet - 1, maker); // שני עמודי הזוג עצמם
  assert.ok(between.every((p) => !p.worksheet), "applet pages must not be worksheet-marked");
});

test("WORKSHEETS: structural pages are never worksheets", () => {
  for (const p of WS_PAGES) {
    if (p.kind === "cover" || p.kind === "toc" || p.kind === "presentation") {
      assert.ok(!p.worksheet, `structural page "${p.title}" must not be worksheet-marked`);
    }
  }
});

test("only the presentation page is non-printable", () => {
  for (const page of WS_PAGES) {
    assert.equal(isPrintableKind(page), page.kind !== "presentation", `printable mismatch for ${page.title}`);
  }
});
