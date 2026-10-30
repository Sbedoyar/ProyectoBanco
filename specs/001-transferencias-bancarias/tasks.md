# [TASKS-001] Transferencias bancarias

Fecha: 2026-10-24. Ruta FULL. Once tareas implementadas y comprobadas en corrida previa; ver evidencia y límites. El cierre formal depende del verify de convergencia. Fuentes: [especificación](spec.md), [plan](plan.md), [evidencia de entorno](environment.md). La fase omni-implement ejecutó el trabajo local aprobado y sus checks; no se publicó código.

## Dependencias y criterios de cierre
Orden de dependencia: TASK-01 → TASK-02 → TASK-03 → TASK-04 → TASK-05; TASK-06 requiere TASK-01/03; TASK-07 requiere TASK-04/05/06; TASK-08 requiere TASK-02/07; TASK-09 requiere TASK-03/04/05; TASK-10 requiere TASK-08/09; TASK-11 requiere todas las anteriores. La secuencia no autoriza delegación a agentes.

No completar una tarea por crear archivos: exige el resultado y verificación indicados. Los checkIds siguientes son previstos por el plan, no checks configurados ni ejecutados. Registrar comandos reales, cwd, fecha, exit, resultados y límites al ejecutarlos. Vincularlos al catálogo efectivo antes de verify. Mantener Javadoc/TSDoc junto al código de cada tarea y revisar su significado.

## Preparación y backend

- [x] TASK-01 / AC-22, AC-23: Preparar toolchain reproducible y checks por módulo.
  - Dependencias: ninguna. Afecta: backend/pom.xml, backend/mvnw.cmd y wrapper, frontend/package.json, package-lock.json y configuración Vite/TypeScript/tests; ejemplos de configuración sin valores secretos.
  - Resolver y fijar versiones auxiliares dentro de la delegación registrada, revisando fuentes oficiales/engines/peers; diagnosticar el aviso Maven 'Acceso denegado.' y preservar el resultado. Crear estructura mínima conforme al plan, sin capas genéricas.
  - Configurar scripts y perfiles que implementen backend-integration, frontend-unit/build/lint, ui-e2e y backend-docs del plan; incluir guardias de DB en TASK-02. Registrar checks con cwd y timeout cuando los comandos existan; no configurar comandos ficticios ni considerar build un test UI.
  - Cierre: wrapper identifica toolchain, instalación reproducible documentada y build mínimo por módulo ejecutado con resultados; generación de documentación preparada. Los checks de funcionalidades inexistentes siguen pendientes. Falta de red/permisos bloquea sólo lo dependiente.

- [x] TASK-02 / AC-01, AC-02, AC-15, AC-17: Preparar persistencia y datos aislados.
  - Depende de TASK-01. Afecta: backend/src/main/resources/db, application.properties/perfiles, entidades y repositorios JPA de user/account/opening/transfer, configuración y fixtures de integración.
  - Verificar versión/acceso PostgreSQL sin revelar credenciales; preparar base/rol exclusivos de demo y base/rol distintos de test sólo en alcance autorizado. No modificar una base existente arbitraria. Variables DB_* y TEST_DB_* según plan, valores fuera de archivos rastreables.
  - Implementar esquema SQL versionado, restricciones de unicidad/FK/checks, NUMERIC(19,2), Hibernate validate; carga demo idempotente de dos usuarios que no reinicia saldos. Tests abortan si apuntan a DB demo o si el aislamiento no está acreditado.
  - Verificación: backend-integration sobre esquema nuevo aislado, constraints, repetición de semilla y apertura única. Documentar recuperación y respaldo antes de cambiar datos persistidos. Un servicio Running no satisface conexión ni aislamiento.

- [x] TASK-03 / AC-01–06, AC-24: Implementar registro, acceso y cuenta propia.
  - Depende de TASK-02. Afecta: backend/.../auth, account, security/common y pruebas de autenticación/registro/autorización.
  - Registro nombre/correo/contraseña con normalización y validación del plan; creación atómica de usuario/cuenta/apertura de 1000000.00 COP. PasswordEncoder; HttpSession y persistencia del SecurityContext, rotación de cookie, CSRF y respuestas JSON. Consultar cuenta por principal, nunca confiar en un origen enviado por cliente.
  - Caducidad 30 minutos de inactividad y logout invalidan acceso; probar 401, 403 CSRF, persistencia de login, correo duplicado secuencial/concurrente, rollback de registro y manipulación de IDs sin datos ajenos. Ausencia de secretos en respuestas/logs.
  - Verificación: backend-integration con dos usuarios y solicitudes HTTP reales; Javadoc semánticamente revisado para APIs nuevas, completado de forma transversal en TASK-11.

