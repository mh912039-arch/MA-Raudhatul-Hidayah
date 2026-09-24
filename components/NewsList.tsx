"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Search } from "lucide-react";
import type { Post } from "@/lib/types";
export function NewsList({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState("Semua");
  const [q, setQ] = useState("");
  const filtered = posts.filter(
    (p) =>
      (category === "Semua" || p.category === category) &&
      p.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="toolbar">
        <div className="filters">
          {["Semua", ...new Set(posts.map((p) => p.category))].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`filter ${category === c ? "active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        <label
          className="search-input"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Search size={18} />
          <input
            aria-label="Cari berita"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari berita sekolah..."
          />
        </label>
      </div>
      <div className="news-grid">
        {filtered.map((p) => (
          <Link href={`/berita/${p.slug}`} className="news-card" key={p.id}>
            <div className="news-image">
              <Image
                src={p.image || "/images/campus.webp"}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
                className="cover"
                alt={p.title}
              />
              <span>{p.category}</span>
            </div>
            <div className="news-meta">
              {new Date(p.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Jakarta",
              })}
            </div>
            <h3>{p.title}</h3>
            <div className="news-more">
              Baca cerita <ArrowUpRight size={16} />
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          Belum ada berita yang cocok dengan pencarian.
        </div>
      )}
    </>
  );
}
