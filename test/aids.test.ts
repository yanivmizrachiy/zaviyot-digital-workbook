import test from "node:test";
import assert from "node:assert/strict";
import { AID_TOPICS, AID_ITEMS, aidItemsOfTopic, aidNumberOf, aidTopicOf } from "../src/lib/aidTopics.ts";

// מקור-האמת של האביזרים הנלווים להמחשה: כל פריט שייך לנושא קיים, הסדר בתוך
// כל נושא רציף וללא כפילויות, וה-n של הנתיב יציב (מיקום במערך).

test("every aid item belongs to an existing topic", () => {
  const topicIds = new Set(AID_TOPICS.map((t) => t.id));
  for (const it of AID_ITEMS) {
    assert.ok(topicIds.has(it.topic), `item "${it.id}" has unknown topic "${it.topic}"`);
  }
});

test("aid item ids are unique and n mapping is stable", () => {
  const ids = AID_ITEMS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate aid ids");
  AID_ITEMS.forEach((it, i) => assert.equal(aidNumberOf(it.id), i + 1));
});

test("orders inside each topic are unique and every topic has items", () => {
  for (const t of AID_TOPICS) {
    const items = aidItemsOfTopic(t.id);
    assert.ok(items.length > 0, `topic "${t.id}" has no items`);
    const orders = items.map((i) => i.order);
    assert.equal(new Set(orders).size, orders.length, `duplicate order in topic "${t.id}"`);
    // הרשימה הממוינת אכן עולה
    for (let i = 1; i < orders.length; i++) assert.ok(orders[i] > orders[i - 1]);
  }
});

test("topics cover every item exactly once", () => {
  const total = AID_TOPICS.reduce((sum, t) => sum + aidItemsOfTopic(t.id).length, 0);
  assert.equal(total, AID_ITEMS.length, "items lost or duplicated across topics");
  for (let n = 1; n <= AID_ITEMS.length; n++) {
    assert.ok(aidTopicOf(n), `item ${n} has no topic`);
  }
});

test("every item supports both print modes (color + bw)", () => {
  for (const it of AID_ITEMS) {
    assert.deepEqual([...it.printModes], ["color", "bw"], `item "${it.id}" print modes`);
  }
});
