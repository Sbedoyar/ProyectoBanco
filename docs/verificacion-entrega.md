# Verificación final de la entrega académica

Fecha local 29 de octubre de 2026, America/Bogota. Fuente académica: SpringBoot AI.pdf, página 11. Rama inicial yfinal de trabajo: developer. No se hizo commit, push, merge ni cambio de main.

## Ejecución nueva del catálogo

Comando desde raíz: `./scripts/check-all.ps1 -EvidenceDirectory docs/evidencias/verificacion-2026-10-29`.

El runner lee specs/checks.json, detiene sólo backends propios para reemplazar JAR y ejecuta suites en secuencia. Los timestamps se guardan en UTC (30 de octubre); el inicio local fue 29 de octubre a las22:00 aproximadamente. [Resultados publicables](evidencias/verificacion-2026-10-29/resultados-publicables.json) conserva comando, cwd, hora, código y archivo por check. Los archivos TXT son copias de logs, con ruta local sustituida cuando coincide; las salidas originales.log permanecen ignoradas.

| Check | Comando y directorio | Resultado |
| --- | --- | --- |
| presentation-boundary | node specs/004-navegacion-modulos/check-invariants.mjs; raíz | Código 0, 42 archivos sin cambios |
| frontend-unit | npm.cmd run test -- --run; frontend | 21 aprobadas, 0 fallidas, 0 omitidas |
| frontend-build | npm.cmd run build; frontend | Código 0 |
| frontend-lint | npm.cmd run lint; frontend | Código 0 |
| frontend-format | npm.cmd run format:check; frontend | Código 0 |
| backend-build | mvnw.cmd -B -ntp -DskipTests package; backend | Código 0; pruebas separadas |
| backend-integration | powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-backend.ps1; raíz | 14 aprobadas, 0 fallidas, 0 errores, 0 omitidas |
| ui-e2e | powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-ui.ps1; raíz | 15 aprobadas, 0 fallidas, 0 omitidas |
| backend-docs | mvnw.cmd -B -ntp javadoc:javadoc; backend | Código 0 |

Total 50 casos aprobados. JUnit: 13 integración + 1 inactividad. Vitest: 6 archivos/21 casos. Playwright: 14 casos journey + 1 persistencia. Esta corrida sustituye cifras históricas para la entrega, sin borrar evidencia anterior.

## Matriz de requisitos y alcance de prueba

| Requisito | Archivos responsables | Prueba/evidencia | Implementado | Comprobado |
| --- | --- | --- | --- | --- |
| Traslado entre cuentas | transfer/service/TransferService.java; features/transfer; app/useBanking.ts | transferAndReplayHaveOneReferenceAndExactBalances; journey recorrido real | Sí | Sí, JUnit y UI |
| Histórico | movement/repository/MovementQueryRepository.java; MovementsPage.tsx | historyAndReceiptsAreScopedToParticipants; UI módulos; movimientos.png | Sí | Sí |
| QR con datos básicos | ReceiptPanel.tsx; qrPayload.ts | jsQR decodifica PNG y compara recibo; comprobante-qr.png | Sí | Sí |
| Informe | informe.md, Informe_ProyectoBanco.docx/pdf | Revisión textual y visual del PDF exportado del DOCX | Sí | Según acta final de revisión documental |
| Código en GitHub | Remoto Sbedoyar/ProyectoBanco, developer | git remote/branch/status; no push de nuevos documentos | Aplicación en repositorio indicado | Actualización nueva pendiente de publicar |
| Prompts utilizados | prompts.md, Prompts_Utilizados.docx/pdf | Fuentes literales, resúmenes identificados y solicitud actual íntegra | Sí | Según acta final documental |
| Seguridad adicional | SecurityConfig, IdleSessionFilter, servicios | HTTP CSRF/401/403, privacidad entre 3 titulares, inactividad | Sí | Escenarios específicos, no auditoría total |
| Idempotencia | TransferService, UNIQUE(source_id, idempotency_key), pending.ts | concurrentReplayDebitsOnlyOnce; respuesta perdida | Sí | Sí |
| Rollback | @Transactional y PostgreSQL | forcedDatabaseFailureRollsBackBothBalancesAndReceipt | Sí | Sí, falla SQL inducida |
| Concurrencia | locks ordenados y relectura | concurrentSpendingCannotOverdraw; oppositeTransfersUseTheSameLockOrder | Sí | Sí |
| Persistencia | PostgreSQL, opening_movement | persistence.spec.ts reinicia realmente servidor | Sí | Sí |
| Navegación responsive | App.tsx, layouts, features | cinco módulos 1440/768/360/320; protección, recarga, atrás/logout | Sí | Chromium Windows |

## Evidencia de transferencia manual y PostgreSQL

[Consulta de lectura](evidencias/postgresql-consulta.txt): PostgreSQL 18.6, bank_demo, transferencia 50000.00 COP de 0003 a 0002, fecha 29-10-2026 21:11:24 Bogotá. Saldos al consultar 950000.00 y 1050000.00. Se omiten correos, nombres, hashes y claves. La consulta sólo lee; no se repitió la transferencia.

## Git y revisión de seguridad

[Revisión inicial](evidencias/git-seguridad.json):294 archivos rastreados, 1 commit accesible, rama developer. No rutas prohibidas rastreadas ni coincidencias exactas con contraseñas locales conocidas en el texto revisado. El código contiene fixtures públicos de demo/tests: son datos ficticios, no secretos personales. .local, node_modules, target, dist, .env y llaves están ignorados.

Se revisan además documentos e imágenes finales. El control tiene alcance acotado, no garantiza ausencia universal de secretos ni analiza objetos remotos no descargados. No se modifican remotos ni identidad Git. Los archivos nuevos quedan sin stage para revisión del estudiante. Antes de publicar, revisar `git diff` y `git status --short` en developer.

Commit recomendado: `docs(delivery): prepare academic report prompts and verification evidence`.

## Reproducibilidad y límites

Las pruebas requieren JDK 25, Node 24, PostgreSQL 18 y Chromium instalado; bank_test se limpia en suites. Nunca ejecutar JUnit y UI simultáneamente sobre esa base. check-all detiene demo:restaurarlo con scripts/start-backend.ps1 -Mode demo. No se modifican reglas, esquema, HTTP ni código funcional para la entrega.

El renderer DOCX habitual no pudo convertir porque LibreOffice no está disponible. Se usó Word instalado en modo invisible, actualización de índices y exportación PDF. Las páginas se rasterizan con Poppler para revisión real. El resultado final de esa revisión y conteos se registra en evidencias/revision-documental.json.

## Pendientes reales

Completar integrantes, docente y grupo en portada. Revisar y autorizar commit/push de developer cuando se quiera publicar los nuevos documentos. No se hizo push, merge ni cambio de main. No presentar esta simulación como banca real ni certificación de seguridad/accesibilidad.

## Cierre de revisión documental

Informe 18 páginas y prompts 26 páginas, 44 en total, abiertos y rasterizados con Poppler. Revisión de todas las páginas por Codex sin cortes ni solapamientos observados. Se corrigieron recortes móviles y auto inclusión del índice antes de la exportación final. 28 enlaces relativos válidos;prompt de entrega íntegro en MD y Word. Acta y huellas en [revisión documental](evidencias/revision-documental.json).

Consulta remota de sólo lectura git ls-remote: main y developer existen y ambas apuntan a de98c09785df938f18225c96ba7438f0d57b5522 en el momento de consultar. No se hizo fetch ni push. Código backend/frontend/scripts sin diferencias frente a HEAD. Los cambios son documentación, evidencias yregistro OmniSpec 005.
