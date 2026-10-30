# DEBT-002 — Revisión modular

## Evidencia y coste
Observado: BankService concentra registro, cuenta, transferencia y SQL de histórico; BankController expone todos los endpoints. Contracts y Repositories agrupan tipos. App y AccountPanel contienen componentes y JSX comprimidos. El informe actual tiene ocho apartados y no satisface la estructura solicitada. La entrega 001 está completada; sus resultados no prueban esta revisión.

## Alcance y criterios
- AC-01 [functional] Backend modular por auth/account/transfer/movement/shared; DTO records y repositorios separados, consultas de histórico aisladas.
- AC-02 [functional] Conservar contratos HTTP, registro atómico, dinero exacto, locks ordenados, refresh tras bloqueo, rollback, concurrencia e idempotencia con PostgreSQL real.
- AC-03 [functional] Preservar sesiones, CSRF, hash y privacidad por principal.
- AC-04 [functional] Frontend por funcionalidades con componentes cohesivos y TS/TSX/CSS legibles.
- AC-05 [interaction] Recorrido A a B con QR realmente decodificado, históricos SENT/RECEIVED, saldos exactos y recarga persistente.
- AC-06 [interaction] Conservar validación, recuperación de errores y reintento con clave; ampliar unitarias faltantes.
- AC-07 [visual] Conservar identidad y revisar render responsive, foco, contraste, estados y comprobante con referencias legibles.
- AC-08 [functional] README reproducible, informe académico de 24 secciones, solicitud literal en prompts e ignores sin publicación.
- AC-09 [functional] Compilar, empaquetar, lint, tests y Javadoc antes/después; revisar semántica documental.

## No objetivos
No cambiar esquema, reglas monetarias, stack ni endpoints; sin microservicios, dinero real, commits o push. La solicitud adjunta autoriza expresamente la refactorización y ajustes visuales sutiles; no autoriza agentes.
