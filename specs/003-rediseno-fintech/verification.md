# Verificación del rediseño fintech

## Resultado y alcance
Rediseño de presentación solicitado con frontend-design. React/TypeScript y arquitectura por funcionalidades conservados. Backend y lógica monetaria sin cambios verificados con hashes. No se añadieron productos financieros, gráficas, saldos o estadísticas ficticias fuera de la simulación existente. Sin dependencias de runtime nuevas, Git/commits/push o agentes.

## Evidencia ejecutada
Entorno: Windows, Node24.19.0, Java 25.0.4.1, PostgreSQL 18.6 real, Boot 4.1.2 y Chromium 156.0.8078.4/Playwright 1.64.1. Baseline002 pasó39 pruebas. Primera corrida de esta UI pasó10/11; falló reflow con CSSzoom2x. Se corrigió el layout con flex-wrap e intrínsecos, manteniendo la aserción; siguiente corrida 11/11. Se amplió un caso de diseño: preflight final40 pruebas (14 Java,14 Vitest,12 Playwright) y9 checks exit0. Cambios posteriores mínimos: espacio tras coma en título móvil y volver al inicio para capturar correctamente sidebar sticky; prueba dirigida1/1 aprobada. El resultado formal vigente posterior consta en verification.json y estado del CLI; no confundir preflight con huella final.

| Check | cwd | Comando | Inicio UTC | Exit | Evidencia |
| --- | --- | --- | --- | --- | --- |
| presentation-boundary | . | `node specs/003-rediseno-fintech/check-invariants.mjs` | 2026-10-25T03:01:03.8227192Z | 0 | [log](evidence/checks/presentation-boundary.log) |
| frontend-unit | frontend | `npm.cmd run test -- --run` | 2026-10-25T03:01:04.2894707Z | 0 | [log](evidence/checks/frontend-unit.log) |
| frontend-build | frontend | `npm.cmd run build` | 2026-10-25T03:01:07.4332178Z | 0 | [log](evidence/checks/frontend-build.log) |
| frontend-lint | frontend | `npm.cmd run lint` | 2026-10-25T03:01:15.9753421Z | 0 | [log](evidence/checks/frontend-lint.log) |
| frontend-format | frontend | `npm.cmd run format:check` | 2026-10-25T03:01:30.0767713Z | 0 | [log](evidence/checks/frontend-format.log) |
| backend-build | backend | `mvnw.cmd -B -ntp -DskipTests package` | 2026-10-25T03:01:33.0383068Z | 0 | [log](evidence/checks/backend-build.log) |
| backend-integration | . | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-backend.ps1` | 2026-10-25T03:01:55.0258105Z | 0 | [log](evidence/checks/backend-integration.log) |
| ui-e2e | . | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-ui.ps1` | 2026-10-25T03:02:59.5345226Z | 0 | [log](evidence/checks/ui-e2e.log) |
| backend-docs | backend | `mvnw.cmd -B -ntp javadoc:javadoc` | 2026-10-25T03:06:19.8768916Z | 0 | [log](evidence/checks/backend-docs.log) |

[Primer fallo de zoom](evidence/checks/initial-zoom-failure.log), [corrección 11/11](evidence/checks/reflow-corrected.log), [prueba visual dirigida](evidence/checks/targeted-visual.log). Un diagnóstico aislado con respuestas GET de muestra tuvo inicialmente una intercepción demasiado amplia que alcanzó un import JS; se limitó a /api/ y se obtuvo scrollWidth1280=innerWidth1280 a zoom2x. No se usó ese mock como prueba de transferencias.

