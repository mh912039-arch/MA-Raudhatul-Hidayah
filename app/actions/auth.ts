"use server";
import { loginSchema } from "@/lib/validation";
import { configured, db } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function login(input: unknown) {
  const v = loginSchema.safeParse(input);
  if (!v.success) return { error: "Isi email dan kata sandi yang valid." };
  if (!configured())
    return { error: "Login tersedia setelah database sekolah dikonfigurasi." };
  const c = await db();
  const { error } = await c.auth.signInWithPassword(v.data);
  if (error) return { error: "Email atau kata sandi tidak sesuai." };
  const {
    data: { user },
  } = await c.auth.getUser();
  const { data: profile } = await c
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (!profile) {
    await c.auth.signOut();
    return { error: "Akun belum memiliki akses pengelola sekolah." };
  }
  redirect("/admin");
}
export async function logout() {
  if (configured()) {
    const c = await db();
    await c.auth.signOut();
  }
  redirect("/login");
}
