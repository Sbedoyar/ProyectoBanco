# [PLAN-001] Plan técnico de transferencias bancarias

Fecha: 2026-10-24. Ruta FULL. Diseño bajo delegación explícita del usuario. Estado: diseño implementado; comandos efectivos y resultados en checks/verification. Derivado de [spec.md](spec.md); no certifica seguridad, compatibilidad instalada ni calidad visual.

## Evidence and existing architecture
- OBSERVADO al planificar: aplicación nueva; inventario fuera del tooling sólo contiene PDF e instrucciones/documentación OmniSpec. No hay APIs, esquema, manifiestos de aplicación, CI ni pruebas existentes que conservar o migrar. [Contexto](../project-context.md).
- CONFIRMADO: [alcance](../.omni/inputs/banking-scope.json), [registro/moneda/sesión](../.omni/inputs/plan-product-rules.json), [delegación y stack](../.omni/inputs/plan-stack.json). La versión CLI 0.7.0-preview.2 coincide con el manifiesto; fit devuelve FULL.
- Problema: la simulación necesita proteger credenciales y titularidad y mantener saldo/transferencias consistentes ante simultaneidad y reintentos. Solución: aplicación React y un backend Spring con PostgreSQL, transacciones y sesiones de servidor. Riesgos: errores de autorización, doble débito, pérdida parcial de movimientos y resultado incierto de red; ver contratos y pruebas siguientes.

## Proposed change
Un backend desplegable y un frontend SPA; sin microservicios, Redis, colas o capas genéricas. Organización por responsabilidades concretas, nombres de código en inglés y textos de interfaz en español.

| Ubicación futura | Responsabilidad |
| --- | --- |
| backend/pom.xml, src/main/resources/application.properties | Dependencias BOM, Java 25, variables de entorno y perfiles local/test/demo |
| backend/src/main/java/.../auth | Registro atómico, autenticación, usuario, repositorio JPA y configuración de seguridad |
| backend/src/main/java/.../account | Cuenta, repositorio y consulta de cuenta propia |
| backend/src/main/java/.../transfer | Servicio transaccional, repositorio, endpoints, histórico y comprobante |
| backend/src/main/java/.../common | Sólo errores compartidos y conversión HTTP cuando se necesiten |
| backend/src/main/resources/db | SQL versionado de esquema y datos demo separados; JPA validate |
| backend/src/test | Integración PostgreSQL, seguridad, fallas y concurrencia |
| frontend/src | Pantallas de acceso/cuenta, formulario de transferencia, comprobante, histórico, cliente HTTP y estilos |
| frontend/package.json, package-lock.json, vite.config.ts | Versiones fijadas, proxy /api, build y checks |
| frontend/tests | Recorrido real, validaciones, sesión, reintentos y QR |
| README.md, docs/informe.md, docs/prompts.md | Preparación, arquitectura, limitaciones, evidencia y prompts reales utilizados |

Estimación: 35–55 archivos de aplicación/test y dos módulos, a revisar en tasks. La tabla registra las ubicaciones del diseño; su implementación se contrasta con tasks y verification. Usar records para contratos HTTP cuando sean necesarios; no crear interfaces de servicio/DTO genéricos ni una capa por entidad sin propósito.

