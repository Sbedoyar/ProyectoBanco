# Evidencia de inspección del entorno

Fecha local de revisión: 2026-10-24, America/Bogota. Cwd de todas las inspecciones: raíz ProyectoBanco (ruta del entorno de esta sesión). Sólo inspección; ninguna instalación, build, prueba de aplicación ni conexión SQL.

| Comando | Timestamp UTC capturado | Exit | Resultado observado |
| --- | --- | --- | --- |
| java -version | 2026-10-24T05:18:38.1680274Z | 0 | Temurin 25.0.4.1+1 LTS |
| javac -version | 2026-10-24T05:18:38.9561548Z | 0 | javac 25.0.4.1 |
| mvn.cmd -version | 2026-10-24T05:18:39.7989070Z | 0 | Maven 3.9.16, Java 25.0.4.1, Windows 11 amd64; también 'Acceso denegado.'; capacidad de build no establecida |
| node --version | 2026-10-24T05:18:52.5183124Z | 0 | v24.19.0 |
| npm.cmd --version | 2026-10-24T05:18:52.6271504Z | 0 | 11.17.0 |
| C:/Program Files/PostgreSQL/18/bin/psql.exe --version | 2026-10-24T05:19:13.6829242Z | 0 | psql (PostgreSQL) 18.6; versión de cliente, no del servidor |

Get-Command encontró java/javac, mvn, node y npm. psql y docker no se encontraron en PATH. Get-Service -Name '*postgres*' mostró postgresql-x64-18 Running; Get-ChildItem 'C:/Program Files/PostgreSQL' mostró carpeta 18. Estas inspecciones se ejecutaron en llamada compuesta terminada en exit 0; no se capturó timestamp/exit individual. No demuestra autenticación SQL ni acceso a una base aislada.

CLI version/status/fit/guide design: ejecutados desde raíz, versión coincidente 0.7.0-preview.2 y ruta FULL; evidencia en salida de terminal de esta sesión. Sin timestamp/exit individual en las llamadas compuestas. Revisión de fuentes web y límites en [plan.md](plan.md); registros de decisiones conservan fecha de consulta.
