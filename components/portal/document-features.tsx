"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText, IdCard, Loader2, Medal, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocStatusBadge } from "@/components/status-badge";
import type { DocStatus } from "@/lib/mock-data";

const MAX_BYTES = 4 * 1024 * 1024;

const icons = { transcript: FileText, ielts: Medal, id_document: IdCard } as const;

export interface DocumentFeature {
  docType: "transcript" | "ielts" | "id_document";
  title: string;
  accept: string;
  mimeAccept: string;
  fileName?: string | null;
  status: DocStatus;
  reason?: string | null;
}

function UploadCard({ item }: { item: DocumentFeature }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("Tệp quá lớn (tối đa 4MB).");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("docType", item.docType);
      form.append("file", file);
      const res = await fetch("/api/portal/documents", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Tải lên thất bại.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tải lên thất bại.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const status: DocStatus = busy ? "dang_xu_ly" : item.status;
  const Icon = icons[item.docType];

  return (
    <div>
      <Card className="flex aspect-video flex-col items-center justify-center gap-2 border-none bg-foreground/5 p-6 shadow-none ring-0">
        {busy ? (
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        ) : (
          <Icon className="size-7 text-muted-foreground" />
        )}
        <span className="max-w-full truncate px-4 text-xs text-muted-foreground">
          {busy ? "Đang đọc giấy tờ..." : (item.fileName ?? "Chưa có tệp")}
        </span>
      </Card>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <DocStatusBadge status={status} />
        </div>
        <p className="mt-3 text-balance text-muted-foreground">
          {!busy && item.status === "can_nop_lai" && item.reason ? (
            <>
              Cần nộp lại: <span className="text-red-600">{item.reason}</span>
            </>
          ) : (
            item.accept
          )}
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={item.mimeAccept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          loading={busy}
          onClick={() => inputRef.current?.click()}
        >
          {!busy && <Upload className="size-4" />}
          {item.status === "chua_nop" ? "Tải lên" : "Tải lên lại"}
        </Button>
      </div>
    </div>
  );
}

export function DocumentFeatures({ items }: { items: DocumentFeature[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <UploadCard key={item.docType} item={item} />
      ))}
    </div>
  );
}
