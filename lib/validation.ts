import { z } from "zod";
const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Minimal ${min} karakter.`)
    .max(max, `Maksimal ${max} karakter.`);
export const registrationSchema = z.object({
  student_name: text(3, 100),
  nisn: z.string().regex(/^\d{10}$/, "NISN harus terdiri dari 10 angka."),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi.")
    .refine(
      (v) =>
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v &&
        v >= "1990-01-01" &&
        v < new Date().toISOString().slice(0, 10),
      "Tanggal lahir tidak valid.",
    ),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  previous_school: text(3, 150),
  parent_name: text(3, 100),
  parent_phone: z
    .string()
    .regex(
      /^(\+62|0)[0-9]{8,13}$/,
      "Gunakan nomor telepon Indonesia yang valid.",
    ),
  email: z.string().trim().email("Alamat email tidak valid.").max(150),
  address: text(10, 500),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Persetujuan wajib dicentang." }),
  }),
  request_id: z.string().uuid(),
  access_token: z.string().regex(/^[a-f0-9]{64}$/),
  website: z.string().max(0),
});
export const statusSchema = z.object({
  registration_number: z.string().trim().min(5).max(40),
  access_token: z
    .string()
    .regex(/^[a-f0-9]{64}$/, "Kode akses terdiri dari 64 karakter.")
    .or(z.literal("DEMO")),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export const categorySchema = z.enum([
  "Akademik",
  "Kegiatan",
  "Sekolah",
  "Prestasi",
]);
export const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(5, 160),
  slug: z
    .string()
    .min(3)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya huruf kecil, angka, dan tanda hubung.",
    ),
  body: text(20, 30000),
  category: categorySchema,
  published: z.boolean(),
  pinned: z.boolean(),
  image: z.string().max(1000),
});
export const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(5, 160),
  body: text(10, 5000),
  pinned: z.boolean(),
});
export const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  title: text(3, 160),
  category: categorySchema,
  image: z.string().min(1).max(1000),
});
export const mapsSchema = z
  .string()
  .url()
  .refine((s) => {
    try {
      const u = new URL(s);
      return (
        u.protocol === "https:" &&
        ["www.google.com", "maps.google.com"].includes(u.hostname) &&
        u.pathname.startsWith("/maps")
      );
    } catch {
      return false;
    }
  }, "Gunakan URL embed resmi Google Maps (https://www.google.com/maps...).");
export const schoolSchema = z
  .object({
    name: text(3, 100),
    short_name: text(2, 60),
    tagline: text(5, 200),
    intro: text(20, 2000),
    principal_name: text(3, 150),
    principal_message: text(20, 5000),
    principal_image: z.string().max(1000),
    vision: text(10, 2000),
    mission: z.array(text(5, 500)).min(1).max(15),
    phone: z.string().max(30),
    email: z.string().email().or(z.literal("")),
    address: text(10, 500),
    maps_url: mapsSchema,
    academic_year: z.string().regex(/^20\d{2}\/20\d{2}$/),
    ppdb_open: z.boolean(),
    ppdb_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ppdb_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    maintenance: z.boolean(),
  })
  .refine((v) => v.ppdb_start <= v.ppdb_end, {
    message: "Tanggal akhir harus setelah tanggal awal.",
    path: ["ppdb_end"],
  });
export const verifySchema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(["Menunggu", "Perlu revisi", "Diterima", "Ditolak"]),
    notes: z.string().trim().max(2000),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (v) =>
      !["Perlu revisi", "Ditolak"].includes(v.status) || v.notes.length >= 5,
    {
      message: "Catatan wajib diisi untuk revisi atau penolakan.",
      path: ["notes"],
    },
  );
export const MAX_DOCUMENT = 5 * 1024 * 1024;
export function documentError(file: File | undefined | null) {
  if (!file || !file.size) return "Berkas wajib diunggah.";
  if (file.size > MAX_DOCUMENT) return "Ukuran berkas maksimal 5 MB.";
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
    return "Gunakan format PDF, JPG, atau PNG.";
  return null;
}
export async function validateDocument(file: File) {
  const error = documentError(file);
  if (error) throw new Error(error);
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const pdf = b[0] === 37 && b[1] === 80 && b[2] === 68 && b[3] === 70;
  const jpg = b[0] === 255 && b[1] === 216 && b[2] === 255;
  const png = b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
  const valid =
    (file.type === "application/pdf" && pdf) ||
    (file.type === "image/jpeg" && jpg) ||
    (file.type === "image/png" && png);
  if (!valid) throw new Error("Isi berkas tidak sesuai format PDF/JPG/PNG.");
  return pdf ? "pdf" : jpg ? "jpg" : "png";
}
