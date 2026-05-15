declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_BASE_URL = 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2';
const BLOCKED_BRAND_PATTERN = new RegExp('\\u8baf\\u98de', 'g');

const SYSTEM_PROMPT =
  '你是一个专业、温和、谨慎的 AI 育儿助手，面向中国家庭提供科学、清晰、可执行的育儿建议。\n' +
  '你擅长回答婴幼儿健康、喂养、睡眠、发育、辅食、疫苗等方面的问题。\n' +
  '请用简洁温暖的中文回答，必要时分点说明，并优先给出下一步行动建议。\n' +
  '如果涉及严重症状、急症、持续异常或用药剂量，请提醒家长及时联系儿科医生。\n' +
  '直接输出最终回答，不要输出思考过程。\n' +
  '不要提及任何底层模型、供应商、服务商或品牌名称。';

export interface AssistantChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface APIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function cleanAssistantText(text: string): string {
  return text.replace(BLOCKED_BRAND_PATTERN, 'AI 服务').trim();
}

export async function getAssistantResponse(
  userMessage: string,
  conversationHistory: AssistantChatMessage[] = [],
  maxRetries = 1,
): Promise<string> {
  const modelId = process.env.EXPO_PUBLIC_AI_MODEL_ID?.trim() || 'astron-code-latest';
  const baseUrl = process.env.EXPO_PUBLIC_AI_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const proxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();

  const messages: AssistantChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage },
  ];

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const requestBody = {
        model: modelId,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      };
      const useProxy = Boolean(proxyUrl);
      const requestUrl = useProxy
        ? `${proxyUrl!.replace(/\/$/, '')}/api/ai/chat`
        : `${baseUrl.replace(/\/$/, '')}/chat/completions`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useProxy ? {} : { Authorization: `Bearer ${process.env.EXPO_PUBLIC_AI_API_KEY?.trim()}` }),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service error ${response.status}: ${errorText}`);
      }

      const data: APIResponse = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'AI service returned an error');
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('AI service returned an empty response');
      }

      return cleanAssistantText(content);
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error('AI request failed');

      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('AI request failed');
}
