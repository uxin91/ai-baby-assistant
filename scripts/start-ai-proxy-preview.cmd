@echo off
cd /d "%~dp0.."
"C:\Users\dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\ai-proxy.js > ai-proxy-cmd.log 2>&1
