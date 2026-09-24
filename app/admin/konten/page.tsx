import { db } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { ContentManager } from "@/components/admin/ContentManager";
import type { Post, Announcement, GalleryItem } from "@/lib/types";
export default async function Page() {
  await requireRole(["super_admin", "admin", "humas"]);
  const c = await db();
  const [p, a, g] = await Promise.all(
    ["posts", "announcements", "gallery"].map((t) =>
      c.from(t).select("*").order("created_at", { ascending: false }),
    ),
  );
  if (p.error || a.error || g.error)
    throw new Error("Konten belum dapat dimuat.");
  return (
    <ContentManager
      posts={(p.data ?? []) as Post[]}
      announcements={(a.data ?? []) as Announcement[]}
      gallery={(g.data ?? []) as GalleryItem[]}
    />
  );
}
