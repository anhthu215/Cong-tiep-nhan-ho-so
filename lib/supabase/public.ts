import { createClient } from "@supabase/supabase-js";

// Khóa publishable: chỉ có quyền của role anon (chịu RLS). Dùng cho dữ liệu công khai.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
