import { after } from "next/server";
import { sendQuoteToMake } from "@/lib/make-webhook";
import { countries, servicePackages } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidEmail } from "@/lib/validation";

const DEGREE_LEVELS = ["thpt", "dai_hoc", "thac_si"];
const MAX_REQUESTS_PER_EMAIL_PER_DAY = 3;

const fail = (error: string, status: number) => Response.json({ error }, { status });
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Khách gửi yêu cầu báo giá từ trang chủ. Giá luôn do server tính từ gói dịch vụ, không tin giá do trình duyệt gửi.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Dữ liệu không hợp lệ.", 400);
  }

  // Ô ẩn dành cho bot: người thật không điền. Trả thành công giả để bot không biết bị chặn.
  if (text(body.website, 100)) return Response.json({ ok: true });

  const customerName = text(body.customerName, 100);
  const email = text(body.email, 200).toLowerCase();
  const phone = text(body.phone, 30);
  const country = text(body.country, 80);
  const degreeLevel = text(body.degreeLevel, 20);
  const pkg = servicePackages.find((p) => p.id === body.servicePackage);

  if (customerName.length < 2) return fail("Vui lòng nhập họ tên.", 400);
  if (!isValidEmail(email)) return fail("Email chưa hợp lệ.", 400);
  if (phone && !/^[0-9+()\-.\s]{6,30}$/.test(phone)) return fail("Số điện thoại chưa hợp lệ.", 400);
  if (!(countries as readonly string[]).includes(country)) return fail("Vui lòng chọn quốc gia.", 400);
  if (!DEGREE_LEVELS.includes(degreeLevel)) return fail("Bậc học không hợp lệ.", 400);
  if (!pkg) return fail("Gói dịch vụ không hợp lệ.", 400);

  const supabase = createAdminClient();
  let requestId: string;
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .ilike("email", email)
      .gte("created_at", since);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_REQUESTS_PER_EMAIL_PER_DAY) {
      return fail("Bạn đã gửi nhiều yêu cầu hôm nay. Đội ngũ sẽ liên hệ với bạn sớm.", 429);
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        customer_name: customerName,
        email,
        phone: phone || null,
        country,
        degree_level: degreeLevel,
        service_package: pkg.id,
        price_vnd: pkg.price,
      })
      .select("id")
      .single();
    if (error) throw error;
    requestId = data.id;
  } catch (e) {
    console.error("Save quote request error", e);
    return fail("Chưa gửi được yêu cầu lúc này. Bạn thử lại sau nhé.", 500);
  }

  // Gửi sang Make sau khi đã trả lời khách, để webhook chậm hay lỗi không ảnh hưởng khách.
  after(() =>
    sendQuoteToMake({
      requestId,
      customerName,
      email,
      servicePackage: pkg.name,
      price: pkg.price,
    }),
  );

  return Response.json({ ok: true, price: pkg.price });
}
