// עמוד נושא באביזרים הנלווים להמחשה — מציג אך ורק את הדפים ששייכים לנושא,
// לפי סדרם הפדגוגי בתוכו: תצוגה מקדימה חיה של כל דף, כותרת, ופעולות אמיתיות
// (פתיחה בתצוגה גדולה, הדפסה צבעונית, הדפסה בשחור-לבן). ניווט קבוע: חזרה
// לרשימת הנושאים וחזרה לאתר. רענון ישיר עובד — הנתיב סטטי (generateStaticParams).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionHead } from "@/components/SectionHead";
import { AID_TOPICS, aidItemsOfTopic, type AidTopicId } from "@/lib/aidTopics";
import { AidDoc } from "@/components/hamchashot/registry";

export function generateStaticParams() {
  return AID_TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const t = AID_TOPICS.find((x) => x.id === topic);
  return {
    title: t ? `${t.title} — אביזרים נלווים להמחשה` : "אביזרים נלווים להמחשה",
    description: t?.blurb,
  };
}

export default async function AidTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicRaw } = await params;
  const topic = AID_TOPICS.find((t) => t.id === topicRaw);
  if (!topic) notFound();
  const items = aidItemsOfTopic(topic.id as AidTopicId);

  return (
    <>
      <TopBar />
      <SiteNav />
      <main id="main">
        <section className="section" id="hamchashot-topic">
          <div className="container">
            <SectionHead eyebrow="אביזרים נלווים להמחשה" title={topic.title} />
            <div className="aidtopic__bar">
              <Link className="btn btn--ghost btn--sm" href="/hamchashot">
                ‹ לרשימת הנושאים
              </Link>
              <span className="aidtopic__barcount">{items.length} דפים בנושא</span>
            </div>
            <ul className="aidgrid">
              {items.map((it) => (
                <li key={it.id} className="aiditem">
                  <Link className="aiditem__open" href={`/hamchashot/${it.n}`} title={`פתיחת «${it.label}» בתצוגה גדולה`}>
                    <span className="aiditem__preview" aria-hidden="true">
                      <span className="aiditem__page">
                        <AidDoc n={it.n} />
                      </span>
                    </span>
                    <span className="aiditem__label">{it.label}</span>
                  </Link>
                  <span className="aiditem__acts">
                    <Link className="btn btn--ghost btn--sm" href={`/hamchashot/${it.n}?print=1`}>
                      הדפסה צבעונית
                    </Link>
                    <Link className="btn btn--ghost btn--sm" href={`/hamchashot/${it.n}?bw=1&print=1`}>
                      הדפסה בשחור-לבן
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
