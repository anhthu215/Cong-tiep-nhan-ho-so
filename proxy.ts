import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const sha = (s: string) => createHash("sha256").update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

// Trang /admin chứa dữ liệu riêng tư của khách: bắt buộc đăng nhập Basic Auth.
// Chưa đặt ADMIN_PASSWORD thì chặn hoàn toàn (fail closed). Thay bằng Supabase Auth ở Tuần 6.
export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Chưa cấu hình ADMIN_PASSWORD nên khu vực admin bị khóa.", { status: 503 });
  }
  const user = process.env.ADMIN_USER ?? "admin";

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString();
    const i = decoded.indexOf(":");
    if (i >= 0 && same(decoded.slice(0, i), user) && same(decoded.slice(i + 1), password)) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Cần đăng nhập.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="DuHoc24 Admin", charset="UTF-8"' },
  });
}

export const config = { matcher: "/admin/:path*" };
