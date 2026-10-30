# Guía de sustentación de ProyectoBanco

## Idea central para explicar el proyecto

ProyectoBanco simula transferencias en COP. React permite operar; Spring Boot valida y confirma; PostgreSQL conserva usuarios, cuentas, apertura y transferencias. Una operación confirmada cambia ambos saldos y produce histórico y comprobante QR. Todo el dinero es ficticio.

## Conceptos que debes dominar

| Concepto | Explicación aplicada |
| --- | --- |
| Full stack | Interfaz, API y base de datos trabajan juntas; cada capa tiene responsabilidades distintas. |
| React | Componentes tipados presentan formularios y páginas; React Router separa módulos. |
| Spring Boot | Una aplicación Java expone HTTP, coordina servicios, seguridad y persistencia. |
| API REST | Endpoints bajo /api intercambian JSON y códigos HTTP. La sesión identifica al titular. |
| PostgreSQL | Motor relacional con claves, restricciones, decimales y transacciones reales. |
| Monolito modular | Un despliegue y módulos auth/account/transfer/movement; no son microservicios. |
| Controlador | Recibe HTTP, valida el DTO y llama al servicio; no debe concentrar reglas monetarias. |
| Servicio | Aplica el caso de uso y la frontera transaccional. |
| Repositorio | Consulta o persiste; JPA para entidades y JDBC para histórico y consultas específicas. |
| Entidad | Representación persistente de User, Account o Transfer. |
| DTO | Datos del contrato HTTP; los records no exponen el hash de contraseña ni toda la entidad. |
| @Transactional | El proxy Spring confirma o revierte el conjunto de cambios del servicio. |
| BigDecimal | Aritmética decimal exacta para dinero, junto a NUMERIC(19,2). |
| Bloqueo | Dos operaciones esperan por las mismas cuentas; se bloquean en orden de ID. |
| Rollback | Una falla revierte débito, crédito y registro; no se arregla manualmente sólo un saldo. |
| Idempotencia | La misma intención conserva UUID y contenido, y devuelve la misma referencia sin otro débito. |
| Histórico | Vista combinada de apertura y transferencias; SENT/RECEIVED dependen del participante. |
| QR | JSON informativo del recibo confirmado; no está firmado ni autoriza pagos. |

## Modelo y relaciones

app_user tiene una account mediante owner_id UNIQUE. Cada account tiene una opening_movement con account_id como PK/FK. bank_transfer referencia dos cuentas distintas, origen y destino. Una cuenta participa en muchas transferencias. La restricción única de origen y clave de idempotencia protege la identidad de la intención. Consulta el diagrama del informe.

## Recorrido técnico de una transferencia

1. React valida destino/monto y muestra revisión.
2. El coordinador guarda UUID y datos por titular antes del POST.
3. Sesión y CSRF autentican y protegen la mutación; el origen sale del principal.
4. TransferService valida y bloquea ambas cuentas por ID ascendente.
5. Relee saldos y replay; si ya existe una intención idéntica devuelve el recibo.
6. Verifica fondos/límite, debita, acredita y guarda en una transacción.
7. Después del commit devuelve resultado; React actualiza datos y genera QR.
8. Si se pierde la respuesta, comprobar por clave o reenviar la misma intención. Nunca crear otra para resolver la incertidumbre.

## Seguridad y límites

PBKDF2 protege contraseñas almacenadas. La sesión usa cookie HttpOnly/SameSite=Lax, rota al acceder y caduca por inactividad de 30 minutos. Las mutaciones exigen CSRF. Cada consulta verifica titular o participante. El HTTP local y Secure=false son sólo para loopback; no presentar esta configuración como banca productiva.

## Qué prueban las suites

- Vitest: funciones pequeñas de dinero, validación, cliente HTTP, pendiente, rutas y filtros.
- JUnit: servicios y restricciones sobre PostgreSQL real, incluyendo rollback, gasto concurrente, replay y privacidad. Un caso adicional prueba inactividad.
- Playwright: recorrido real HTTP/navegador, QR decodificado con jsQR y reinicio del backend para persistencia.
- Build/lint/formato/Javadoc: calidad de construcción y documentación; no sustituyen las pruebas funcionales.

Resultado nuevo: 14 Java + 21 Vitest + 15 Playwright, 50 aprobadas, 0 fallidas y 0 omitidas. Ver logs de la entrega; no confundir este total con las etapas históricas.

## Preguntas probables y respuestas

**¿Por qué un monolito?** El ejercicio no requiere servicios distribuidos. Los módulos separan responsabilidades y una transacción local protege ambos saldos.

