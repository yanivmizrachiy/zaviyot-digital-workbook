// ממתין שכל המסמך מוכן להדפסה: גופנים (document.fonts.ready) + כל התמונות.
// עמיד ל-race של img.complete (בדיקה חוזרת אחרי הוספת ה-listeners), מסיים גם
// על error (תמונה שבורה לא תוקעת), ומנקה תמיד — clearTimeout כשהמשאבים ניצחו,
// והסרת כל ה-listeners שנותרו כש-ה-timeout ניצח (שום Promise לא ממשיך להחזיק
// listeners עד שהתמונה תיטען אי-פעם בעתיד). קובץ ‎.ts טהור — נבדק ב-node:test.
export async function waitForPrintReady(
  doc: Document,
  timeoutMs = 15_000
): Promise<"ready" | "timeout"> {
  const cleanups = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const safety = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), timeoutMs);
    });

    const fontsReady: Promise<unknown> =
      "fonts" in doc && doc.fonts?.ready ? doc.fonts.ready.catch(() => undefined) : Promise.resolve();

    const imagesReady = Promise.all(
      Array.from(doc.images).map(
        (img) =>
          new Promise<void>((resolve) => {
            let settled = false;
            // idempotent: מסיר את שני ה-listeners ופותר פעם אחת בלבד
            const done = () => {
              if (settled) return;
              settled = true;
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              cleanups.delete(done);
              resolve();
            };
            if (img.complete) {
              resolve();
              return;
            }
            img.addEventListener("load", done);
            img.addEventListener("error", done);
            cleanups.add(done);
            // סגירת ה-race: התמונה עשויה להשלים בין הבדיקה הראשונה להוספת ה-listeners
            if (img.complete) done();
          })
      )
    );

    const ready = Promise.all([fontsReady, imagesReady]).then(() => "ready" as const);
    return await Promise.race([ready, safety]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    // אם ה-timeout ניצח — משחררים כל listener שעוד תלוי (done הוא idempotent)
    for (const done of Array.from(cleanups)) done();
  }
}
