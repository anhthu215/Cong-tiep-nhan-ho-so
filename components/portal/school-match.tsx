import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SchoolMatchResult } from "@/lib/school-match";

function Criterion({ label, mine, required, ok }: { label: string; mine: number; required: number; ok: boolean }) {
  return (
    <p className={cn(ok ? "text-success-ink" : "text-red-600")}>
      {label}: {mine.toFixed(1)} {ok ? "≥" : "<"} {required.toFixed(1)}
    </p>
  );
}

export function SchoolMatch({
  matches,
  student,
}: {
  matches: SchoolMatchResult[];
  student: { gpa: number; ielts: number };
}) {
  const passedCount = matches.filter((m) => m.passed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
        <p className="text-sm text-muted-foreground">
          Điểm học tập {student.gpa.toFixed(1)}/10 và IELTS {student.ielts.toFixed(1)} của bạn so với điểm chuẩn từng
          trường. Bạn đạt <span className="font-medium text-foreground">{passedCount}/{matches.length}</span> trường.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.map(({ school, gpaOk, ieltsOk, passed }) => (
          <div
            key={school.id}
            className={cn(
              "flex items-center justify-between gap-4 rounded-xl border p-4",
              passed ? "border-success-border bg-success-soft" : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  passed ? "bg-success text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {passed ? <Check className="size-4" /> : <X className="size-4" />}
              </span>
              <div>
                <p className="font-medium">{school.name}</p>
                <p className="text-sm text-muted-foreground">
                  {school.country} · {passed ? "Đạt" : "Chưa đạt"}
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <Criterion label="GPA" mine={student.gpa} required={school.minGpa} ok={gpaOk} />
              <Criterion label="IELTS" mine={student.ielts} required={school.minIelts} ok={ieltsOk} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
