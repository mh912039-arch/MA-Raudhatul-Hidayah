"use server";
import {
  registrationSchema,
  statusSchema,
  validateDocument,
} from "@/lib/validation";
import { configured, serviceDb } from "@/lib/supabase/server";
import { getSchool, isOpen } from "@/lib/data";
async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function submitRegistration(
  form: FormData,
): Promise<{ error?: string; number?: string; demo?: boolean }> {
  const parsed = registrationSchema.safeParse({
    ...Object.fromEntries(form),
    consent: form.get("consent") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const report = form.get("report");
  const birth = form.get("birth");
  if (!(report instanceof File) || !(birth instanceof File))
    return { error: "Rapor dan akta kelahiran wajib diunggah." };
  let uploaded: string[] = [];
  let committed = false;
  let cleanupSafe = true;
  try {
    const [extR, extB] = await Promise.all([
      validateDocument(report),
      validateDocument(birth),
    ]);
    if (!configured()) return { number: "SIMULASI-PPDB-2027", demo: true };
    const c = serviceDb();
    const tokenHash = await hash(v.access_token);
    const { data: existing } = await c
      .from("ppdb_registrations")
      .select("registration_number,access_token_hash")
      .eq("request_id", v.request_id)
      .maybeSingle();
    if (existing) {
      if (existing.access_token_hash !== tokenHash)
        return { error: "Permintaan tidak valid." };
      return { number: existing.registration_number };
    }
    const { school, unavailable } = await getSchool();
    if (unavailable || !isOpen(school))
      return { error: "Pendaftaran belum dibuka atau periode telah berakhir." };
    const { data: allowed, error: limitError } = await c.rpc(
      "consume_submission_limit",
      { key_hash: await hash(v.email.toLowerCase() + ":" + v.nisn) },
    );
    if (limitError || !allowed)
      return { error: "Terlalu banyak percobaan. Coba kembali satu jam lagi." };
    const folder = crypto.randomUUID();
    const paths = [`${folder}/rapor.${extR}`, `${folder}/akta.${extB}`];
    for (const [i, file] of [report, birth].entries()) {
      const { error } = await c.storage
        .from("documents")
        .upload(paths[i], file, { contentType: file.type, upsert: false });
      if (error)
        throw new Error(
          "Unggahan terputus. Coba kembali; isian Anda tetap tersedia.",
        );
      uploaded.push(paths[i]);
    }
    const { consent, request_id, access_token, website, ...record } = v;
    void access_token;
    void website;
    cleanupSafe = false;
    const { data, error } = await c
      .from("ppdb_registrations")
      .insert({
        ...record,
        request_id,
        access_token_hash: tokenHash,
        consent,
        academic_year: school.academic_year,
        report_path: paths[0],
        birth_path: paths[1],
      })
      .select("registration_number")
      .single();
    if (error) {
      cleanupSafe = /^[0-9A-Z]{5}$/.test(error.code ?? "");
      if (error.code === "23505") {
        const { data: prior } = await c
          .from("ppdb_registrations")
          .select("registration_number")
          .eq("request_id", request_id)
          .eq("access_token_hash", tokenHash)
          .maybeSingle();
        if (prior) return { number: prior.registration_number };
        return {
          error:
            "NISN sudah terdaftar pada tahun ajaran ini. Gunakan nomor registrasi dan kode akses untuk cek status.",
        };
      }
      throw new Error(
        "Data belum tersimpan. Periksa koneksi lalu coba kembali.",
      );
    }
    committed = true;
    return { number: data.registration_number };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Terjadi gangguan layanan. Silakan coba kembali.",
    };
  } finally {
    if (uploaded.length && !committed && cleanupSafe) {
      try {
        await serviceDb().storage.from("documents").remove(uploaded);
      } catch {
        console.error("PPDB upload cleanup failed");
      }
    }
  }
}
export async function checkStatus(input: unknown) {
  const p = statusSchema.safeParse(input);
  if (!p.success)
    return { error: "Masukkan nomor registrasi dan kode akses yang valid." };
  if (!configured()) {
    if (p.data.registration_number === "SIMULASI-PPDB-2027")
      return {
        data: {
          registration_number: "SIMULASI-PPDB-2027",
          student_name: "Siswa Contoh",
          status: "Menunggu",
          notes: "Simulasi tampilan status. Pendaftaran ini tidak tersimpan.",
          created_at: new Date().toISOString(),
        },
        demo: true,
      };
    return {
      error:
        "Situs masih dalam mode demonstrasi. Data pendaftaran nyata belum tersedia.",
    };
  }
  try {
    const c = serviceDb();
    const { data, error } = await c
      .from("ppdb_registrations")
      .select("registration_number,student_name,status,notes,created_at")
      .eq("registration_number", p.data.registration_number)
      .eq("access_token_hash", await hash(p.data.access_token))
      .maybeSingle();
    if (error || !data)
      return { error: "Nomor registrasi atau kode akses tidak sesuai." };
    return { data, demo: false };
  } catch {
    return { error: "Status belum dapat dimuat. Silakan coba kembali." };
  }
}
