const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const port = Number(process.env.AI_PROXY_PORT || 8787);
const baseUrl =
  process.env.AI_BASE_URL ||
  process.env.EXPO_PUBLIC_AI_BASE_URL ||
  'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2';
const apiKey = process.env.AI_API_KEY || process.env.EXPO_PUBLIC_AI_API_KEY;
const defaultModel = process.env.AI_MODEL_ID || process.env.EXPO_PUBLIC_AI_MODEL_ID || 'astron-code-latest';
const blockedBrandPattern = new RegExp('\\u8baf\\u98de', 'g');

function sanitizePayloadText(value) {
  if (typeof value === 'string') {
    return value.replace(blockedBrandPattern, 'AI 服务');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizePayloadText);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizePayloadText(item)]));
  }
  return value;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(statusCode === 204 ? undefined : JSON.stringify(payload));
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        req.destroy();
        reject(new Error('Request body is too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const isChatRoute = req.url === '/api/ai/chat';

  if (req.method !== 'POST' || !isChatRoute) {
    sendJson(res, 404, { error: { message: 'Not found' } });
    return;
  }

  if (!apiKey) {
    sendJson(res, 500, { error: { message: 'AI API key is not configured on proxy' } });
    return;
  }

  try {
    const rawBody = await collectRequestBody(req);
    const payload = JSON.parse(rawBody);
    const upstreamBody = JSON.stringify({
      model: payload.model || defaultModel,
      messages: Array.isArray(payload.messages) ? payload.messages : [],
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 1024,
    });

    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstreamBody,
    });

    const text = await upstream.text();
    let responseText = text;
    if ((upstream.headers.get('content-type') || '').includes('application/json')) {
      try {
        responseText = JSON.stringify(sanitizePayloadText(JSON.parse(text)));
      } catch {
        responseText = sanitizePayloadText(text);
      }
    } else {
      responseText = sanitizePayloadText(text);
    }
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(responseText);
  } catch (error) {
    sendJson(res, 502, {
      error: {
        message: error instanceof Error ? error.message : 'Proxy request failed',
      },
    });
  }
});

server.listen(port, () => {
  console.log(`AI proxy listening on http://localhost:${port}`);
});
