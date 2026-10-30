param([ValidateSet('demo','test')][string]$Mode='demo',[switch]$Build)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
& "$PSScriptRoot/local-db.ps1"
if($Build) { & "$root/backend/mvnw.cmd" -f "$root/backend/pom.xml" -B -ntp -DskipTests package; if($LASTEXITCODE -ne 0){throw 'Falló build backend.'} }
$config=Get-Content -Raw "$root/.local/database.json"|ConvertFrom-Json
$env:DB_URL="jdbc:postgresql://127.0.0.1:55432/bank_$Mode"
$env:DB_USERNAME="bank_$Mode"
$env:DB_PASSWORD=$config.$Mode
$port=if($Mode -eq 'test'){8081}else{8080}
$profile=if($Mode -eq 'test'){'test'}else{'demo'}
$process=Start-Process -FilePath 'java' -ArgumentList @('-jar',"`"$root/backend/target/bank-1.0.0.jar`"","--server.port=$port","--spring.profiles.active=$profile") -WindowStyle Hidden -PassThru -RedirectStandardOutput "$root/.local/backend-$Mode.log" -RedirectStandardError "$root/.local/backend-$Mode.err.log"
$process.Id|Set-Content "$root/.local/backend-$Mode.pid"
Write-Output "Backend $Mode iniciado (PID $($process.Id)), puerto $port."
