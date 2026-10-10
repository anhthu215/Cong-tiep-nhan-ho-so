import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE = "chat_session";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Tìm cuộc trò chuyện của khách qua cookie httpOnly (trình duyệt chỉ giữ token ngẫu nhiên,
 * không có nội dung chat). Nếu `create` = true và chưa có thì tạo mới.
 */
export async function getConversationId(create: boolean): Promise<string | null> {
  const store = await cookies();
  const supabase = createAdminClient();
  const existing = store.get(COOKIE)?.value;

  if (existing) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_token_hash", hash(existing))
      .maybeSingle();
    if (data) return data.id;
  }
  if (!create) return null;

  const token = randomBytes(32).toString("hex");
  const { data, error } = await supabase
    .from("conversations")
    .insert({ session_token_hash: hash(token) })
    .select("id")
    .single();
  if (error) throw error;

  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return data.id;
}
