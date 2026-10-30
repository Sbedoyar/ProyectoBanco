# Prompts y decisiones utilizados

Registro del trabajo asistido en esta conversación. Las citas siguientes son solicitudes reales del usuario; las decisiones indicadas como resumen no son prompts inventados ni instrucciones atribuidas al profesor.

| Etapa | Prompt o respuesta real | Resultado |
| --- | --- | --- |
| Onboarding | Invocación de omni-init | Inventario y contexto del proyecto |
| Fuente académica | «Acabo de subir un PDF, revisalo» | Lectura del ejercicio de la página 11 y detección de contradicción Angular/React |
| Discusión | «El frontend lo requiero con react y el backend tiene que estar documentado con javadoc» | React y Javadoc confirmados |
| Acceso | «Si, necesita inicio de sesion» y consulta sobre alcance | Propuesta de registro/cuenta automática |
| Alcance | «Tu recomendacion me gusta, apliquemosla»; confirmó saldo ficticio, COP y cuenta automática | Simulación acordada; registro y transferencias entre cuentas |
| Saldo | «Me parece perfecto» a $1.000.000 COP inicial y reglas propuestas | Decisión de alcance registrada |
| Requisitos | Invocación de omni-specify | Criterios estables y exclusiones |
| Diseño | Invocación de omni-plan | API, persistencia, sesiones, reintentos, QR, UI y verificación |
| Aclaraciones de diseño | «Aprobar propuesta», «Hasta dos decimales», «Delego esas decisiones técnicas y visuales» | Nombre/correo/contraseña; 30 minutos de sesión; precisión; herramientas y UI delegadas |
| Tareas | Invocación de omni-tasks | Once tareas trazadas a criterios |
| Implementación | Invocación de omni-implement | Código de backend/frontend, scripts, pruebas y documentación |

## Resumen de instrucciones operativas del asistente

Se aplicaron las skills del proyecto invocadas por el usuario. El asistente inspeccionó el repositorio, consultó fuentes oficiales registradas en el plan, escribió el código y ejecutó comandos de compilación/documentación/pruebas. Las instrucciones de implementación se derivaron del alcance aprobado: validar titularidad, exactitud monetaria, atomicidad, concurrencia, identidad de reintento, histórico privado y QR desde comprobante confirmado. Este párrafo resume el proceso, no reproduce un prompt literal de generación separado.

Las herramientas ejecutadas y sus resultados están en [verification.md](../specs/001-transferencias-bancarias/verification.md). No se incluyen contraseñas reales, tokens, contenido de configuración local ni prompts de sistema. Los únicos datos de acceso documentados en README son usuarios ficticios públicos de demostración.


## Solicitud literal de revisión — 24 de octubre de 2026

