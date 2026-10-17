import "server-only";
import type { DocType } from "@/lib/document-extraction";
import { getStudentProfileId } from "@/lib/student-session";
import { createAdminClient } from "@/lib/supabase/admin";

export interface StudentDocument {
  doc_type: DocType;
  status: "hop_le" | "can_nop_lai";
  rejection_reason: string | null;
  file_name: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  gpa: number | null;
  gpa_scale: number | null;
  ielts_listening: number | null;
  ielts_reading: number | null;
  ielts_writing: number | null;
  ielts_speaking: number | null;
  ielts_overall: number | null;
  ielts_exam_date: string | null;
  id_number: string | null;
  uploaded_at: string;
}

/** Giấy tờ của học viên hiện tại (theo cookie phiên), đọc bằng secret key ở phía server. */
export async function getStudentDocuments(): Promise<Partial<Record<DocType, StudentDocument>>> {
  const profileId = await getStudentProfileId(false);
  if (!profileId) return {};

  const { data, error } = await createAdminClient()
    .from("student_documents")
    .select("*")
    .eq("profile_id", profileId);
  if (error) throw error;

  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return Object.fromEntries(
    data.map((d) => [
      d.doc_type,
      {
        ...d,
        gpa: num(d.gpa),
        gpa_scale: num(d.gpa_scale),
        ielts_listening: num(d.ielts_listening),
        ielts_reading: num(d.ielts_reading),
        ielts_writing: num(d.ielts_writing),
        ielts_speaking: num(d.ielts_speaking),
        ielts_overall: num(d.ielts_overall),
      } as StudentDocument,
    ]),
  );
}
