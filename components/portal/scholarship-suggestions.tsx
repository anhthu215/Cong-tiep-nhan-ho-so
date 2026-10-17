"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScholarshipSuggestions({
  suggestion,
  schoolsLookedUp,
}: {
  suggestion: string | null;
  schoolsLookedUp: string[];
}) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const started = React.useRef(false);

  const generate = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/scholarships", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Chưa gợi ý được học bổng.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa gợi ý được học bổng.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Chưa có gợi ý (hoặc hồ sơ vừa đổi) thì tự tạo, không cần bấm nút.
  React.useEffect(() => {
    if (suggestion === null && !started.current) {
      started.current = true;
      generate();
    }
  }, [suggestion, generate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gợi ý học bổng</CardTitle>
        <p className="text-sm text-muted-foreground">
          Trợ lý AI tra cứu học bổng của các trường bạn đã đạt điểm chuẩn và so với điểm của bạn. Đây chỉ là gợi ý
          dựa trên điều kiện tối thiểu, không phải cam kết nhận học bổng.
        </p>
      </CardHeader>
      <CardContent>
        {suggestion ? (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{suggestion}</p>
            {schoolsLookedUp.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                AI đã tra cứu học bổng của: {schoolsLookedUp.join(", ")}
              </p>
            )}
          </>
        ) : error ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
              <RotateCw className="size-4" />
              Thử lại
            </Button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tra cứu học bổng phù hợp với bạn...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
