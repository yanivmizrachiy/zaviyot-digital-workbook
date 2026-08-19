export type IllustrationVideo = {
  id: string;
  title: string;
  youtubeId: string;
};

// מקור אמת יחיד לסרטוני ההמחשה. סרטונים נוספים מתווספים כאן בלבד,
// והעמוד /videos נבנה אוטומטית מן הרשימה.
export const ILLUSTRATION_VIDEOS: readonly IllustrationVideo[] = [
  {
    id: "petich-zaviyot-ayelet-krispin",
    title: "פתיח לזוויות - איילת קריספין",
    youtubeId: "eKxw0UCPeAs",
  },
] as const;

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}
