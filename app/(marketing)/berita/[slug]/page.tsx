import { getPosts, dateID } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await getPosts()).find((p) => p.slug === slug);
  return { title: p?.title ?? "Berita tidak ditemukan" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await getPosts()).find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <article className="article">
      <Link href="/berita" className="text-link">
        ← Kembali ke berita
      </Link>
      <div className="news-meta">
        {p.category} · {dateID(p.created_at)} · Redaksi sekolah
      </div>
      <h1>{p.title}</h1>
      <div className="article-image">
        <Image
          fill
          priority
          src={p.image || "/images/campus.webp"}
          sizes="800px"
          className="cover"
          alt={p.title}
        />
      </div>
      <div className="article-body">{p.body}</div>
    </article>
  );
}
