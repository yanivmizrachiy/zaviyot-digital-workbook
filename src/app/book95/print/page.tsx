import type { Metadata } from "next";
import { parseBook95PageList } from "@/lib/book95";
import { Book95PrintPages } from "@/components/book95/Book95PrintPages";

export const metadata: Metadata = {
  title: "חוברת עבודה — הדפסה / PDF",
  robots: { index: false, follow: false },
};

export default async function Book95PrintPage({
  searchParams,
}: {
  searchParams: Promise<{ pages?: string; tone?: string; autoprint?: string }>;
}) {
  const sp = await searchParams;
  const pages = parseBook95PageList(sp.pages);
  const tone = sp.tone === "bw" ? "bw" : "color";
  return <Book95PrintPages pages={pages} tone={tone} autoPrint={sp.autoprint === "1"} />;
}
