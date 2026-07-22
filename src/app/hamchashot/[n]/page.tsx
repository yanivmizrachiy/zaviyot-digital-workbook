// מצב קריאה לדף המחשה בודד — נקי, ממורכז, A4 אמיתי; ?print=1 פותח מיד את
// חלון ההדפסה (הורדה כ-PDF / הדפסה) ו-?bw=1 מציג/מדפיס בשחור-לבן ייעודי —
// בדיוק כמו דפי העבודה. הניווט קודם/הבא נע בתוך הנושא של הדף (aidTopics),
// עם חזרה לעמוד הנושא ולרשימת הנושאים.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AidReaderBar } from "@/components/hamchashot/AidReaderBar";
import { AidDoc, AID_DOCS } from "@/components/hamchashot/registry";
import { AID_TOPICS, aidItemsOfTopic } from "@/lib/aidTopics";

export const metadata: Metadata = {
  title: "אביזר נלווה להמחשה — הוראת זוויות",
  robots: { index: false },
};

export default async function AidReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ print?: string; bw?: string }>;
}) {
  const { n: nRaw } = await params;
  const sp = await searchParams;
  const n = Number(nRaw);
  if (!Number.isInteger(n) || n < 1 || n > AID_DOCS.length) notFound();

  const doc = AID_DOCS[n - 1];
  const topic = AID_TOPICS.find((t) => t.id === doc.topic)!;
  const inTopic = aidItemsOfTopic(doc.topic);
  const idx = inTopic.findIndex((it) => it.n === n);
  const bw = sp.bw === "1";

  return (
    <div className="ws-page">
      <AidReaderBar
        n={n}
        title={doc.label}
        topicTitle={topic.title}
        topicHref={`/hamchashot/t/${topic.id}`}
        prevN={idx > 0 ? inTopic[idx - 1].n : null}
        nextN={idx < inTopic.length - 1 ? inTopic[idx + 1].n : null}
        bw={bw}
        autoPrint={sp.print === "1"}
      />
      <div className={`ws-page__sheets${bw ? " ws-bw" : ""}`}>
        <AidDoc n={n} />
      </div>
    </div>
  );
}
