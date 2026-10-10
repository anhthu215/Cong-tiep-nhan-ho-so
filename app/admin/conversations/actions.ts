"use server";

import { revalidatePath } from "next/cache";
import { extractLead } from "@/lib/lead-extraction";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Gọi qua URL /admin/... nên được proxy.ts (Basic Auth) bảo vệ.
export async function extractLeadAction(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!UUID.test(conversationId)) return { ok: false, error: "Mã cuộc trò chuyện không hợp lệ." };
  try {
    await extractLead(conversationId);
  } catch (e) {
    console.error("extractLeadAction", e);
    return { ok: false, error: e instanceof Error ? e.message : "Trích xuất thất bại." };
  }
  revalidatePath("/admin/conversations");
  revalidatePath(`/admin/conversations/${conversationId}`);
  return { ok: true };
}