### Modelo de datos
- app_user: id, name, email normalizado con trim y minúsculas, password_hash. Restricción UNIQUE(email); validar formato y longitud antes de escribir. Nombre 1–120 caracteres; correo hasta 254; contraseña 12–128 caracteres sin truncar. No almacenar contraseña original. Hash con PasswordEncoder adaptativo de Spring, preferentemente PBKDF2 del framework con parámetros documentados y probados.
- account: id, owner_id UNIQUE FK, number UNIQUE inmutable generado desde secuencia de backend (presentación de 12 dígitos), balance NUMERIC(19,2) CHECK(balance >= 0), opened_at TIMESTAMPTZ. Moneda de aplicación fija COP. Número público no sustituye autorización.
- opening_movement: account_id PRIMARY KEY FK, amount NUMERIC(19,2) fijo 1000000.00, created_at. Separado de transfer para distinguir apertura sin falsificar cuenta origen.
- transfer: id/referencia UUID PK, source_id y target_id FK, amount NUMERIC(19,2) CHECK(amount > 0), created_at, idempotency_key UUID; UNIQUE(source_id,idempotency_key), CHECK(source_id <> target_id). Sólo filas confirmadas: no se insertan transferencias fallidas como exitosas.
- amount y balance se procesan con BigDecimal; HTTP y QR usan cadenas decimales canónicas. Rechazar entradas con más de dos decimales antes de normalizar a escala 2; no confiar en que NUMERIC rechace precisión extra (puede redondearla). Rechazar valores fuera de capacidad y créditos que desborden la columna con error sin efectos parciales. [Numeric Types](https://www.postgresql.org/docs/18/datatype-numeric.html).
- Registro crea usuario, cuenta, saldo y apertura en una transacción. Un fallo o registro duplicado revierte todo. Los dos usuarios demo sólo se crean explícitamente en perfil demo; semilla repetible que no reinicia saldos ni se aplica a bases arbitrarias.

## Contracts and compatibility
Contrato nuevo; no hay clientes previos que migrar. Base /api, JSON; campos y códigos de error en inglés, mensajes UI en español. Paginación simple de movimientos con orden estable por fecha descendente y desempate por identificador, tamaño por defecto 20 y máximo 100.

| Método / ruta | Entrada | Salida / errores |
| --- | --- | --- |
| GET /auth/csrf | Anónimo o autenticado | 200 token CSRF de sesión; no cachear |
| POST /auth/register | name,email,password y CSRF | 201 usuario/cuenta creados; 400 validación, 409 correo existente; no inicia sesión automáticamente |
| POST /auth/login | email,password y CSRF | 200 usuario autenticado, cookie de sesión rotada; 401 credenciales inválidas con mensaje genérico |
| POST /auth/logout | Sesión y CSRF | 204, invalidación y borrado de cookie |
| GET /auth/me | Sesión | 200 id/name/email; 401 si ausente/vencida |
| GET /account | Sesión | 200 number,balance,currency; cuenta resuelta por identidad autenticada |
| GET /movements?page=0&size=20 | Sesión | 200 items OPENING/SENT/RECEIVED, referencia cuando corresponda, amount,currency,occurredAt y contraparte enmascarada |
| POST /transfers | Sesión, CSRF, Idempotency-Key UUID, body targetAccountNumber y amount cadena | 201 comprobante nuevo; 200 misma operación ya confirmada; 400 monto/destino propio/clave inválida; 404 destino inexistente; 409 fondos insuficientes o reutilización de clave con otro contenido; 503 conflicto transitorio de lock |
| GET /transfers/by-key/{key} | Sesión | 200 comprobante de operación propia confirmada; 404 sin resultado visible aún; nunca prueba definitiva de que una petición en vuelo fracasó |
| GET /transfers/{reference} | Sesión | 200 comprobante para origen o destino; 404 si ajena/inexistente |

Error JSON: code, message, fieldErrors cuando aplique; no stacktraces, SQL ni credenciales. No aceptar sourceAccountId ni saldo desde cliente. En endpoints protegidos 401 tiene prioridad sobre validación; CSRF inválido retorna 403. Contenido de cookie/token fuera de logs.

### Sesión y protección
- Spring Security con HttpSession; cookie HttpOnly, SameSite=Lax, path restringido a la aplicación; Secure en HTTPS. Localhost HTTP sólo para demostración local explícita, sin exposición remota; HTTPS requerido al preparar hosting. Sin JWT almacenado en localStorage ni servicio adicional.
- Caducidad 30 minutos sin peticiones de sesión; frontend sin polling que prolongue artificialmente la sesión. Cerrar sesión invalida sesión servidor. Reiniciar backend puede requerir nuevo acceso; no debe modificar datos bancarios.
- CSRF activo también para login/registro/logout. Endpoint explícito entrega token para encabezado X-CSRF-TOKEN; volver a obtenerlo tras login/logout, siguiendo el ciclo de Spring. Guardar SecurityContext al autenticar si se usa controlador propio, renovar identificador de sesión y probar persistencia en peticiones siguientes. [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [sesiones](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html), [PasswordEncoder](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html).
- Vite en desarrollo sirve frontend y reenvía /api al backend local. Build de demo bajo mismo origen; evita CORS permisivo. Si se requieren orígenes separados, allowlist explícita y credenciales, nunca wildcard.

### Transferencia y recuperación de resultado
1. Cliente genera clave UUID por intención de transferencia y conserva clave/destino/importe hasta conocer resultado. Sesión de navegador guarda sólo ese sobre de operación pendiente, asociado al usuario; no guarda credenciales ni números en logs.
2. Backend obtiene cuenta origen del principal; valida entradas, localiza las dos cuentas y adquiere locks PESSIMISTIC_WRITE secuenciales por id ascendente dentro de la transacción. Configurar tiempo límite de lock y propagar fallo transitorio con rollback. Todas las transferencias usan ese mismo orden. [JPA locking](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html), [PostgreSQL locks](https://www.postgresql.org/docs/18/explicit-locking.html).
3. Tras adquirir locks, buscar de nuevo source+key: si existe con mismo destino/importe, devolver comprobante anterior sin tocar saldo; si difiere, 409. Esto también resuelve reintentos tras esperar el lock del envío original. UNIQUE como defensa adicional; no capturar una violación de constraint para continuar usando una transacción abortada.
4. Validar fondos y capacidad de crédito; debitar, acreditar e insertar transferencia en una única transacción. El controlador responde éxito sólo al completar commit. No producir QR antes de ese resultado.
5. Si se corta la conexión, UI muestra resultado pendiente de comprobar y consulta by-key. Si 404, puede reenviar exactamente la misma clave/payload; nunca generar clave nueva automáticamente. Tras sesión vencida, regresar a acceso y consultar estado luego de autenticar al mismo usuario, sin POST automático. Otro usuario nunca hereda esa intención.
6. Reintentar fallo de QR sólo regenera presentación desde comprobante; no repite POST /transfers. Nueva transferencia exige intención explícita y otra clave.

### QR
Comprobante del backend: reference, occurredAt ISO-8601 UTC, amount con dos decimales, currency COP, sourceAccountMasked y targetAccountMasked (sólo últimos cuatro dígitos). Payload QR JSON v1 con esos campos y simulation:true. Frontend serializa exclusivamente este DTO y genera PNG/canvas con qrcode.toDataURL, con zona libre y contraste negro sobre blanco; no requiere servicio externo. [API oficial del proyecto](https://github.com/soldair/node-qrcode#browser-api). No es firma digital ni autorización de pago; cualquier afirmación de autenticidad queda fuera del alcance. Verificar decodificación real de imagen con un decoder independiente, no sólo el texto dado al generador.

## Technology, setup and documentation decisions
Consultas oficiales realizadas el 2026-10-24; selección bajo delegación, no pruebas de instalación conjunta.

| Selección | Evidencia y motivo |
| --- | --- |
| Java Temurin 25 LTS | Coincide con guía y JDK local; [Adoptium](https://adoptium.net/support/) identifica Java 25 LTS. Se conserva rama 25, sin salto a 27 |
| Spring Boot 4.1.2 | Rama estable 4 vigente, adecuada a proyecto nuevo y guía; [requisitos](https://docs.spring.io/spring-boot/system-requirements.html) incluyen Java 17–27 y Maven >=3.6.3. Spring Security/JPA/JDBC gestionados por BOM; no mezclar versiones manuales. [Política](https://spring.io/support-policy/) consultada; no se deriva garantía comercial ni fecha de soporte no comprobada |
| Maven 3.9.16 | Detectado localmente; usar wrapper fijado para reproducibilidad al implementar; build aún no probado |
| PostgreSQL 18.6 | Cliente local 18.6 y servicio 18 observados; [política oficial](https://www.postgresql.org/support/versioning/) soporta rama 18 hasta noviembre de 2030. No usar 19 RC; la versión real del servidor necesita SELECT version con acceso autorizado |
| Node 24 LTS y npm | Node 24.19.0/npm 11.17.0 locales; [Node releases](https://nodejs.org/en/about/previous-releases) lista 24 LTS. No se requiere subir a 26 Current |
| React 19.3 + Vite 8.3 + TypeScript | React requerido; [React versions](https://react.dev/versions) lista 19.3. [Vite releases](https://vite.dev/releases) da parches regulares a 8.3; [guide](https://vite.dev/guide/) incluye react-ts y umbral Node 20.19+/22.12+. Node 24 satisface ese umbral; engines/peers de template y plugins deben verificarse antes de instalación |
| Pruebas | JUnit/Spring Boot Test gestionados por BOM; PostgreSQL real de test. Vitest para contratos de cliente y Playwright para recorrido real. [Vitest](https://vitest.dev/guide/) requiere Node >=22.12 y Vite >=6.4; [Playwright](https://playwright.dev/docs/intro) contempla Node 24 y Windows 11. Fijar versiones de auxiliares compatibles al preparar package-lock; versiones instaladas y resultados registrados posteriormente en implementation-stack/verification |

No hay manifests/lockfiles/CI de aplicación previos. Antes de instalar, fijar parches de React/Vite, TypeScript, plugin React, qrcode, decoder y tests y revisar engines/peers y advisories oficiales; el plan no inventa versiones exactas no consultadas. Conservar BOM y lockfile; documentar cualquier incompatibilidad observada y ajustar dentro de la delegación. No se propone despliegue remoto en esta fase.

Javadoc en métodos públicos y contratos internos no triviales, con propósito/parámetros/retorno/errores/efectos aplicables y revisión semántica; usar doclint y generación Maven. Frontend TypeScript con TSDoc de APIs/componentes/hooks exportados y contratos no triviales; tipos y ejemplos precisos, no comentarios que narren sintaxis. Convención de commits pendiente antes del primer commit, sin bloquear diseño; no se autorizó Git ni publicación.

### Preparación inicial (resuelta en implementación según ajustes al final)
- Windows 11/PowerShell observados. Inspecciones ejecutadas en raíz; detalles de comandos/versiones en [evidencia de entorno](environment.md).
- Servicio postgresql-x64-18 observado Running y cliente en C:/Program Files/PostgreSQL/18/bin/psql.exe; no está en PATH. No se inspeccionaron credenciales ni se conectó a base alguna.
- Crear en fase autorizada base y rol propios del demo y base/rol separados de test. Variables previstas: DB_URL, DB_USERNAME, DB_PASSWORD, TEST_DB_URL, TEST_DB_USERNAME, TEST_DB_PASSWORD; valores fuera de Git y documentación. No usar base existente arbitraria ni superusuario para pruebas.
- Docker no está en PATH; no se impone Docker/Testcontainers. Pruebas de concurrencia en PostgreSQL aislado local, nunca sustituidas por H2 como evidencia equivalente.
- Maven imprimió 'Acceso denegado.' pese a exit 0 y versión; investigar ejecución de build/wrapper antes de afirmar toolchain sano.

## UI & Interaction Design
Herramienta operativa para usuario académico, operación ocasional y demostración en escritorio/móvil. Sin identidad existente. Decisión visual delegada: tipografía de sistema, fondo claro, texto azul oscuro y acento verde azulado reservado para acción/éxito; error rojo con texto e icono; escala de espaciado 4/8/16/24/32 px y densidad moderada. Ajustar colores tras medir contraste, no declarar conformidad por paleta.

Cuenta: encabezado con nombre, aviso de simulación y cierre; saldo y número de cuenta como información principal; formulario con destinatario/importe y revisión de datos previa al envío; histórico debajo. En móvil, apilar secciones y filas de movimiento sin pérdida de información. Resultado muestra estado confirmado, datos y QR con alternativa textual; estado incierto tiene acción de comprobar y no mensaje de éxito/rechazo definitivo.

Referencias consultadas el 2026-10-24:
- [PDF local](../../SpringBoot%20AI.pdf), p. 10: flujo formulario+tabla y feedback; aprovechar jerarquía operativa, no copiar dominio reservas ni apariencia como branding aprobado.
- [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/): revisar destinatario/importe antes de enviar para reducir errores; no copiar marca ni añadir pasos innecesarios.
- [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/): resumen enfocable, enlaces a campos y errores junto al control; no depender sólo de toast/color.

Primero construir una superficie representativa de cuenta, formulario, histórico con nombres largos y error; revisar render e interacción antes de extender acceso y comprobante. La implementación posterior observó la superficie representativa antes de ampliar el recorrido; capturas y pruebas en verification. Normal/carga/validación/error/pending/success/session-expired son aplicables; no inventar latencia o estados de servicio.

Verificación prevista: 360, 768 y 1440 px; reflow a 320 CSS px y zoom 200%; Tab/Shift+Tab, labels, foco tras error y navegación, región de estado, contraste medido texto >=4.5:1 y controles >=3:1, targets usables y reduced-motion si se añade movimiento. QR se prueba a tamaño real con margen. En el diseño inicial el render estaba NOT_VERIFIED; en implementación se acreditó Chromium y se registraron observaciones y checks reales en verification. Registrar capacidad render disponible antes de observar; si falla, procedimiento manual con pasos y artefactos, criterios pendientes.

## Verification
La matriz siguiente conserva los CHECKS PROPUESTOS del diseño inicial; los comandos/cwd efectivos y ejecuciones actuales se encuentran en checks.json y verification.md. No se cambian gates del manifiesto en plan. Cwd relativo; npm.cmd y mvnw.cmd para Windows.

| checkId previsto | Comando propuesto | cwd | Criterios / aserciones relevantes | Prerrequisitos |
| --- | --- | --- | --- | --- |
| backend-integration | ./mvnw.cmd verify -Ptest | backend | AC-01–18 y AC-24; sesión y correo duplicado, 401/403/404, rollback inducido entre débito/crédito, locks con transacciones independientes y barreras, clave repetida simultánea, payload cambiado, decimal extra | JDK25, wrapper/dependencias, rol y DB exclusivos TEST_DB_*; guardia contra DB de demo |
| frontend-unit | npm.cmd run test -- --run | frontend | AC-14/15/19; reintento conserva clave, entradas decimales sin Number para operaciones, errores de QR no reenvían dinero | Node24, npm ci, scripts Vitest |
| frontend-build | npm.cmd run build | frontend | Contratos TS y empaquetado; no prueba visual ni funcional suficiente | Node24, lockfile y dependencias |
| frontend-lint | npm.cmd run lint | frontend | Errores de código y hooks; no prueba semántica de documentación | Node24, ESLint configurado |
| ui-e2e | npm.cmd run test:e2e | frontend | AC-03/06/16/18–21/24; dos usuarios, QR decodificado independiente, expiración, timeout tras commit, recarga; artefactos UI | Browser Playwright instalado, frontend/backend test, DB y usuarios aislados, variables de test; nunca DB demo |
| backend-docs | ./mvnw.cmd javadoc:javadoc | backend | AC-22 generación/doclint + revisión manual semántica de APIs | JDK25 y plugin fijado |
| delivery-review | Revisión manual documentada | . | AC-23; informe, prompts sin secretos, README y reproducción demo desde datos iniciales | Código y herramientas preparadas; publicación separada |

Añadir observaciones manuales para AC-20/21 con viewport, superficie, entorno, pasos, resultado real y capturas dentro de evidence/ de la spec. No pasar criterios por ejecutar build. Persistencia de AC-17 exige reinicio real de proceso contra la misma DB aislada. Expiración se verifica en backend con reloj/timeout controlado y caso real equivalente, no sólo borrando estado React. Evaluar aserciones y límites al revisar resultados. Mapear checkIds a catálogo efectivo antes de verify; acceptance.json registra los resultados por criterio; no confundir el diseño de un check con su ejecución.

## Rollback / recovery
Proyecto nuevo: no migración de aplicación previa. SQL de esquema inicial ejecutado sólo en base dedicada; Hibernate validate evita cambios implícitos. Versionar scripts y aplicar controladamente; no usar ddl-auto=update como recuperación. Antes de cambiar un esquema con datos, respaldo y restauración probada en base aislada. Restaurar snapshot demo sólo con autorización, nunca borrar registros para fingir reversión de transferencia.

Un error transaccional revierte movimiento completo. Una transferencia confirmada no se deshace borrando filas o reiniciando saldo: correcciones operativas requieren alcance explícito posterior. Ante respuesta perdida, consultar/reintentar misma clave. Reinicio puede perder sesión, no saldo/apertura. Si falla instalación/build, conservar diagnóstico y lockfile revisado; no silenciar errores ni cambiar versiones sin evidencia.

Descomposición registrada en [tasks.md](tasks.md), con matriz de evidencia en [verification.md](verification.md). Próxima fase: implementación de TASK-01 y preparación de checks efectivos; auditoría documental ejecutada por omni-tasks sin errores, sin validar aplicación. Se ejecutaron pruebas locales según verification; no se realizó despliegue remoto.



## Ajustes confirmados durante implementación
- Artefactos reales: paquetes Java concretos bajo co.edu.tdea.bank; 45 archivos de aplicación/scripts/docs inventariados con rg (excluyendo outputs ignorados). No se impusieron capas adicionales por plantilla.
- IdleSessionFilter con Clock añade comprobación exacta de 30 minutos antes de Security, además de timeout del contenedor; unit test controla frontera 1799/1800 segundos. La UI prueba sesión terminada real por logout y ausencia de POST automático; no se afirma una espera manual de media hora.
- Catálogo efectivo en [checks.json](../checks.json): wrapper invocado como mvnw.cmd para cmd.exe; backend-integration ejecuta script con goal test sin reempaquetar JAR; backend-build separado valida package. UI script usa UseBasicParsing para compatibilidad Windows PowerShell 5.1. Las suites comparten DB test y se ejecutan secuencialmente.
- SQL de esquema inicial y seed demo implementados; sin datos reales ni cambios al servicio PostgreSQL preexistente. Producción local empaqueta frontend/dist dentro de recursos static del JAR. Antes de reconstruir, detener procesos propios por bloqueo de archivo Windows.
- Evidencia finita en [verification.md](verification.md); sin afirmación de certificación, soporte universal ni publicación remota.

