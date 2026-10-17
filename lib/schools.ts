import { createPublicClient } from "@/lib/supabase/public";
import type { School } from "@/lib/mock-data";

/** Danh sách trường tham chiếu (dữ liệu công khai, đọc qua RLS policy "Public can read schools"). */
export async function getSchools(): Promise<School[]> {
  const { data, error } = await createPublicClient()
    .from("schools")
    .select("id, name, country, min_gpa, min_ielts")
    .order("country")
    .order("name");
  if (error) throw error;

  return data.map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    minGpa: Number(s.min_gpa),
    minIelts: Number(s.min_ielts),
  }));
}
