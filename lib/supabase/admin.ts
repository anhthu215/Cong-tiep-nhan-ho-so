import "server-only";
import { createClient } from "@supabase/supabase-js";

// Chỉ dùng trong Route Handler / Server Component. Khóa secret bỏ qua RLS, không bao giờ để lộ ra trình duyệt.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
