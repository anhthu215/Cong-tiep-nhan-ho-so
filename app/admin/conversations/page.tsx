import Link from "next/link";
import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { LeadQualityBadge } from "@/components/admin/lead-quality-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead } from "@/lib/lead-extraction";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminConversationsPage() {
  await connection();
  const supabase = createAdminClient();

  const [{ data: conversations, error }, { data: leads }, { data: counts }] = await Promise.all([
    supabase.from("conversations").select("id, created_at, updated_at").order("updated_at", { ascending: false }),
    supabase.from("leads").select("*"),
    supabase.from("messages").select("conversation_id"),
  ]);
  if (error) throw error;

  const leadById = new Map((leads as Lead[] | null)?.map((l) => [l.conversation_id, l]));
  const countById = new Map<string, number>();
  counts?.forEach((m) => countById.set(m.conversation_id, (countById.get(m.conversation_id) ?? 0) + 1));

  return (
    <>
      <AdminPageHeader
        title="Hội thoại"
        description="Cuộc trò chuyện của khách với chatbot trên trang chủ, kèm thông tin lead trích xuất bằng AI."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Chất lượng lead</TableHead>
              <TableHead>Số tin nhắn</TableHead>
              <TableHead>Cập nhật gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((c) => {
              const lead = leadById.get(c.id);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/conversations/${c.id}`} className="hover:underline">
                      {lead?.name ?? "Khách chưa xác định"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead?.email ?? lead?.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {lead ? (
                      <LeadQualityBadge quality={lead.quality} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Chưa trích xuất</span>
                    )}
                  </TableCell>
                  <TableCell>{countById.get(c.id) ?? 0} tin nhắn</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </TableCell>
                </TableRow>
              );
            })}
            {conversations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có cuộc trò chuyện nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
