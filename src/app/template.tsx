// עוטף כל עמוד ב-fade-in אחיד. template נטען מחדש בכל ניווט בין עמודים,
// כך שהמעבר בין עמוד הבית לתוכנית הלימודים (ובחזרה) מקבל את אותה רוח של
// מעברי ה-fade הפנימיים. ה-CSS טהור (opacity בלבד) ומכבד prefers-reduced-motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
