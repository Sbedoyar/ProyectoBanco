# Contexto del proyecto

## 1. Estado y alcance del onboarding
- Estado de validación: APPLICATION_VALIDATED en entorno local delimitado por la corrida y revisión de aceptación de verification.md; cierre formal y huella vigentes en estado de OmniSpec. No es certificación ni cobertura universal.
- CONTEXT_RECORDED. Actualización de implementación: 24 de octubre de 2026, America/Bogota. Feature001 y deuda002 completadas; feature 003-rediseno-fintech en convergencia. No confundir checks documentales con pruebas de aplicación.
- Cobertura: instrucciones, PDF, decisiones, backend/frontend/scripts y documentación creada. Inventario original greenfield quedó superado por la implementación; no existía código de aplicación previo. No hay baseline Git independiente: git rev-parse falló y no se inicializó repositorio.

## 2. Mapa de evidencia
- OBSERVADO: [backend/pom.xml](../backend/pom.xml) fija Boot 4.1.2 y Java 25, WebMVC/Security/JPA/Validation, PostgreSQL y test BOM; [BankApplication](../backend/src/main/java/co/edu/tdea/bank/BankApplication.java) inicia backend. Organización por funcionalidad auth/account/transfer/movement/shared; [TransferService](../backend/src/main/java/co/edu/tdea/bank/transfer/service/TransferService.java) conserva locks y transferencia atómica. Son rutas inspeccionadas, no prueba de toda seguridad.
- OBSERVADO: [schema.sql](../backend/src/main/resources/db/schema.sql) define usuarios/cuentas/apertura/transferencias y restricciones. [application.properties](../backend/src/main/resources/application.properties) declara loopback, sesión 30m, cookie y DB por variables, JPA validate. No se afirma cifrado en reposo ni cumplimiento regulatorio.
- OBSERVADO: [frontend/package.json](../frontend/package.json) y lockfile fijan React19.3.1, Vite8.3.5, TypeScript6.0.3 y auxiliares; [App](../frontend/src/app/App.tsx), useBanking, componentes por funcionalidad y cliente compartido implementan recorrido y QR. [Vite](../frontend/vite.config.ts), [tsconfig](../frontend/tsconfig.json), [Playwright](../frontend/playwright.config.ts) configuran build/proxy/tipos y pruebas.
- OBSERVADO/EJECUTADO: JDK25.0.4.1, Maven3.9.16, Node24.19.0/npm11.17.0; PostgreSQL 18.6 confirmado por conexión de tests. [Procedencia de entorno](001-transferencias-bancarias/environment.md). Clúster propio en .local/pgdata:55432 con bank_demo/bank_test; servicio ajeno existente no modificado. Contraseñas aleatorias sólo en archivo ignorado, nunca copiadas al contexto.
- Estado compartido: [manifest](manifest.json), [decisiones](.omni/inputs/plan-stack.json) y catálogo efectivo [checks](checks.json). El catálogo configurado no significa ejecutado.

## 3. Objetivos y decisiones
- DECLARADO en [PDF](../SpringBoot%20AI.pdf), p.11: transferencia entre cuentas, histórico y QR; entrega 30/10/2026, informe/código GitHub/prompts. [Alcance aprobado](.omni/inputs/banking-scope.json): registro/acceso, una cuenta, apertura única 1000000 COP ficticios, privacidad, atomicidad, concurrencia, reintentos, histórico y QR enmascarado. No se añaden reglas de banca real.
- CONFIRMADO: [registro/moneda/sesión](.omni/inputs/plan-product-rules.json): nombre/correo único/contraseña, sesión 30m, dos decimales sin redondear mayor precisión. [Plan](001-transferencias-bancarias/plan.md) registra diseño/versiones y fuentes oficiales consultadas el 24/10/2026; usuario delegó decisiones técnicas/visuales conservando React, Java/Spring Boot, PostgreSQL y Javadoc.
- Documentación: Javadoc en APIs/contratos backend; TSDoc frontend. Generación Javadoc ejecutada con éxito en inspección previa, revisión semántica y resultado final se registran en verificación. Convención de commits pendiente antes del primer commit; no bloquea implementación local.
- Autorización vigente: omni-implement permite ejecutar el plan local, preparar entorno dedicado y tests. Sin Git/commits, publicación/despliegue ni subagentes autorizados. Entregable GitHub del enunciado no equivale a permiso para publicar ahora.
- Sesión: preguntas y web efectivamente usadas, terminal y Chromium Playwright disponibles; [registro de implementación](.omni/inputs/implementation-session.json), sessionId 916b4617-e89d-4bb2-9302-9b1577ff3fc0. Delegación de decisiones no autoriza subagentes.

