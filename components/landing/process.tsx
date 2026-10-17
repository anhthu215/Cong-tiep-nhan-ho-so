import { ClipboardList, FileUp, GraduationCap } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Điền form báo giá",
    description:
      "Chọn quốc gia, bậc học và gói dịch vụ. Đội ngũ tư vấn xem xét, duyệt yêu cầu rồi gửi email mời bạn vào cổng hồ sơ.",
  },
  {
    icon: FileUp,
    title: "Nộp giấy tờ trong cổng hồ sơ",
    description:
      "Tải lên bảng điểm (PDF), ảnh chứng chỉ IELTS và ảnh CMND/CCCD hoặc hộ chiếu.",
  },
  {
    icon: GraduationCap,
    title: "Nhận kết quả đối chiếu",
    description:
      "Hệ thống tự so điểm học tập và điểm IELTS với điểm chuẩn từng trường, báo ngay trường nào bạn đủ điều kiện.",
  },
];

export function Process() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <span className="h-px w-5 bg-primary" />
          Quy trình
        </p>
        <h2 className="mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
          Ba bước từ báo giá đến kết quả
        </h2>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <li key={title} className="relative rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Bước {i + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
