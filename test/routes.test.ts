import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// בדיקות route מרונדרות: מרימות את האפליקציה הבנויה (next start) ומאמתות שכל
// עמוד קורא מגיש את *הרכיב הנכון* לפי marker תוכן ייחודי — לא רק HTTP 200 ולא
// רק component-key. דורש `npm run build` לפני הריצה (כך זה רץ ב-CI).
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// פורט ייעודי לבדיקה — לא 3000 כדי לא להתנגש בשרת פיתוח. ניתן לעקיפה
// (TEST_PORT) כששרת בדיקות ישן נשאר תקוע על הפורט (ב-Windows ‏kill של spawn
// עם shell הורג את המעטפת בלבד — ואז הבדיקות רצות בשקט מול build ישן).
const PORT = Number(process.env.TEST_PORT ?? 4873);
const BASE = `http://127.0.0.1:${PORT}`;

let server: ChildProcess | null = null;

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return;
    } catch {
      /* עדיין עולה */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start did not become ready in time (did you run `npm run build`?)");
}

test.before(async () => {
  // הגנה מפני שרת ישן שנשאר על הפורט: אם משהו כבר עונה שם — נכשלים מיד
  // במקום לבדוק בשקט מול build ישן.
  try {
    await fetch(`${BASE}/`, { signal: AbortSignal.timeout(1500) });
    throw new Error(`port ${PORT} is already serving — kill the stale server or set TEST_PORT`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("already serving")) throw e;
    /* הפורט פנוי — ממשיכים */
  }
  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  server = spawn(cmd, ["next", "start", "--hostname", "127.0.0.1", "--port", String(PORT)], {
    cwd: appDir,
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  await waitForServer();
});

test.after(() => {
  // ‏Windows: kill() הורג רק את ה-shell (npx.cmd) ומשאיר את next יתום על
  // הפורט — הריצה הבאה נכשלת מולו. חובה להרוג את עץ התהליכים כולו.
  if (server?.pid && process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server?.kill();
  }
});

async function getHtml(p: string): Promise<string> {
  const res = await fetch(`${BASE}${p}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(res.status, 200, `${p} should return 200`);
  return res.text();
}

// עמוד ← ‏markers שחייבים להופיע / אסורים. נבחרו מטקסט ייחודי של כל רכיב.
const CASES: { path: string; must: string[]; mustNot?: string[]; name: string }[] = [
  // הכפתור "הורדת כל דפי העבודה" הוסר מסרגל הניווט (יניב 17.7.2026) — הוא חי
  // רק בתוך עמוד "דפי עבודה"; בכל עמוד אחר אסור שיופיע.
  { path: "/worksheets/1", name: "cover", must: ["מורים יקרים"], mustNot: ["page-01.webp", "הורדת כל דפי העבודה"] },
  { path: "/worksheets/2", name: "toc", must: ["תוכן העניינים", "/worksheets/3"] },
  { path: "/worksheets/3", name: "intro-a", must: ["לומדים ומלמדים"], mustNot: ["מטרות הלמידה"] },
  { path: "/worksheets/4", name: "intro-b", must: ["למה ללמוד להבנה"], mustNot: ["מטרות הלמידה"] },
  // עמוד "מטרות הלמידה" (objectives) נמחק לצמיתות — כל העמודים אחרי 5 זזו אחורה באחד.
  { path: "/worksheets/5", name: "what-we-teach", must: ["מה אנחנו מלמדים"] },
  // "למה נשתמש בהמחשות?" — הועבר מעמוד הבית לעמוד 6 בחוברת; העמודים אחריו זזו קדימה באחד.
  { path: "/worksheets/6", name: "why-models", must: ["למה נשתמש בהמחשות", "השורה התחתונה"] },
  { path: "/worksheets/13", name: "around-us (first worksheet in the run)", must: ["רשמו האם הזווית"], mustNot: ["מטרות הלמידה"] },
  { path: "/worksheets/7", name: "angles-types", must: ["זווית חדה"] },
  { path: "/worksheets/14", name: "image", must: ["/booklet-worksheets/page-04.webp"] },
  { path: "/worksheets/9", name: "measurement", must: ["מדידה ואומדן של זוויות"] },
  // "מה גודל הזווית בין מחוגי השעון" — עותק חי של דף הקנבה, ברצף אחרי דף השעון
  { path: "/worksheets/21", name: "clock-angles", must: ["מה גודל הזווית בין מחוגי השעון"] },
  { path: "/worksheets/25", name: "draw-measure", must: ["שרטוט ומדידת זוויות"] },
  // "מחסן המילים — חלק ב" (page-16) — בתוך רצף דפי העבודה, ישירות אחרי שרטוט ומדידה.
  { path: "/worksheets/26", name: "image (word-bank B)", must: ["/booklet-worksheets/page-16.webp"], mustNot: ["Matific"] },
  { path: "/worksheets/10", name: "applet (Matific)", must: ["Matific"], mustNot: ["מטרות הלמידה"] },
  { path: "/worksheets/11", name: "applet (StoryboardThat)", must: ["StoryboardThat"] },
  // פוסטר "כיצד להשתמש במד זווית" — אחרי היישומונים, מחוץ לרצף דפי העבודה;
  // בעמוד עצמו כפתור הורדה מיידית של ה-PDF, תצוגה מלאה והדפסה.
  { path: "/worksheets/12", name: "protractor poster", must: ["פוסטר — כיצד להשתמש במד זווית", "poster-mad-zavit.pdf", "הורדת הפוסטר"] },
  // הפוסטר הצבעוני — העמוד האחרון בחוברת, מחוץ לרצף דפי העבודה (דרישת יניב)
  { path: "/worksheets/44", name: "poster (last page)", must: ["/booklet-worksheets/page-14.webp"] },
  // עמוד "דפי עבודה" + הקורא — המספור רץ לפי סדר החוברת בלבד (דרישת יניב
  // 17.7.2026): דף עבודה 1 = "זוויות סביבנו" (הראשון ברצף), אחד אחרי השני.
  { path: "/worksheets", name: "worksheets index", must: ["דפי עבודה", "דף עבודה 1", "/worksheets/w/1", "הורדת כל דפי העבודה", "/worksheets/booklet"] },
  { path: "/worksheets/w/1", name: "worksheet reader #1 (around-us)", must: ["דף עבודה 1 מתוך", "רשמו האם הזווית"] },
  // דף עבודה 9 = "מה גודל הזווית בין מחוגי השעון" (העותק החי החדש, אחרי דף השעון)
  { path: "/worksheets/w/9", name: "worksheet reader #9 (clock angles)", must: ["דף עבודה 9 מתוך", "מה גודל הזווית בין מחוגי השעון"] },
  // דף עבודה 27 = "זוויות ישרות, חדות וקהות" · 28 = ראשון מדפי השאלות
  { path: "/worksheets/w/27", name: "worksheet reader #27 (right-angle estimate)", must: ["דף עבודה 27 מתוך", "זוויות ישרות, חדות וקהות", "ניתן לקפל פיסת נייר פעמיים"] },
  { path: "/worksheets/w/28", name: "worksheet reader #28 (curriculum questions)", must: ["דף עבודה 28 מתוך", "שאלות כמו בתוכנית הלימודים"] },
  { path: "/worksheets/w/2?bw=1", name: "worksheet reader BW", must: ["ws-bw", "תצוגה צבעונית"] },
  // חוברת כל דפי העבודה — כל הדפים הממוספרים ברצף אחד, עם מעבר צבע/שחור-לבן
  { path: "/worksheets/booklet", name: "all-worksheets booklet", must: ["חוברת דפי העבודה", "דף עבודה 1", "דף עבודה 31", "תצוגת שחור-לבן"] },
  { path: "/worksheets/booklet?bw=1", name: "all-worksheets booklet BW", must: ["ws-bw", "תצוגה צבעונית"] },
  // אביזרים נלווים להמחשה — אינדקס נושאים, עמוד נושא, וקורא דף עם שחור-לבן
  { path: "/hamchashot", name: "aid topics index", must: ["אביזרים נלווים להמחשה", "מושג הזווית והשוואת זוויות", "/hamchashot/t/coords"], mustNot: ["המחשות להדפסה"] },
  { path: "/hamchashot/t/coords", name: "aid topic page", must: ["רביע ראשון עם מספרים", "לרשימת הנושאים"], mustNot: ["מד זווית להדפסה על שקף"] },
  { path: "/hamchashot/9?bw=1", name: "aid reader BW", must: ["ws-bw", "רביע ראשון עם מספרים"] },
];

for (const c of CASES) {
  test(`route ${c.path} renders the ${c.name} component`, async () => {
    const html = await getHtml(c.path);
    for (const m of c.must) assert.ok(html.includes(m), `${c.path}: missing marker "${m}"`);
    for (const m of c.mustNot ?? []) assert.ok(!html.includes(m), `${c.path}: must NOT contain "${m}"`);
  });
}

test("print route renders every kind (cover, intro, content, applet)", async () => {
  // המצגת אינה עמוד בחוברת (מקטע עצמאי בעמוד הבית) — לכן אין כאן "פתיחת המצגת".
  const html = await getHtml("/worksheets/print");
  for (const m of ["bkprint", "מורים יקרים", "למה ללמוד להבנה", "Matific", "שרטוט ומדידת זוויות"]) {
    assert.ok(html.includes(m), `print: missing marker "${m}"`);
  }
});
