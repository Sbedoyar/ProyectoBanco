# Verificación de captura stdout y stderr

## Causa reproducida
Windows PowerShell5 convirtió stderr nativo del pipeline2>&1 en NativeCommandError con ErrorActionPreference Stop. Un comando de prueba que imprimía BUILD SUCCESS yMockito warning con exit0 interrumpió el runner previo antes de guardar su resultado. No era un fallo Java.

## Cambio limitado
Sólo scripts/check-all.ps1 cambia en producción:ProcessStartInfo inicia cmd.exe sin ventana ni shell adicional,redirige1/2 al mismo log dentro de cmd,espera ylee ExitCode real. No se relaja ErrorActionPreference ni se oculta stderr. Excepción de arranque sigue terminando;exit!=0 se guarda ydetiene. Exit0 explícito al terminar. Mismo catálogo,cwd,StopBackend,StartAt yresultados. Sin cambios bancarios ni tests eliminados.

## AC01 regresión ejecutada
Copias aisladas .local/runner-probe,stop inerte ycatálogo de tres comandos:warning0,failure7,must-not-run. WindowsPowerShell5 yPowerShell7 pasan:stdout/stderr preservados,warning0 continúa,failure7 se guarda ydevuelve7,tercero no corre. Segunda copia con dos éxitos confirma exit0 final.

Comprobación adicional de StartAt enPS5 encontró una limitación preexistente al recuperar array de éxitos:el caso aislado conserva sólo el seleccionado en results.json. Reproducida idéntica con script original ycorregido (.local/resume-before yafter);no se cambia esa lógica por estar fuera del problema solicitado. No se afirma que esa limitación esté corregida.

## AC02 catálogo completo
Comando raíz:./scripts/check-all.ps1 -EvidenceDirectory specs/006-captura-salidas-check-all/evidence/checks. [Resultados](evidence/checks/results.json):nueve exit0,14Java/21Vitest/15Playwright aprobadas,sin fallos/omisiones. Logs conservan advertencias Mockito. Formalverify posterior ejecuta catálogo vigente sin cambios yliga fuentes;los resultados del runner no se regeneran durante verify.

Sin commit/push;developer. Se conserva trabajo documental previo005. No se actualizan informes ni evidencias académicas anteriores como efecto del arreglo.
