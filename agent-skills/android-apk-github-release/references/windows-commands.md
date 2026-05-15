# Windows Commands

Use these from the repository root unless noted.

## Start Preview

```powershell
$env:PATH='C:\Program Files\nodejs;C:\Users\dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
npm run web -- --port 19007
```

If a server is already running on another port, use that port and give the user the exact URL.

## Start AI Proxy

```powershell
$env:PATH='C:\Program Files\nodejs;C:\Users\dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
npm run proxy:ai
```

The proxy listens on `AI_PROXY_PORT` or `8787`. Validate:

```powershell
Invoke-WebRequest -Method Options -Uri http://localhost:8787/api/ai/chat
```

For a POST smoke test, send a small JSON request and verify a non-empty assistant message.

## Build Release APK

Run from `android`:

```powershell
$env:NODE_ENV='production'
$env:PATH='C:\Program Files\nodejs;C:\Users\dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
.\gradlew.bat assembleRelease --no-daemon
```

Expected output:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Copy for release upload:

```powershell
New-Item -ItemType Directory -Force release-artifacts | Out-Null
Copy-Item android\app\build\outputs\apk\release\app-release.apk release-artifacts\xiaoya-baby-vX.Y.Z.apk -Force
```

## Git Push on This Windows Machine

Use this PATH before network Git commands:

```powershell
$env:PATH='C:\Program Files\Git\usr\bin;C:\Program Files\Git\mingw64\bin;C:\Program Files\Git\cmd;' + $env:PATH
git push origin <branch>
```

This avoids Git Credential Manager failing with `cannot spawn sh`.

## Local Gradle Notes

During the successful build, this repo needed:

- Gradle wrapper `8.13`.
- Android Gradle Plugin `8.11.0`.
- Kotlin Gradle Plugin `2.1.20`.
- Expo/RN new architecture disabled for the release build.
- A local `@react-native-community/cli` shim from `tools/react-native-community-cli`.

Because `/android` is ignored, generated native changes are local unless intentionally committed.
