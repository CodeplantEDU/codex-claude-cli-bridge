$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$node = (Get-Command node).Source
$vbs = Join-Path $PSScriptRoot 'run-hidden.vbs'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$bridge = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('"{0}" "{1}" "{2}"' -f $vbs, $node, (Join-Path $PSScriptRoot 'ensure-bridge.mjs')) -WorkingDirectory $root
$check = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName 'CODEPLANT Claude Bridge' -Action $bridge -Trigger @((New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME), $check) -Settings $settings -Principal $principal -Description 'Codex Claude 연결 서버가 꺼져 있으면 시작' -Force | Out-Null

$update = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/c ""{0}" "{1}" >> "{2}" 2>&1"' -f $node, (Join-Path $PSScriptRoot 'update-models.mjs'), (Join-Path $root '.runtime\models-update.log')) -WorkingDirectory $root
Register-ScheduledTask -TaskName 'CODEPLANT Claude Models Update' -Action $update -Trigger (New-ScheduledTaskTrigger -Daily -At '07:00') -Settings $settings -Principal $principal -Description '매일 07:00 새 Claude 모델 확인 후 Codex 목록에 추가' -Force | Out-Null
Get-ScheduledTask -TaskName 'CODEPLANT Claude*' | Select-Object TaskName, State
