# Contexto vigente de ProyectoBanco

## 1 Estado y alcance
Estado de aplicación: APPLICATION_VALIDATED únicamente en los escenarios ejecutados del catálogo del29-10-2026; evidencia y límites en docs/verificacion-entrega.md. No certifica seguridad universal.

CONTEXT_RECORDED, inspección 29-10-2026 America/Bogota. Aplicación existente; entrega académica005 sólo documental y de verificación. Reconciliación sustituye afirmaciones históricas de Git ausente y publicación desconocida: Git existe en raíz, developer inicialmente limpio, remoto Sbedoyar/ProyectoBanco. Sin cambios de código bancario. No inferir validez universal a partir de auditoría documental.

## 2 Mapa de evidencia
- [Backend](../backend/pom.xml):Java 25, Spring Boot 4.1.2, Security/DataJPA/JDBC. Paquetes auth/account/transfer/movement/shared; controladores, records DTO, servicios yrepositorios. Javadoc conservado.
- [SQL](../backend/src/main/resources/db/schema.sql):app_user, account, opening_movement, bank_transfer, NUMERIC(19, 2), FK/UNIQUE/CHECK. PostgreSQL 18.6 observado en [consulta de lectura](../docs/evidencias/postgresql-consulta.txt).
- [Frontend](../frontend/package.json):React 19.3.1, TypeScript 6.0.3, React Router 8.5.0, HashRouter, Vite 8.3.5, Node >=24<25. app/layouts/contexto y features por módulo. useBanking y 42 archivos de frontera sin cambios.
- [Enunciado](../SpringBoot%20AI.pdf):p.11, traslado/histórico/QR, informe, código GitHub y prompts; entrega 30-10-2026. Institución confirmada en PDF. Autor/docente/grupo no suministrados.
- [Documentos finales](../docs/verificacion-entrega.md), [informe](../docs/informe.md), [prompts](../docs/prompts.md) y[guía](../docs/guia-sustentacion.md). DOCX/PDF generados desde contenido MD; 44páginas revisadas con Word/Poppler.

## 3 Objetivos y decisiones
Usuario autorizó entrega completa, pruebas y correcciones mínimas si necesarias. No reconstruir ni cambiar reglas/SQL/API. Sólo developer; no commit/push/merge ni modificar main. Delegación técnica previa se conserva; no agentes autorizados. Convención commit existente Conventional Commits en inglés; mensaje recomendado docs(delivery), sin ejecutarlo. API Java Javadoc, React TSDoc y contratos en inglés conservados. [Decisión de rutas](.omni/inputs/modules-decision.json) sigue aplicable, sin cambios de tecnología. Word instalado usado por ausencia de LibreOffice, no se instalaron dependencias.

## 4 Matriz de comandos
[Catálogo](checks.json) contiene 9 checks sin cambios. Runner [check-all](../scripts/check-all.ps1) lee catálogo, detiene backends propios yguarda resultados. Ejecutado desde raíz con -EvidenceDirectory docs/evidencias/verificacion-2026-10-29; [comandos/cwd/UTC/exit](../docs/evidencias/verificacion-2026-10-29/resultados-publicables.json).
- presentation-boundary:node snapshot004, 42 archivos idénticos.
- frontend unit/build/lint/format:cwd frontend, npm.cmd, requiere Node24 y dependencias instaladas.
- backend package/Javadoc:cwd backend, MavenWrapper/JDK25 y dependencias.
- backend-integration:scripts/test-backend.ps1, PostgreSQL dedicado bank_test, variables TEST_DB_URL/USERNAME/PASSWORD cargadas desde archivo local ignorado; no valores aquí.
- ui-e2e:scripts/test-ui.ps1, JAR/PostgreSQL/Chromium, inicia 8081 y Vite 5187, reinicia servidor en un caso; no ejecutar junto a JUnit.
- demo:scripts/start-backend.ps1 -Mode demo, 8080, bank_demo; el runner lo detiene para reemplazar JAR Windows.

## 5 Base de calidad
EJECUTADO29-10Bogotá:14 Java +21 Vitest +15 Playwright=50 aprobadas, 0fallidas/omitidas, nueve exit0. Concurrencia, rollback, idempotencia, privacidad, QR decodificado y módulos/recarga/reinicio comprobados en escenarios explícitos. [Acta documental](../docs/evidencias/revision-documental.json):18 páginas informe+26 prompts, 28 enlaces relativos, solicitud actual íntegra, PDF legible y capturas/diagramas revisados. No WCAG completo ni certificación bancaria. Evidencias001–004 se mantienen históricas; esta corrida no se atribuye a ellas.

## 6 Trabajo existente y riesgos
[Seguridad Git](../docs/evidencias/git-seguridad.json):294 rastreados/1 commit revisado, rutas prohibidas ausentes y sin coincidencias de secretos locales conocidos. Nuevos documentos también revisados; fixtures de demo/tests son públicos. No garantía exhaustiva de ausencia de secretos. git ls-remote leyó main y developer en de98c09785df938f18225c96ba7438f0d57b5522, sin fetch/push. main no modificada. Cambio local sólo docs, README y OmniSpec 005.

### Conflictos de fuentes
<!-- omni:source-conflicts -->
| Tema | Fuente A | Fuente B | Resolución |
| --- | --- | --- | --- |
| Frontend | PDF p1 Angular | PDF ejemplos React yusuario exige React | Mantener React, decisión explícita |
| Bootstrap | Constitución/manifest Undecided | poms/package y decisiones001 | Declaración inicial no refleja stack actual; archivos y decisiones mandan |
| SQL | PDF ejemplo Hibernate update | SQL inicial +Hibernate validate | No modificar esquema; documentar límites de migración |
| Git | Contexto histórico Git ausente | Inspección29-10 Git/remoto reales | Estado vigente existe developer/main; sin publicación documental nueva |
| Fechas | Logs UTC30-10 | Client29-10Bogotá | Ambas corresponden a misma ejecución; documentos usan fecha local |

## 7 Próxima acción
005 completada. Trabajo actual006:corregir únicamente captura stdout/stderr yExitCode en scripts/check-all.ps1. NativeCommandError PS5 reproducido;ProcessStartInfo+redirección interna cmd preserva advertencias yfallos reales. Catálogo completo nueve exit0/50pruebas. Evidencia ylimitación preexistente StartAt PS5 en [verificación006](006-captura-salidas-check-all/verification.md). Sin cambios bancarios ni commit/push. Próxima acción verify/complete006 yrestaurar demo8080.
