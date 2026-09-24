"use client";
import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [category, setCategory] = useState("Semua");
  return (
    <>
      <div className="filters" style={{ marginBottom: 30 }}>
        {["Semua", ...new Set(items.map((i) => i.category))].map((c) => (
          <button
            className={`filter ${category === c ? "active" : ""}`}
            key={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="news-grid">
        {items
          .filter((i) => category === "Semua" || i.category === category)
          .map((i) => (
            <button
              className="gallery-item"
              key={i.id}
              onClick={() => setSelected(i)}
            >
              <div className="news-image">
                <Image
                  src={i.image}
                  fill
                  sizes="(max-width:700px) 100vw, 33vw"
                  alt={i.title}
                  className="cover"
                />
              </div>
              <h3>{i.title}</h3>
              <span className="muted small">{i.category}</span>
            </button>
          ))}
      </div>
      {!items.length && (
        <div className="empty">Galeri sekolah belum tersedia.</div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>{selected?.title}</DialogTitle>
          {selected && (
            <div className="gallery-lightbox">
              <Image
                src={selected.image}
                alt={selected.title}
                fill
                sizes="800px"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
