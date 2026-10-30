# Rediseño fintech

## 0. Clarification & Assumptions (Anti-Hallucination Gate)
Solicitud explícita de frontend-design: transformación visual importante y coherente manteniendo intactas funcionalidades. Sólo componentes de presentación, CSS, activos locales tipográficos y pruebas de apariencia. React/TypeScript y arquitectura modular permanecen. No backend/API/BD/seguridad/lógica de transferencias; no nuevas funciones bancarias, datos inventados, publicación ni agentes.

## Acceptance Criteria
- AC-01 [visual] Identidad fintech nueva coherente en login, registro, dashboard, saldo, transferencia, histórico y QR; render revisado.
- AC-02 [interaction] Conservar registro/login/logout, revisión, procesamiento, errores, pendientes/reintento, histórico, QR y descarga sin segunda transferencia.
- AC-03 [accessibility] Responsive320/360/768/1440, foco y teclado, contraste real, zoom/reflow y reduced-motion.
- AC-04 [functional] Backend, API, esquema, seguridad y lógica monetaria sin modificaciones; hashes invariantes. React/TS y módulos conservados.
- AC-05 [functional] Unitarias, lint, formato, build y E2E existentes aprobados; documentación de resultados y límites.

## Non-Goals
No backend, API, base de datos, seguridad, lógica monetaria, publicación o nuevas funciones bancarias. El mensaje termina en Asegúra; no se infiere una condición adicional no recibida.