**¿Por qué no double?** Su representación binaria puede introducir aproximaciones. Se valida la cadena antes de construir BigDecimal y se persiste NUMERIC.

**¿Qué pasa si se corta Internet después del débito?** La respuesta es incierta, no un rechazo. Se consulta by-key o reintenta el mismo UUID/payload; no otro débito.

**¿Dos envíos simultáneos pueden sobregirar?** Se adquieren locks, se releen saldos y se evalúan fondos dentro de la transacción. Las pruebas concurrentes verifican estos escenarios.

**¿Qué ocurre si falla el crédito?** La excepción revierte también el débito y el registro. Existe prueba con un trigger que falla intencionalmente en bank_test.

**¿Por qué ordenar los locks?** Para que operaciones opuestas no esperen cuentas en órdenes contradictorios; además existe límite de espera.

**¿Por qué no guardar todos los movimientos por duplicado?** La apertura está persistida y las transferencias se consultan con perspectiva del titular. Un registro produce enviado y recibido según quién consulta.

**¿El QR certifica una transferencia auténtica?** No. Resume datos confirmados dentro de la simulación; no tiene firma ni sirve como autorización de pago.

**¿La búsqueda incluye todo el histórico?** No. Sólo la página cargada. El contrato actual acepta page/size; una búsqueda global necesitaría ampliar API y pruebas.

**¿Qué aporta HashRouter?** Rutas independientes, historial y recarga sin pedir al servidor una ruta de frontend inexistente. El hash no se envía en HTTP.

**¿Cuál prueba demuestra persistencia?** persistence.spec.ts reinicia realmente el backend y vuelve a consultar saldo/histórico/apertura.

**¿La aplicación está lista para un banco real?** No. Es académica y local, sin auditoría productiva ni integración financiera.

## Guion de demostración de ocho a diez minutos

1. Mostrar README, objetivo y advertencia de dinero ficticio. Abrir el informe/diagrama.
2. Acceder con un titular de demostración. No proyectar contraseñas ni configuración privada.
3. Mostrar Resumen, saldo y número; explicar apertura única. Registrar un usuario ficticio sólo si necesitas una cuenta nueva, sabiendo que persiste.
4. Antes de una transferencia nueva, consultar la cuenta destino y anotar ambos saldos. No asumir que vuelven a un millón en cada demo.
5. Transferir un monto pequeño autorizado, revisar datos y confirmar una sola vez. Mostrar recibo, referencia y QR.
6. Abrir Comprobantes y recargar el detalle. Explicar que sólo realiza GET; no pulsar otra vez Confirmar para demostrar recarga.
7. Mostrar Movimientos y sus tipos; explicar alcance de filtros y paginación. Cambiar de titular para mostrar recibido.
8. Reducir ventana y navegar por módulos; cerrar sesión y abrir ruta protegida.
9. Mostrar consultas de lectura en pgAdmin y resultados de pruebas. Explicar idempotencia, rollback y concurrencia con los tests, sin forzar errores en demo.
10. Cerrar con límites, repositorio developer y documentos. La transferencia previa de 50000 COP está registrada: no repetirla para simular la misma evidencia.

## SQL de sólo lectura para pgAdmin

Conectar al clúster del proyecto, host 127.0.0.1, puerto 55432, base bank_demo. Obtener credenciales localmente; no ponerlas en diapositivas. No usar bank_test para la sustentación mientras corren suites.

```sql
BEGIN TRANSACTION READ ONLY;
SELECT current_database(), current_setting('server_version');
SELECT right(number,4) AS cuenta, balance, opened_at
FROM account ORDER BY id;
SELECT right(s.number,4) AS origen, right(d.number,4) AS destino,
       t.amount, t.created_at, t.id AS referencia
FROM bank_transfer t
JOIN account s ON s.id=t.source_id
JOIN account d ON d.id=t.target_id
ORDER BY t.created_at DESC LIMIT 10;
SELECT count(*) AS cuentas, sum(balance) AS saldo_total FROM account;
SELECT count(*) AS aperturas, sum(amount) AS total_apertura
FROM opening_movement;
SELECT source_id, idempotency_key, count(*)
FROM bank_transfer GROUP BY source_id,idempotency_key HAVING count(*)>1;
COMMIT;
```

No ejecutar SELECT * sobre app_user: expondría hashes y datos innecesarios. Las consultas de suma son explicativas; si hubo nuevas aperturas, cambia el total inicial. Nunca ejecutar UPDATE, DELETE o TRUNCATE para ajustar una demostración.

## Lista antes de entregar

Completar portada; abrir ambos PDF; verificar enlaces; revisar git diff en developer; preparar commit local sólo si se autoriza. No hacer push ni merge a main automáticamente.
