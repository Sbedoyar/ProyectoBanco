# [SPEC-001] Transferencias bancarias

Fecha: 2026-10-24. Tipo: feature. Estado: implementación y revisión de aceptación registradas. Resultado formal y huella vigente en estado de OmniSpec; evidencia local delimitada en verification.md.

## 0. Clarification and Assumptions
- Necesidad académica: [enunciado](../../SpringBoot%20AI.pdf), p. 11; entrega el 30 de octubre de 2026. El ejemplo de reservas no constituye reglas bancarias.
- Alcance aprobado: [registro de decisión](../.omni/inputs/banking-scope.json) y [contexto](../project-context.md), sección 3. Usuarios finales: participantes de una simulación académica con cuentas propias.
- Confirmado por el usuario: React; backend documentado con Javadoc; registro e inicio de sesión; cuenta automática; COP; saldo ficticio inicial de 1.000.000; histórico y QR. Estas decisiones se implementaron; los resultados y límites se registran por criterio en verification.md.
- Base tecnológica declarada por la guía: Java 25+, Spring Boot 4, JPA y PostgreSQL. Versiones concretas fijadas en pom/lockfile durante implementación, con compatibilidad local comprobada por los checks descritos. Angular descartado por decisión explícita de React.
- ACLARADO por respuestas explícitas durante omni-plan: registro con nombre, correo único y contraseña; acceso por correo; cierre y caducidad de sesión tras 30 minutos de inactividad; regreso al acceso sin reenviar transferencias. COP hasta dos decimales, rechazando mayor precisión sin redondeo silencioso. [Decisión](../.omni/inputs/plan-product-rules.json).
- DISEÑADO bajo delegación técnica y visual explícita: [plan](plan.md) define sesión, API, persistencia, locks, reintentos, QR y UI; versiones y herramientas documentadas con fuentes oficiales. Parches y lockfile fijados; checks ejecutados en el entorno local descrito, sin afirmar compatibilidad universal.

## 1. Necesidad y alcance
Permitir que una persona se registre, reciba una cuenta de demostración, consulte saldo, transfiera dinero ficticio a otra cuenta y vea sus movimientos y el comprobante QR. El backend determina titularidad y resultado; el cliente no puede conceder saldo ni declarar una transferencia confirmada por sí solo.

Incluye dos usuarios de prueba con cuentas, aviso de simulación, persistencia, validación de errores y documentación para reproducir la demostración. No se integra dinero real.

## 2. Acceptance Criteria and Non-Goals
Los criterios siguientes definen resultados esperados. Su estado revisado y evidencia real están en acceptance.json y verification.md; no se deducen resultados de esta lista por sí sola.

- AC-01 [functional]: Un registro válido con nombre, correo único y contraseña crea un usuario y exactamente una cuenta propia con número único generado en backend; repetir una identidad ya registrada no crea otra cuenta ni otro abono de apertura.
- AC-02 [functional]: La cuenta nueva recibe exactamente 1.000.000 COP ficticios una sola vez y un movimiento de apertura por ese importe.
- AC-03 [functional]: Credenciales válidas permiten iniciar sesión; credenciales inválidas no conceden acceso a operaciones protegidas.
- AC-04 [functional]: Una petición sin autenticación no obtiene saldo, movimientos ni capacidad de transferir desde una cuenta protegida.
- AC-05 [functional]: El backend impide a un usuario consultar la cuenta o movimientos de otro o transferir desde una cuenta ajena, incluso manipulando identificadores de petición.
- AC-06 [functional]: El usuario autenticado consulta número de su cuenta, saldo actual y moneda COP.
- AC-07 [functional]: Transferir 150.000 COP entre dos cuentas con 1.000.000 COP cada una produce saldos de 850.000 y 1.150.000 COP y una transferencia confirmada con referencia única.
- AC-08 [functional]: Un monto cero o negativo se rechaza sin cambiar saldos ni registrar una transferencia exitosa.
- AC-09 [functional]: Transferir a una cuenta inexistente se rechaza sin cambiar saldos ni registrar una transferencia exitosa.
- AC-10 [functional]: Transferir a la misma cuenta de origen se rechaza sin cambiar saldos ni registrar una transferencia exitosa.
- AC-11 [functional]: Transferir más que el saldo disponible se rechaza sin cambiar saldos ni registrar una transferencia exitosa; transferir el saldo exacto deja origen en cero.
- AC-12 [functional]: Ante una falla durante la actualización, débito, crédito y registro se confirman juntos o ninguno queda persistido.
- AC-13 [functional]: Dos transferencias concurrentes de 700.000 COP desde una cuenta con 1.000.000 COP no pueden confirmarse ambas ni dejar saldo negativo.
- AC-14 [functional]: Repetir la misma operación por doble envío o reintento produce como máximo un débito, un crédito y una referencia de transferencia; una operación nueva legítima puede ejecutarse de forma independiente.
- AC-15 [functional]: Los importes aceptados se calculan y persisten exactamente con hasta dos decimales (rechazando mayor precisión sin redondearla), sin diferencias acumuladas de redondeo entre débitos y créditos.
- AC-16 [functional]: El histórico propio distingue apertura, transferencias enviadas y recibidas, mostrando importe, moneda, fecha y referencia de transferencia cuando corresponda; una transferencia aparece una vez para cada participante.
- AC-17 [functional]: Al cerrar e iniciar sesión o reiniciar la aplicación se conservan saldo y movimientos; no se repite el abono inicial.
- AC-18 [functional]: Una transferencia confirmada ofrece un QR que, al decodificarse, contiene su referencia, fecha, monto, COP y cuentas parcialmente ocultas coincidentes con el movimiento persistido, sin contraseñas ni tokens.
- AC-19 [interaction]: Una transferencia rechazada no muestra un comprobante de éxito ni QR de éxito y presenta un mensaje que permite corregir la causa; durante el envío se muestra estado pendiente y se previenen envíos repetidos desde la interfaz.
- AC-20 [visual]: Las pantallas de acceso, cuenta y transferencia muestran de forma legible que se trata de una simulación académica con dinero ficticio.
- AC-21 [interaction]: Con los dos usuarios de prueba se completa el recorrido inicio de sesión, consulta, transferencia, resultado con QR e histórico; un fallo al presentar el QR no invita a repetir una transferencia ya confirmada.
- AC-22 [functional]: Los métodos públicos y contratos internos no triviales del backend tienen Javadoc coherente con propósito, parámetros, retorno, errores, efectos e invariantes aplicables; la documentación no contradice las firmas ni las reglas implementadas.
- AC-23 [functional]: La entrega incluye informe, código preparado para GitHub, registro de prompts y README con requisitos y pasos reproducibles para ejecutar la demostración; la publicación remota se realiza sólo con autorización correspondiente.

