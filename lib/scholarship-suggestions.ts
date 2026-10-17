import "server-only";
import { getStudentProfileId } from "@/lib/student-session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdvisorResult } from "@/lib/scholarship-advisor";

/** Gợi ý đã lưu cho học viên hiện tại, chỉ trả về nếu đầu vào (hồ sơ + trường đạt) chưa đổi. */
export async function getCachedSuggestion(hash: string): Promise<AdvisorResult | null> {
  const profileId = await getStudentProfileId(false);
  if (!profileId) return null;

  const { data, error } = await createAdminClient()
    .from("scholarship_suggestions")
    .select("input_hash, suggestion, schools_looked_up")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.input_hash !== hash) return null;
  return { suggestion: data.suggestion, schoolsLookedUp: data.schools_looked_up };
}
