"use client";
import { randomId } from "@/lib/random-id";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, Pin } from "lucide-react";
import { toast } from "sonner";
import { saveContent, removeContent, uploadMedia } from "@/app/actions/admin";
import {
  postSchema,
  announcementSchema,
  gallerySchema,
} from "@/lib/validation";
import type { Post, Announcement, GalleryItem } from "@/lib/types";
type Kind = "posts" | "announcements" | "gallery";
type Item = {
  id: string;
  title: string;
  body?: string;
  image?: string;
  category?: string;
  slug?: string;
  published?: boolean;
  pinned?: boolean;
  created_at: string;
};
type Edit = {
  id?: string;
  title: string;
  body: string;
  image: string;
  category: string;
  slug: string;
  published: boolean;
  pinned: boolean;
};
const blank: Edit = {
  title: "",
  body: "",
  image: "",
  category: "Kegiatan",
  slug: "",
  published: true,
  pinned: false,
};
export function ContentManager({
  posts,
  announcements,
  gallery,
  demo = false,
}: {
  posts: Post[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  demo?: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("posts");
  const [local, setLocal] = useState<Record<Kind, Item[]>>({
    posts,
    announcements,
    gallery,
  });
  const source: Record<Kind, Item[]> = demo
    ? local
    : { posts, announcements, gallery };
  const [edit, setEdit] = useState<Edit | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const labels = {
    posts: "Berita",
    announcements: "Pengumuman",
    gallery: "Galeri",
  };
  async function save() {
    if (!edit) return;
    setError("");
    const obj = { ...edit, id: demo ? undefined : edit.id };
    const parsed = (
      kind === "posts"
        ? postSchema
        : kind === "announcements"
          ? announcementSchema
          : gallerySchema
    ).safeParse(obj);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        const item = {
          ...edit,
          id: edit.id ?? randomId(),
          created_at: new Date().toISOString(),
        };
        setLocal({
          ...local,
          [kind]: edit.id
            ? local[kind].map((x) => (x.id === edit.id ? item : x))
            : [item, ...local[kind]],
        });
        toast.success("Konten contoh diperbarui dalam sesi ini.");
        setEdit(null);
      } else {
        const r = await saveContent(kind, parsed.data);
        if (r.error) setError(r.error);
        else {
          toast.success(r.success);
          setEdit(null);
          router.refresh();
        }
      }
    } catch {
      setError("Koneksi terputus. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      if (demo) {
        setLocal({ ...local, [kind]: local[kind].filter((i) => i.id !== del) });
        toast.success("Konten contoh dihapus dari sesi ini.");
      } else {
        const r = await removeContent(kind, del);
        if (r.error) toast.error(r.error);
        else {
          toast.success(r.success);
          router.refresh();
        }
      }
    } finally {
      setBusy(false);
      setDel(null);
    }
  }
  async function upload(file?: File) {
    if (!file || !edit) return;
    if (
      file.size > 2 * 1024 * 1024 ||
      !["image/webp", "image/png", "image/jpeg"].includes(file.type)
    ) {
      setError("Gunakan JPG/PNG/WebP maksimal 2 MB.");
      return;
    }
    setUploading(true);
    try {
      if (demo) {
        setEdit({ ...edit, image: URL.createObjectURL(file) });
        toast.info("Pratinjau gambar tersedia hanya di sesi ini.");
      } else {
        const f = new FormData();
        f.set("file", file);
        const r = await uploadMedia(f);
        if (r.error) setError(r.error);
        else if (r.url) setEdit({ ...edit, image: r.url });
      }
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Konten sekolah</h1>
          <p>Kelola berita, pengumuman, dan galeri yang tampil di website.</p>
        </div>
        <button
          className="button navy"
          onClick={() => {
            setEdit({ ...blank });
            setError("");
          }}
        >
          <Plus size={17} /> Tambah {labels[kind].toLowerCase()}
        </button>
      </div>
      {demo && (
        <div className="notice admin-demo">
          Mode demo. Perubahan hanya terlihat di panel ini dan tidak
          dipublikasikan ke website.
        </div>
      )}
      <div className="panel">
        <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
          <TabsList className="h-11 mb-5">
            {Object.entries(labels).map(([k, v]) => (
              <TabsTrigger value={k} key={k} className="px-5">
                {v}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(labels).map((k) => (
            <TabsContent value={k} key={k}>
              {source[k as Kind].map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="toolbar" style={{ marginBottom: 0 }}>
                    <div>
                      <h3>
                        {p.pinned && (
                          <Pin
                            size={14}
                            style={{ display: "inline", marginRight: 7 }}
                          />
                        )}
                        {p.title}
                      </h3>
                      <span className="small muted">
                        {p.category ?? labels[k as Kind]} ·{" "}
                        {new Date(p.created_at).toLocaleDateString("id-ID")}
                        {k === "posts"
                          ? ` · ${p.published ? "Terbit" : "Draf"}`
                          : ""}
                      </span>
                    </div>
                    <div className="action-row">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${p.title}`}
                        onClick={() => {
                          setEdit({ ...blank, ...p });
                          setError("");
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Hapus ${p.title}`}
                        onClick={() => setDel(p.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!source[k as Kind].length && (
                <div className="empty">
                  Belum ada {labels[k as Kind].toLowerCase()}. Tambahkan konten
                  pertama Anda.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Dialog
        open={!!edit}
        onOpenChange={(v) => {
          if (!v) setEdit(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl dialog-scroll">
          <DialogTitle>
            {edit?.id ? "Edit" : "Tambah"} {labels[kind]}
          </DialogTitle>
          <DialogDescription>
            Lengkapi konten sebelum menyimpan.
          </DialogDescription>
          {edit && (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <label className="field">
                Judul
                <input
                  value={edit.title}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      title: e.target.value,
                      slug: edit.id
                        ? edit.slug
                        : e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                    })
                  }
                  maxLength={160}
                  required
                />
              </label>
              {kind === "posts" && (
                <label className="field">
                  Slug / alamat berita
                  <input
                    value={edit.slug}
                    onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
                    required
                  />
                  <small>Contoh: kegiatan-sains-sekolah</small>
                </label>
              )}
              {kind !== "announcements" && (
                <label className="field">
                  Kategori
                  <Select
                    value={edit.category}
                    onValueChange={(v) => setEdit({ ...edit, category: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Akademik", "Kegiatan", "Sekolah", "Prestasi"].map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </label>
              )}
              {kind !== "gallery" && (
                <label className="field">
                  Isi {labels[kind].toLowerCase()}
                  <textarea
                    rows={8}
                    value={edit.body}
                    onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                    required
                  />
                  <small>
                    Teks biasa. Pisahkan paragraf dengan baris kosong.
                  </small>
                </label>
              )}
              {kind !== "announcements" && (
                <label className="field">
                  Gambar utama
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void upload(e.target.files?.[0])}
                  />
                  <small>
                    {uploading
                      ? "Mengunggah…"
                      : edit.image
                        ? "Gambar telah dipilih."
                        : "JPG, PNG, WebP · Maksimal 2 MB"}
                  </small>
                  {edit.image && (
                    <img
                      src={edit.image}
                      alt="Pratinjau unggahan"
                      style={{
                        height: 140,
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                  )}
                </label>
              )}
              {kind === "posts" && (
                <label className="check-line">
                  <Checkbox
                    checked={edit.published}
                    onCheckedChange={(v) =>
                      setEdit({ ...edit, published: v === true })
                    }
                  />
                  Terbitkan berita
                </label>
              )}
              {kind !== "gallery" && (
                <label className="check-line">
                  <Checkbox
                    checked={edit.pinned}
                    onCheckedChange={(v) =>
                      setEdit({ ...edit, pinned: v === true })
                    }
                  />
                  Sematkan di bagian teratas
                </label>
              )}
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <button className="button navy" disabled={busy || uploading}>
                {busy ? "Menyimpan…" : "Simpan konten"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!del}
        onOpenChange={(v) => {
          if (!v) setDel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus konten ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Konten akan dihapus dari daftar dan website. Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void remove()}>
              Hapus konten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
