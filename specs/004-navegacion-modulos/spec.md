# Navegación bancaria por módulos

## 0. Clarification and Assumptions
Autorizado explícitamente por el usuario: React Router, páginas independientes y layouts reutilizados con identidad003. No reconstrucción ni cambios monetarios. HashRouter es elección técnica delegada para recarga sin backend nuevo. Inspeccionado: movimientos sólo acepta page/size; comprobante GET por referencia permite ambos participantes. No se necesita endpoint adicional para listado desde movimientos; búsqueda global exigiría API nueva fuera de alcance.

## Acceptance Criteria and Non-Goals
- AC-01 [interaction] React Router con rutas protegidas independientes, layouts compartidos, estados activos, títulos, historial atrás/adelante y recarga directa; logout y caducidad vuelven al acceso.
- AC-02 [functional] Resumen acotado sin formulario ni histórico completo, transferencia aislada y coordinador compartido conserva validación, clave pendiente y confirmación sin doble envío.
- AC-03 [interaction] Movimientos y comprobantes paginados, filtros/búsqueda locales explícitos; detalle porGET autorizado y recargable sin POST, errores y apertura sin comprobante.
- AC-04 [visual] Conservar identidad003 y comprobar todas las páginas en desktop/móvil, foco, contraste, reflow y movimiento reducido.
- AC-05 [functional] Backend, esquema, seguridad HTTP y utilidades monetarias intactos; tests previos adaptados sólo por navegación, nuevos casos, build/lint/unit/E2E aprobados y docs/prompts actualizados.

### Non-Goals
Sin búsqueda global simulada, exportaciones inexistentes, edición de perfil, nuevas transacciones, backend/BD, cambios de contratos o publicación.
