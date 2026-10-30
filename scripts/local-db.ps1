param([string]$PostgresBin = 'C:/Program Files/PostgreSQL/18/bin')
$ErrorActionPreference='Stop'
$root = Split-Path $PSScriptRoot -Parent
$local = Join-Path $root '.local'
New-Item -ItemType Directory -Force $local | Out-Null
$configFile=Join-Path $local 'database.json'
if(-not(Test-Path -LiteralPath $configFile)) {
  $config=@{admin=[guid]::NewGuid().ToString('N');demo=[guid]::NewGuid().ToString('N');test=[guid]::NewGuid().ToString('N')}
  $config | ConvertTo-Json | Set-Content -Encoding utf8 $configFile
}
$config=Get-Content -Raw $configFile|ConvertFrom-Json
$data=Join-Path $local 'pgdata'
if(-not(Test-Path -LiteralPath (Join-Path $data 'PG_VERSION'))) {
  $passwordFile=Join-Path $local 'pg-password'
  $config.admin | Set-Content -Encoding ascii $passwordFile
  & "$PostgresBin/initdb.exe" -D $data -U project_admin -A scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
  if($LASTEXITCODE -ne 0){throw 'No se pudo inicializar PostgreSQL local.'}
}
& "$PostgresBin/pg_ctl.exe" -D $data status | Out-Null
if($LASTEXITCODE -ne 0) {
  & "$PostgresBin/pg_ctl.exe" -D $data -l (Join-Path $local 'postgres.log') -o '-h 127.0.0.1 -p 55432' -w start
  if($LASTEXITCODE -ne 0){throw 'No se pudo iniciar el clúster local en 55432.'}
}
$env:PGPASSWORD=$config.admin
try {
  foreach($entry in @(@('bank_demo','bank_demo',$config.demo),@('bank_test','bank_test',$config.test))) {
    $role=$entry[0];$database=$entry[1];$password=$entry[2]
    $exists=& "$PostgresBin/psql.exe" -h 127.0.0.1 -p 55432 -U project_admin -d postgres -Atqc "select 1 from pg_roles where rolname='$role'"
    if($LASTEXITCODE -ne 0){throw 'No se pudo consultar el rol dedicado.'}
    if($exists -ne '1') {
      "CREATE ROLE $role LOGIN PASSWORD '$password';" | & "$PostgresBin/psql.exe" -h 127.0.0.1 -p 55432 -U project_admin -d postgres -v ON_ERROR_STOP=1 -q
      if($LASTEXITCODE -ne 0){throw 'No se pudo crear el rol dedicado.'}
    }
    $exists=& "$PostgresBin/psql.exe" -h 127.0.0.1 -p 55432 -U project_admin -d postgres -Atqc "select 1 from pg_database where datname='$database'"
    if($exists -ne '1') {
      & "$PostgresBin/createdb.exe" -h 127.0.0.1 -p 55432 -U project_admin -O $role $database
      if($LASTEXITCODE -ne 0){throw 'No se pudo crear la base dedicada.'}
    }
  }
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
Write-Output 'Clúster aislado disponible en 127.0.0.1:55432; bases bank_demo y bank_test.'
