import { Clock, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Báo giá tức thì",
    description: "Báo giá sẽ được gửi trực tiếp vào email đã đăng ký.",
  },
  {
    icon: ShieldCheck,
    title: "Đối chiếu điểm chuẩn minh bạch",
    description:
      "Điểm học tập và IELTS của bạn được so trực tiếp với điểm chuẩn từng trường để biết kết quả đạt hay không.",
  },
  {
    icon: Clock,
    title: "Phản hồi trong 24h",
    description:
      "Gửi yêu cầu báo giá hoặc nộp hồ sơ xong, tư vấn viên sẽ liên hệ lại với bạn trong vòng 24 giờ.",
  },
];

export function Highlights() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
