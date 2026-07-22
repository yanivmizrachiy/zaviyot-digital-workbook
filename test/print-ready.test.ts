import test from "node:test";
import assert from "node:assert/strict";
import { waitForPrintReady } from "../src/components/worksheets/printReady.ts";

// תמונה מזויפת מינימלית: complete + מנגנון load/error events.
class FakeImg {
  complete = false;
  private listeners: Record<string, Set<() => void>> = { load: new Set(), error: new Set() };
  addEventListener(type: string, cb: () => void) {
    this.listeners[type]?.add(cb);
  }
  removeEventListener(type: string, cb: () => void) {
    this.listeners[type]?.delete(cb);
  }
  fire(type: "load" | "error") {
    this.complete = true;
    for (const cb of Array.from(this.listeners[type])) cb();
  }
  listenerCount() {
    return this.listeners.load.size + this.listeners.error.size;
  }
}

function fakeDoc(images: FakeImg[], fontsReady: Promise<unknown> = Promise.resolve()): Document {
  return { images, fonts: { ready: fontsReady } } as unknown as Document;
}

test("resolves 'ready' immediately when all images are already complete", async () => {
  const img = new FakeImg();
  img.complete = true;
  assert.equal(await waitForPrintReady(fakeDoc([img]), 1000), "ready");
});

test("resolves 'ready' when an image finishes loading (and on error)", async () => {
  const ok = new FakeImg();
  const broken = new FakeImg();
  const p = waitForPrintReady(fakeDoc([ok, broken]), 5000);
  ok.fire("load");
  broken.fire("error"); // תמונה שבורה לא תוקעת
  assert.equal(await p, "ready");
  assert.equal(ok.listenerCount() + broken.listenerCount(), 0, "listeners must be removed");
});

test("img.complete race: image completing between filter and listeners still resolves", async () => {
  // מדמה את ה-race: complete הופך true לפני שהאירוע נורה, בלי אירוע load עתידי.
  const img = new FakeImg();
  const origAdd = img.addEventListener.bind(img);
  img.addEventListener = (type: string, cb: () => void) => {
    origAdd(type, cb);
    img.complete = true; // הטעינה "הסתיימה" בדיוק אחרי הוספת ה-listener — האירוע כבר חלף
  };
  assert.equal(await waitForPrintReady(fakeDoc([img]), 1500), "ready");
  assert.equal(img.listenerCount(), 0, "listeners must be removed after the re-check");
});

test("timeout wins over a stuck image and detaches its listeners", async () => {
  const stuck = new FakeImg(); // לעולם לא יורה load/error
  const result = await waitForPrintReady(fakeDoc([stuck]), 50);
  assert.equal(result, "timeout");
  assert.equal(stuck.listenerCount(), 0, "timeout must not leave listeners attached");
});
