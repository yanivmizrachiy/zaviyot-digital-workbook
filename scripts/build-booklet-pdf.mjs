// הפקת ה-PDF הרשמי של החוברת הדיגיטלית — public/booklet/hoveret-zaviyot.pdf.
//
// למה כך: window.print() דורש מהמשתמש חלון הדפסה; כאן הקובץ נוצר פעם אחת
// ממנוע ההדפסה של Chrome (CDP Page.printToPDF) ומוגש כהורדה ישירה ומהירה.
// כל הקישורים נשארים לחיצים בקובץ: תוכן העניינים כקישורים פנימיים בין עמודי
// ה-PDF (עוגני #bk-page-N של /worksheets/print), וקישורים חיצוניים (Matific,
// המצגת) כ-URI. בלי תלות חדשה: Chrome המותקן + WebSocket מובנה של Node ≥22.
//
// הרצה (אחרי npm run build):  npm run pdf
// יש להריץ מחדש אחרי כל שינוי תוכן בחוברת, ולקמט את ה-PDF המעודכן.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(appDir, "public", "booklet", "hoveret-zaviyot.pdf");
const PORT = 4874; // לא 3000 (dev) ולא 4873 (routes.test)
const URL_ = `http://127.0.0.1:${PORT}/worksheets/print`;

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const chrome = CHROME_PATHS.find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Chrome/Edge not found — set CHROME_PATH");

// ---------- שרת next start ----------
async function waitFor(url, timeoutMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (r.ok) return;
    } catch { /* עדיין עולה */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`server not ready: ${url} (did you run npm run build?)`);
}

const isWin = process.platform === "win32";

// הפורט חייב להיות פנוי — שרת ישן שנשאר עליו יגיש build קודם וה-PDF ייצא שבור
try {
  await fetch(`http://127.0.0.1:${PORT}/`, { signal: AbortSignal.timeout(1500) });
  throw new Error(`port ${PORT} is already taken by another server — kill it first (netstat -ano | findstr ${PORT})`);
} catch (e) {
  if (!(e instanceof TypeError) && e.name !== "TimeoutError") throw e; // fetch נכשל = הפורט פנוי, ממשיכים
}

const server = spawn(isWin ? "npx.cmd" : "npx", ["next", "start", "--hostname", "127.0.0.1", "--port", String(PORT)], {
  cwd: appDir,
  stdio: "ignore",
  shell: isWin,
});

