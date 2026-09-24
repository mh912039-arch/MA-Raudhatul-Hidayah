import { getPosts, getAnnouncements, dateID } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";
import { NewsList } from "@/components/NewsList";
import { Pin } from "lucide-react";
export const metadata = { title: "Berita & Agenda" };
export default async function Page() {
  const [posts, ann] = await Promise.all([getPosts(), getAnnouncements()]);
  return (
    <>
      <PageBanner
        label="Berita & Agenda"
        title="Cerita yang terus bertumbuh."
        description="Ikuti kabar, kegiatan, dan pengumuman terbaru dari lingkungan sekolah."
      />
      <section className="section container">
        <NewsList posts={posts} />
        <div id="pengumuman" style={{ paddingTop: 70, scrollMarginTop: 120 }}>
          <div className="eyebrow">INFORMASI SEKOLAH</div>
          <h2>Pengumuman</h2>
          {ann.map((a) => (
            <article className="list-item" key={a.id}>
              <div className="news-meta">
                {a.pinned && <Pin size={14} />} {dateID(a.created_at)}
              </div>
              <h3>{a.title}</h3>
              <p style={{ whiteSpace: "pre-line" }}>{a.body}</p>
            </article>
          ))}
          {!ann.length && (
            <p className="muted" style={{ marginTop: 20 }}>
              Belum ada pengumuman.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