## Criterios y revisión semántica
- AC-01: Revisión real de login y registro1440x1000, dashboard1440 y360, comprobante 320/768/1024/1440. Identidad índigo/tinta/lavanda, Manrope local y SVG consistentes; composición por superficies y tipografía contrastada. Observación de agente, no aprobación humana final.
- AC-02: Las12 pruebas HTTP/UI preservan las11 anteriores: registro/acceso/logout, privacidad, validación/revisión/espera, error/reintento, QR realmente decodificado y descarga con un único POST, saldos/históricos y reinicio real.
- AC-03: Prueba UI: anchos320/360/768/1440, nombre largo, monto máximo17 dígitos en revisión, referencia UUID móvil, navegación por anclas con foco, fuente local, reduced-motion con animationName none. Reflow texto200% y zoom2x pasan; contraste calculado hint 5.5476, botón 6.1034, borde 3.1879. Revisión inicial de1024 adicional; no auditoríaWCAG completa ni otros navegadores.
- AC-04: check-invariants.mjs confirma42 archivos idénticos por SHA256: backend/src completo y useBanking/HTTP/tipos/dinero/pending/validación/payloadQR. Sin cambios backend/API/esquema/seguridad/lógica de transferencias. React/TS/módulos conservados; Manrope es activo OFL, no dependencia de runtime.
- AC-05: Preflight:14 Java +14 Vitest +12 Playwright=40 pruebas,9 checks exit0. Último ajuste de texto y capturas pasó prueba visual dirigida1/1; formalverify posterior ejecuta catálogo completo ligado a la versión final.

## Render observado
Observador Codex, sesión f40e3d1a-dd63-44cd-8973-9bab2b190e30, revisión final 2026-10-25T03:09:04.679Z; se abrieron capturas con view_image. Se revisaron: acceso/registro1440x1000 y320x900, cuenta1440/360, comprobante 320x900 y768/1024/1440x1000, error360x900. El contenido largo y cifras siguen disponibles; filas de movimientos adaptan importe a otra línea. No se oculta overflow global para fingir reflow; sólo el arte decorativo de saldo se recorta dentro de su panel.

- [Login escritorio](evidence/ui/login-final-1440.png)
- [Registro escritorio](evidence/ui/register-final-1440.png)
- [Dashboard](evidence/ui/account-1440.png)
- [Dashboard móvil](evidence/ui/account-360.png)
- [Registro móvil](evidence/ui/design-register-320.png)
- [Revisión de transferencia](evidence/ui/design-review-320.png)
- [Comprobante escritorio](evidence/ui/design-receipt-1440.png)
- [Comprobante tablet](evidence/ui/design-receipt-1024.png)
- [Comprobante móvil](evidence/ui/design-receipt-320.png)
- [Validación y foco](evidence/ui/validation-360.png)

Contraste medido sobre colores computados de hint/campo blanco5.5476, botón/blanco6.1034, borde/campo3.1879; sólo pares probados. La preferencia reduced-motion desactiva animación de recibo y scroll/transiciones; navegación por anclas enfoca encabezados. No es evaluación exhaustiva de lectores de pantalla, daltonismo o todos los navegadores.

## Archivos y recursos
Presentación: Access, AccountPanel, AccountSummary, TransferForm, MovementHistory, ReceiptPanel y styles.css. Nuevo shared/components/BankIdentity.tsx contiene Brand, Icon y SimulationNotice. Nuevos activos public/fonts/Manrope-Variable.ttf y OFL.txt (Google Fonts, copyright 2018 Manrope Project, SIL OFL 1.1), servidos localmente. No hay consultas a Google Fonts al abrir la app. Manifiestos de dependencias sin cambio. Playwright cambia sólo puerto de UI a 5187 para convivir con dev5173; se preservan todas las pruebas y se añade una. README/prompts/contexto y artefactos003 documentan alcance.

[Plan y referencias exactas](plan.md): consulta de Monzo y licencia/fuente Google; Wise no estuvo accesible y no se atribuye evidencia visual a esa consulta. La dirección de tokens es elección delegada del agente, no aprobación humana específica. La ilustración y los iconos son SVG/CSS propios.

## Límites y recuperación
Código fuente protegido comparado con [baseline SHA256](invariants.json) mediante [comprobación](check-invariants.mjs);9 checks están configurados, el CLI ejecuta y vincula su resultado. El check de frontera está acotado a esta feature 003; cualquier trabajo futuro autorizado de lógica deberá revisar explícitamente ese baseline/catálogo, no saltarlo para declarar esta entrega. Copia de frontend anterior en .local/redesign-before, ignorada. No se hicieron cambios de esquema ni se reinició dinero de demo; integración usa bank_test y registros ficticios. Nada se publica. Los avisos de agenteMockito, conflictos SQL inducidos y NO_COLOR/FORCE_COLOR son esperados y se conservan en logs.