// ---------- CDP מינימלי מעל WebSocket המובנה ----------
function cdp(ws) {
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      events.forEach((f) => f(msg));
    }
  });
  return {
    send: (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pending.set(msg.id, { resolve, reject });
        ws.send(JSON.stringify(msg));
      }),
    onEvent: (f) => events.push(f),
  };
}

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "zaviyot-pdf-"));
let browser = null;
try {
  await waitFor(`http://127.0.0.1:${PORT}/`, 60_000);

  // מספר העמודים הצפוי — נספר מה-HTML המוגש עצמו (מקור אמת אחד, בלי קשיחות).
  // בנוסף מוודאים שגיליון ה-CSS שה-HTML מפנה אליו אכן קיים (200) — שרת ישן
  // שנשאר על הפורט מגיש הפניות ל-chunks של build קודם, וההדפסה יוצאת שבורה.
  const html = await (await fetch(URL_)).text();
  const expectedPages = (html.match(/<section class="bkprint__page"/g) || []).length;
  if (expectedPages < 10) throw new Error(`suspicious page count in HTML: ${expectedPages}`);
  const cssHref = html.match(/href="([^"]+\.css[^"]*)"/)?.[1];
  if (!cssHref || !(await fetch(`http://127.0.0.1:${PORT}${cssHref}`)).ok) {
    throw new Error(`stylesheet ${cssHref} not served — stale server on port ${PORT}? kill it and rerun`);
  }

  browser = spawn(chrome, [
    "--headless",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  // Chrome כותב את פורט ה-DevTools לקובץ בתוך user-data-dir
  const portFile = path.join(userDataDir, "DevToolsActivePort");
  const t0 = Date.now();
  while (!fs.existsSync(portFile) || fs.readFileSync(portFile, "utf8").split("\n").length < 2) {
    if (Date.now() - t0 > 30_000) throw new Error("DevToolsActivePort not written");
    await new Promise((r) => setTimeout(r, 200));
  }
  const [dbgPort, browserPath] = fs.readFileSync(portFile, "utf8").trim().split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${dbgPort}${browserPath}`);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const c = cdp(ws);

  const { targetId } = await c.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await c.send("Target.attachToTarget", { targetId, flatten: true });

  await c.send("Page.enable", {}, sessionId);
  const loaded = new Promise((res) => c.onEvent((m) => m.method === "Page.loadEventFired" && m.sessionId === sessionId && res()));
  await c.send("Page.navigate", { url: URL_ }, sessionId);
  await loaded;
  // המתנה קצרה נוספת לטעינת גופנים ותמונות webp של כל 40 העמודים
  await c.send("Runtime.enable", {}, sessionId);
  await c.send("Runtime.evaluate", {
    expression: "Promise.all([document.fonts.ready, ...[...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))])",
    awaitPromise: true,
    timeout: 60_000,
  }, sessionId);

  // הקטנת משקל: Chrome מקודד webp מחדש ללא-דחיסה ב-PDF (‎~25MB). המרה בתוך
  // הדף ל-JPEG דרך canvas — Skia מטמיע JPEG כ-DCT כמות-שהוא, וה-PDF קטן פי ~8.
  await c.send("Runtime.evaluate", {
    expression: `Promise.all([...document.images]
      .filter((img) => img.src.includes("/booklet-worksheets/"))
      .map(async (img) => {
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#fff"; // ל-JPEG אין שקיפות — רקע לבן כמו הסריקות
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0);
        img.src = cv.toDataURL("image/jpeg", 0.88);
        await new Promise((r) => { img.onload = img.onerror = r; });
      }))`,
    awaitPromise: true,
    timeout: 60_000,
  }, sessionId);

  // אבחון תחת מדיית print: גובה המסמך מול גובה הקטע האחרון — לגילוי מקור עמוד עודף
  await c.send("Emulation.setEmulatedMedia", { media: "print" }, sessionId);
  const diag = await c.send("Runtime.evaluate", {
    expression: `(() => {
      const secs = [...document.querySelectorAll(".bkprint__page")];
      const last = secs[secs.length - 1].getBoundingClientRect();
      const after = [];
      let el = secs[secs.length - 1].nextSibling;
      while (el) { after.push(el.nodeName + (el.getBoundingClientRect ? ":" + Math.round(el.getBoundingClientRect().height) : "")); el = el.nextSibling; }
      return JSON.stringify({ sections: secs.length, bodyH: document.body.scrollHeight, htmlH: document.documentElement.scrollHeight, lastBottom: Math.round(last.bottom), lastH: Math.round(last.height), after: after.slice(0, 6), bodyStyles: getComputedStyle(document.body).minHeight + "/" + getComputedStyle(document.body).height } );
    })()`,
    returnByValue: true,
  }, sessionId);
  console.log("diag:", diag.result.value);
  await c.send("Emulation.setEmulatedMedia", { media: "" }, sessionId);

  const { data } = await c.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true, // ‏@page A4 margin 9mm מה-CSS
    displayHeaderFooter: false,
    transferMode: "ReturnAsBase64",
  }, sessionId);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(data, "base64"));
  ws.close();

  // ---------- אימות: מספר עמודים, גודל A4, וקישורים לחיצים ----------
  const { PDFDocument, PDFName, PDFDict } = await import("pdf-lib");
  let doc = await PDFDocument.load(fs.readFileSync(OUT));

  // רשת ביטחון: מנוע ההדפסה של Chrome מוסיף לעיתים עמוד-זנב ריק (עיגולי mm↔px
  // בפאגינציה). אם נותר בדיוק עמוד עודף אחד — מאמתים ב-pdfjs שהוא באמת ריק
  // (בלי טקסט ובלי קישורים) ומסירים אותו.
  if (doc.getPageCount() === expectedPages + 1) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const jdoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(OUT)), useSystemFonts: true }).promise;
    const jlast = await jdoc.getPage(jdoc.numPages);
    const [text, annots] = await Promise.all([jlast.getTextContent(), jlast.getAnnotations()]);
    if (text.items.length === 0 && annots.length === 0) {
      doc.removePage(doc.getPageCount() - 1);
      fs.writeFileSync(OUT, await doc.save());
      doc = await PDFDocument.load(fs.readFileSync(OUT));
      console.log("trimmed a trailing blank page");
    }
  }
  const pages = doc.getPages();
  let internal = 0, external = 0;
  for (const p of pages) {
    const annots = p.node.Annots?.();
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const a = annots.lookup(i, PDFDict);
      if (a.get(PDFName.of("Subtype"))?.toString() !== "/Link") continue;
      if (a.get(PDFName.of("Dest"))) { internal++; continue; }
      const action = a.lookupMaybe?.(PDFName.of("A"), PDFDict) ?? (a.get(PDFName.of("A")) ? a.lookup(PDFName.of("A"), PDFDict) : null);
      const s = action?.get(PDFName.of("S"))?.toString();
      if (s === "/URI") external++;
      else if (s === "/GoTo") internal++;
    }
  }
  const { width, height } = pages[0].getSize();
  const a4 = Math.abs(width - 595) < 3 && Math.abs(height - 842) < 3;
  console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, pages: pages.length, expectedPages, a4, internalLinks: internal, externalLinks: external }));
  if (!a4) throw new Error(`page size is not A4: ${width}x${height}pt`);
  if (pages.length !== expectedPages) throw new Error(`PDF has ${pages.length} pages, booklet has ${expectedPages} — layout overflow or a concurrent rebuild broke the run`);
  if (internal < 8) throw new Error(`expected >=8 internal TOC links, got ${internal}`);
  if (external < 1) throw new Error(`expected >=1 external link, got ${external}`);
} finally {
  // להמתין ליציאת Chrome לפני מחיקת ה-user-data-dir — אחרת EPERM ב-Windows
  if (browser) {
    const exited = new Promise((r) => browser.once("exit", r));
    browser.kill();
    await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))]);
  }
  // ‏Windows: kill() הורג רק את ה-shell ומשאיר את next יתום על הפורט — חובה
  // להרוג את עץ התהליכים כולו, אחרת הריצה הבאה תדבר עם שרת של build ישן.
  if (isWin) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
  for (let i = 0; i < 5; i++) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }
}
