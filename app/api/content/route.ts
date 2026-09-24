import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/supabase/server";
import { saveContent, removeContent } from "@/app/actions/admin";
const kindSchema = z.enum(["posts", "announcements", "gallery"]);
export async function GET(request: NextRequest) {
  try {
    await requireRole(["super_admin", "admin", "humas"]);
    const kind = kindSchema.parse(request.nextUrl.searchParams.get("kind"));
    const client = await db();
    const { data, error } = await client
      .from(kind)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid atau tidak diizinkan." },
      { status: 403 },
    );
  }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Origin tidak diizinkan." },
      { status: 403 },
    );
  try {
    const v = z
      .object({ kind: kindSchema, data: z.unknown() })
      .parse(await request.json());
    const result = await saveContent(v.kind, v.data);
    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return NextResponse.json(
      { error: "Payload tidak valid." },
      { status: 400 },
    );
  }
}
export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Origin tidak diizinkan." },
      { status: 403 },
    );
  try {
    const v = z
      .object({ kind: kindSchema, id: z.string().uuid() })
      .parse(await request.json());
    const result = await removeContent(v.kind, v.id);
    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return NextResponse.json(
      { error: "Payload tidak valid." },
      { status: 400 },
    );
  }
}
