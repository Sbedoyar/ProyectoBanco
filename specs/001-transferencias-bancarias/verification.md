# Verificación de SPEC-001

Fecha de revisión: 24 de octubre de 2026. Implementación local comprobada; estado y huella formal vigentes se consultan en OmniSpec. [Criterios](acceptance.json), [especificación](spec.md), [plan](plan.md) y [tareas](tasks.md). Criterios revisados por separado; no equivalen a certificación de seguridad, accesibilidad o soporte universal.

## Ejecuciones registradas
Entorno: Windows11/PowerShell, Temurin25.0.4.1, Maven3.9.16, Node24.19.0/npm11.17.0, PostgreSQL18.6 aislado en loopback:55432, Chromium de Playwright1.64.1. Suites sobre bank_test secuenciales, sin datos reales. Root es la raíz ProyectoBanco; cwd en tabla es relativo.

| checkId | Comando exacto | cwd | Inicio UTC | Exit | Artefacto |
| --- | --- | --- | --- | --- | --- |
| frontend-unit | npm.cmd run test -- --run | frontend | 10/24/2026 06:01:22 | 0 | [log](evidence/checks/frontend-unit.log) |
| frontend-build | npm.cmd run build | frontend | 10/24/2026 06:01:25 | 0 | [log](evidence/checks/frontend-build.log) |
| frontend-lint | npm.cmd run lint | frontend | 10/24/2026 06:01:31 | 0 | [log](evidence/checks/frontend-lint.log) |
| backend-build | mvnw.cmd -B -ntp -DskipTests package | backend | 10/24/2026 06:02:48 | 0 | [log](evidence/checks/backend-build.log) |
| backend-integration | powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-backend.ps1 | . | 10/24/2026 06:03:03 | 0 | [log](evidence/checks/backend-integration.log) |
| ui-e2e | powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-ui.ps1 | . | 10/24/2026 06:04:50 | 0 | [log](evidence/checks/ui-e2e.log) |
| backend-docs | mvnw.cmd -B -ntp javadoc:javadoc | backend | 10/24/2026 06:05:47 | 0 | [log](evidence/checks/backend-docs.log) |
Resultados: 14 tests backend (13 integración PostgreSQL + frontera de sesión), 3 unit tests frontend y 9 tests HTTP/navegador, todos sin fallos en esta corrida. Build, lint y Javadoc exit0. [Resultados estructurados](evidence/checks/results.json). npm ci --no-fund desde raíz con --prefix frontend: exit0, 209 paquetes, audit informó cero vulnerabilidades conocidas; timestamp individual no capturado en esa llamada, evidencia en terminal de esta sesión. No es una auditoría de seguridad completa.

## Revisión criterio por criterio
Todos los resultados siguientes son PASÓ en el entorno descrito; conservar límites específicos. Las filas automatizadas usan checkIds efectivos de [checks](../checks.json); AC-22 incluye generación más inspección semántica y AC-23 revisión documental/reproducción.

