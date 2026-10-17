import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentFeatures } from "@/components/portal/document-features";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { SchoolMatch } from "@/components/portal/school-match";
import { getSchools } from "@/lib/schools";
import { getStudentDocuments } from "@/lib/student-documents";
import type { DocStatus } from "@/lib/mock-data";

export default async function PortalPage() {
  await connection();
  const [documents, schools] = await Promise.all([getStudentDocuments(), getSchools()]);
  const { transcript, ielts, id_document } = documents;

  const name = id_document?.full_name ?? transcript?.full_name ?? ielts?.full_name ?? null;
  const statusOf = (d?: { status: DocStatus }): DocStatus => d?.status ?? "chua_nop";

  // Chỉ so sánh khi có điểm hệ 10 và IELTS tổng; hệ điểm khác chưa quy đổi.
  const gpa10 = transcript?.status === "hop_le" && transcript.gpa_scale === 10 ? transcript.gpa : null;
  const ieltsOverall = ielts?.status === "hop_le" ? ielts.ielts_overall : null;
  const canMatch = gpa10 !== null && ieltsOverall !== null;
  const matches = canMatch
    ? schools.map((school) => ({
        school,
        passed: gpa10 >= school.minGpa && ieltsOverall >= school.minIelts,
      }))
    : [];

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
          {canMatch ? (
            <SchoolMatch matches={matches} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {transcript?.status === "hop_le" && transcript.gpa_scale !== 10
                  ? "Bảng điểm của bạn không ở thang điểm 10 nên hệ thống chưa tự đối chiếu được. Đội ngũ tư vấn sẽ hỗ trợ bạn."
                  : "Nộp hợp lệ bảng điểm (thang điểm 10) và chứng chỉ IELTS để xem bạn đủ điều kiện vào trường nào."}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