## 4. Matriz de comandos
- Comandos efectivos/cwd/timeouts: [checks.json](checks.json). Propósito, prerrequisitos y vínculo a criterios en [plan](001-transferencias-bancarias/plan.md) y [tareas](001-transferencias-bancarias/tasks.md); resultados finales en [verification.md](001-transferencias-bancarias/verification.md).
- frontend-unit/build/lint: npm.cmd desde frontend, requieren Node24 y npm ci; sin datos reales. ui-e2e: PowerShell scripts/test-ui.ps1 desde raíz, requiere JAR construido, cluster/DB test y Chromium; inicia/detiene sólo servidor test y ejecuta desde frontend. No ejecutar junto a tests JUnit sobre la misma DB.
- backend-build/docs: mvnw.cmd desde backend, requieren JDK25 y dependencias Maven. backend-integration: PowerShell scripts/test-backend.ps1 desde raíz, requiere TEST_DB_* configuradas por script desde archivo local ignorado, nombre/rol/URL bank_test comprobados antes de limpieza. No opera sobre demo.
- Diferencia frente al plan original: backend-integration usa goal test (no verify/package) para evitar reconstruir JAR activo en Windows; backend-build separado comprueba empaquetado. No es omisión de tests. delivery-review es manual; no se inventa comando automatizado para ella.
- Arranque/demo y reproducción: [README](../README.md). DB_URL/DB_USERNAME/DB_PASSWORD y TEST_DB_URL/TEST_DB_USERNAME/TEST_DB_PASSWORD son nombres de variables; sus valores no forman parte de este contexto.

## 5. Base de calidad y requisitos
- EJECUTADO: 14 tests backend, 3 unit frontend y 9 HTTP/UI en corrida previa, builds/lint/Javadoc exit0. Prueba de reinicio conserva saldo/histórico/apertura. La primera corrida formal tuvo todos los checks exit0 pero rechazó la huella por regeneración de capturas; El runtime no aplica ignores al hashTree de spec activa; se conservaron capturas revisadas fijas dentro de evidence y nuevas corridas generan en .local/ui-artifacts, sin modificar tooling. [Resultados y procedencia](001-transferencias-bancarias/evidence/checks/results.json).
- [verification.md](001-transferencias-bancarias/verification.md) mantendrá comando/cwd/timestamp/exit/artefacto por check y categorías. Configuración/generación documental no garantiza semántica ni accesibilidad. Capturas no sustituyen interacción y aserciones.

## 6. Trabajo existente, riesgos y validación pendiente
- Código nuevo dentro de los módulos aprobados; Git ausente impide comparación contra baseline independiente. No se tocaron ramas ni identidades Git. Prerrequisitos iniciales desconocidos de SQL ya se resolvieron con cluster dedicado y pruebas reales; Maven compiló con éxito en entorno con permisos adecuados.
### Conflictos de fuentes
<!-- omni:source-conflicts -->
| Tema | Fuente A | Fuente B | Estado y consecuencia |
| --- | --- | --- | --- |
| Frontend | PDF p.1 Angular | PDF pp.9–10 React/instrucciones mezcladas | RESUELTO: usuario exige React; código React |
| Stack del bootstrap | Constitución/manifiesto: Undecided | Decisiones delegadas y poms/package del proyecto | Configuración inicial conservada; decisión efectiva en plan y manifests de aplicación, no tratar Undecided como falta de elección actual |
| Esquema automático | PDF p.4 ejemplo Hibernate update | Plan: SQL versionado y validate | Decisión técnica delegada aplicada al simulador; no cambiar esquema ajeno implícitamente |
| Ejecución JAR en Windows | Package necesita reemplazar JAR | Proceso Java local lo mantiene abierto | Detener procesos propios antes de empaquetar; tests de backend usan test, build separado |
- Estado de cierre: verificar/complete según estado CLI tras separar outputs regenerables de capturas revisadas inmutables; aceptación/documentación/UI revisadas, alcance local comprobado; publicación requiere acción posterior autorizada. No hay garantía de ausencia universal de fugas, conformidad WCAG ni certificación.

