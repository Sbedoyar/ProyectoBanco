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
 try {
  # Merge streams inside cmd so PowerShell does not treat native stderr as an ErrorRecord.
  $startInfo=New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName=$env:ComSpec
  $startInfo.Arguments='/d /s /c "(' + $check.command + ') > "' + $log + '" 2>&1"'
  $startInfo.WorkingDirectory=(Get-Location).Path
  $startInfo.UseShellExecute=$false
  $startInfo.CreateNoWindow=$true
  $process=New-Object System.Diagnostics.Process
  $process.StartInfo=$startInfo
  try {
   if(-not $process.Start()){throw "No se pudo iniciar $($check.id)."}
   $process.WaitForExit()
   $code=$process.ExitCode
  } finally {$process.Dispose()}
 } finally {Pop-Location}
 $results += [pscustomobject]@{id=$check.id;command=$check.command;cwd=$check.cwd;timestamp=$time;exitCode=$code;artifact="evidence/checks/$($check.id).log"}
 $results|ConvertTo-Json -Depth 5|Set-Content -Encoding utf8 (Join-Path $logDir 'results.json')
 Write-Output "$($check.id): exit $code ($time)"
 if($code -ne 0){Write-Output "Revisar $log";exit $code}
}
exit 0
