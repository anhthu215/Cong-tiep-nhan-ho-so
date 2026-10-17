import type { School } from "@/lib/mock-data";
import { matchSchools, type SchoolMatchResult } from "@/lib/school-match";
import type { StudentDocument } from "@/lib/student-documents";

type Docs = Partial<Record<StudentDocument["doc_type"], StudentDocument>>;

export interface PortalEvaluation {
  ready: boolean;
  /** Giấy tờ bắt buộc còn thiếu hoặc cần nộp lại. */
  missing: string[];
  gpa: number | null;
  ielts: number | null;
  matches: SchoolMatchResult[];
}

/**
 * Chỉ cần bảng điểm và IELTS hợp lệ (CMND/hộ chiếu không bắt buộc), điểm học tập ở thang 10
 * thì đối chiếu điểm chuẩn bằng phép so sánh số (lib/school-match.ts).
 */
export function evaluatePortal(documents: Docs, schools: School[]): PortalEvaluation {
  const { transcript, ielts } = documents;
  const missing = [
    ["Bảng điểm", transcript],
    ["Chứng chỉ IELTS", ielts],
  ]
    .filter(([, d]) => (d as StudentDocument | undefined)?.status !== "hop_le")
    .map(([label]) => label as string);

  const gpa = transcript?.gpa ?? null;
  const ieltsOverall = ielts?.ielts_overall ?? null;
  const ready = missing.length === 0 && gpa !== null && ieltsOverall !== null && transcript?.gpa_scale === 10;

  return {
    ready,
    missing,
    gpa,
    ielts: ieltsOverall,
    matches: ready ? matchSchools({ gpa: gpa!, ielts: ieltsOverall! }, schools) : [],
  };
}
