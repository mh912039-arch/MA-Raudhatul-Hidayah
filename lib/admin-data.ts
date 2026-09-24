import "server-only";
import { db } from "./supabase/server";
import { requireRole } from "./auth";
import type { Registration } from "./types";
export async function listRegistrations(): Promise<Registration[]> {
  await requireRole(["super_admin", "admin"]);
  const client = await db();
  const all: Registration[] = [];
  const columns =
    "id,registration_number,student_name,nisn,birth_date,gender,parent_name,parent_phone,email,address,previous_school,status,notes,report_path,birth_path,created_at,updated_at";
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from("ppdb_registrations")
      .select(columns)
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + 999);
    if (error) throw new Error("Data pendaftar belum dapat dimuat.");
    all.push(...((data ?? []) as Registration[]));
    if ((data ?? []).length < 1000) break;
  }
  return all;
}
