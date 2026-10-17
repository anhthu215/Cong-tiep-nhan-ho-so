import { DOC_TYPES, MAX_FILE_BYTES, extractDocument, type DocType } from "@/lib/document-extraction";
import { getStudentProfileId } from "@/lib/student-session";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_UPLOADS_PER_PROFILE = 20;

// Nhận dạng loại tệp theo nội dung (magic bytes), không tin Content-Type do client gửi.
function sniffMime(b: Buffer): "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP")
    return "image/webp";
  return null;
}

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Dữ liệu tải lên không hợp lệ.", 400);
  }

  const docType = form.get("docType");
  const file = form.get("file");
  if (typeof docType !== "string" || !DOC_TYPES.includes(docType as DocType)) {
    return fail("Loại giấy tờ không hợp lệ.", 400);
  }
  if (!(file instanceof File) || file.size === 0) return fail("Chưa chọn tệp.", 400);
  if (file.size > MAX_FILE_BYTES) return fail("Tệp quá lớn (tối đa 4MB).", 413);

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(bytes);
  const type = docType as DocType;
  if (type === "transcript" ? mime !== "application/pdf" : !mime || mime === "application/pdf") {
    return fail(type === "transcript" ? "Bảng điểm cần là tệp PDF." : "Vui lòng tải ảnh JPG, PNG hoặc WEBP.", 415);
  }

  const supabase = createAdminClient();
  let profileId: string;
  try {
    profileId = (await getStudentProfileId(true))!;
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("upload_count")
      .eq("id", profileId)
      .single();
    if (error) throw error;
    if (profile.upload_count >= MAX_UPLOADS_PER_PROFILE) {
      return fail("Bạn đã tải lên quá nhiều lần. Vui lòng liên hệ đội ngũ tư vấn.", 429);
    }
    await supabase
      .from("student_profiles")
      .update({ upload_count: profile.upload_count + 1 })
      .eq("id", profileId);
  } catch (e) {
    console.error("Student profile error", e);
    return fail("Không tạo được hồ sơ học viên.", 500);
  }

  let result;
  try {
    result = await extractDocument(type, mime!, bytes);
  } catch (e) {
    console.error("Extract error", e);
    return fail("Hệ thống chưa đọc được giấy tờ lúc này. Bạn thử lại sau nhé.", 502);
  }

  const { error: saveError } = await supabase.from("student_documents").upsert(
    {
      profile_id: profileId,
      doc_type: type,
      status: result.ok ? "hop_le" : "can_nop_lai",
      rejection_reason: result.reason,
      file_name: file.name.slice(0, 200),
      ...result.fields,
      uploaded_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,doc_type" },
  );
  if (saveError) {
    console.error("Save document error", saveError);
    return fail("Không lưu được kết quả.", 500);
  }

  return Response.json({ status: result.ok ? "hop_le" : "can_nop_lai", reason: result.reason });
}
