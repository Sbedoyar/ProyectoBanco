$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
& "$PSScriptRoot/stop-backend.ps1" -Mode test
& "$PSScriptRoot/start-backend.ps1" -Mode test
$ready=$false
for($attempt=0;$attempt -lt 60;$attempt++) {
 try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8081/api/auth/csrf' -TimeoutSec 2; if($r.StatusCode -eq 200){$ready=$true;break} }
 catch { if($attempt -eq 59){throw 'El backend de prueba no estuvo disponible a tiempo.'} }
 Start-Sleep -Seconds 1
}
if(-not $ready){throw 'Backend de prueba no disponible.'}
Push-Location "$root/frontend"
try { & npm.cmd run test:e2e; $code=$LASTEXITCODE } finally {Pop-Location; & "$PSScriptRoot/stop-backend.ps1" -Mode test}
exit $code

