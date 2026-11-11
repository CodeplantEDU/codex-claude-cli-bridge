param([int]$DelaySeconds = 0)
Start-Sleep -Seconds $DelaySeconds
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*codex-claude-cli-bridge*src*server.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Sleep -Seconds 2
& (Get-Command node).Source (Join-Path $PSScriptRoot 'ensure-bridge.mjs')