```text
Quiero que realices una revisión completa y una mejora controlada del proyecto existente `ProyectoBanco`.

IMPORTANTE: este proyecto YA FUNCIONA. No debes reconstruirlo desde cero ni reemplazar funcionalidades correctas innecesariamente. Primero inspecciona completamente el backend, frontend, base de datos, pruebas, scripts y documentación existente. Después realiza una refactorización incremental conservando el comportamiento actual.

OBJETIVO ACADÉMICO

El proyecto debe cumplir completamente con el siguiente ejercicio:

“Generar una aplicación completa para hacer el traslado de dinero entre cuentas en un banco. Debe mostrar el histórico de transacciones y, cuando se genere el resultado de la transacción, mostrar un código QR con los datos básicos de la transacción codificados. Se debe entregar informe del ejercicio, código en GitHub y prompts utilizados.”

Fecha de entrega: 30 de octubre de 2026.

Actualmente el proyecto ya implementa transferencias, histórico, QR, registro, login, PostgreSQL, seguridad, validaciones, concurrencia, idempotencia, pruebas y documentación. Debes conservar y mejorar estas funcionalidades.

REGLAS IMPORTANTES

- No elimines funcionalidades existentes que estén funcionando.
- No simplifiques reglas de seguridad o integridad existentes.
- No reemplaces BigDecimal por double o float.
- No elimines la idempotencia de transferencias.
- No elimines los bloqueos/transacciones utilizados para proteger los saldos.
- No cambies PostgreSQL por H2 para las pruebas de integración que requieren comportamiento real.
- No elimines CSRF, autenticación, autorización ni manejo de sesiones.
- No cambies React por Angular.
- No conviertas el proyecto en microservicios.
- No agregues complejidad sin una razón concreta.
- No modifiques contratos HTTP innecesariamente.
- Si debes modificar un endpoint o DTO, actualiza frontend y pruebas correspondientes.
- Todos los nombres de clases, métodos, variables, atributos y paquetes Java deben permanecer en inglés.
- Los DTO del backend deben implementarse con Java records cuando corresponda.
- Todo método público no trivial del backend debe tener Javadoc claro y actualizado.
- No deben existir secretos, contraseñas reales o datos locales dentro del repositorio Git.
- Antes y después de cambios importantes ejecuta las pruebas correspondientes.

ARQUITECTURA OBJETIVO DEL BACKEND

Quiero mantener una sola aplicación Spring Boot y una sola base de datos PostgreSQL, utilizando un MONOLITO MODULAR organizado principalmente por funcionalidad.

Reorganiza progresivamente el paquete `co.edu.tdea.bank` aproximadamente de la siguiente manera:

co.edu.tdea.bank
├── BankApplication.java
├── auth
│   ├── controller
│   ├── dto
│   ├── service
│   ├── entity
│   └── repository
├── account
│   ├── controller
│   ├── dto
│   ├── service
│   ├── entity
│   └── repository
├── transfer
│   ├── controller
│   ├── dto
│   ├── service
│   ├── entity
│   └── repository
├── movement
│   ├── controller
│   ├── dto
│   ├── service
│   └── repository
└── shared
    ├── config
    ├── security
    └── exception

Esta estructura es una referencia. Puedes realizar pequeños ajustes si existe una razón arquitectónica clara, pero conserva el principio de monolito modular por funcionalidad.

Refactoriza el actual `BankController` para evitar que un solo controlador maneje autenticación, cuentas, movimientos y transferencias.

Preferiblemente deben existir responsabilidades similares a:

- AuthController
- AccountController
- TransferController
- MovementController

Refactoriza el actual `BankService` para evitar que concentre registro, usuarios, cuentas, histórico y transferencias en una única clase.

Utiliza servicios cohesivos, por ejemplo:

- AuthService
- AccountService
- TransferService
- MovementService

No dividas servicios artificialmente. Cada servicio debe agrupar operaciones relacionadas.

La transacción monetaria completa debe permanecer dentro de un único límite transaccional y continuar garantizando:

- débito del origen;
- crédito del destino;
- registro de la transferencia;
- rollback completo ante cualquier error;
- protección frente a concurrencia;
- saldo nunca negativo;
- idempotencia ante reintentos.

SEPARACIÓN DE ARCHIVOS

Actualmente existen archivos que contienen varios tipos, como `Contracts.java` y `Repositories.java`.

Organízalos en archivos separados cuando mejore la claridad.

Ejemplos:

- RegistrationRequest
- LoginRequest
- IdentityResponse
- AccountResponse
- TransferRequest
- TransferReceiptResponse
- MovementResponse
- MovementPageResponse
- ErrorResponse

Mantén los DTO apropiados como Java records.

Igualmente, separa:

- UserRepository
- AccountRepository
- TransferRepository

en sus archivos y módulos correspondientes.

PERSISTENCIA

Conserva PostgreSQL, Spring Data JPA y el esquema existente.

Revisa el uso directo de `JdbcTemplate` dentro de servicios.

Cuando exista SQL específico para consultas de histórico o read models, aísla esas consultas en una clase de repositorio/query repository apropiada en lugar de dejar SQL dentro del servicio de aplicación.

No cambies una consulta correcta simplemente por utilizar JPA si hacerlo empeora la implementación.

Mantén:

- BigDecimal en Java;
- NUMERIC(19,2) en PostgreSQL;
- restricciones de integridad;
- claves únicas;
- idempotency key;
- índices necesarios;
- bloqueo seguro de cuentas;
- actualización atómica.

FRONTEND

Conserva React + TypeScript + Vite.

El frontend actual funciona y visualmente tiene una buena base. No quiero reemplazarlo por un diseño completamente diferente.

Quiero mejorar tanto la arquitectura del código como la experiencia visual.

Organiza `src` aproximadamente así:

src
├── app
│   └── App.tsx
├── features
│   ├── auth
│   ├── account
│   ├── transfer
│   ├── history
│   └── receipt
├── shared
│   ├── api
│   ├── components
│   ├── types
│   └── utils
└── styles

Divide los componentes actuales cuando tengan demasiadas responsabilidades.

Especialmente revisa:

- App.tsx
- AccountPanel.tsx
- api.ts
- domain.ts
- styles.css

No quiero componentes enormes ni código comprimido en líneas excesivamente largas.

Formatea correctamente todos los archivos TypeScript, TSX y CSS.

Puedes configurar Prettier si resulta conveniente y compatible con el proyecto.

Separa componentes visuales reutilizables cuando sea útil, pero no generes componentes artificiales de pocas líneas sin valor.

La interfaz final debe mostrar claramente:

- login;
- registro;
- usuario autenticado;
- cuenta propia;
- número de cuenta;
- saldo;
- moneda COP;
- formulario de transferencia;
- revisión previa de transferencia;
- estado de procesamiento;
- errores de validación;
- transferencia confirmada;
- datos del comprobante;
- código QR;
- histórico;
- transferencias enviadas;
- transferencias recibidas;
- saldo inicial;
- cierre de sesión;
- aviso visible de que se trata de una simulación académica.

MEJORAS DE EXPERIENCIA

Conserva la identidad visual actual y mejórala de manera sutil.

Revisa:

- responsive desktop/tablet/móvil;
- espaciados;
- estados disabled;
- estados loading;
- mensajes de error;
- mensajes de éxito;
- foco de teclado;
- labels accesibles;
- contraste;
- histórico vacío;
- referencia de transferencia;
- presentación del comprobante;
- presentación del QR.

Puedes incorporar acciones como copiar la referencia del comprobante o guardar el QR si pueden implementarse limpiamente, pero no son obligatorias y nunca deben interferir con la transferencia.

Generar, regenerar, copiar o guardar el QR NO debe volver a ejecutar una transferencia.

QR

El QR debe generarse únicamente después de que el backend confirme la transacción.

Debe contener al menos:

- referencia de la transferencia;
- fecha;
- monto;
- moneda;
- cuenta origen parcialmente ocultada;
- cuenta destino parcialmente ocultada.

No debe contener:

- contraseña;
- hash;
- cookie;
- CSRF token;
- datos de sesión;
- secretos;
- información sensible innecesaria.

Comprueba mediante una prueba que el QR generado realmente puede decodificarse y que el contenido coincide con la transferencia confirmada.

HISTÓRICO

Verifica que el histórico sea persistente y pertenezca únicamente al usuario autenticado.

Debe distinguir claramente:

- OPENING;
- SENT;
- RECEIVED.

Debe mostrar, cuando corresponda:

- fecha;
- monto;
- moneda;
- contraparte parcialmente ocultada;
- referencia.

SEGURIDAD

Conserva y revisa:

- Spring Security;
- passwords almacenadas mediante hash seguro;
- sesión de servidor;
- cookie HttpOnly;
- SameSite;
- CSRF;
- logout;
- expiración por inactividad;
- autorización por usuario;
- protección para que un usuario no pueda consultar cuenta, histórico o transferencias privadas de otro.

No confíes en identificadores enviados por el frontend para determinar la cuenta origen. La cuenta origen debe continuar obteniéndose de la identidad autenticada.

PRUEBAS

Esta parte es prioritaria.

Antes de considerar terminada la refactorización debes verificar que existe cobertura real sobre todos los requerimientos del ejercicio.

Conserva las pruebas actuales y agrega únicamente las que falten.

Backend:

- registro;
- correo duplicado;
- login correcto;
- login incorrecto;
- usuario no autenticado;
- consulta de cuenta propia;
- transferencia correcta;
- monto cero;
- monto negativo;
- monto con más de dos decimales;
- saldo insuficiente;
- cuenta destino inexistente;
- misma cuenta;
- transferencia por saldo completo;
- actualización exacta de ambos saldos;
- rollback si falla parte de la operación;
- transferencias concurrentes;
- idempotencia;
- reutilización incorrecta de una idempotency key;
- histórico enviado;
- histórico recibido;
- privacidad del histórico;
- persistencia;
- expiración de sesión.

Frontend/unitarias:

- validación de montos;
- formato monetario;
- generación del payload QR;
- comportamiento del formulario;
- manejo de errores relevantes;
- operación pendiente/reintento.

E2E con Playwright:

Realiza como mínimo un recorrido completo:

Usuario A inicia sesión
→ consulta saldo
→ transfiere dinero al usuario B
→ backend confirma
→ aparece comprobante
→ aparece QR
→ el QR se decodifica correctamente
→ el histórico de A muestra SENT
→ usuario A cierra sesión
→ usuario B inicia sesión
→ el histórico de B muestra RECEIVED
→ los saldos de ambas cuentas son correctos.

También verifica que recargar la aplicación no elimine las transacciones.

VERIFICACIÓN FINAL

Al terminar ejecuta, utilizando los comandos compatibles con el sistema operativo del proyecto:

Backend:
- tests;
- build/package;
- generación de Javadoc.

Frontend:
- unit tests;
- lint;
- build.

Integración:
- pruebas con PostgreSQL real;
- Playwright E2E;
- decodificación real del QR.

No declares que algo funciona únicamente porque compila.

No elimines una prueba para conseguir un build verde.

Si una prueba falla, corrige la causa.

DOCUMENTACIÓN

Actualiza README.md para que una persona que clone el repositorio pueda ejecutar el proyecto sin conocimiento previo.

Debe incluir:

- descripción;
- objetivo académico;
- funcionalidades;
- arquitectura;
- estructura de carpetas;
- stack;
- requisitos;
- instalación;
- configuración PostgreSQL;
- variables de entorno;
- cómo ejecutar backend;
- cómo ejecutar frontend;
- cómo ejecutar pruebas;
- endpoints principales;
- usuarios demo si corresponde;
- explicación del QR;
- advertencia de que todo el dinero es ficticio;
- limitaciones;
- enlace al informe;
- enlace a prompts utilizados.

INFORME

Revisa y mejora `docs/informe.md`.

Debe quedar preparado para convertirlo posteriormente a Word/PDF y contener:

1. Portada.
2. Introducción.
3. Objetivo general.
4. Objetivos específicos.
5. Descripción del problema.
6. Requerimientos.
7. Tecnologías utilizadas.
8. Arquitectura.
9. Estructura del proyecto.
10. Modelo de datos.
11. Funcionamiento de registro/login.
12. Funcionamiento de cuentas.
13. Flujo de una transferencia.
14. Manejo transaccional.
15. Histórico.
16. Generación y contenido del QR.
17. Endpoints.
18. Validaciones.
19. Seguridad.
20. Pruebas realizadas.
21. Resultados de pruebas.
22. Capturas principales.
23. Conclusiones.
24. URL del repositorio GitHub cuando se publique.

PROMPTS

Actualiza `docs/prompts.md`.

Conserva los prompts reales utilizados y agrega este prompt como parte del historial de desarrollo.

No inventes prompts que nunca se utilizaron.

GITHUB Y LIMPIEZA

Prepara el proyecto para GitHub.

Comprueba `.gitignore` y asegúrate de NO publicar:

- `.local/`;
- bases de datos locales;
- contraseñas;
- `.env`;
- `node_modules/`;
- `target/`;
- `dist/`;
- `test-results/`;
- `playwright-report/`;
- logs;
- archivos temporales;
- credenciales.

Revisa `git status` antes de cualquier commit.

No realices push a un repositorio remoto sin que yo lo autorice expresamente.

RESULTADO QUE ESPERO

Al finalizar quiero recibir un resumen con:

- arquitectura final;
- árbol principal de carpetas;
- archivos creados;
- archivos movidos;
- archivos modificados;
- decisiones arquitectónicas;
- funcionalidades preservadas;
- mejoras del frontend;
- pruebas agregadas;
- número total de pruebas ejecutadas;
- resultado de cada suite;
- requisitos del ejercicio cubiertos;
- posibles pendientes;
- instrucciones exactas para ejecutar el proyecto.

Prioridad máxima:

1. No romper lo existente.
2. Cumplir el ejercicio del profesor al 100%.
3. Mejorar organización y mantenibilidad.
4. Tener una interfaz limpia y profesional.
5. Tener pruebas que demuestren el funcionamiento.
6. Dejar README, informe y prompts listos para la entrega.
7. Dejar el repositorio limpio y preparado para GitHub.

Trabaja incrementalmente. Después de cada refactorización estructural importante, compila y ejecuta las pruebas relevantes antes de continuar.
```


