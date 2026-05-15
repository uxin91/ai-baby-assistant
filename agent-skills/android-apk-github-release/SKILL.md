---
name: android-apk-github-release
description: Build, verify, push, and publish Android APK releases for this Expo React Native project on Windows. Use when an agent needs to preview localhost, fix the local AI proxy, assemble a release APK, push code to GitHub, create GitHub Releases, upload APK assets, or avoid repeating known Windows/GitHub/Gradle pitfalls in this repository.
---

# Android APK GitHub Release

## Core Rule

Before rebuilding or releasing, read this skill and check the current repo state. Prefer the known working commands below over rediscovering Gradle, Git credential, and GitHub Release behavior.

## Fast Path

1. Confirm preview first.
   - Web preview normally runs at `http://localhost:19007/`.
   - If the browser says localhost refused the connection, start Expo web again and inspect the matching `expo-preview-*.log`.
   - Keep the AI proxy running on `http://localhost:8787` for online chat.

2. Verify online chat before APK work.
   - Start the proxy with `npm run proxy:ai` or `scripts/start-ai-proxy-preview.cmd`.
   - Test `OPTIONS /api/ai/chat` returns `204`.
   - Test `POST /api/ai/chat` returns JSON with `message.content`.
   - For Android/iOS APKs, do not rely on `http://localhost:8787`; mobile `localhost` points at the device. Native builds must either use a reachable LAN/prod proxy or bypass local proxy and call the HTTPS AI API directly.
   - Keep provider/vendor names out of user-facing prompts, logs shown in UI, and chat responses. Use a sanitizer for upstream text when needed.

3. Build the APK.
   - The generated native folders `/android` and `/ios` are ignored by Git in this repo. Do not assume Android build fixes are tracked unless you intentionally add them.
   - Build from `android` with the Windows command in `references/windows-commands.md`.
   - Expected output: `android/app/build/outputs/apk/release/app-release.apk`.
   - Verify the release APK is not signed with `CN=Android Debug`; public downloads must use a stable release certificate.
   - Install-test on a connected emulator or device with `adb install -r` before publishing.
   - Copy the APK to `release-artifacts/xiaoya-baby-vX.Y.Z.apk` for upload, but do not commit `release-artifacts/` unless the user explicitly asks.

4. Commit and push code only.
   - Stage only files that belong to the requested change.
   - Leave unrelated untracked files alone.
   - On this machine, use the Git PATH shown in `references/windows-commands.md` before `git push`; otherwise Git Credential Manager may fail with `cannot spawn sh`.

5. Publish GitHub Release.
   - Check existing tags first. If a tag already exists, bump the patch version rather than overwriting.
   - If `gh` is unavailable, use the Node HTTPS release script pattern in `references/github-release.md`.
   - Pull a token from `git credential fill` only inside the command, never print it, and remove the temporary environment variable after use.

## Known Pitfalls

- `ERR_CONNECTION_REFUSED` in the in-app browser means the preview server is not running on that port, not that the UI build is broken.
- `tsc --noEmit` may fail on existing unrelated helper files. Record the exact failure instead of broadening the release task.
- `git status` does not show ignored `/android` changes. If APK builds depend on ignored native edits, document them.
- A release APK signed with the debug certificate may pass basic APK verification but is not a good public install artifact. Always inspect `apksigner --print-certs`.
- If the release app crashes with `EXNativeModulesProxy` missing, ensure `ExpoModulesPackage` is registered. In this repo the tracked local RN CLI shim must include the `expo` package so generated Android `PackageList.java` contains `new ExpoModulesPackage()`.
- If chat stays offline only in APK, inspect the bundled AI endpoint. A `localhost` proxy in a mobile package is wrong unless it is explicitly translated to the emulator host or bypassed.
- `fatal: unsafe repository` is a Windows ownership/sandbox symptom. Use the same working Git context that successfully committed, or add a scoped safe.directory only if acceptable.
- PowerShell `Invoke-RestMethod` and Windows `curl.exe` may hit TLS credential issues. Node `https` worked for GitHub API calls here.

## References

- Read `references/windows-commands.md` for exact Windows commands.
- Read `references/github-release.md` for Release creation/upload without `gh`.