| Criterio | Evidencia y aserción revisada |
| --- | --- |
| AC-01 | Registro secuencial/concurrente y fallo inducido en apertura: una identidad/cuenta y rollback completo. BankIntegrationTest; recorrido HTTP/UI real. Evidencia y límites: verification.md. |
| AC-02 | Saldo 1000000.00 y una apertura; repetir correo o seed no concede otro abono. BankIntegrationTest y DemoData inspeccionado. Evidencia y límites: verification.md. |
| AC-03 | HTTP/UI autentican, mantienen sesión en la siguiente petición y rechazan credenciales incorrectas. Evidencia y límites: verification.md. |
| AC-04 | Peticiones anónimas account y transfer retornan 401 en HTTP real. Evidencia y límites: verification.md. |
| AC-05 | Origen resuelto por principal; cuenta propia aun con ownerId manipulado; recibos/claves de terceros rechazados en servicio. Evidencia y límites: verification.md. |
| AC-06 | UI muestra número, saldo decimal propio y COP; endpoints autenticados usados en recorrido. Evidencia y límites: verification.md. |
| AC-07 | Transferencia 150000 desde dos cuentas de 1000000 produce 850000 y 1150000; una fila y referencia. Evidencia y límites: verification.md. |
| AC-08 | Cero/negativo rechazados sin cambios en saldos/filas. Evidencia y límites: verification.md. |
| AC-09 | Destino inexistente rechazado sin efectos. Evidencia y límites: verification.md. |
| AC-10 | Misma cuenta rechazada sin efectos. Evidencia y límites: verification.md. |
| AC-11 | Saldo insuficiente rechazado y saldo exacto transferido hasta cero. Evidencia y límites: verification.md. |
| AC-12 | Trigger de test falla durante escrituras: ambas cuentas y fila revierten; excepción esperada. Evidencia y límites: verification.md. |
| AC-13 | Dos peticiones de 700000 en transacciones independientes desde 1000000: sólo una confirma, total de fondos conservado. Evidencia y límites: verification.md. |
| AC-14 | Misma clave concurrente y respuesta perdida: un débito/referencia; contenido cambiado rechazado; reintento real tras recarga. Evidencia y límites: verification.md. |
| AC-15 | BigDecimal/NUMERIC y formato de cadena: 0.01 exacto, tercer decimal rechazado; montos grandes formateados sin Number. Evidencia y límites: verification.md. |
| AC-16 | Históricos propios OPENING/SENT/RECEIVED, referencia una vez por participante; comprobación API y UI. Evidencia y límites: verification.md. |
| AC-17 | Proceso Java detenido/reiniciado por harness: nuevo login conserva saldo, histórico y una apertura; sin restauración de fixture. Evidencia y límites: verification.md. |
| AC-18 | Imagen QR generada se decodifica con jsQR y se compara con comprobante persistido; campos permitidos/enmascarados. Evidencia y límites: verification.md. |
| AC-19 | Validación enfocada y rechazo sin QR; estado incierto conserva operación; error anterior se limpia al editar. Evidencia y límites: verification.md. |
| AC-20 | Aviso de simulación y dinero ficticio en acceso y cuenta/formulario; capturas de render y revisión a 360/768/1440 y acceso1280. Evidencia y límites: verification.md. |
| AC-21 | Recorrido con dos cuentas; QR fallido se regenera sin POST nuevo; sesión terminada requiere acceso sin reenvío automático. Evidencia y límites: verification.md. |
| AC-22 | Javadoc generado con doclint y revisión semántica de BankController/BankService/Contracts/Repositories/IdleSessionFilter; firmas y reglas coherentes. TSDoc revisado en dominio/API/componentes. Evidencia y límites: verification.md. |
| AC-23 | README, informe y prompts reales preparados; clúster, npm ci, builds y recorrido reproducidos localmente. No publicado; GitHub es operación posterior autorizada. Evidencia y límites: verification.md. |
| AC-24 | IdleSessionFilterTest verifica exactamente 1799/1800 segundos con Clock controlado; HTTP logout y UI reautenticación sin POST automático. No se esperaron manualmente 30 minutos. Evidencia y límites: verification.md. |
## Revisión de UI y documentación
- Sesión de observación 916b4617-e89d-4bb2-9302-9b1577ff3fc0 registrada con render disponible antes de los checks integrados. Recorrido real en frontend/tests/journey.spec.ts; reinicio en persistence.spec.ts. Capturas: [acceso1280](evidence/access-1280.png), [cuenta360](evidence/account-360.png), [cuenta1440](evidence/account-1440.png), [resultado1440](evidence/receipt-1440.png), [validación360](evidence/validation-360.png) y [texto ampliado](evidence/reflow-text-200.png).
- Observado: aviso legible de simulación, etiquetas/cuenta/saldo y error enfocado; render integrado revisado después de correcciones. Pruebas a 320/360/768/1440 px comparan scrollWidth contra innerWidth. Contrastes medidos en estilos renderizados: ayuda/texto sobre blanco 5.754:1, botón 7.928:1, borde input 3.534:1. Tab después de error y foco de monto comprobados. Texto al 200% y zoom CSS2x comprobados sin overflow; no equivale a probar todos los navegadores/tecnologías asistivas. No hay animaciones que requieran reducción adicional; CSS contempla reduced motion.
- QR: se decodifica PNG real, no sólo el texto de entrada. Error de canvas inducido sólo en test deja la transferencia confirmada, permite regenerar QR y no produce otro POST. Al perder respuesta después de commit, recarga/reintento conserva clave y saldos; cambio de usuario no hereda intención (assert ejecutado en la corrida formal).
- Documentación inspeccionada: contratos/purpose/params/return/errors en APIs Java y consultas; ausencia de comentarios que sólo narren sintaxis. Javadoc genera HTML; no se deduce corrección semántica de contar tags. Revisados TSDoc monetario, cliente HTTP y estado pendiente contra implementación. Informe/README/prompts corresponden al alcance y resultados; publicación no ejecutada.

## Hallazgos, correcciones y límites
- Fallos de preparación registrados en terminal: npm/Maven necesitaron red/permisos; PostgreSQL no inició en sandbox restringido y se inició con permisos adecuados en clúster dedicado; quoting Maven se corrigió; wrapper bajo cmd requiere mvnw.cmd en vez de ./mvnw.cmd.
- Empaquetar JAR activo falló por bloqueo Windows: se detienen sólo PIDs del proyecto antes del build. Tests usan goal test sin reempaquetar; build separado. El primer harness de reinicio agotó timeout con pipes heredados; stdio ignore/windowsHide lo corrigió y reinicio real pasó. Readiness HTTP usa UseBasicParsing bajo PowerShell5.1.
- Primera corrida UI tuvo race de route.abort y locator ambiguo tras mensaje previo; se esperó el error de red y la UI limpia el mensaje al editar. No se ocultaron esos fallos como éxitos.
- Logs de SQL con fallas/duplicado son inducidos por tests y terminan con aserciones y suite exit0. Mockito/JDK advierten carga dinámica de agente; Node avisa NO_COLOR/FORCE_COLOR. No hubo fallo de checks por esas advertencias.
- Sólo simulación local. No evaluación bancaria regulatoria, auditoría de accesibilidad completa, carga/penetración o compatibilidad multibrowser. La frontera de 30 minutos se prueba con Clock controlado; no se afirma una espera manual de media hora. No se alteraron bases ajenas ni se publicó en GitHub.
- Git no existe en esta raíz; sin baseline independiente de diff. Inventario de 45 archivos de módulos/scripts/docs, excluyendo outputs ignorados. Ver [entorno](environment.md), [README](../../README.md), [informe](../../docs/informe.md) y [prompts](../../docs/prompts.md).

## Cierre formal
La corrida previa registrada apoya la revisión de aceptación. La primera corrida formal ejecutó todos los checks con exit0 y vinculó criterios, pero no registró éxito global porque los PNG de evidencia cambiaron al regenerarse. El intento de .omnispecignore no afectó las capturas de la spec activa: se diagnosticó que projectSnapshot llama hashTree de esa spec sin reglas de ignore en este runtime. No se modificó el tooling. Las capturas revisadas se conservan fijas y atestadas dentro de evidence/; nuevas corridas generan imágenes en .local/ui-artifacts, ignorado como output. El registro formal final está en estado/verification-logs de OmniSpec. Se repite verify con contenido reconciliado antes de complete. No marcar como verificado un cambio posterior sin nueva verificación.


