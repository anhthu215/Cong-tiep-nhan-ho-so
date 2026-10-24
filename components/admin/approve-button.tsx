"use client";

import React from "react";
import { Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveRequestAction, resendApprovalAction } from "@/app/admin/requests/actions";

export function ApproveButton({
  id,
  customerName,
  mode,
}: {
  id: string;
  customerName: string;
  /** "approve": duyệt yêu cầu đang chờ; "resend": gửi lại thông báo cho yêu cầu đã duyệt nhưng chưa gửi được sang Make. */
  mode: "approve" | "resend";
}) {
  const [pending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<{ text: string; ok: boolean } | null>(null);

  function run() {
    if (
      mode === "approve" &&
      !window.confirm(`Duyệt yêu cầu của ${customerName} và gửi email mời đăng nhập cho khách?`)
    ) {
      return;
    }
    startTransition(async () => {
      setMessage(null);
      const res = await (mode === "approve" ? approveRequestAction(id) : resendApprovalAction(id));
      if (!res.ok) setMessage({ text: res.error, ok: false });
      else if (!res.notified)
        setMessage({ text: "Đã duyệt nhưng chưa gửi được sang Make. Bấm “Gửi lại”.", ok: false });
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant={mode === "approve" ? "default" : "outline"} loading={pending} onClick={run}>
        {!pending && (mode === "approve" ? <Check className="size-4" /> : <RotateCw className="size-4" />)}
        {mode === "approve" ? "Duyệt" : "Gửi lại"}
      </Button>
      {message && <p className={message.ok ? "text-xs text-success-ink" : "max-w-48 text-right text-xs text-red-600"}>{message.text}</p>}
    </div>
  );
}
