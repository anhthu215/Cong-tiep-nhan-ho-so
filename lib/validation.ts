// Quy tắc kiểm tra dùng chung cho trình duyệt và server, để hai nơi luôn cho cùng kết quả.

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 200 && EMAIL_PATTERN.test(v) && !v.includes("..");
}

/** Thông báo lỗi tiếng Việt cho ô email, hoặc null nếu hợp lệ. */
export function emailErrorMessage(value: string): string | null {
  const v = value.trim();
  if (!v) return "Vui lòng nhập email.";
  if (/\s/.test(v)) return "Email không được chứa khoảng trắng.";
  if (!v.includes("@")) return "Email cần có ký tự @, ví dụ: ten@gmail.com.";
  if (!isValidEmail(v)) return "Email chưa đúng định dạng, ví dụ: ten@gmail.com.";
  return null;
}
