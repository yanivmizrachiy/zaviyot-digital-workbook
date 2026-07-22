import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">
          <Image
            className="footer__logo"
            src="/logo.png"
            alt="יחידת מתמטיקה — מחוז ירושלים והעיר ירושלים"
            width={52}
            height={52}
            sizes="52px"
          />
          <span>זוויות — יחידת לימוד מתוקשבת</span>
        </span>
        <span>האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים</span>
      </div>
    </footer>
  );
}
