import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { situation } = req.body;

  if (!situation || typeof situation !== "string" || situation.trim() === "") {
    return res.status(400).json({ error: "상황을 입력해주세요." });
  }

  if (situation.length > 500) {
    return res.status(400).json({ error: "500자 이내로 입력해주세요." });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `당신은 '럭키비키' 마인드셋 코치예요. 사용자가 부정적인 상황을 이야기하면, 그 상황을 진심으로 긍정적이고 럭키한 시각으로 재해석해줘요.

규칙:
- 억지스럽지 않게, 진짜로 긍정적인 면을 찾아줘요
- 유머와 따뜻함을 섞어서 2~4문장으로 답해요
- '럭키비키~'나 '사실 이건 럭키한 거야!' 같은 표현을 자연스럽게 넣어요
- 이모지는 1~2개만 써요 (🍀 ✨ 중 하나 선택)
- 한국어로 답해요
- 과하게 외치거나 비현실적이지 않게, 실제로 공감이 가는 긍정 리프레이밍을 해줘요`,
      messages: [{ role: "user", content: `상황: ${situation.trim()}` }],
    });

    const result = message.content[0]?.text;
    if (!result) throw new Error("응답 없음");

    res.json({ result });
  } catch (err) {
    console.error("Anthropic API 오류:", err.message);
    res.status(500).json({ error: "AI 응답을 불러오지 못했어요. 다시 시도해주세요." });
  }
}
