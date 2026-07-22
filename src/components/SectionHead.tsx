import type { ReactNode } from "react";

// כותרת אזור אחידה: תווית טורקיז, כותרת, ותת-כותרת אופציונלית.
// children (למשל תגי +1/−1) מוצגים מעל התווית.
export function SectionHead({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section__head reveal">
      {children}
      <span className="section__eyebrow">{eyebrow}</span>
      <h2 className="section__title">{title}</h2>
      {sub ? <p className="section__sub">{sub}</p> : null}
    </div>
  );
}
