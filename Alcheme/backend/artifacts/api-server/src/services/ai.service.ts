import { openai } from "@workspace/integrations-openai-ai-server";

export interface CardMetaResult {
  milestoneTitle: string;
  illustrationDescription: string;
}

export async function generateCardMeta(oreContents: string[]): Promise<CardMetaResult> {
  const combined = oreContents.join("\n\n").slice(0, 1200);

  const systemPrompt = `你是一个成长旅程卡片设计师。用户会提供若干条碎碎念/学习笔记，请你：
1. 提取所有内容中的核心动词和名词（代表用户的行动与收获）
2. 据此生成一个简洁有力的「里程碑标题」（中文，8字以内，像一枚徽章的名字）
3. 根据这些关键词，撰写一段用于 AI 生图的「3D卡片插图描述」（英文，50词以内，描述一个魔法世界场景，体现用户的成长主题，适合水彩风格）

只返回如下 JSON，不要有其他内容：
{
  "milestoneTitle": "里程碑标题",
  "illustrationDescription": "English illustration scene description"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: combined },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as CardMetaResult;
    return {
      milestoneTitle: parsed.milestoneTitle?.trim() || "成长里程碑",
      illustrationDescription: parsed.illustrationDescription?.trim() || "",
    };
  } catch {
    return { milestoneTitle: "成长里程碑", illustrationDescription: "" };
  }
}

export interface BadgeEvolutionResult {
  /** 进化后的封号（中文，6字以内，高级感，体现成长层次） */
  title: string;
  /** 进化后勋章的插图描述（英文，50词以内，场景要体现从旧到新的进阶感） */
  illustrationDescription: string;
  /** 进化叙述（中文，一句话，写入勋章 description） */
  evolutionNarrative: string;
}

export async function generateBadgeEvolution(
  previousBadge: { name: string; description: string } | null,
  newCardContents: string[],
): Promise<BadgeEvolutionResult> {
  const combined = newCardContents.join("\n\n").slice(0, 1000);

  const previousContext = previousBadge
    ? `旧勋章封号：「${previousBadge.name}」\n旧勋章描述：${previousBadge.description}`
    : "（这是第一枚勋章，没有前序封号）";

  const systemPrompt = `你是一位成长旅程的史诗叙事者，负责为用户铸造进化勋章。
用户有一枚旧勋章（代表过去的成就），并带来了新的卡片内容（代表最新的努力与突破）。
请你：
1. 结合旧勋章封号与新卡片内容，生成一个更高级别的「进化封号」（中文，6字以内，比旧封号更有气势/层次感）
2. 撰写一段「进化插图描述」（英文，50词以内，要描绘一个体现成长进阶的魔法场景——比如旧形态升华、力量突破、新境界开启）
3. 写一句「进化叙述」（中文，20字以内，记录这次成长跨越）

只返回如下 JSON：
{
  "title": "进化封号",
  "illustrationDescription": "English scene showing evolution/ascension",
  "evolutionNarrative": "进化叙述一句话"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${previousContext}\n\n新卡片内容：\n${combined}` },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as BadgeEvolutionResult;
    return {
      title: parsed.title?.trim() || "成长封号",
      illustrationDescription: parsed.illustrationDescription?.trim() || "",
      evolutionNarrative: parsed.evolutionNarrative?.trim() || "",
    };
  } catch {
    return { title: "成长封号", illustrationDescription: "", evolutionNarrative: "" };
  }
}

const PROMPTS = {
  refine: `你是一个成长型思维教练。用户将提交一段原始想法或笔记，
请将它提炼成一段清晰、有洞见、具有启发性的文字。
要求：
- 保留原意的核心价值
- 语言精炼，去掉冗余
- 以第一人称表达，更有力量感
- 不超过200字
直接输出提炼后的内容，不需要解释。`,

  summarize: `你是一个知识萃取专家。根据用户提供的内容，
请提取出以下信息并以 JSON 格式返回：
{
  "title": "一句话标题（不超过20字）",
  "summary": "核心摘要（50字以内）",
  "tags": ["标签1", "标签2", "标签3"],
  "type": "text | idea | insight | question | resource"
}
只返回 JSON，不要有其他内容。`,
};

export async function refineContent(rawContent: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.refine },
      { role: "user", content: rawContent },
    ],
  });
  return response.choices[0]?.message?.content ?? rawContent;
}

export interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
  type: string;
}

export async function summarizeContent(content: string): Promise<SummarizeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.summarize },
      { role: "user", content },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as SummarizeResult;
    return {
      title: parsed.title ?? "未命名",
      summary: parsed.summary ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      type: parsed.type ?? "text",
    };
  } catch {
    return { title: "未命名", summary: raw, tags: [], type: "text" };
  }
}
