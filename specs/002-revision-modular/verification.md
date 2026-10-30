# Verificación — revisión modular

## Alcance y procedencia
Revisión local solicitada, no reconstrucción. Observador: Codex. Fuentes originales respaldadas antes de modificar; baseline ejecutado con esas fuentes restauradas, y luego reactivación modular. Primera referencia falló por PostgreSQL apagado, no por aserción; [log](evidence/baseline/backend-integration.log). Se inició clúster aislado y se repitió todo. Una compilación intermedia detectó comentario de DTO mal delimitado en extracción y se corrigió antes de tests; lint detectó import money sin uso y se eliminó. Ninguna prueba eliminada.

Entorno ejecutado: Windows, PowerShell, Temurin25.0.4.1, Node24.19.0, Boot4.1.2, PostgreSQL18.6, Chromium Playwright1.64.1. Horas de logs UTC25-10 y zona local24-10. No se extrapola a otros navegadores/plataformas.

## Resultados ejecutados
Baseline: **14 Java +3 Vitest +9 Playwright =26**; siete checks exit0 [resultados](evidence/baseline-ready/results.json). Preflight modular: **14 Java +14 Vitest +11 Playwright =39**; siete checks exit0 [resultados](evidence/checks/results.json), además formato exit0 [log](evidence/checks/frontend-format.log). Los resultados formales vigentes se guardan por CLI en verification.json y specs/project-state.json; ejecución posterior vincula todas las comprobaciones al código final, incluida última simplificación de AccountService.

| Check | cwd | Comando | Inicio UTC | Exit | Artefacto |
| --- | --- | --- | --- | --- | --- |
| frontend-unit | frontend | `npm.cmd run test -- --run` | 2026-10-25T00:48:00.6787225Z | 0 | [log](evidence/checks/frontend-unit.log) |
| frontend-build | frontend | `npm.cmd run build` | 2026-10-25T00:48:03.7664390Z | 0 | [log](evidence/checks/frontend-build.log) |
| frontend-lint | frontend | `npm.cmd run lint` | 2026-10-25T00:48:10.7318546Z | 0 | [log](evidence/checks/frontend-lint.log) |
| backend-build | backend | `mvnw.cmd -B -ntp -DskipTests package` | 2026-10-25T00:48:19.4825556Z | 0 | [log](evidence/checks/backend-build.log) |
| backend-integration | . | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-backend.ps1` | 2026-10-25T00:48:41.7245454Z | 0 | [log](evidence/checks/backend-integration.log) |
| ui-e2e | . | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test-ui.ps1` | 2026-10-25T00:49:29.6523984Z | 0 | [log](evidence/checks/ui-e2e.log) |
| backend-docs | backend | `mvnw.cmd -B -ntp javadoc:javadoc` | 2026-10-25T00:58:05.8105802Z | 0 | [log](evidence/checks/backend-docs.log) |

## Revisión por criterio
| Criterio | Evidencia y límites |
| --- | --- |
| AC-01 | Paquetes, records y repositorios separados; MovementQueryRepository mantiene UNION y filtros propios. Revisión de imports/visibilidad y compilación. |
| AC-02 | 13 pruebas PostgreSQL conservadas: exactitud, saldo completo, dos concurrencias y transferencias opuestas, rollback de crédito/apertura, límites y replay. SQL schema byte a byte idéntico. |
| AC-03 | HTTP comprueba 401/403/409, cookie HttpOnly/SameSiteLax, rotación, logout, privacidad de tercero, origen inyectado rechazado. JUnit comprueba umbral exacto 30m. |
| AC-04 | Prettier check para todo TS/TSX/CSS, App y useBanking separados de seis superficies; build y lint. |
| AC-05 | A registra/accede, transfiere150000, QR PNG decodificado comparado con GET persistido, saldo 850000/SENT; logout y acceso B:1150000/RECEIVED; recarga de ambos conserva. Reinicio real adicional conserva 200.25/apertura única. |
| AC-06 | 11 nuevas unitarias validación/pending/API; E2E mantiene respuesta perdida/replay/expiración y añade editar revisión/bloqueo durante petición. |
| AC-07 | Capturas integradas revisadas acceso/cuenta/comprobante/validación/recibido; 320/360/768/1440 sin overflow, foco por teclado, contraste medido y reflow2x; no auditoríaWCAG completa. |
| AC-08 | README revisado con árbol/configuración/endpoints/comandos; informe24 secciones, portada sin nombres inventados; prompt literal preservado; ignore ampliado. Git inexistente; no commit/push. Búsqueda de contraseñas locales generadas en fuentes/scripts/docs:0 archivos, no prueba universal de ausencia de secretos. |
| AC-09 | Baseline 26 pruebas y preflight 39 pruebas; builds/lint/Javadoc 0. Javadoc revisado frente a transacciones, principal, records, locks y errores; formatter check 0. Formal verify aporta registro ligado a huella actual. |

