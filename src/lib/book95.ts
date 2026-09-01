export const BOOK95_TOTAL = 95 as const;
export const BOOK95_SOURCE_BASE = "https://yanivmizrachiy.github.io/razpages/";

export type Book95Page = {
  number: number;
  sourceFile: string;
  sourceUrl: string;
  proxyUrl: string;
};

export const BOOK95_PAGES: readonly Book95Page[] = Array.from(
  { length: BOOK95_TOTAL },
  (_, index) => {
    const number = index + 1;
    const sourceFile = `עמוד-${number}.html`;
    return {
      number,
      sourceFile,
      sourceUrl: `${BOOK95_SOURCE_BASE}${encodeURIComponent(sourceFile)}`,
      proxyUrl: `/api/book95/${number}`,
    };
  },
);

export function clampBook95Page(value: number): number {
  return Math.min(BOOK95_TOTAL, Math.max(1, Math.trunc(value)));
}

export function parseBook95PageList(raw: string | null | undefined): number[] {
  if (!raw || raw === "all") return BOOK95_PAGES.map((page) => page.number);
  const values = new Set<number>();
  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = clampBook95Page(Number(range[1]));
      const to = clampBook95Page(Number(range[2]));
      const start = Math.min(from, to);
      const end = Math.max(from, to);
      for (let n = start; n <= end; n++) values.add(n);
      continue;
    }
    const n = Number(token);
    if (Number.isInteger(n) && n >= 1 && n <= BOOK95_TOTAL) values.add(n);
  }
  return values.size ? [...values].sort((a, b) => a - b) : BOOK95_PAGES.map((page) => page.number);
}
