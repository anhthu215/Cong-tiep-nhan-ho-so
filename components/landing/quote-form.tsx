"use client";

import React from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { emailErrorMessage } from "@/lib/validation";
import { countries, servicePackages, type ServicePackage } from "@/lib/mock-data";

const degreeLevels = [
  { value: "thpt", label: "THPT" },
  { value: "dai_hoc", label: "Đại học" },
  { value: "thac_si", label: "Thạc sĩ" },
];

const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

export function QuoteForm() {
  const [country, setCountry] = React.useState<string>("");
  const [degreeLevel, setDegreeLevel] = React.useState<string>("dai_hoc");
  const [selectedPackage, setSelectedPackage] = React.useState<ServicePackage>("co_ban");
  const [customerName, setCustomerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState(""); // ô ẩn chống bot
  const [quotedPrice, setQuotedPrice] = React.useState<number | null>(null);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Kiểm tra email ngay khi nhập: báo lỗi khi đã gõ "@" hoặc khoảng trắng, khi rời ô, hoặc khi bấm gửi;
  // từ lúc đó mỗi ký tự gõ thêm đều được kiểm tra lại.
  const emailError = emailErrorMessage(email);
  const showEmailError =
    emailError !== null && (emailTouched || (email.trim() !== "" && /[@\s]/.test(email)));

  const chosenPackage = servicePackages.find((p) => p.id === selectedPackage)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailTouched(true);
    if (emailError) {
      document.getElementById("email")?.focus();
      return;
    }
    if (!country) {
      setError("Vui lòng chọn quốc gia muốn du học.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          country,
          degreeLevel,
          servicePackage: selectedPackage,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Chưa gửi được yêu cầu.");
      setQuotedPrice(typeof data.price === "number" ? data.price : chosenPackage.price);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa gửi được yêu cầu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="bao-gia" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div>
          <h2 className="text-balance text-3xl font-medium tracking-tight">
            Nhận báo giá dịch vụ ngay
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Chọn quốc gia, bậc học và gói dịch vụ phù hợp với bạn
          </p>
        </div>

        <Card className="mt-10 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Quốc gia muốn du học</Label>
                <Select value={country} onValueChange={(value) => setCountry(value ?? "")}>
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Chọn quốc gia" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bậc học</Label>
                <RadioGroup
                  value={degreeLevel}
                  onValueChange={setDegreeLevel}
                  className="grid grid-cols-3 gap-2 pt-1"
                >
                  {degreeLevels.map((level) => (
                    <label
                      key={level.value}
                      className={cn(
                        "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 text-[15px] duration-150",
                        degreeLevel === level.value
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-input text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      <RadioGroupItem value={level.value} style={srOnlyStyle} />
                      {level.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gói dịch vụ</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {servicePackages.map((pkg) => {
                  const active = selectedPackage === pkg.id;
                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={cn(
                        "rounded-xl border p-5 text-left duration-150",
                        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pkg.name}</span>
                        {active && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-2xl font-semibold tracking-tight">
                        {formatVnd(pkg.price)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                      <ul className="mt-4 space-y-2">
                        {pkg.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerName">Họ và tên</Label>
                <Input
                  id="customerName"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email liên hệ</Label>
                <Input
                  id="email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="ban@email.com"
                  value={email}
                  aria-invalid={showEmailError || undefined}
                  aria-describedby={showEmailError ? "email-error" : undefined}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email && setEmailTouched(true)}
                />
                {showEmailError && (
                  <p id="email-error" role="alert" className="text-sm text-red-600">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" loading={sending}>
              Nhận báo giá
            </Button>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {quotedPrice !== null && (
              <div className="space-y-3 rounded-xl border border-primary/20 bg-accent p-5">
                <p className="text-sm text-muted-foreground">Mức giá dự kiến cho bạn</p>
                <p className="text-3xl font-semibold tracking-tight text-accent-foreground">
                  {formatVnd(quotedPrice)}
                </p>
                <div className="flex items-start gap-2 text-sm text-accent-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Chúng tôi đã nhận yêu cầu của bạn, đội ngũ sẽ liên hệ trong 24h.
                  </span>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </section>
  );
}
