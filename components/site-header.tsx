"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import React from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Trang chủ", href: "/" },
  { name: "Điểm chuẩn trường", href: "/schools" },
  { name: "Cổng hồ sơ", href: "/portal" },
  { name: "Admin", href: "/admin" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75 duration-200",
        scrolled && "shadow-md shadow-primary/5",
      )}
    >
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-8">
          <Link href="/" aria-label="Về trang chủ" className="flex items-center gap-2.5">
            <LogoMark uniColor className="size-9 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">DuHoc24</span>
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-full px-5 py-2.5 text-lg duration-150",
                    isActive(item.href)
                      ? "bg-accent font-semibold text-primary"
                      : "font-medium text-foreground hover:bg-muted",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className="hidden xl:inline-flex"
              nativeButton={false}
              render={<Link href="/#bao-gia">Nhận báo giá</Link>}
            />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              className="relative z-20 flex size-10 items-center justify-center rounded-lg text-foreground duration-150 hover:bg-muted xl:hidden"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t py-4 xl:hidden">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-base duration-150",
                      isActive(item.href)
                        ? "bg-accent font-semibold text-primary"
                        : "font-medium text-foreground hover:bg-muted",
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-4 w-full"
              nativeButton={false}
              render={<Link href="/#bao-gia" onClick={() => setMenuOpen(false)}>Nhận báo giá</Link>}
            />
          </div>
        )}
      </nav>
    </header>
  );
}