- [x] TASK-04 / AC-07–15: Implementar transferencias atómicas, concurrencia y reintentos.
  - Depende de TASK-03. Afecta: backend/.../transfer, account repository y pruebas de negocio/concurrencia/fallas.
  - Contrato POST /api/transfers con monto decimal cadena, Idempotency-Key y origen del principal. Validación de escala previa a persistir; bloquear ambas cuentas por id ascendente, releer operación por clave bajo lock y confirmar débito/crédito/fila juntos. Clave repetida con mismo contenido devuelve referencia original; con otro contenido retorna conflicto sin movimientos.
  - Errores: cero/negativo, destino propio/inexistente, saldo insuficiente, escala extra, desbordamiento y lock timeout sin efectos parciales. No capturar violación SQL para continuar en transacción abortada.
  - Verificación: backend-integration con PostgreSQL real y transacciones independientes; caso 150000, saldo exacto, dos envíos de 700000 desde 1000000, misma clave concurrente, transferencias opuestas y fallo inyectado entre débito/crédito. Revisar saldos, filas, referencias y suma de fondos; no basta assert HTTP.

- [x] TASK-05 / AC-05, AC-16–18: Implementar histórico y comprobante recuperable.
  - Depende de TASK-04. Afecta: backend/.../transfer consultas/controlador, DTO records y pruebas de lecturas/persistencia.
  - GET /api/movements pagina apertura/SENT/RECEIVED de cuenta propia con orden estable; GET por referencia sólo para participantes y GET by-key sólo para origen autenticado. DTO de comprobante desde datos persistidos con fecha UTC, COP, monto canónico y cuentas enmascaradas según plan; no incluye datos de autenticación.
  - Verificación: backend-integration compara ambos históricos con una sola transferencia, apertura separada, autorización de referencia/clave ajena, paginación y comprobante idéntico tras reintento. AC-17 requiere además reinicio real en TASK-09.

## Frontend e integración

- [x] TASK-06 / AC-06, AC-19, AC-20: Construir y observar la superficie UI representativa.
  - Depende de TASK-01/03. Afecta: frontend/src estilos, pantalla de cuenta, formulario e histórico; artefactos de observación en evidence/ de esta spec.
  - Aplicar dirección delegada y referencias del plan, sin nueva marca o métricas ficticias: saldo/número claros, aviso de simulación, revisión de destinatario/importe, errores de campo y resumen enfocable. Muestra permitida: dos cuentas demo, nombres largos y estado de validación/error; si es fixture visual, etiquetarlo y no confundirlo con integración real.
  - Verificación: render real representativo a 360/768/1440 px, teclado y estado exigente antes de expandir la UI. Registrar sesión con render disponible y observaciones tipadas; corregir y repetir lo afectado. Sin navegador, conservar pendiente y procedimiento manual; nunca aprobar por JSX o captura sola.

- [x] TASK-07 / AC-01, AC-03–11, AC-14–17, AC-19–21, AC-24: Integrar el recorrido React con el backend.
  - Depende de TASK-04/05/06. Afecta: frontend/src acceso/registro, cliente HTTP, estado de sesión, cuenta, formulario e histórico; tests de cliente y recorrido.
  - Inputs monetarios conservados como cadenas; no cálculos de saldo con Number. Flujo login/CSRF/cuenta, revisión y envío, estado pendiente, error recuperable e histórico actualizado desde backend. Persistir sobre de operación por usuario; ante timeout consultar by-key o reintentar misma clave, nunca nueva automáticamente. Logout/sesión vencida regresan a acceso sin reenviar POST; otro usuario no hereda intención.
  - Verificación: frontend-unit para validación decimal y ciclo de claves, frontend-build/lint; ui-e2e con backend/DB aislados para éxito, rechazo, doble clic, respuesta perdida tras commit, recarga, cambio de usuario y sesión vencida. No usar mocks como única evidencia del recorrido real.

