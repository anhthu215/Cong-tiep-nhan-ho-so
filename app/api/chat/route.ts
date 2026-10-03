import { systemInstruction } from "@/lib/chat-qna";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

interface ChatMessage {
  from: "bot" | "user";
  text: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chưa cấu hình GEMINI_API_KEY." }, { status: 500 });
  }

  let messages: ChatMessage[];
  try {
    ({ messages } = await request.json());
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Thiếu nội dung tin nhắn." }, { status: 400 });
  }

  // Giữ mạch hội thoại, giới hạn 20 lượt gần nhất; Gemini yêu cầu lượt đầu là của user.
  const contents = messages
    .slice(-20)
    .filter((m) => typeof m.text === "string" && m.text.trim())
    .map((m) => ({
      role: m.from === "user" ? "user" : "model",
      parts: [{ text: m.text.slice(0, 1000) }],
    }));
  while (contents.length && contents[0].role !== "user") contents.shift();
  if (!contents.length) {
    return Response.json({ error: "Thiếu nội dung tin nhắn." }, { status: 400 });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.2 },
      }),
    },
  );

  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return Response.json({ error: "Không gọi được Gemini." }, { status: 502 });
  }

  const data = await res.json();
  const reply: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  return Response.json({
    reply: reply || "Xin lỗi, mình chưa trả lời được. Bạn thử hỏi lại giúp mình nhé.",
  });
}
