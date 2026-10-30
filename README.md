# Banco académico

Simulación full stack de transferencias entre cuentas en pesos colombianos. **Todo el dinero es ficticio.** Registro, inicio de sesión, cuenta automática con $1.000.000 COP, histórico privado y comprobante QR. Proyecto académico del Tecnológico de Antioquia; enunciado de entrega: 30 de octubre de 2026.

## Herramientas
Java Temurin 25, Maven 3.9.16 (wrapper incluido), Spring Boot 4.1.2, Spring Security/Data JPA y PostgreSQL 18.6. React 19.3.1, TypeScript 6.0.3 y Vite 8.3.5 con Node 24 y npm. Versiones frontend exactas en frontend/package-lock.json, dependencias Spring en BOM. La entrega original está en [verificación 001](specs/001-transferencias-bancarias/verification.md) y la revisión modular en [verificación 002](specs/002-revision-modular/verification.md).

## Ejecutar en Windows

Requisitos: JDK25, Node24/npm, PostgreSQL18 con sus herramientas en `C:/Program Files/PostgreSQL/18/bin` y acceso a Maven Central/npm en la primera preparación. PowerShell desde esta carpeta. No hace falta Docker ni modificar el servicio PostgreSQL existente.

```powershell
# Clúster propio en .local/pgdata, puerto 55432; no toca bases existentes.
./scripts/local-db.ps1
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend run build
./backend/mvnw.cmd -f backend/pom.xml -B -ntp -DskipTests package
./scripts/start-backend.ps1 -Mode demo
```

