import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ExtractLeadButton } from "@/components/admin/extract-lead-button";
import { LeadQualityBadge } from "@/components/admin/lead-quality-badge";
import { Card } from "@/components/ui/card";
import type { Lead } from "@/lib/lead-extraction";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = createAdminClient();
  const [{ data: conversation }, { data: messages }, { data: lead }] = await Promise.all([
    supabase.from("conversations").select("id, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("leads").select("*").eq("conversation_id", id).maybeSingle(),
  ]);
  if (!conversation) notFound();

  const l = lead as Lead | null;
  const fields: [string, string | null | undefined][] = [
    ["Họ tên", l?.name],
    ["Email", l?.email],
    ["Số điện thoại", l?.phone],
    ["Nước du học", l?.country],
    ["Bậc học", l?.education_level],
    ["Ngành học", l?.major],
    ["Thời gian rảnh", l?.availability],
    [
      "Đặt lịch tư vấn",
      l ? (l.wants_consultation === null ? null : l.wants_consultation ? "Có" : "Không") : undefined,
    ],
    ["Ghi chú", l?.note],
  ];

  return (
    <>
      <Link
        href="/admin/conversations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Tất cả hội thoại
      </Link>
      <AdminPageHeader
        title={l?.name ?? "Khách chưa xác định"}
        description={`Bắt đầu lúc ${new Date(conversation.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`}
        action={<ExtractLeadButton conversationId={id} hasLead={!!l} />}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-4 text-base font-medium">Nội dung hội thoại</h2>
          <div className="space-y-3">
            {messages?.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {!messages?.length && <p className="text-sm text-muted-foreground">Chưa có tin nhắn.</p>}
          </div>
        </Card>

        <Card className="h-fit p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium">Thông tin lead</h2>
            {l && <LeadQualityBadge quality={l.quality} />}
          </div>
          {l ? (
            <>
              <dl className="space-y-3 text-sm">
                {fields.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd>{value ?? <span className="text-muted-foreground">—</span>}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Trích xuất bằng AI lúc{" "}
                {new Date(l.extracted_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa trích xuất. Bấm &quot;Trích xuất lead&quot; để AI đọc hội thoại và điền thông tin.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
