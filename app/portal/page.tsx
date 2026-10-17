import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentFeatures } from "@/components/portal/document-features";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { SchoolMatch } from "@/components/portal/school-match";
import { ScholarshipSuggestions } from "@/components/portal/scholarship-suggestions";
import { evaluatePortal } from "@/lib/portal-readiness";
import { inputHash } from "@/lib/scholarship-advisor";
import { getCachedSuggestion } from "@/lib/scholarship-suggestions";
import { getSchools } from "@/lib/schools";
import { getStudentDocuments } from "@/lib/student-documents";
import type { DocStatus } from "@/lib/mock-data";

export default async function PortalPage() {
  await connection();
  const [documents, schools] = await Promise.all([getStudentDocuments(), getSchools()]);
  const { transcript, ielts, id_document } = documents;

  const name = id_document?.full_name ?? transcript?.full_name ?? ielts?.full_name ?? null;
  const statusOf = (d?: { status: DocStatus }): DocStatus => d?.status ?? "chua_nop";

  // Chỉ cần bảng điểm và IELTS hợp lệ là đối chiếu được (CMND/hộ chiếu không bắt buộc).
  const { ready, missing, gpa, ielts: ieltsOverall, matches } = evaluatePortal(documents, schools);
  const passedSchools = matches.filter((m) => m.passed).map((m) => m.school.name);
  const cachedSuggestion =
    ready && passedSchools.length > 0
      ? await getCachedSuggestion(inputHash({ gpa: gpa!, ielts: ieltsOverall!, passedSchools }))
      : null;

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
            Chỉ cần nộp bảng điểm và chứng chỉ IELTS là hệ thống tự trích xuất thông tin và đối chiếu điểm chuẩn giúp bạn. CMND/CCCD hoặc hộ chiếu không bắt buộc.
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
                  title: "Ảnh CMND/CCCD hoặc hộ chiếu (không bắt buộc)",
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
            <>
              <SchoolMatch matches={matches} student={{ gpa: gpa!, ielts: ieltsOverall! }} />
              {passedSchools.length > 0 ? (
                <ScholarshipSuggestions
                  suggestion={cachedSuggestion?.suggestion ?? null}
                  schoolsLookedUp={cachedSuggestion?.schoolsLookedUp ?? []}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Gợi ý học bổng</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Bạn chưa đạt điểm chuẩn trường nào trong danh sách nên chưa có gợi ý học bổng.
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {missing.length > 0
                  ? `Cần nộp hợp lệ bảng điểm và chứng chỉ IELTS để đối chiếu điểm chuẩn. Còn thiếu hoặc cần nộp lại: ${missing.join(", ")}.`
                  : "Bảng điểm của bạn không ở thang điểm 10 nên hệ thống chưa tự đối chiếu được. Đội ngũ tư vấn sẽ hỗ trợ bạn."}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
