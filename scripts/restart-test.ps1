$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
& "$PSScriptRoot/stop-backend.ps1" -Mode test
& "$PSScriptRoot/start-backend.ps1" -Mode test
