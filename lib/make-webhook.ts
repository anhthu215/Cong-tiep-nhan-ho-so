import "server-only";

export interface QuoteWebhookPayload {
  requestId: string;
  customerName: string;
  email: string;
  servicePackage: string;
  price: number;
}

/**
 * Gửi yêu cầu báo giá mới tới webhook Make.com (địa chỉ nằm trong MAKE_WEBHOOK_URL, không ghi trong code).
 * Không bao giờ ném lỗi: nếu webhook hỏng thì chỉ ghi log, yêu cầu của khách vẫn đã được lưu.
 */
export async function sendQuoteToMake(payload: QuoteWebhookPayload): Promise<void> {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) console.log("Đã gửi yêu cầu báo giá tới Make", res.status);
    else console.error("Make webhook trả lỗi", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("Không gửi được webhook Make", e instanceof Error ? e.message : e);
  }
}

export interface ApprovalWebhookPayload {
  requestId: string;
  customerName: string;
  email: string;
  /** Link đăng nhập gửi cho khách. Đổi giá trị này (APPROVAL_LOGIN_LINK) là đủ, tên trường giữ nguyên để Make không phải sửa. */
  loginLink: string;
}

/**
 * Gửi thông báo "đã duyệt" tới webhook Make.com thứ hai (MAKE_APPROVAL_WEBHOOK_URL).
 * Trả về true nếu Make nhận thành công, false nếu thất bại (không ném lỗi) để admin biết và gửi lại.
 */
export async function sendApprovalToMake(payload: ApprovalWebhookPayload): Promise<boolean> {
  const url = process.env.MAKE_APPROVAL_WEBHOOK_URL;
  if (!url) {
    console.error("Chưa cấu hình MAKE_APPROVAL_WEBHOOK_URL");
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      console.log("Đã gửi thông báo duyệt tới Make", res.status);
      return true;
    }
    console.error("Make (duyệt) trả lỗi", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("Không gửi được thông báo duyệt tới Make", e instanceof Error ? e.message : e);
  }
  return false;
}
