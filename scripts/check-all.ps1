param([string]$StartAt='', [string]$EvidenceDirectory='specs/002-revision-modular/evidence/checks')
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$logDir=Join-Path $root $EvidenceDirectory
New-Item -ItemType Directory -Force $logDir | Out-Null
& "$PSScriptRoot/stop-backend.ps1" -Mode demo
& "$PSScriptRoot/stop-backend.ps1" -Mode test
$checks=(Get-Content -Raw "$root/specs/checks.json"|ConvertFrom-Json).checks
$results=@()
if($StartAt -and (Test-Path (Join-Path $logDir 'results.json'))){$results=@(Get-Content -Raw (Join-Path $logDir 'results.json')|ConvertFrom-Json|Where-Object exitCode -eq 0)}
$started= -not [bool]$StartAt
foreach($check in $checks){
 if(-not $started){if($check.id -eq $StartAt){$started=$true}else{continue}}
 $time=[DateTime]::UtcNow.ToString('o')
 $log=Join-Path $logDir "$($check.id).log"
 Push-Location (Join-Path $root $check.cwd)
 try { & cmd.exe /d /s /c $check.command 2>&1 | Out-File -Encoding utf8 $log; $code=$LASTEXITCODE } finally {Pop-Location}
 $results += [pscustomobject]@{id=$check.id;command=$check.command;cwd=$check.cwd;timestamp=$time;exitCode=$code;artifact="evidence/checks/$($check.id).log"}
 $results|ConvertTo-Json -Depth 5|Set-Content -Encoding utf8 (Join-Path $logDir 'results.json')
 Write-Output "$($check.id): exit $code ($time)"
 if($code -ne 0){Write-Output "Revisar $log";exit $code}
}


