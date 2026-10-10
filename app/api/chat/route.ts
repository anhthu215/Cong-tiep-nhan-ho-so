import { systemInstruction } from "@/lib/chat-qna";
import { getConversationId } from "@/lib/chat-session";
import { createAdminClient } from "@/lib/supabase/admin";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const HISTORY_LIMIT = 20;

// Lấy lịch sử chat của khách từ database (qua cookie phiên), không dùng bộ nhớ trình duyệt.
export async function GET() {
  try {
    const conversationId = await getConversationId(false);
    if (!conversationId) return Response.json({ messages: [] });

    const { data, error } = await createAdminClient()
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    if (error) throw error;

    return Response.json({
      messages: data.map((m) => ({
        from: m.role === "user" ? "user" : "bot",
        text: m.content,
      })),
    });
  } catch (e) {
    console.error("Load chat error", e);
    return Response.json({ error: "Không tải được lịch sử chat." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chưa cấu hình GEMINI_API_KEY." }, { status: 500 });
  }

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Thiếu nội dung tin nhắn." }, { status: 400 });
  }
  const text = message.trim().slice(0, 1000);

  const supabase = createAdminClient();
  let conversationId: string;
  try {
    conversationId = (await getConversationId(true))!;
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role: "user", content: text });
    if (error) throw error;
  } catch (e) {
    console.error("Save message error", e);
    return Response.json({ error: "Không lưu được tin nhắn." }, { status: 500 });
  }

  // Ngữ cảnh gửi Gemini lấy từ database (không tin dữ liệu do client gửi lên).
  const { data: rows, error: loadError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(HISTORY_LIMIT);
  if (loadError) {
    console.error("Load history error", loadError);
    return Response.json({ error: "Không tải được lịch sử chat." }, { status: 500 });
  }
  const contents = rows.reverse().map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
  while (contents.length && contents[0].role !== "user") contents.shift();

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
  const reply: string =
    data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim() || "Xin lỗi, mình chưa trả lời được. Bạn thử hỏi lại giúp mình nhé.";

  const { error: saveError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "assistant", content: reply });
  if (saveError) console.error("Save reply error", saveError);
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return Response.json({ reply });
}
