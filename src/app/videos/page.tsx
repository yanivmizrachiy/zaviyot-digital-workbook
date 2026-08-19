import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionHead } from "@/components/SectionHead";
import { ILLUSTRATION_VIDEOS, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/videos";
import styles from "./videos.module.css";

export const metadata: Metadata = {
  title: "סרטוני המחשה — הוראת זוויות",
  description: "סרטוני המחשה נבחרים להוראת זוויות, מרוכזים במקום אחד לצפייה נוחה.",
};

export default function VideosPage() {
  return (
    <>
      <TopBar />
      <SiteNav />
      <main id="main">
        <section className="section" id="videos">
          <div className="container">
            <SectionHead eyebrow="הוראת זוויות" title="סרטוני המחשה" />
            <p className={styles.lead}>סרטונים נבחרים להמחשה ולהוראה בנושא זוויות.</p>

            <ul className={styles.grid}>
              {ILLUSTRATION_VIDEOS.map((video) => (
                <li key={video.id} className={styles.card}>
                  <div className={styles.frame}>
                    <iframe
                      src={youtubeEmbedUrl(video.youtubeId)}
                      title={video.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div className={styles.body}>
                    <h2 className={styles.title}>{video.title}</h2>
                    <div className={styles.actions}>
                      <a
                        className="btn btn--ghost btn--sm"
                        href={youtubeWatchUrl(video.youtubeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        פתיחה ב-YouTube
                      </a>
                    </div>
                  </div>
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