## Observación visual e interacción
Sesión 31089b1d-a7e6-4df8-a50a-d1ba810c012f registrada antes de revisión final. Observado 2026-10-25T00:59:32.029Z: capturas finales de la corrida modular, cuenta 360×1000, escritorio 1440×1000, validación 360×900 y recibido 1440×1000. Se comparó referencia original (misma identidad de color, jerarquía, espaciado y composición) con resultado. QR/GuardarQR legibles, referencia completa sin desbordamiento, error rojo y foco visible en monto. La prueba de descarga mantiene un único POST; procesamiento bloquea logout/reintento. Anchos320/360/768/1440 medidos por scrollWidth<=innerWidth, reflow textual200% y zoom2x. Contraste calculado desde colores renderizados: hint 5.7538, botón 7.9284, borde 3.5343. No prueba lectores de pantalla, todos los dispositivos o conformidad total. Estado sin transferencias cubierto por apertura y mensaje; página verdaderamente vacía tiene mensaje explícito, rama inspeccionada pero no simulada en navegador. Sin animaciones añadidas, reduced-motion conservado.

- [Acceso](evidence/ui/access-1280.png)
- [Cuenta móvil](evidence/ui/account-360.png)
- [Comprobante y QR](evidence/ui/receipt-1440.png)
- [Validación y foco](evidence/ui/validation-360.png)
- [Histórico recibido](evidence/ui/received-1440.png)

## Inventario y decisiones
[Inventario exacto](evidence/files.json): creados 50, retirados por sustitución/movimiento 19, modificados en fuentes comunes 4. Los agrupados Contracts/Repositories y BankService/BankController fueron reemplazados por tipos/servicios/controladores por funcionalidad. SQL sin modificaciones (comparación binaria). SecurityConfig/IdleSessionFilter/ApiErrors/DemoData cambiaron de paquete manteniendo comportamiento. Test de filtro cambia a su paquete para conservar acceso interno; BankIntegrationTest sustituye llamadas al monolito por los cuatro beans, conserva13 métodos y aserciones. Nuevas11 unitarias y2 E2E; recorrido/descarga fortalecidos. No se añaden servicios/interfaces especulativos.

Javadoc generado y revisado: públicas operaciones explican principal, montos, estado confirmado/replay, límites y rollback. Constructores de entidades describen hashes/locks; get/setBalance identifica precondición transaccional. Componentes y contratos exportados tienen TSDoc con propósito. La documentación generada no demuestra la semántica por sí sola.

## Entrega académica y límites
Transferencias/histórico/QR implementados y probados; README/informe24 secciones/prompts locales preparados. GitHub **pendiente**, no se inventa URL ni se publica. No hay repositorio Git (rev-parse falla); no es posible declarar git status limpio. Ignore cubre .local, .env.*, dumps, certificados privados, node_modules, target, dist, resultados, logs y temporales. Comprobación acotada: ningún valor de contraseña aleatoria local en fuentes/scripts/docs analizados. No se imprime ni copia el archivo de secretos. No se inicializó Git, no commit ni push. Word/PDF no solicitado todavía; portada requiere autor/docente/grupo.

Advertencias preservadas: Mockito sobre carga dinámica de agente, SQL intencional de rollback/duplicado y NO_COLOR/FORCE_COLOR no son fallas de aserción. Cobertura finita, dinero ficticio; sin firma QR o certificación bancaria. Copia local ignorada permite recuperar archivos; no existe migración de datos ni se alteraron saldos demo.
