// פלטת תוכן העניינים — "גרסה 1: נועזת וקונטרסטית" (12 גוונים, לפי הדוגמה של יניב).
// מקור-אמת יחיד לצבעי הפרקים: עמוד תוכן העניינים שבחוברת + הפאנל הצף.
export const TOC_COLORS = [
  "#FF2D55", // 1 ורוד-אדום
  "#FF9500", // 2 כתום
  "#FFD60A", // 3 צהוב
  "#33D74B", // 4 ירוק
  "#00C7BE", // 5 טורקיז
  "#007AFF", // 6 כחול
  "#5856D6", // 7 אינדיגו
  "#AF52DE", // 8 סגול
  "#FF3D96", // 9 מגנטה
  "#8E8E93", // 10 אפור
  "#000000", // 11 שחור
  "#FFFFFF", // 12 לבן
] as const;

/** הצבע של פרק לפי האינדקס שלו (0-based), במחזוריות. */
export function tocColor(index: number): string {
  return TOC_COLORS[index % TOC_COLORS.length];
}

/** צבע טקסט קריא על גבי הגוון — כהה לגוונים בהירים (צהוב/לבן), לבן לכל השאר. */
export function tocInkOn(color: string): string {
  return color === "#FFD60A" || color === "#FFFFFF" ? "#1c1c1e" : "#ffffff";
}
