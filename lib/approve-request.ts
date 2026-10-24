import "server-only";
import { sendApprovalToMake } from "@/lib/make-webhook";
import { createAdminClient } from "@/lib/supabase/admin";

export type ApproveResult =
  | { ok: true; notified: boolean }
  | { ok: false; error: string };

/**
 * Link đăng nhập gửi cho khách. Tuần này dùng tạm trang /login của chính website;
 * khi có trang đăng nhập thật chỉ cần đặt APPROVAL_LOGIN_LINK, không phải sửa code hay Make.
 */
export function getLoginLink(origin: string): string {
  return process.env.APPROVAL_LOGIN_LINK?.trim() || `${origin}/login`;
}

/**
 * Duyệt một yêu cầu báo giá và gửi thông báo sang Make.
 * Chỉ duyệt được yêu cầu đang "chờ duyệt" (cập nhật có điều kiện), nên bấm nhiều lần hay hai admin bấm cùng lúc
 * vẫn chỉ duyệt và gửi đúng một lần.
 */
export async function approveRequest(id: string, origin: string): Promise<ApproveResult> {
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("quote_requests")
    .update({ status: "da_duyet", approved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "cho_duyet")
    .select("id, customer_name, email")
    .maybeSingle();
  if (error) {
    console.error("Approve request error", error);
    return { ok: false, error: "Không duyệt được yêu cầu. Bạn thử lại sau nhé." };
  }
  if (!row) return { ok: false, error: "Yêu cầu này đã được xử lý hoặc không còn tồn tại." };

  const notified = await sendApprovalToMake({
    requestId: row.id,
    customerName: row.customer_name,
    email: row.email,
    loginLink: getLoginLink(origin),
  });
  if (notified) {
    await supabase
      .from("quote_requests")
      .update({ approval_notified_at: new Date().toISOString() })
      .eq("id", id);
  }
  return { ok: true, notified };
}

/** Gửi lại thông báo cho yêu cầu đã duyệt nhưng lần gửi trước sang Make bị lỗi. */
export async function resendApproval(id: string, origin: string): Promise<ApproveResult> {
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("quote_requests")
    .select("id, customer_name, email, status, approval_notified_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !row) return { ok: false, error: "Không tìm thấy yêu cầu." };
  if (row.status !== "da_duyet") return { ok: false, error: "Chỉ gửi lại được cho yêu cầu đã duyệt." };
  if (row.approval_notified_at) return { ok: false, error: "Thông báo của yêu cầu này đã được gửi." };

  const notified = await sendApprovalToMake({
    requestId: row.id,
    customerName: row.customer_name,
    email: row.email,
    loginLink: getLoginLink(origin),
  });
  if (notified) {
    await supabase
      .from("quote_requests")
      .update({ approval_notified_at: new Date().toISOString() })
      .eq("id", id);
  }
  return { ok: true, notified };
}
