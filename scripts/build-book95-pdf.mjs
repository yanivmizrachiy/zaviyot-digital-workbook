import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(appDir, "public", "booklet", "hoveret-zaviyot-95.pdf");
const port = 4875;
const printUrl = `http://127.0.0.1:${port}/book95/print?pages=all&tone=color`;
const expectedPages = 95;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) throw new Error("Chrome/Chromium not found — set CHROME_PATH");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error(`server not ready: ${url}`);
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
      return;
    }
    listeners.forEach((listener) => listener(message));
  });
  return {
    send(method, params = {}, sessionId) {
      return new Promise((resolve, reject) => {
        const message = { id: ++id, method, params };
        if (sessionId) message.sessionId = sessionId;
        pending.set(message.id, { resolve, reject });
        ws.send(JSON.stringify(message));
      });
    },
    on(listener) { listeners.push(listener); },
  };
}

const isWin = process.platform === "win32";
const server = spawn(isWin ? "npx.cmd" : "npx", ["next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: appDir,
  stdio: "ignore",
  shell: isWin,
});
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "zaviyot-book95-pdf-"));
let browser;

try {
  await waitFor(`http://127.0.0.1:${port}/`);
  browser = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  const portFile = path.join(userDataDir, "DevToolsActivePort");
  const chromeStarted = Date.now();
  while (!fs.existsSync(portFile)) {
    if (Date.now() - chromeStarted > 30_000) throw new Error("Chrome DevTools did not start");
    await sleep(150);
  }
  const [debugPort, browserPath] = fs.readFileSync(portFile, "utf8").trim().split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${debugPort}${browserPath}`);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  const client = cdp(ws);
  const { targetId } = await client.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await client.send("Target.attachToTarget", { targetId, flatten: true });
  await client.send("Page.enable", {}, sessionId);
  await client.send("Runtime.enable", {}, sessionId);

  const loaded = new Promise((resolve) => client.on((message) => {
    if (message.method === "Page.loadEventFired" && message.sessionId === sessionId) resolve();
  }));
  await client.send("Page.navigate", { url: printUrl }, sessionId);
  await loaded;

  const readyStarted = Date.now();
  while (true) {
    const result = await client.send("Runtime.evaluate", {
      expression: "window.__BOOK95_READY === true",
      returnByValue: true,
    }, sessionId);
    if (result.result?.value === true) break;
    if (Date.now() - readyStarted > 240_000) throw new Error("95-page print view did not finish loading");
    await sleep(1000);
  }

  const { data } = await client.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    transferMode: "ReturnAsBase64",
  }, sessionId);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  ws.close();

  let pdf = await PDFDocument.load(fs.readFileSync(out));
  if (pdf.getPageCount() === expectedPages + 1) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const source = new Uint8Array(fs.readFileSync(out));
    const doc = await pdfjs.getDocument({ data: source, useSystemFonts: true }).promise;
    const last = await doc.getPage(doc.numPages);
    const [text, annotations] = await Promise.all([last.getTextContent(), last.getAnnotations()]);
    if (text.items.length === 0 && annotations.length === 0) {
      pdf.removePage(pdf.getPageCount() - 1);
      fs.writeFileSync(out, await pdf.save());
      pdf = await PDFDocument.load(fs.readFileSync(out));
    }
  }

  const count = pdf.getPageCount();
  if (count !== expectedPages) throw new Error(`PDF page count mismatch: ${count} !== ${expectedPages}`);
  const { width, height } = pdf.getPage(0).getSize();
  const a4 = Math.abs(width - 595.28) < 4 && Math.abs(height - 841.89) < 4;
  if (!a4) throw new Error(`PDF is not A4: ${width}x${height}`);

  console.log(JSON.stringify({ out, pages: count, a4, bytes: fs.statSync(out).size }));
} finally {
  if (browser) {
    const exited = new Promise((resolve) => browser.once("exit", resolve));
    browser.kill();
    await Promise.race([exited, sleep(4000)]);
  }
  if (isWin) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}
