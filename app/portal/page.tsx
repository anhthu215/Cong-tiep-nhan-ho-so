import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentFeatures } from "@/components/portal/document-features";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { SchoolMatch } from "@/components/portal/school-match";
import { matchSchools } from "@/lib/school-match";
import { getSchools } from "@/lib/schools";
import { getStudentDocuments } from "@/lib/student-documents";
import type { DocStatus } from "@/lib/mock-data";

export default async function PortalPage() {
  await connection();
  const [documents, schools] = await Promise.all([getStudentDocuments(), getSchools()]);
  const { transcript, ielts, id_document } = documents;

  const name = id_document?.full_name ?? transcript?.full_name ?? ielts?.full_name ?? null;
  const statusOf = (d?: { status: DocStatus }): DocStatus => d?.status ?? "chua_nop";

  // Chỉ đối chiếu khi hồ sơ đầy đủ (đủ 3 giấy tờ) và hợp lệ. Điểm học tập phải ở thang 10 mới so được với điểm chuẩn.
  const missing = [
    ["Bảng điểm", transcript],
    ["Chứng chỉ IELTS", ielts],
    ["CMND/CCCD hoặc hộ chiếu", id_document],
  ]
    .filter(([, d]) => (d as { status?: string } | undefined)?.status !== "hop_le")
    .map(([label]) => label as string);

  const gpa = transcript?.gpa ?? null;
  const ieltsOverall = ielts?.ielts_overall ?? null;
  const scaleOk = transcript?.gpa_scale === 10;
  const ready = missing.length === 0 && gpa !== null && ieltsOverall !== null && scaleOk;
  const matches = ready ? matchSchools({ gpa, ielts: ieltsOverall }, schools) : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="border-b pb-6">
          <p className="text-sm text-muted-foreground">Xin chào,</p>
          <h1 className="text-2xl font-medium tracking-tight">{name ?? "bạn"}</h1>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Giấy tờ cần nộp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nộp đủ 3 loại giấy tờ dưới đây, hệ thống sẽ tự trích xuất thông tin và đối chiếu điểm chuẩn giúp bạn.
          </p>

          <div className="mt-6">
            <DocumentFeatures
              items={[
                {
                  docType: "transcript",
                  title: "Bảng điểm (PDF)",
                  accept: "Chấp nhận PDF, tối đa 4MB",
                  mimeAccept: "application/pdf",
                  fileName: transcript?.file_name,
                  status: statusOf(transcript),
                  reason: transcript?.rejection_reason,
                },
                {
                  docType: "ielts",
                  title: "Ảnh chứng chỉ IELTS",
                  accept: "Chấp nhận JPG, PNG, tối đa 4MB",
                  mimeAccept: "image/jpeg,image/png,image/webp",
                  fileName: ielts?.file_name,
                  status: statusOf(ielts),
                  reason: ielts?.rejection_reason,
                },
                {
                  docType: "id_document",
                  title: "Ảnh CMND/CCCD hoặc hộ chiếu",
                  accept: "Chấp nhận JPG, PNG, tối đa 4MB",
                  mimeAccept: "image/jpeg,image/png,image/webp",
                  fileName: id_document?.file_name,
                  status: statusOf(id_document),
                  reason: id_document?.rejection_reason,
                },
              ]}
            />
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <ExtractedInfo documents={documents} />
          {ready ? (
            <SchoolMatch matches={matches} student={{ gpa: gpa!, ielts: ieltsOverall! }} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {missing.length > 0
                  ? `Hồ sơ cần đầy đủ và hợp lệ để đối chiếu điểm chuẩn. Còn thiếu hoặc cần nộp lại: ${missing.join(", ")}.`
                  : "Bảng điểm của bạn không ở thang điểm 10 nên hệ thống chưa tự đối chiếu được. Đội ngũ tư vấn sẽ hỗ trợ bạn."}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
