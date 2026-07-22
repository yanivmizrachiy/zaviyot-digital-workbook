// נתיב ישן — דפי «ארגז המשאבים» אוחדו לתוך «אביזרים נלווים להמחשה» לבקשת יניב.
// כל דף ישן (1–11) מפנה לצמיתות למקומו החדש (10–20), כולל ?print=1.
import { notFound, redirect } from "next/navigation";

export default async function MeshaabimRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { n: nRaw } = await params;
  const sp = await searchParams;
  const n = Number(nRaw);
  if (!Number.isInteger(n) || n < 1 || n > 11) notFound();
  redirect(`/hamchashot/${n + 9}${sp.print === "1" ? "?print=1" : ""}`);
}
