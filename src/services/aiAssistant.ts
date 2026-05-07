declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_BASE_URL = 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2';

const SYSTEM_PROMPT =
  '你是一个专业的AI育儿助手，专门为中国家长提供科学、权威的育儿建议。\n' +
  '你擅长回答关于婴幼儿健康、喂养、睡眠、发育、辅食、疫苗等方面的问题。\n' +
  '请用简洁、温暖的语气回答，给出实用的建议。\n' +
  '回答要有条理，适当使用列表和分段。\n' +
  '如果涉及严重健康问题，请建议家长及时就医。\n' +
  '请用中文回答所有问题。';

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

export async function getAssistantResponse(
  userMessage: string,
  conversationHistory: AssistantChatMessage[] = [],
  maxRetries = 2,
): Promise<string> {
  const modelId = process.env.EXPO_PUBLIC_AI_MODEL_ID?.trim() || 'astron-code-latest';
  const baseUrl = process.env.EXPO_PUBLIC_AI_BASE_URL?.trim() || DEFAULT_BASE_URL;
  // 始终使用 proxy（如果配置了），由 proxy 处理认证
  const proxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();

  const messages: AssistantChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage },
  ];

  let lastError: Error | undefined;

  // 重试机制
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`\n🔄 第 ${attempt} 次重试...`);
      // 指数退避：1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ 请求超时（${attempt + 1}/${maxRetries + 1}），尝试中止...`);
      controller.abort();
    }, 30000);

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

      console.log(`📡 发送请求到: ${useProxy ? proxyUrl : baseUrl}`);

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
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from API');
      }

      console.log('✅ 请求成功');
      return content.trim();
    } catch (error) {
      clearTimeout(timeoutId);

      // 记录错误
      if (error instanceof Error) {
        lastError = error;
        console.error(`❌ 请求失败（${attempt + 1}/${maxRetries + 1}）:`, error.message);

        // 如果是超时错误且还有重试次数，继续重试
        if (error.name === 'AbortError' && attempt < maxRetries) {
          console.log('⏳ 超时，准备重试...');
          continue;
        }
      }

      // 最后一次失败，抛出错误
      if (attempt === maxRetries) {
        throw lastError || new Error('Request failed after all retries');
      }
    }
  }

  throw lastError || new Error('Request failed');
}
