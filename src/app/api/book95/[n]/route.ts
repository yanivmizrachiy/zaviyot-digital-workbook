import type { NextRequest } from "next/server";

const TOTAL = 95;
const SOURCE_BASE = "https://yanivmizrachiy.github.io/razpages/";

function validPage(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL ? n : null;
}

function inject(html: string, n: number, autoPrint: boolean) {
  const base = `<base href="${SOURCE_BASE}">`;
  const printCss = `<style id="book95-print-contract">
@page{size:A4;margin:0}
@media print{html,body{margin:0!important;padding:0!important;background:#fff!important}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>`;
  const printScript = autoPrint
    ? `<script>(async()=>{const ready=()=>new Promise(r=>{if(document.readyState==='complete')r();else addEventListener('load',r,{once:true})});await ready();const imgs=[...document.images];await Promise.all(imgs.map(i=>i.complete?(i.decode?i.decode().catch(()=>{}):Promise.resolve()):new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})));setTimeout(()=>window.print(),80)})()</script>`
    : "";
  const marker = `<meta name="book95-source-page" content="${n}">`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${base}${marker}${printCss}`)
      .replace(/<\/body>/i, `${printScript}</body>`);
  }
  return `<!doctype html><html lang="he" dir="rtl"><head>${base}${marker}${printCss}</head><body>${html}${printScript}</body></html>`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const { n: raw } = await params;
  const n = validPage(raw);
  if (!n) return new Response("Page not found", { status: 404 });

  const sourceUrl = `${SOURCE_BASE}${encodeURIComponent(`עמוד-${n}.html`)}`;
  const upstream = await fetch(sourceUrl, {
    next: { revalidate: 86400 },
    headers: { "User-Agent": "zaviyot-digital-workbook/1.0" },
  });
  if (!upstream.ok) return new Response("Source page unavailable", { status: 502 });

  const html = inject(await upstream.text(), n, request.nextUrl.searchParams.get("print") === "1");
  const download = request.nextUrl.searchParams.get("download") === "1";
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
    "X-Content-Type-Options": "nosniff",
  });
  if (download) {
    headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(`זוויות-עמוד-${n}.html`)}`);
  }
  return new Response(html, { headers });
}
