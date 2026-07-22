// עמוד "אביזרים נלווים להמחשה" — אינדקס הנושאים: כרטיס לכל נושא פדגוגי
// (שם, מספר דפים, תיאור קצר ותצוגה מקדימה של הדף הראשון), בסדר הפדגוגי של
// היחידה. לחיצה על נושא פותחת את עמוד הנושא (/hamchashot/t/[topic]) שמציג
// רק את הדפים ששייכים לו. אין כאן "הדפס הכול" — ההדפסה נעשית לפי דף בודד.
import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionHead } from "@/components/SectionHead";
import { AID_TOPICS, aidItemsOfTopic } from "@/lib/aidTopics";
import { AidDoc } from "@/components/hamchashot/registry";

export const metadata: Metadata = {
  title: "אביזרים נלווים להמחשה — הוראת זוויות",
  description: "האביזרים הנלווים להמחשה בהוראת זוויות בכיתה ז׳, מחולקים לנושאים: מושג הזווית, מדידה במד זווית וזוויות במערכת הצירים.",
};

export default function HamchashotIndexPage() {
  return (
    <>
      <TopBar />
      <SiteNav />
      <main id="main">
        <section className="section" id="hamchashot">
          <div className="container">
            <SectionHead eyebrow="אביזרים נלווים להמחשה" title="בחרו נושא" />
            <ul className="aidtopics">
              {AID_TOPICS.map((topic) => {
                const items = aidItemsOfTopic(topic.id);
                const first = items[0];
                return (
                  <li key={topic.id}>
                    <Link className="aidtopic" href={`/hamchashot/t/${topic.id}`}>
                      <span className="aidtopic__preview" aria-hidden="true">
                        <span className="aidtopic__page">
                          <AidDoc n={first.n} />
                        </span>
                      </span>
                      <span className="aidtopic__text">
                        <span className="aidtopic__title">{topic.title}</span>
                        <span className="aidtopic__count">{items.length} דפים</span>
                        <span className="aidtopic__blurb">{topic.blurb}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