## 7. Próxima acción
Revisión modular002 implementada; convergencia formal según CLI. Seis tareas y nueve criterios revisados; no completar publicación remota como efecto implícito.





## Revisión modular — solicitud24-10-2026
Usuario autorizó explícitamente refactor incremental completo y ajustes visuales sutiles, tests/documentación/ignores; [prompt literal](../docs/prompts.md). [Plan002](002-revision-modular/migration-plan.md), [evidencia002](002-revision-modular/verification.md). Backend ahora auth/account/transfer/movement/shared; React app/features/shared/styles. HTTP y SQL conservados; BigDecimal, locks, refresh, idempotencia y seguridad preservados por revisión y regresiones. Prettier3.9.10 sólo desarrollo fijado, fuente oficial/compatibilidad y delegación en [decisión](.omni/inputs/revision-decision.json).
Catálogo vigente [checks](checks.json) añade frontend-format; entrada [revision-checks](.omni/inputs/revision-checks.json), runner lee catálogo vigente, guarda evidencia002 y permite directorio alternativo. [Sesión](.omni/inputs/revision-session.json) terminal/web/render disponibles; no agentes autorizados. Baseline 26 y preflight 39 pruebas pasaron; formalverify actualiza resultado ligado a fuentes. Javadoc revisado, capturas nuevas observadas; no se afirma WCAG ni todas las plataformas. Git sigue ausente; no commits/push. Scripts start-backend -Build ahora usa pom explícito. Saldo demo no reiniciado.

## Rediseño fintech 003
Solicitud explícita con [frontend-design](../.agents/skills/frontend-design/SKILL.md), autorización para rediseño visual importante y restricción de no cambiar backend/API/BD/seguridad/lógica monetaria. [Plan](003-rediseno-fintech/plan.md) y [evidencia](003-rediseno-fintech/verification.md). React/TS y módulos conservados; presentación nueva con Manrope local OFL e iconos propios, sin nuevas dependencias de runtime. [Frontera SHA256](003-rediseno-fintech/invariants.json):42 archivos sin cambios. Playwright usa puerto 5187 separado de desarrollo 5173; preview propio 5174 sólo para inspección. [Catálogo](checks.json) añade presentation-boundary temporal al alcance 003. Preflight40 pruebas/9 checks0 y prueba visual dirigida1/1; formalverify posterior es resultado ligado al código final. Login/registro/dashboard/comprobante/estados renderizados y capturas revisadas. Decisión visual delegada en [registro](.omni/inputs/design-decision.json), sesión render en [registro](.omni/inputs/design-session.json). Sin agentes/Git/push.

## Navegación modular004 (vigente)

003 completada;004 implementa React Router8.5.0 exacto/HashRouter con layouts auth/banca y contexto sobre rutas. Ver [plan004](004-navegacion-modulos/plan.md), [evidencia004](004-navegacion-modulos/verification.md), [decisión](.omni/inputs/modules-decision.json) y [sesión](.omni/inputs/modules-session.json). Rutas /#/resumen, transferencias, movimientos, comprobantes/:reference y perfil. Búsqueda local a página, sin nuevo endpoint. useBanking entero y backend sin cambios:42 hashes. Catálogo vigente apunta frontera004,9checks; ui-e2e300s. Preflight14Java+21Vitest+15Playwright=50 pruebas aprobadas; formalverify liga versión final. Capturas revisadas de cinco módulos1440/768/360/320, sin desbordamiento. Sólo Chromium Windows, sin agentes/Git/push. Próxima acción formalverify/complete004, luego restaurar demo8080. Los estados históricos de próximas acciones001–003 quedan sustituidos por este párrafo y CLI actual.
