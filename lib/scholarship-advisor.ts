import "server-only";
import { createHash } from "node:crypto";
import { createPublicClient } from "@/lib/supabase/public";

const MODEL = process.env.GEMINI_ADVISOR_MODEL ?? "gemini-3.1-flash-lite";
const MAX_STEPS = 6;

export interface AdvisorInput {
  gpa: number;
  ielts: number;
  /** Tên các trường học viên đã đạt điểm chuẩn (kết quả của phép so sánh số). */
  passedSchools: string[];
}

export interface AdvisorResult {
  suggestion: string;
  schoolsLookedUp: string[];
}

/** Dấu vân tay của đầu vào: đổi hồ sơ hoặc danh sách trường đạt thì gợi ý được tạo lại. */
export function inputHash({ gpa, ielts, passedSchools }: AdvisorInput): string {
  return createHash("sha256")
    .update(JSON.stringify([gpa, ielts, [...passedSchools].sort()]))
    .digest("hex");
}

const instruction = `Bạn là trợ lý tư vấn học bổng du học của DuHoc24. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.

Bạn nhận hồ sơ của học viên (điểm học tập thang 10, điểm IELTS tổng) và danh sách các trường học viên ĐÃ đạt điểm chuẩn.
Nhiệm vụ: gợi ý học bổng phù hợp với học viên.

QUY TẮC:
- Dùng công cụ lookup_scholarships để tra cứu học bổng của từng trường mà bạn cần xét. Tự quyết định cần tra cứu trường nào.
- Chỉ nói về học bổng có trong kết quả công cụ. Không bịa học bổng, điều kiện hay mức hỗ trợ.
- Tự so sánh điều kiện của học bổng với điểm của học viên để kết luận học viên đủ điều kiện hay chưa. Điều kiện nào là "null" nghĩa là học bổng không yêu cầu điều kiện đó.
- Nêu rõ: tên học bổng, trường, mức hỗ trợ (support_type "full" là hỗ trợ toàn phần; "percent_tuition" là phần trăm học phí theo support_percent), và lý do đủ điều kiện (so điểm của học viên với điều kiện).
- Với học bổng học viên chưa đủ điều kiện, nêu ngắn gọn thiếu điều kiện nào.
- Không cam kết học viên sẽ nhận được học bổng; đây chỉ là gợi ý dựa trên điều kiện tối thiểu.
- Trình bày dạng danh sách gạch đầu dòng "- ", không dùng markdown khác. Nếu không có học bổng phù hợp thì nói rõ.`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "lookup_scholarships",
        description:
          "Tra cứu danh sách học bổng của một trường trong cơ sở dữ liệu. Trả về tên học bổng, điều kiện tối thiểu (min_gpa thang 10, min_ielts) và mức hỗ trợ.",
        parameters: {
          type: "OBJECT",
          properties: {
            school_name: { type: "STRING", description: "Tên trường, ví dụ: Đại học Deakin" },
          },
          required: ["school_name"],
        },
      },
    ],
  },
];

/** Công cụ mà Gemini gọi: đọc học bổng của một trường (dữ liệu công khai, đọc qua RLS). */
async function lookupScholarships(schoolName: string) {
  const supabase = createPublicClient();
  const { data: schools, error } = await supabase
    .from("schools")
    .select("id, name")
    .ilike("name", `%${schoolName.replace(/[%_]/g, "").trim()}%`)
    .limit(5);
  if (error) throw error;
  if (!schools.length) return { found: false, message: `Không tìm thấy trường "${schoolName}".` };

  const { data, error: schError } = await supabase
    .from("scholarships")
    .select("name, min_gpa, min_ielts, support_type, support_percent, school_id")
    .in("school_id", schools.map((s) => s.id));
  if (schError) throw schError;

  const nameById = new Map(schools.map((s) => [s.id, s.name]));
  return {
    found: true,
    scholarships: data.map((s) => ({
      school: nameById.get(s.school_id),
      scholarship: s.name,
      min_gpa: s.min_gpa === null ? null : Number(s.min_gpa),
      min_ielts: s.min_ielts === null ? null : Number(s.min_ielts),
      support_type: s.support_type,
      support_percent: s.support_percent === null ? null : Number(s.support_percent),
    })),
    ...(data.length === 0 && { message: "Trường này chưa có học bổng nào được ghi nhận." }),
  };
}

type Part = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> } };
type Content = { role: string; parts: Part[] };

/** Gợi ý học bổng bằng function calling: Gemini tự quyết định tra cứu trường nào. */
export async function suggestScholarships(input: AdvisorInput): Promise<AdvisorResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY.");

  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `Hồ sơ học viên: điểm học tập ${input.gpa}/10, IELTS tổng ${input.ielts}.\nCác trường học viên đã đạt điểm chuẩn: ${input.passedSchools.join(", ")}.\nHãy gợi ý học bổng phù hợp.`,
        },
      ],
    },
  ];
  const lookedUp = new Set<string>();

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instruction }] },
          contents,
          tools,
          generationConfig: { temperature: 0.2 },
        }),
      },
    );
    if (!res.ok) {
      console.error("Scholarship advisor error", res.status, await res.text());
      throw new Error("Không gọi được Gemini để gợi ý học bổng.");
    }

    const content: Content | undefined = (await res.json()).candidates?.[0]?.content;
    if (!content?.parts?.length) throw new Error("Gemini không trả về nội dung.");

    const calls = content.parts.filter((p) => p.functionCall);
    if (calls.length === 0) {
      const text = content.parts.map((p) => p.text ?? "").join("").trim();
      if (!text) throw new Error("Gemini không trả về nội dung.");
      return { suggestion: text, schoolsLookedUp: [...lookedUp] };
    }

    // Giữ nguyên lượt của model (kể cả chữ ký suy luận), rồi trả kết quả công cụ.
    contents.push(content);
    const responses: { functionResponse: { name: string; response: unknown } }[] = [];
    for (const part of calls) {
      const { name, args } = part.functionCall!;
      let response: unknown;
      if (name === "lookup_scholarships" && typeof args?.school_name === "string") {
        lookedUp.add(args.school_name);
        response = await lookupScholarships(args.school_name);
      } else {
        response = { error: "Công cụ không tồn tại hoặc thiếu tham số." };
      }
      responses.push({ functionResponse: { name, response } });
    }
    contents.push({ role: "user", parts: responses as unknown as Part[] });
  }

  throw new Error("Gemini gọi công cụ quá nhiều lần.");
}
