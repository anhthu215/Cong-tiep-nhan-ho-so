import type { School } from "@/lib/mock-data";

export interface SchoolMatchResult {
  school: School;
  gpaOk: boolean;
  ieltsOk: boolean;
  /** Đạt khi đủ cả hai tiêu chí. */
  passed: boolean;
}

// So sánh theo bội số của 0.1 (số nguyên) để tránh sai số số thực (ví dụ 7.5 vs 7.50000001).
const tenths = (n: number) => Math.round(n * 10);

/**
 * Đối chiếu điểm học tập (thang 10) và IELTS tổng của học viên với điểm chuẩn từng trường.
 * Chỉ dùng phép so sánh số: đạt khi gpa >= minGpa VÀ ielts >= minIelts. Không gọi AI.
 */
export function matchSchools(student: { gpa: number; ielts: number }, schools: School[]): SchoolMatchResult[] {
  return schools
    .map((school) => {
      const gpaOk = tenths(student.gpa) >= tenths(school.minGpa);
      const ieltsOk = tenths(student.ielts) >= tenths(school.minIelts);
      return { school, gpaOk, ieltsOk, passed: gpaOk && ieltsOk };
    })
    .sort((a, b) => Number(b.passed) - Number(a.passed));
}
