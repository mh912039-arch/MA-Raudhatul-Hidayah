import "server-only";
import { cache } from "react";
import { db, configured } from "./supabase/server";
import {
  sampleSchool,
  samplePosts,
  sampleAnnouncements,
  sampleGallery,
} from "./sample";
import type { School, Post, Announcement, GalleryItem } from "./types";
export const getSchool = cache(
  async (): Promise<{
    school: School;
    demo: boolean;
    unavailable: boolean;
  }> => {
    if (!configured())
      return { school: sampleSchool, demo: true, unavailable: false };
    try {
      const client = await db();
      const { data, error } = await client
        .from("schools")
        .select("*")
        .eq("id", "main")
        .single();
      if (error || !data) throw error;
      return { school: data as School, demo: false, unavailable: false };
    } catch {
      return {
        school: { ...sampleSchool, ppdb_open: false, maintenance: true },
        demo: false,
        unavailable: true,
      };
    }
  },
);
export async function getPosts(): Promise<Post[]> {
  if (!configured()) return samplePosts;
  try {
    const c = await db();
    const { data, error } = await c
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}
export async function getAnnouncements(): Promise<Announcement[]> {
  if (!configured()) return sampleAnnouncements;
  try {
    const c = await db();
    const { data } = await c
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}
export async function getGallery(): Promise<GalleryItem[]> {
  if (!configured()) return sampleGallery;
  try {
    const c = await db();
    const { data } = await c
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}
export const dateID = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
export function isOpen(s: School) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  return (
    s.ppdb_open && !s.maintenance && day >= s.ppdb_start && day <= s.ppdb_end
  );
}
