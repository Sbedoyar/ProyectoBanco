$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$config=Get-Content -Raw "$root/.local/database.json"|ConvertFrom-Json
$env:TEST_DB_URL='jdbc:postgresql://127.0.0.1:55432/bank_test'
$env:TEST_DB_USERNAME='bank_test'
$env:TEST_DB_PASSWORD=$config.test
& "$root/backend/mvnw.cmd" -f "$root/backend/pom.xml" -B -ntp test
exit $LASTEXITCODE

