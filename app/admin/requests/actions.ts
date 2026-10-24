"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { approveRequest, resendApproval, type ApproveResult } from "@/lib/approve-request";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Gọi qua URL /admin/... nên được proxy.ts (Basic Auth) bảo vệ.
export async function approveRequestAction(id: string): Promise<ApproveResult> {
  if (!UUID.test(id)) return { ok: false, error: "Mã yêu cầu không hợp lệ." };
  const result = await approveRequest(id, await origin());
  revalidatePath("/admin/requests");
  return result;
}

export async function resendApprovalAction(id: string): Promise<ApproveResult> {
  if (!UUID.test(id)) return { ok: false, error: "Mã yêu cầu không hợp lệ." };
  const result = await resendApproval(id, await origin());
  revalidatePath("/admin/requests");
  return result;
}
