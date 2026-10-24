import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { servicePackages, type RequestStatus } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";

const degreeLabels: Record<string, string> = {
  thpt: "THPT",
  dai_hoc: "Đại học",
  thac_si: "Thạc sĩ",
};

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function packageLabel(id: string) {
  return servicePackages.find((p) => p.id === id)?.name ?? id;
}

export default async function AdminRequestsPage() {
  await connection();
  const { data: requests, error } = await createAdminClient()
    .from("quote_requests")
    .select("id, customer_name, email, phone, country, degree_level, service_package, price_vnd, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <>
      <AdminPageHeader
        title="Yêu cầu"
        description="Danh sách yêu cầu báo giá gửi từ trang chủ, chờ đội ngũ duyệt."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khách</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Quốc gia</TableHead>
              <TableHead>Bậc học</TableHead>
              <TableHead>Gói dịch vụ</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.customer_name}</TableCell>
                <TableCell>
                  <div>{req.email}</div>
                  {req.phone && <div className="text-xs text-muted-foreground">{req.phone}</div>}
                </TableCell>
                <TableCell>{req.country}</TableCell>
                <TableCell>{degreeLabels[req.degree_level] ?? req.degree_level}</TableCell>
                <TableCell>{packageLabel(req.service_package)}</TableCell>
                <TableCell>{formatVnd(req.price_vnd)}</TableCell>
                <TableCell>
                  <RequestStatusBadge status={req.status as RequestStatus} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(req.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Chưa có yêu cầu báo giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
