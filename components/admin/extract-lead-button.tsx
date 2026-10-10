"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractLeadAction } from "@/app/admin/conversations/actions";

export function ExtractLeadButton({ conversationId, hasLead }: { conversationId: string; hasLead: boolean }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await extractLeadAction(conversationId);
            if (!res.ok) setError(res.error);
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {hasLead ? "Trích xuất lại" : "Trích xuất lead"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
