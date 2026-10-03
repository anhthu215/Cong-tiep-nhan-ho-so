import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SchoolList } from "@/components/schools/school-list";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/mock-data";

export const metadata = { title: "Điểm chuẩn các trường | DuHoc24" };

export default function SchoolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-medium tracking-tight">Điểm chuẩn các trường</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Điểm học tập và IELTS tối thiểu của từng trường. Sau khi nộp đủ hồ sơ, hệ thống sẽ tự
          so sánh điểm của bạn với bảng này.
        </p>

        <div className="mt-8">
          <SchoolList schools={schools} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">Muốn biết mình đủ điều kiện vào trường nào?</p>
          <Button render={<Link href="/#bao-gia" />}>Nhận báo giá</Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
