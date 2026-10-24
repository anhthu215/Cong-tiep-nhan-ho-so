import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroPhoto } from "@/components/landing/hero-photo";

export function Hero() {
  return (
    <section className="overflow-hidden border-b bg-hero-sky pb-20 pt-32 md:pb-24 md:pt-36">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <span className="h-px w-5 bg-primary" />
            Cổng tiếp nhận hồ sơ du học
          </p>

          <h1 className="mt-4 max-w-xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Tư vấn hồ sơ du học, rõ ràng từ báo giá đến xét duyệt
          </h1>

          <p className="mt-5 max-w-lg text-balance text-muted-foreground md:text-lg">
            Biết giá ngay khi điền form, nộp hồ sơ online và theo dõi hồ sơ của
            mình đạt hay chưa đạt điểm chuẩn từng trường.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="#bao-gia">Nhận báo giá ngay</Link>}
            />
            <Button
              variant="outline"
              size="lg"
              className="border-primary bg-white/60 text-primary hover:bg-white"
              nativeButton={false}
              render={<Link href="/portal">Vào cổng hồ sơ</Link>}
            />
          </div>
        </div>

        <HeroPhoto />
      </div>
    </section>
  );
}
