$ErrorActionPreference = 'Stop'
$bridgeRoot = Split-Path $PSScriptRoot -Parent
$env:CODEX_CLAUDE_BRIDGE_HOME = Join-Path $bridgeRoot '.runtime'
& (Get-Command node).Source (Join-Path $bridgeRoot 'src\server.js')
