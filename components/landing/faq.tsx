import { ChevronDown } from "lucide-react";
import { qna } from "@/lib/chat-qna";

// Dùng chung bộ QnA với chatbot để nội dung luôn khớp.
export function Faq() {
  return (
    <section className="border-t py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <span className="h-px w-5 bg-primary" />
          Câu hỏi thường gặp
        </p>
        <h2 className="mt-3 text-balance text-3xl font-medium tracking-tight md:text-4xl">
          Bạn cần biết gì trước khi bắt đầu
        </h2>

        <div className="mt-10 divide-y rounded-xl border bg-card">
          {qna.map(({ question, answer }) => (
            <details key={question} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
