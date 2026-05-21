# Agent Instructions

This repository keeps reusable agent workflows in `agent-skills/`.

Before previewing, building, pushing, or publishing an Android APK release, read:

```text
agent-skills/android-apk-github-release/SKILL.md
```

That skill records the known working Windows, Expo, Gradle, Git credential, and GitHub Release flow for this project. Use it before trying new release commands.

Do not commit unrelated untracked files. In particular, `release-artifacts/` is for local APK upload staging unless the user explicitly asks to commit binaries.
