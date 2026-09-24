import "server-only";
import { db, configured } from "./supabase/server";
import type { Role } from "./types";
export async function currentStaff() {
  if (!configured()) return null;
  const client = await db();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data } = await client
    .from("profiles")
    .select("id,name,role")
    .eq("id", user.id)
    .single();
  if (!data || !["super_admin", "admin", "humas"].includes(data.role))
    return null;
  return {
    id: user.id,
    name: data.name as string,
    role: data.role as Role,
    email: user.email ?? "",
  };
}
export async function requireRole(roles: Role[]) {
  const staff = await currentStaff();
  if (!staff || !roles.includes(staff.role))
    throw new Error("Anda tidak memiliki akses untuk tindakan ini.");
  return staff;
}
