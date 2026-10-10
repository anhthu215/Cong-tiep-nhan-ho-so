import { StatusBadge } from "@/components/status-badge";
import type { LeadQuality } from "@/lib/lead-extraction";

const meta: Record<LeadQuality, { label: string; tone: "green" | "yellow" | "red" }> = {
  good: { label: "Tốt", tone: "green" },
  ok: { label: "Tạm được", tone: "yellow" },
  spam: { label: "Spam", tone: "red" },
};

export function LeadQualityBadge({ quality }: { quality: LeadQuality }) {
  const m = meta[quality];
  return <StatusBadge tone={m.tone} label={m.label} />;
}
