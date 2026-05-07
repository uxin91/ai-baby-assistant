const API_URL = 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions';
const API_KEY = '378f119b3ce70ed35553cc9b0aeadf0a:ZWY5ZmI0OWFlZDVmZWIwNDdhNjBkMjUz';
const MODEL_ID = 'astron-code-latest';

const SYSTEM_PROMPT =
  '你是一个专业的AI育儿助手，专门为中国家长提供科学、权威的育儿建议。\n' +
  '你擅长回答关于婴幼儿健康、喂养、睡眠、发育、辅食、疫苗等方面的问题。\n' +
  '请用简洁、温暖的语气回答，给出实用的建议。\n' +
  '回答要有条理，适当使用列表和分段。\n' +
  '如果涉及严重健康问题，请建议家长及时就医。\n' +
  '请用中文回答所有问题。';

interface ChatMessage {
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

export async function getXunfeiResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
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

    return content.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