- [x] TASK-08 / AC-18–21: Presentar y decodificar el QR del comprobante.
  - Depende de TASK-02/07. Afecta: frontend/src comprobante/QR, fixtures de comprobante y tests UI/decoder.
  - QR JSON v1 exclusivamente desde DTO confirmado; reference, occurredAt, amount, COP, cuentas enmascaradas y simulation:true. PNG/canvas local con margen/contraste y alternativa textual. Si falla generación, conservar éxito bancario y permitir regenerar sólo QR; no transferir otra vez.
  - Verificación: ui-e2e obtiene la imagen renderizada, la decodifica con herramienta independiente y compara contra movimiento persistido; prueba error de QR sin nuevo POST y ausencia de QR de éxito ante rechazo. Revisar tamaño real y legibilidad; frontend-unit y build complementan, no sustituyen decodificación.

## Verificación y entrega

- [x] TASK-09 / AC-01–18, AC-24: Consolidar pruebas de integridad, seguridad y persistencia.
  - Depende de TASK-03/04/05. Afecta: backend/src/test, perfil y datos aislados, procedimiento de reinicio; verification.md/evidence de esta spec.
  - Ejecutar suite sin transacción envolvente que oculte commits/concurrencia. Probar negaciones de acceso, CSRF, deadlines de sesión servidor, aserciones de saldo/filas y rollback/reintentos de TASK-04; regenerar fixtures sólo en DB dedicada.
  - Verificación: backend-integration; reinicio real de proceso contra misma DB de test con saldos/histórico conservados y apertura no repetida. Revisar adecuación de aserciones; timeout/truncamiento no cuentan como pass. Registrar ambiente/versiones, comando/cwd/fecha/exit, artefactos y limitaciones.

- [x] TASK-10 / AC-19–21, AC-24: Verificar el recorrido final renderizado y corregir defectos.
  - Depende de TASK-08/09. Afecta: frontend/tests y correcciones acotadas de UI/integración, evidencia dentro de esta spec.
  - Recorrer con ambos usuarios desde acceso hasta QR/histórico; revisar carga real, sin transferencias, validación, rechazo, incertidumbre de red, éxito y acceso vencido. Revisar nombres largos, 360/768/1440 px, reflow 320 CSS px, zoom 200%, Tab/Shift+Tab, foco, labels, región de estado, contraste medido y reduced motion si aplica.
  - Verificación: ui-e2e y observaciones manuales tipadas con resultados medidos, entorno/viewport y artefactos; corregir y comprobar superficie integrada. No afirmar WCAG completo ni aprobación visual del usuario por build/código.

- [x] TASK-11 / AC-22, AC-23 y cierre AC-01–24: Completar documentación y evidencia de entrega.
  - Depende de TASK-01–10. Afecta: Javadoc/TSDoc en módulos, README.md, docs/informe.md, docs/prompts.md y verification.md/acceptance.json de esta spec.
  - Generar Javadoc con doclint y revisar exactitud de documentación frente a firmas/reglas; registrar prompts reales sin secretos y resultados reales de la demostración. README explica prerrequisitos, configuración por nombres de variables, perfiles, datos demo, uso, límites y ejecución de checks.
  - Verificación: backend-docs, revisión semántica manual de APIs/TSDoc y delivery-review con reproducción documentada. Vincular cada AC a checkIds efectivos u observaciones; actualizar acceptance sólo por evidencia real. Preparar la convergencia con contexto reconciliado y resultados reales; audit/verify/complete son el cierre posterior del flujo, no una funcionalidad de aplicación. No ejecutar publicación/Git/despliegue como parte implícita: enunciado pide GitHub pero esa operación conserva autorización separada.

## Prerrequisitos y cierre
- Conexión a PostgreSQL18.6 y bases/roles separados resueltos en el clúster dedicado; no se modificó el servicio preexistente.
- Wrapper y lockfile fijados; npm ci, builds y Javadoc ejecutados. Script UI compatible con Windows PowerShell5.1; procesos propios detenidos antes de empaquetar JAR.
- Render Chromium acreditado y capturas/mediciones en evidence/. Las comprobaciones son delimitadas a Windows11, Java25, PostgreSQL18.6 y Chromium; no certifican todos los entornos ni WCAG completo.
- Convención de commits pendiente sólo si se solicita primer commit. Sin subagentes, Git, publicación ni despliegue remoto realizados.
- Convergencia posterior: audit, contexto vigente, verify con catálogo efectivo y complete sólo si todos los resultados lo sostienen.
