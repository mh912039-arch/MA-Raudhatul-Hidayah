"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/supabase/server";
import {
  postSchema,
  announcementSchema,
  gallerySchema,
  schoolSchema,
  verifySchema,
} from "@/lib/validation";
import { getSchool } from "@/lib/data";
const roles = ["super_admin", "admin", "humas"] as const;
async function writable() {
  const { school } = await getSchool();
  if (school.maintenance)
    throw new Error(
      "Mode baca-saja aktif. Super admin dapat menonaktifkannya melalui Pengaturan.",
    );
}
export async function saveContent(kind: unknown, input: unknown) {
  try {
    const staff = await requireRole([...roles]);
    await writable();
    const k = z.enum(["posts", "announcements", "gallery"]).parse(kind);
    const p =
      k === "posts"
        ? postSchema.parse(input)
        : k === "announcements"
          ? announcementSchema.parse(input)
          : gallerySchema.parse(input);
    const c = await db();
    const { id, ...rest } = p;
    const payload: Record<string, string | boolean> = {
      ...rest,
      author_id: staff.id,
    };
    const r = id
      ? await c.from(k).update(payload).eq("id", id).select("id").single()
      : await c.from(k).insert(payload).select("id").single();
    if (r.error)
      throw new Error(
        r.error.code === "23505"
          ? "Slug berita sudah digunakan."
          : "Konten belum tersimpan. Periksa data dan koneksi.",
      );
    revalidatePath("/", "layout");
    return { success: "Konten berhasil disimpan." };
  } catch (e) {
    return {
      error:
        e instanceof z.ZodError
          ? e.issues[0].message
          : e instanceof Error
            ? e.message
            : "Tindakan gagal.",
    };
  }
}
export async function removeContent(kind: unknown, id: unknown) {
  try {
    await requireRole([...roles]);
    await writable();
    const k = z.enum(["posts", "announcements", "gallery"]).parse(kind);
    const key = z.string().uuid().parse(id);
    const c = await db();
    const { error } = await c.from(k).delete().eq("id", key);
    if (error) throw new Error("Konten tidak dapat dihapus.");
    revalidatePath("/", "layout");
    return { success: "Konten dihapus." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tindakan gagal." };
  }
}
export async function uploadMedia(form: FormData) {
  try {
    const staff = await requireRole([...roles]);
    await writable();
    const principal = form.get("principal") === "true";
    if (principal && staff.role !== "super_admin")
      throw new Error("Hanya super admin dapat mengubah foto kepala sekolah.");
    const f = form.get("file");
    if (!(f instanceof File) || !f.size)
      throw new Error("Pilih gambar terlebih dahulu.");
    const max = principal ? 500 * 1024 : 2 * 1024 * 1024;
    if (f.size > max)
      throw new Error(
        principal
          ? "Foto kepala sekolah maksimal 500 KB."
          : "Gambar maksimal 2 MB.",
      );
    if (principal && f.type !== "image/webp")
      throw new Error("Foto kepala sekolah wajib berformat WebP.");
    if (!["image/webp", "image/jpeg", "image/png"].includes(f.type))
      throw new Error("Gunakan gambar WebP, JPG, atau PNG.");
    const b = new Uint8Array(await f.slice(0, 12).arrayBuffer());
    const webp =
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP";
    const jpg = b[0] === 255 && b[1] === 216 && b[2] === 255;
    const png = b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
    if (!(f.type === "image/webp" ? webp : f.type === "image/jpeg" ? jpg : png))
      throw new Error("Isi berkas tidak sesuai format gambar.");
    const c = await db();
    const ext = webp ? "webp" : jpg ? "jpg" : "png";
    const path = `${staff.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await c.storage
      .from("media")
      .upload(path, f, { contentType: f.type });
    if (error) throw new Error("Unggah gambar gagal.");
    return { url: c.storage.from("media").getPublicUrl(path).data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unggah gagal." };
  }
}
export async function saveSchool(input: unknown) {
  try {
    await requireRole(["super_admin"]);
    const s = schoolSchema.parse(input);
    const c = await db();
    const { error } = await c.from("schools").update(s).eq("id", "main");
    if (error) throw new Error("Pengaturan belum tersimpan.");
    revalidatePath("/", "layout");
    return { success: "Pengaturan sekolah disimpan." };
  } catch (e) {
    return {
      error:
        e instanceof z.ZodError
          ? e.issues[0].message
          : e instanceof Error
            ? e.message
            : "Tindakan gagal.",
    };
  }
}
export async function verifyRegistration(input: unknown) {
  try {
    await requireRole(["super_admin", "admin"]);
    await writable();
    const v = verifySchema.parse(input);
    const c = await db();
    const { error } = await c.rpc("verify_registration", {
      registration_id: v.id,
      new_status: v.status,
      new_notes: v.notes,
      expected_updated_at: v.updated_at,
    });
    if (error)
      throw new Error(
        error.message.includes("changed")
          ? "Data telah berubah. Muat ulang sebelum memverifikasi."
          : "Verifikasi gagal. Coba muat ulang halaman.",
      );
    revalidatePath("/admin");
    revalidatePath("/admin/ppdb");
    return { success: "Status diperbarui dan dicatat dalam log verifikasi." };
  } catch (e) {
    return {
      error:
        e instanceof z.ZodError
          ? e.issues[0].message
          : e instanceof Error
            ? e.message
            : "Tindakan gagal.",
    };
  }
}
export async function documentLink(input: unknown) {
  try {
    await requireRole(["super_admin", "admin"]);
    const p = z
      .object({ id: z.string().uuid(), kind: z.enum(["report", "birth"]) })
      .parse(input);
    const c = await db();
    const { data, error } = await c
      .from("ppdb_registrations")
      .select("report_path,birth_path")
      .eq("id", p.id)
      .single();
    if (error || !data) throw new Error("Dokumen tidak ditemukan.");
    const path = p.kind === "report" ? data.report_path : data.birth_path;
    const r = await c.storage.from("documents").createSignedUrl(path, 120);
    if (r.error) throw new Error("Dokumen belum dapat dibuka.");
    return { url: r.data.signedUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tindakan gagal." };
  }
}
export async function auditLog(id: unknown) {
  try {
    await requireRole(["super_admin", "admin"]);
    const key = z.string().uuid().parse(id);
    const c = await db();
    const { data, error } = await c
      .from("verification_logs")
      .select("id,old_status,new_status,notes,actor_id,created_at")
      .eq("registration_id", key)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { data: data ?? [] };
  } catch {
    return { error: "Log belum dapat dimuat." };
  }
}
