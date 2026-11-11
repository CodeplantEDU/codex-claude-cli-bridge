@echo off
node "%~dp0scripts\configure-route.js" "%USERPROFILE%\.codex\config.toml" "http://127.0.0.1:18787/backend-api/codex" remove
pause
