import Image from "next/image";
import { Plane } from "lucide-react";

// Ảnh hero. Đang dùng ảnh stock tạm (Unsplash). Khi có ảnh thật của đội ngũ hoặc học viên,
// chỉ cần đổi HERO_PHOTO (đường dẫn trong /public hoặc URL) và alt cho đúng nội dung ảnh.
const HERO_PHOTO = {
  src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
  alt: "Sinh viên tung mũ tốt nghiệp sau khi hoàn tất chương trình du học",
};

export function HeroPhoto() {
  return (
    <div className="relative">
      <div className="absolute -right-3 -top-3 h-6 w-40 rounded-full bg-white/80" aria-hidden="true" />
      <div className="absolute -bottom-3 -left-3 h-5 w-32 rounded-full bg-primary/10" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-xl border bg-card">
        <Image
          src={HERO_PHOTO.src}
          alt={HERO_PHOTO.alt}
          width={1600}
          height={1280}
          priority
          sizes="(min-width: 768px) 560px, 100vw"
          className="aspect-16/11 w-full object-cover md:aspect-5/4"
        />
      </div>

      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 sm:left-6">
        <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
          <Plane className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium leading-tight">Đối chiếu điểm chuẩn tự động</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Biết ngay trường nào bạn đạt</p>
        </div>
      </div>
    </div>
  );
}
