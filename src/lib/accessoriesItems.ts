// תפריט "אביזרים נלווים להמחשה" — נגזר אוטומטית ממקור-האמת של הנושאים
// והפריטים (aidTopics.ts): קבוצה לכל נושא פדגוגי, ובה הפריטים לפי סדרם
// בתוך הנושא. כל פריט מקשר לדף הצפייה/הדפסה שלו (/hamchashot/[n]).
// (נתונים בלבד, בלי JSX — לייבוא גם בקומפוננטת לקוח.)
import { AID_TOPICS, aidItemsOfTopic } from "@/lib/aidTopics";

export type AccessoryLink = { label: string; href: string };
export type AccessoryGroup = { head: string; topicHref: string; items: AccessoryLink[] };

export const ACCESSORIES_INDEX_HREF = "/hamchashot";

export const ACCESSORY_GROUPS: AccessoryGroup[] = AID_TOPICS.map((topic) => ({
  head: topic.title,
  topicHref: `/hamchashot/t/${topic.id}`,
  items: aidItemsOfTopic(topic.id).map((it) => ({ label: it.label, href: `/hamchashot/${it.n}` })),
}));
