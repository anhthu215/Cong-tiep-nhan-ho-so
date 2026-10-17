import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE = "student_session";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Tìm hồ sơ học viên qua cookie httpOnly (trình duyệt chỉ giữ token ngẫu nhiên).
 * Tạm thời thay cho đăng nhập (Tuần 6). Nếu `create` = true và chưa có thì tạo mới.
 */
export async function getStudentProfileId(create: boolean): Promise<string | null> {
  const store = await cookies();
  const supabase = createAdminClient();
  const existing = store.get(COOKIE)?.value;

  if (existing) {
    const { data } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("session_token_hash", hash(existing))
      .maybeSingle();
    if (data) return data.id;
  }
  if (!create) return null;

  const token = randomBytes(32).toString("hex");
  const { data, error } = await supabase
    .from("student_profiles")
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
