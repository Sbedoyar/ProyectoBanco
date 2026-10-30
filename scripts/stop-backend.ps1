param([ValidateSet('demo','test')][string]$Mode='demo')
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$file=Join-Path $root ".local/backend-$Mode.pid"
if(Test-Path -LiteralPath $file) {
 $processId=[int](Get-Content -LiteralPath $file)
 $process=Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
 if($process) {
   if($process.Name -ne 'java.exe' -or -not $process.CommandLine.Contains("$root/backend/target/bank-1.0.0.jar")){throw 'El PID guardado no corresponde a este backend; no se detuvo ningún proceso.'}
   Stop-Process -Id $processId
 }
 Remove-Item -LiteralPath $file
}
