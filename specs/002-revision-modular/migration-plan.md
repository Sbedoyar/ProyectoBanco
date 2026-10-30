# MIGRATION-002

## Estrategia y contratos
Separar por funcionalidad dentro del mismo Spring Boot. AuthService mantiene registro completo en una transacción; AccountService resuelve cuenta desde principal; TransferService conserva un único límite transaccional, orden de locks, refresh y replay previo a fondos. MovementQueryRepository contiene la consulta UNION existente. DTO cambian nombre Java, no JSON. Entidades encapsulan campos con acceso explícito entre módulos. Controladores no calculan dinero.

React: App coordina sesión y solicitudes; Access, AccountPanel, AccountSummary, TransferForm, MovementHistory y ReceiptPanel contienen sus superficies. Tipos y utilidades comunes separados por propósito. Se conserva CSS/identidad; formato uniforme. Referencia visual: capturas revisadas en ../001-transferencias-bancarias/evidence y CSS actual (24-10-2026): verde/salvia, tarjeta de saldo, jerarquía cuenta→transferencia→histórico. Usuario: estudiante operando con dinero ficticio en móvil/escritorio; prioridad confirmar estado sin duplicar dinero. No se rediseña ni se agregan dependencias de ejecución.

## Secuencia y riesgos
Primero baseline completo. Luego backend y tests ajustados sólo a nuevas clases; después componentes y unitarias; recorrido A/B y revisión visual; docs. Riesgos: visibilidad Java/proxies transaccionales, paquetes JPA escaneados, rutas de importación, sesión/reintento. Mantener esquema intacto y endpoint payloads. Javadoc y TSDoc deben describir límites, no sólo firmas. Stack sin cambios: reutilizar investigación oficial fechada del plan 001; formatter opcional investigado si se incorpora.

## Verificación y recuperación
Catálogo specs/checks.json: unit/build/lint frontend; package/test/Javadoc backend; Playwright PostgreSQL en secuencia. Evidencia baseline en evidence/baseline y final en evidence/checks; screenshots efímeras .local/ui-artifacts para no mutar evidencia durante verify. Revisión visual real tras cambios. Copia local ignorada del código previo permite recuperación de archivos puntuales; sin cambios de esquema ni limpieza demo. No usar rollback de código para deshacer una transferencia confirmada. Sin Git existente: no commit ni push.

## Herramienta de formato
Prettier 3.9.10 dev-only exacto: documentación oficial https://prettier.io/docs/install recomienda instalación local y versión exacta; opciones https://prettier.io/docs/options (consulta 24-10-2026, reloj de ejecución UTC25). npm view confirmó engines Node>=14, compatible con Node24 del proyecto. Sin cambio de runtime. Aprobación: usuario permite configurar Prettier y delega decisiones técnicas. El formato y las pruebas ejecutadas comprueban compatibilidad local, no la mera consulta.