- AC-24 [functional]: Cerrar sesión invalida el acceso autenticado; 30 minutos sin actividad vencen la sesión y el siguiente acceso protegido exige autenticarse de nuevo, sin reenviar automáticamente una transferencia pendiente.

### Non-Goals
Fuera de alcance: préstamos, tarjetas, retiros, depósitos posteriores a apertura, panel administrativo, múltiples cuentas por usuario y monedas adicionales. No se exige integración bancaria real, certificación regulatoria ni pagos mediante el QR. Recuperación de contraseña, verificación de identidad y notificaciones no forman parte del alcance acordado.

## 3. Aplicabilidad de controles
| Control | Aplicabilidad | Resultado requerido / límite |
| --- | --- | --- |
| Datos personales y credenciales | Sí, nombre/correo/contraseña de acceso | Minimizar datos; no exponer contraseñas ni tokens en respuesta, QR, logs o documentación; mecanismo de almacenamiento de credenciales en plan |
| Autorización | Sí | Comprobar identidad y titularidad en backend; pruebas negativas AC-04/05 |
| Multi-tenancy | N/A | No se acordaron organizaciones o tenants; sí aislamiento entre usuarios |
| Integridad y concurrencia | Sí | AC-12/15; persistencia de apertura única y movimientos |
| Auditoría | Histórico funcional | AC-16; sin requisito aprobado de auditoría externa, retención legal o logs adicionales |
| Transporte/almacenamiento | Datos de acceso y movimientos ficticios | Definir protección según entorno de demostración en plan; no afirmar cifrado o cumplimiento ya verificado |

## 4. Experiencia y límites
Recorrido: registro/acceso → cuenta y saldo → destinatario e importe → envío pendiente → resultado confirmado con QR → histórico. Incluir validación, error recuperable, carga, histórico sin transferencias (sólo apertura) y acceso no autenticado. Un resultado incierto por caída de conexión no debe presentarse como rechazo definitivo ni permitir duplicar el movimiento.

La dirección visual está registrada en plan bajo delegación; no se hereda la apariencia de reservas como identidad bancaria. Se realizaron comprobaciones delimitadas de teclado/foco, reflow, contraste y estados relevantes según verification.md; no se declara conformidad completa de accesibilidad.

## 5. Trazabilidad y verificación prevista
| Criterios | Fuente | Verificación prevista, NO EJECUTADA |
| --- | --- | --- |
| AC-01/06, AC-17 | Alcance aprobado: cuenta, acceso y apertura | Pruebas de integración de registro/autorización/persistencia y recorrido UI |
| AC-07/15 | Alcance aprobado: reglas de transferencias | Integración con datos aislados; fallas inducidas, simultaneidad y reintentos reales |
| AC-16/18 | Enunciado p. 11 y alcance aprobado | Integración de histórico y decodificación de QR comparada con persistencia |
| AC-19/21 | Alcance aprobado y constitución sección 5 | Interacciones observadas y render real, estados y evidencia tipada |
| AC-22 | Usuario y guía p. 3 | Generación documental configurada y revisión semántica de APIs |
| AC-23 | Enunciado p. 11 | Revisión de entregables y reproducción documentada; publicación separada |

Plan elaborado en fase omni-plan: [diseño y verificación propuesta](plan.md). AC-24 deriva de la aclaración aprobada de sesión y se verificará con backend-integration y ui-e2e propuestos. Descomposición y matriz de responsables en [tasks.md](tasks.md) y [verification.md](verification.md). El catálogo efectivo de checkIds se registrará cuando existan los comandos. [acceptance.json](acceptance.json) conserva la revisión individual de criterios; [verification.md](verification.md) contiene resultados reales y límites.

### Clasificación de esfuerzo
fit.json estima 45 archivos futuros y dos módulos (frontend/backend); no son archivos existentes inspeccionados. Riesgo alto por autorización, persistencia y concurrencia; reversibilidad difícil para movimientos ya confirmados. crossesContract refiere a una API nueva entre módulos, no a una API existente modificada. No hay pruebas de aplicación existentes. Reestimar al planificar; ruta derivada FULL, sin garantía de calidad por clasificación.





