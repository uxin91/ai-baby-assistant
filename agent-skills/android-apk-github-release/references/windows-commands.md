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

Verify signing and package metadata:

```powershell
& 'C:\Users\dell\AppData\Local\Android\Sdk\build-tools\36.0.0\apksigner.bat' verify --verbose --print-certs android\app\build\outputs\apk\release\app-release.apk
& 'C:\Users\dell\AppData\Local\Android\Sdk\build-tools\36.0.0\aapt.exe' dump badging android\app\build\outputs\apk\release\app-release.apk
```

The signer must be the project release certificate, not `CN=Android Debug`.

Install-test:

```powershell
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' install -r android\app\build\outputs\apk\release\app-release.apk
```

Launch-test and look for crashes:

```powershell
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' logcat -c
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell monkey -p com.aibaby.assistant -c android.intent.category.LAUNCHER 1
Start-Sleep -Seconds 10
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell pidof com.aibaby.assistant
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' logcat -d -t 500 | Select-String -Pattern "FATAL EXCEPTION|AndroidRuntime|ReactNativeJS|EXNativeModulesProxy|has not been registered"
```

Online-chat smoke test:

```powershell
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' logcat -c
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell input tap 180 1068
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell input text "hello"
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell input tap 642 1068
Start-Sleep -Seconds 20
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' shell uiautomator dump /sdcard/window-after-chat.xml
& 'C:\Users\dell\AppData\Local\Android\Sdk\platform-tools\adb.exe' pull /sdcard/window-after-chat.xml tmp-window-after-chat.xml
Select-String -Path tmp-window-after-chat.xml -Pattern "在线|离线|online|offline"
```

If a phone previously installed a debug-signed build with the same package name, the first release-signed install may require uninstalling the old app once.

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
