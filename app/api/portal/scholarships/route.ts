import { evaluatePortal } from "@/lib/portal-readiness";
import { inputHash, suggestScholarships } from "@/lib/scholarship-advisor";
import { getCachedSuggestion } from "@/lib/scholarship-suggestions";
import { getSchools } from "@/lib/schools";
import { getStudentDocuments } from "@/lib/student-documents";
import { getStudentProfileId } from "@/lib/student-session";
import { createAdminClient } from "@/lib/supabase/admin";

const fail = (error: string, status: number) => Response.json({ error }, { status });

// Hồ sơ, điểm và danh sách trường đạt đều tính lại ở server từ database, không tin dữ liệu client gửi lên.
export async function POST() {
  try {
    const profileId = await getStudentProfileId(false);
    if (!profileId) return fail("Chưa có hồ sơ học viên.", 401);

    const [documents, schools] = await Promise.all([getStudentDocuments(), getSchools()]);
    const evaluation = evaluatePortal(documents, schools);
    if (!evaluation.ready) return fail("Hồ sơ chưa đủ điều kiện để gợi ý học bổng.", 409);

    const passedSchools = evaluation.matches.filter((m) => m.passed).map((m) => m.school.name);
    if (passedSchools.length === 0) return fail("Chưa đạt điểm chuẩn trường nào.", 409);

    const input = { gpa: evaluation.gpa!, ielts: evaluation.ielts!, passedSchools };
    const hash = inputHash(input);

    const cached = await getCachedSuggestion(hash);
    if (cached) return Response.json(cached);

    const result = await suggestScholarships(input);
    const { error } = await createAdminClient().from("scholarship_suggestions").upsert(
      {
        profile_id: profileId,
        input_hash: hash,
        suggestion: result.suggestion,
        schools_looked_up: result.schoolsLookedUp,
        created_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    );
    if (error) console.error("Save suggestion error", error);

    return Response.json(result);
  } catch (e) {
    console.error("Scholarship suggestion error", e);
    return fail("Chưa gợi ý được học bổng lúc này. Bạn thử lại sau nhé.", 502);
  }
}