Abrir [la aplicación local](http://127.0.0.1:8080). React se incluye dentro del JAR cuando se compila frontend antes de Maven. El backend sólo escucha en loopback. Esperar el mensaje `Started BankApplication` en .local/backend-demo.log; el primer arranque puede tardar varios segundos.

Usuarios **ficticios públicos de demostración**: `ana@example.test` y `luis@example.test`; contraseña de muestra `Academia2026!`. Sus cuentas se crean sólo en perfil demo. El número de cuenta se consulta iniciando sesión como cada uno; no se asume un número fijo en la interfaz. También puedes registrarte con un correo de ejemplo y contraseña de 12–128 caracteres. Los datos no se reinician al arrancar ni al cerrar sesión.

```powershell
# Detener únicamente el backend de este proyecto.
./scripts/stop-backend.ps1 -Mode demo
```

No ejecutar start-backend dos veces para el mismo modo. Para cambiar el directorio de herramientas PostgreSQL: `./scripts/local-db.ps1 -PostgresBin 'ruta/al/bin'`. El script crea roles y bases bank_demo/bank_test en el clúster aislado y guarda contraseñas aleatorias sólo en .local/database.json, ignorado. No compartir .local ni usar credenciales personales aquí. Para detener el clúster, detener primero los backends y usar `pg_ctl -D .local/pgdata -m fast stop` desde el directorio bin de PostgreSQL.

## Desarrollo y configuración

Para hot reload: mantener backend demo y ejecutar `npm.cmd --prefix frontend run dev`; abrir http://127.0.0.1:5173. Vite reenvía /api a 8080. Las pruebas de navegador usan 8081 contra bank_test, nunca demo. Playwright utiliza su propio servidor Vite en 5187; el desarrollo puede continuar en 5173.

Variables del backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, opcional `PORT` (8080 por defecto), `COOKIE_SECURE` (false sólo para localhost HTTP). Los scripts configuran el entorno del proceso sin imprimir credenciales. Sesión de servidor con cookie HttpOnly/SameSite=Lax, CSRF y caducidad de 30 minutos de inactividad; sin tokens en localStorage. No exponer este perfil HTTP fuera del equipo. Cualquier hosting requiere configuración HTTPS y autorización separada.

## Pruebas

Las suites de backend y UI comparten bank_test y deben ejecutarse **en secuencia**, no en paralelo. El backend de pruebas no debe usarse como demo. La suite JUnit comprueba el nombre/rol/URL dedicados antes de limpiar datos de test. test-backend ejecuta el goal test sin reemplazar el JAR activo; el empaquetado se comprueba por separado y requiere detener sus procesos Java primero.

```powershell
./scripts/test-backend.ps1
npm.cmd --prefix frontend run test -- --run
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
# Instalar el navegador una vez desde frontend:
Push-Location frontend
npm.cmd exec playwright install chromium
Pop-Location
./scripts/test-ui.ps1
./backend/mvnw.cmd -f backend/pom.xml -B -ntp javadoc:javadoc
```

JUnit verifica transacciones/locks con PostgreSQL real; no H2. La falla SQL intencional de la prueba de rollback es esperada, no un error de producción. Playwright prueba HTTP, CSRF, registro/acceso, dinero exacto, histórico, respuesta perdida, reintentos y decodifica el QR con jsQR, separado del generador. Javadoc se genera en backend/target/reports/apidocs. Build o lint no certifican apariencia ni accesibilidad; ver evidencia y límites en la especificación.

## Arquitectura y contratos

Un backend Spring y una SPA React. [Plan](specs/001-transferencias-bancarias/plan.md), [especificación](specs/001-transferencias-bancarias/spec.md) y [tareas](specs/001-transferencias-bancarias/tasks.md). En backend: módulos auth, account, transfer y movement con controlador, DTO y servicio propios; entidades/repositorios JPA por funcionalidad. shared contiene seguridad, configuración y errores. TransferService conserva toda la transacción monetaria; MovementQueryRepository concentra el histórico SQL. Sin microservicios, brokers ni interfaces de servicio especulativas.

Principales rutas bajo `/api`: auth/csrf, auth/register, auth/login, auth/logout, auth/me, account, movements, transfers, transfers/by-key/{key} y transfers/{reference}. Registro/login/transfer reciben JSON; toda mutación exige el encabezado X-CSRF-TOKEN obtenido del endpoint csrf. Transfer requiere Idempotency-Key UUID y `{ "targetAccountNumber": "12 dígitos", "amount": "150000.00" }`; el origen se obtiene de la sesión. Campos de contrato en inglés; mensajes visibles en español.

El monto viaja como cadena, se valida antes de convertir y se calcula con BigDecimal/NUMERIC(19,2). No se admiten valores no positivos ni precisión extra. Se bloquean las dos cuentas en orden de ID; débito/crédito/registro confirman juntos. Reintentos de la misma intención conservan clave y payload. La restricción única y la relectura tras bloqueo previenen duplicados; una clave usada con otro contenido se rechaza.

Una respuesta perdida no implica rechazo: comprobar by-key o reenviar la misma operación. Un error de generación de QR no repite la transferencia. QR JSON v1 contiene referencia, fecha UTC, monto/COP y cuentas con sólo últimos cuatro dígitos; es un resumen sin firma y no autoriza pagos. El histórico combina apertura y enviados/recibidos propios.

## Recuperación y límites

SQL inicial versionado en backend/src/main/resources/db/schema.sql; Hibernate validate, sin ddl-auto=update. Respaldar la base dedicada antes de cambios de esquema/datos y probar restauración en otra base aislada. No borrar movimientos o reiniciar saldos para fingir reversión de una transferencia confirmada. Para comenzar una nueva demostración desde cero se necesita una base dedicada nueva o una restauración explícitamente autorizada.

Una cuenta por usuario, sólo COP y saldo inicial ficticio único. Fuera de alcance: dinero real, préstamos, tarjetas, depósitos/retiros posteriores, administrador, recuperación de contraseña o verificaciones de identidad. No se afirma certificación bancaria, cumplimiento regulatorio ni auditoría WCAG completa. Publicación en GitHub y despliegue son operaciones separadas que no se han realizado.

[Informe](docs/informe.md) · [Prompts utilizados](docs/prompts.md).


## Estructura por funcionalidad

```text
backend/src/main/java/co/edu/tdea/bank/
  BankApplication.java
  auth/{controller,dto,service,entity,repository}
  account/{controller,dto,service,entity,repository}
  transfer/{controller,dto,service,entity,repository}
  movement/{controller,dto,service,repository}
  shared/{config,security,exception}
frontend/src/
  app/{App.tsx,useBanking.ts}
  features/{auth,account,transfer,history,receipt}
  shared/{api,types,utils}
  styles/styles.css
scripts/                   # entorno aislado y comprobaciones
docs/{informe,prompts}.md   # entrega académica
specs/002-revision-modular/ # plan y evidencia de revisión
```

Los módulos son paquetes dentro de una aplicación, sin llamadas remotas entre servicios. No se agregan interfaces de servicio. El esquema PostgreSQL permanece sin migración. La comunicación HTTP y los campos JSON conservan su contrato.

## Guía desde una copia nueva

Cuando exista un repositorio publicado, clonar su URL con Git y abrir la carpeta ProyectoBanco. La URL todavía no se ha publicado; también se puede usar una copia local de los archivos. Ejecutar todos los bloques anteriores desde la raíz. Comprobar `java -version`, `node --version`, `npm.cmd --version` y la existencia de herramientas PostgreSQL antes de instalar. Maven Wrapper descarga Maven automáticamente. En una terminal de desarrollo se inicia backend con el script demo y, en otra, Vite. Para el JAR integrado no hace falta mantener Vite abierto.

| Variable | Uso | Configuración local |
| --- | --- | --- |
| DB_URL | JDBC PostgreSQL | Script apunta a bank_demo o bank_test en 55432 |
| DB_USERNAME / DB_PASSWORD | Rol y contraseña | Generados localmente; nunca copiarlos al repositorio |
| PORT | Puerto HTTP | 8080 por defecto; test usa 8081 |
| COOKIE_SECURE | Cookie sobre HTTPS | false exclusivamente en HTTP local |
| TEST_DB_URL / TEST_DB_USERNAME / TEST_DB_PASSWORD | Integración JUnit | Configuradas por test-backend.ps1 |
| BANK_API_TARGET | Proxy Vite | 8080 por defecto; Playwright usa 8081 |

## Endpoints principales

| Método | Ruta /api | Resultado |
| --- | --- | --- |
| GET | /auth/csrf | Token y nombre de encabezado; sin caché |
| POST | /auth/register | Identidad creada (201), cuenta y apertura atómicas |
| POST | /auth/login | Identidad y sesión (200) |
| POST | /auth/logout | Invalida sesión (204) |
| GET | /auth/me | Identidad propia |
| GET | /account | Cuenta propia y saldo decimal |
| GET | /movements?page=0&size=20 | Página propia OPENING/SENT/RECEIVED |
| POST | /transfers | Comprobante 201; replay idéntico 200 |
| GET | /transfers/by-key/{key} | Resultado confirmado propio; 404 no prueba rechazo de una petición en curso |
| GET | /transfers/{reference} | Comprobante sólo para participantes |

## Formato y verificación conjunta

Prettier se fija como herramienta de desarrollo, sin efecto en producción.

```powershell
npm.cmd --prefix frontend run format
npm.cmd --prefix frontend run format:check
# Detiene ambos backends propios antes de reemplazar el JAR.
./scripts/local-db.ps1
./scripts/check-all.ps1
# Volver a abrir la demostración después de comprobar:
./scripts/start-backend.ps1 -Mode demo
```

No se deben ejecutar simultáneamente suites sobre bank_test. El runner guarda comandos, tiempos y códigos de salida bajo specs/002-revision-modular/evidence/checks. Para una referencia independiente puede indicarse -EvidenceDirectory. Antes de un futuro commit revisar git status y los archivos a incluir; no publicar .local, .env, volcados, certificados privados ni artefactos de compilación. La preparación local no crea un repositorio remoto.

## Identidad visual

El rediseño fintech utiliza Manrope variable servida localmente, paleta índigo/tinta/lavanda e iconos SVG propios. [Licencia de la fuente](frontend/public/fonts/OFL.txt). Navegación por módulos con React Router, reflujo y foco mantienen el recorrido existente; se respeta movimiento reducido. Backend, cliente HTTP y lógica monetaria conservados mediante comparación de hashes. [Diseño y evidencia](specs/003-rediseno-fintech/verification.md).

Para guardar comprobaciones de esta entrega sin sobrescribir evidencias anteriores:

```powershell
./scripts/local-db.ps1
./scripts/check-all.ps1 -EvidenceDirectory specs/004-navegacion-modulos/evidence/checks
./scripts/start-backend.ps1 -Mode demo
```

## Navegación bancaria por módulos

React Router8.5.0 utiliza HashRouter: URLs como `/#/resumen` permiten recargar enlaces del cliente servido por el JAR sin modificar Spring. Layouts de autenticación y banca comparten componentes y contexto; cambiar de ruta no reinicia la sesión ni envía transferencias.

| Ruta del cliente | Contenido |
| --- | --- |
| /#/login y /#/registro | Acceso y alta |
| /#/resumen | Saldo, cuenta, accesos y cinco movimientos recientes |
| /#/transferencias | Datos, revisión, confirmación y QR |
| /#/movimientos | Histórico paginado; búsqueda y tipo sobre la página cargada |
| /#/comprobantes | Transferencias de la página, enviadas y recibidas |
| /#/comprobantes/:reference | Consulta GET del comprobante autorizado; recarga sin débito |
| /#/perfil | Nombre, correo y cuenta reales, sólo lectura |

La apertura no tiene comprobante. El backend sólo admite page/size: búsqueda global y totales filtrados requerirían ampliar el contrato; no se simulan. Sin endpoints ni esquema nuevos. [Verificación de módulos](specs/004-navegacion-modulos/verification.md).
