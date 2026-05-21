# GitHub Release Without gh

Use this when `gh` is not installed or not authenticated.

## Rules

- Prefer creating a new patch tag if the intended tag already exists.
- Do not print the GitHub token.
- Use `git credential fill` to read the already configured credential only inside the publish command.
- Use Node `https` if PowerShell `Invoke-RestMethod` or `curl.exe` fails on TLS.

## Flow

1. Push the code branch first.
2. Pick a tag, for example `v1.0.1`.
3. Ensure the APK exists in `release-artifacts/`.
4. Create the release with `target_commitish` set to the pushed commit SHA.
5. Upload the APK to `uploads.github.com`.
6. Return both the Release URL and direct APK download URL.

## Node HTTPS Pattern

Keep this as an inline command or temporary script. Replace tag, commit SHA, and asset name.

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

const owner = 'uxin91';
const repo = 'ai-baby-assistant';
const tag = 'vX.Y.Z';
const commit = '<pushed-commit-sha>';
const assetName = 'xiaoya-baby-vX.Y.Z.apk';
const assetPath = path.resolve('release-artifacts', assetName);
const token = process.env.GITHUB_TOKEN_FOR_RELEASE;

function request(hostname, method, requestPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body == null || Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));
    const req = https.request({
      hostname,
      method,
      path: requestPath,
      headers: {
        'User-Agent': 'Codex',
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Length': data.length } : {}),
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch {}
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, json, text });
        else reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 500)}`));
      });
    });
    req.on('error', reject);
    req.setTimeout(240000, () => req.destroy(new Error('request timeout')));
    if (data) req.write(data);
    req.end();
  });
}

async function optional(hostname, method, requestPath, body, headers) {
  try {
    return await request(hostname, method, requestPath, body, headers);
  } catch (error) {
    if (String(error.message).startsWith('HTTP 404:')) return null;
    throw error;
  }
}

async function main() {
  if (!fs.existsSync(assetPath)) throw new Error(`missing APK: ${assetPath}`);

  let release = await optional('api.github.com', 'GET', `/repos/${owner}/${repo}/releases/tags/${tag}`);
  if (!release) {
    release = await request('api.github.com', 'POST', `/repos/${owner}/${repo}/releases`, {
      tag_name: tag,
      target_commitish: commit,
      name: `Xiaoya Baby ${tag}`,
      body: 'Android APK release built from the approved preview build.',
      draft: false,
      prerelease: false,
    }, { 'Content-Type': 'application/json' });
  }

  const apk = fs.readFileSync(assetPath);
  const uploaded = await request(
    'uploads.github.com',
    'POST',
    `/repos/${owner}/${repo}/releases/${release.json.id}/assets?name=${encodeURIComponent(assetName)}`,
    apk,
    { 'Content-Type': 'application/vnd.android.package-archive' },
  );

  console.log(`release ${release.json.html_url}`);
  console.log(`asset ${uploaded.json.browser_download_url}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

## Token Wrapper

```powershell
$env:PATH='C:\Program Files\Git\usr\bin;C:\Program Files\Git\mingw64\bin;C:\Program Files\Git\cmd;C:\Program Files\nodejs;C:\Users\dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
$credInput = "protocol=https`nhost=github.com`n`n"
$cred = $credInput | git credential fill
$token = ($cred | Where-Object { $_ -like 'password=*' } | Select-Object -First 1).Substring(9)
$env:GITHUB_TOKEN_FOR_RELEASE=$token
node <release-script.js>
Remove-Item Env:GITHUB_TOKEN_FOR_RELEASE -ErrorAction SilentlyContinue
```
