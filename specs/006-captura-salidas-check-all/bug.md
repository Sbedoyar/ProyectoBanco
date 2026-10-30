# Fallo del runner ante stderr nativo

## Reproduction and expected behavior
Windows PowerShell con ErrorActionPreference Stop: comando node emite BUILD SUCCESS a stdout y Mockito warning a stderr con exit0. Runner anterior se interrumpe en su pipeline2>&1/Out-File con NativeCommandError antes de guardar results.json. Reproducido en copia aislada .local/runner-probe; no falla Java ni regla bancaria.

## Root cause and fix
PowerShell convierte stderr nativo en ErrorRecord terminante. Redirigir ambos streams al log dentro de cmd.exe y usar Process.WaitForExit/ExitCode; conservar ErrorActionPreference Stop, directorio, catálogo, StartAt, resultados, logs y fallo inmediato. Exit0 explícito sólo al finalizar todos los checks seleccionados. No modificar tests/backend/frontend ni otros scripts.

## Acceptance
AC-01 [functional]: Advertencia stderr/exit0 conserva ambos streams y continúa; fallo real exit7 conserva log/results y detiene antes de siguiente check.
AC-02 [functional]: check-all ejecuta nueve comprobaciones,50pruebas aprobadas sin omisiones ni modificaciones de lógica; no commit/push.

## Regression and verification
Copia aislada con stop-backend inerte y catálogo de tres probes: warning0,failure7,must-not-run. Repetir Windows PowerShell y PowerShell7,validar contenidos,códigos JSON yno ejecución posterior. Luego check-all completo. Evidencia aislada .local;resultado formal en verification.md. Recuperación:restaurar únicamente script desde copia original si fuera necesario.
