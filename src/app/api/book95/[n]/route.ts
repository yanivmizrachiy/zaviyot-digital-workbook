import type { NextRequest } from "next/server";
import { BOOK95_PAGES, BOOK95_SOURCE_BASE, BOOK95_TOTAL } from "@/lib/book95";

function validPage(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= BOOK95_TOTAL ? n : null;
}

function inject(html: string, n: number, autoPrint: boolean, embedded: boolean) {
  const base = `<base href="${BOOK95_SOURCE_BASE}">`;
  const printCss = `<style id="book95-print-contract">
@page{size:A4;margin:0}
html,body{background:#fff}
${embedded ? `.preview-nav{display:none!important}body{margin:0!important;padding:0!important;overflow:hidden!important}.a4-page{margin:0!important;box-shadow:none!important}` : ""}
@media print{.preview-nav{display:none!important}html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important}.a4-page{margin:0!important;box-shadow:none!important}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>`;
  const normalizeScript = `<script>(()=>{const apply=()=>{document.querySelectorAll('.page-number').forEach(el=>el.textContent='${n}');document.documentElement.dataset.book95Page='${n}'};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply,{once:true}):apply()})()</script>`;
  const printScript = autoPrint
    ? `<script>(async()=>{const ready=()=>new Promise(r=>{if(document.readyState==='complete')r();else addEventListener('load',r,{once:true})});await ready();await document.fonts?.ready;const imgs=[...document.images];await Promise.all(imgs.map(i=>i.complete?(i.decode?i.decode().catch(()=>{}):Promise.resolve()):new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})));setTimeout(()=>window.print(),80)})()</script>`
    : "";
  const marker = `<meta name="book95-source-page" content="${n}">`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${base}${marker}${printCss}`)
      .replace(/<\/body>/i, `${normalizeScript}${printScript}</body>`);
  }
  return `<!doctype html><html lang="he" dir="rtl"><head>${base}${marker}${printCss}</head><body>${html}${normalizeScript}${printScript}</body></html>`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const { n: raw } = await params;
  const n = validPage(raw);
  if (!n) return new Response("Page not found", { status: 404 });

  const page = BOOK95_PAGES[n - 1];
  const upstream = await fetch(page.sourceUrl, {
    next: { revalidate: 86400 },
    headers: { "User-Agent": "zaviyot-digital-workbook/1.0" },
  });
  if (!upstream.ok) return new Response("Source page unavailable", { status: 502 });

  const html = inject(
    await upstream.text(),
    n,
    request.nextUrl.searchParams.get("print") === "1",
    request.nextUrl.searchParams.get("embed") === "1",
  );
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
