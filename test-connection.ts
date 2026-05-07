/**
 * AI Assistant 断联问题诊断测试
 *
 * 测试目标：
 * 1. 验证超时机制是否导致请求中断
 * 2. 验证重试机制是否存在
 * 3. 验证 Proxy 稳定性
 */

import { getAssistantResponse } from './src/services/aiAssistant';

async function testTimeoutBehavior() {
  console.log('=== 测试 1: 超时行为 ===');

  try {
    // 模拟慢速请求（30秒超时）
    console.log('发送测试请求...');
    const response = await getAssistantResponse('测试超时行为', []);
    console.log('✅ 请求成功:', response.substring(0, 50));
  } catch (error) {
    console.error('❌ 请求失败:', error);
    console.log('失败原因:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('');
}

async function testRetryBehavior() {
  console.log('=== 测试 2: 重试机制 ===');

  // 检查是否有重试逻辑
  const aiAssistantCode = await Bun.file('./src/services/aiAssistant.ts').text();
  const hasRetry = aiAssistantCode.includes('retry') || aiAssistantCode.includes('重试');

  if (hasRetry) {
    console.log('✅ 代码中包含重试逻辑');
  } else {
    console.log('❌ 代码中缺少重试机制');
  }

  console.log('');
}

async function testProxyConfiguration() {
  console.log('=== 测试 3: Proxy 配置 ===');

  const baseUrl = process.env.EXPO_PUBLIC_AI_BASE_URL;
  const proxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL;

  console.log('Base URL:', baseUrl);
  console.log('Proxy URL:', proxyUrl);

  if (!proxyUrl) {
    console.log('⚠️  未配置 Proxy，直接调用 API');
  } else {
    console.log('✅ 已配置 Proxy:', proxyUrl);
  }

  console.log('');
}

async function main() {
  console.log('🧪 AI Assistant 断联问题诊断\n');
  console.log('='.repeat(50));
  console.log('');

  await testTimeoutBehavior();
  await testRetryBehavior();
  await testProxyConfiguration();

  console.log('='.repeat(50));
  console.log('\n诊断完成');
}

main().catch(console.error);