## Solicitud literal de rediseño con frontend-design — 24 de octubre de 2026

```text
Utiliza la skill `frontend-design` para realizar un rediseño visual profesional de ProyectoBanco.
Quiero transformar la aplicación actual en una plataforma bancaria digital moderna, elegante y visualmente atractiva.
Rediseña de manera coherente el login, registro, dashboard, tarjeta de saldo, formulario de transferencia, histórico y comprobante QR.
Toma como referencia la calidad visual de aplicaciones fintech modernas, con una composición cuidada, excelente tipografía, iconografía consistente, colores elegantes, componentes reutilizables y animaciones sutiles.
Puedes realizar cambios importantes en la apariencia y distribución de los elementos. No quiero únicamente modificar colores y márgenes: quiero una mejora visual evidente respecto al diseño actual.
Mantén React, TypeScript y la arquitectura modular existente.
**Es obligatorio conservar intactas las funcionalidades del proyecto.** No modifiques el backend, las API, la base de datos, la seguridad ni la lógica de transferencias.
Asegúra
```

El texto recibido termina en «Asegúra». No se atribuyen instrucciones adicionales al usuario.

## Solicitud de navegación modular —24-10-2026

Fragmento literal del prompt del usuario: «Transformar el frontend actual en una aplicación bancaria profesional con navegación real por módulos, mediante React Router y páginas independientes.»

Requisitos adicionales del mismo mensaje (síntesis, no transcripción): conservar azul profundo/violeta/blanco y arquitectura features; Resumen acotado, Transferencias independiente, Movimientos paginados con filtros compatibles, Comprobantes recuperables sin volver a transferir y perfil sólo con datos reales. Layouts, rutas protegidas, estado de sesión/pending/recarga, escritorio y móvil; no cambiar dinero/SQL/seguridad/HTTP innecesariamente. Inspeccionar antes de cambiar; ejecutar build/lint/unit/E2E, documentar. Skill frontend-design solicitada explícitamente.

Acciones del agente: inspección de componentes/endpoints y definición previa de reutilización/rutas; React Router exacto con HashRouter documentado; implementación incremental y regresiones sin agentes ni publicación.
