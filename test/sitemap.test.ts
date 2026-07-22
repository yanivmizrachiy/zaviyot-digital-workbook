import test from "node:test";
import assert from "node:assert/strict";
import sitemap, { PUBLIC_ROUTES } from "../src/app/sitemap.ts";

// ה-sitemap חייב לכלול את כל המסלולים הציבוריים הידועים — ורק אותם.
// מסלולי קורא/הדפסה מסומנים noindex ולכן אסור שיופיעו.
test("sitemap contains every known public route", () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);
  for (const route of PUBLIC_ROUTES) {
    assert.ok(urls.includes(route), `sitemap missing public route ${route}`);
  }
  assert.equal(urls.length, PUBLIC_ROUTES.length, "sitemap has unexpected extra routes");
});

test("sitemap excludes noindex reader/print routes", () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);
  // ‏/worksheets עצמו הפך לעמוד ציבורי (רשימת דפי העבודה) — נבדק למעלה; דפי
  // הקורא (לפי עמוד חוברת או לפי מספור דף-עבודה) וההדפסה נשארים מחוץ ל-sitemap.
  for (const banned of ["/worksheets/1", "/worksheets/w", "/worksheets/print", "/hamchashot/1", "/meshaabim/1", "/sugei-zaviyot"]) {
    assert.ok(!urls.some((u) => u === banned || u.startsWith(`${banned}/`)), `sitemap must not include ${banned}`);
  }
});
