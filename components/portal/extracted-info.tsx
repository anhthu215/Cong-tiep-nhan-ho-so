import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentDocument } from "@/lib/student-documents";

const date = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : null);
const score = (v: number | null) => (v === null ? null : v.toFixed(1));

type Field = { label: string; value: string | null };

function Section({ title, doc, fields }: { title: string; doc?: StudentDocument; fields: Field[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      {!doc ? (
        <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Chưa nộp giấy tờ này.</p>
      ) : doc.status === "can_nop_lai" ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Cần nộp lại: {doc.rejection_reason ?? "Không đọc rõ thông tin"}
        </p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => (
            <div key={f.label} className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-base font-medium">
                {f.value ?? <span className="text-muted-foreground">Không đọc được</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function ExtractedInfo({
  documents,
}: {
  documents: Partial<Record<StudentDocument["doc_type"], StudentDocument>>;
}) {
  const t = documents.transcript;
  const i = documents.ielts;
  const d = documents.id_document;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đã trích xuất</CardTitle>
        <p className="text-sm text-muted-foreground">
          Đây là thông tin đọc được từ giấy tờ bạn đã nộp, kiểm tra lại xem có đúng không nhé.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section
          title="Bảng điểm"
          doc={t}
          fields={[
            { label: "Họ tên", value: t?.full_name ?? null },
            { label: "Ngày sinh", value: date(t?.date_of_birth ?? null) },
            {
              label: "Điểm học tập tổng kết",
              value: t?.gpa != null ? `${t.gpa}${t.gpa_scale ? ` / ${t.gpa_scale}` : ""}` : null,
            },
          ]}
        />
        <Section
          title="Chứng chỉ IELTS"
          doc={i}
          fields={[
            { label: "Họ tên trên chứng chỉ", value: i?.full_name ?? null },
            { label: "Nghe", value: score(i?.ielts_listening ?? null) },
            { label: "Đọc", value: score(i?.ielts_reading ?? null) },
            { label: "Viết", value: score(i?.ielts_writing ?? null) },
            { label: "Nói", value: score(i?.ielts_speaking ?? null) },
            { label: "Điểm tổng", value: score(i?.ielts_overall ?? null) },
            { label: "Ngày thi", value: date(i?.ielts_exam_date ?? null) },
          ]}
        />
        <Section
          title="CMND/CCCD hoặc hộ chiếu"
          doc={d}
          fields={[
            { label: "Họ tên", value: d?.full_name ?? null },
            { label: "Ngày sinh", value: date(d?.date_of_birth ?? null) },
            { label: "Số giấy tờ", value: d?.id_number ?? null },
          ]}
        />
      </CardContent>
    </Card>
  );
}
