# Plan

## Diseño y compatibilidad
HashRouter declarativo + Routes/Route, Outlet y NavLink. Rutas /login, /registro, /resumen, /transferencias, /movimientos, /comprobantes, /comprobantes/:reference y /perfil. URLs reales del cliente /#/ruta; no anclas de scroll. Router conserva historial, deep link y recarga sin fallbackSpring. Layouts AuthLayout y BankLayout. Contexto bancario por encima de Routes comparte useBanking sin recrearlo al navegar; ningún POST por visita a rutas. ReturnTo protegido validado como ruta local y conservado sólo dentro de la sesión de UI; logout explícito lo limpia.

Resumen usa una consulta de primeros5movimientos, sin paginación global ni formulario. Movimientos consulta page/size20 y filtra sólo esa página con aviso. Comprobantes reutiliza páginas del histórico, elimina OPENING y muestra participantes; búsqueda local declarada. Detalle GET /transfers/:ref valida autorización en servidor; error404no revela datos. Perfil muestra nombre/correo/cuenta sin editar. TransferForm conserva callbacks/validación; estado de operación y envío/reintento permanece en useBanking. Último comprobante en transferencia puede mostrarse, pero GET independiente recargable no envía dinero. No renderizar respuestas obsoletas tras cambio de usuario/ruta; limpieza de efectos y claves por usuario.

## Dirección visual y referencias
Conservar fuenteManrope local, tinta#172B4D, violeta#454CE7, blanco#FFFFFF, fondo#F5F7FC, lavanda#E8E9FF y menta#A9E8D4. Referencia real: capturas003/evidence/ui, componentes/CSS inspeccionados; no nuevo lenguaje visual. Cada página se alinea a izquierda y tiene propósito único: overview[saldo | accesos] +5recientes; transfer[pasos/datos | contexto cuenta]; movimientos[buscador/filtro + ledger]; comprobantes[listado o recibo]; perfil[datos reales]. Sidebar persistente con NavLink activo; móvil navegación compacta en grid con44pxmínimo. Título contextual y foco en cada ruta, scroll al inicio y animación sólo de transición breve con reduced-motion. Se descarta mini-dashboard idéntico en todas las rutas, gráficos falsos y filtros que aparenten búsqueda global.

## Dependencia
React Router8.5.0 exacto. Consulta24-10-2026: https://reactrouter.com/start/declarative/installation indica paquete react-router; https://reactrouter.com/start/declarative/routing explica Outlet y rutas hijas; https://reactrouter.com/api/declarative-routers/HashRouter establece hash no enviado al servidor. npm view engines>=22.22 y peersReact>=19.2.7/types>=19.2 confirmados; proyectoNode24.19 yReact19.3.1 compatible declarativamente. Compilación/pruebas verificarán compatibilidad local. Elección de versión dentro de delegación técnica y requisito explícitoReactRouter.

## Verification
Snapshot SHA256 de42archivos: backend/src, useBanking completo, HTTP y utilidades monetarias sin modificaciones. Adaptar recorridos existentes para entrar al módulo correcto y consultar saldo/histórico en sus rutas, sin retirar aserciones. Añadir protección/deep links/recarga/atrás/filtros/paginación/detalle sinPOST y aislamiento de usuario. Catálogo9checks, sustituir frontera003 por004 porque usuario ahora autoriza integración de rutas encoordinador. Screenshots efímeras.local, copiar evidencia revisada antes deverify.

## Rollback / recovery
Copia.local/modules-before permite restaurar archivos frontend puntuales y package manifests respaldados. Sin migración de datos ni backend. No deshacer transferencias persistidas; bank_test aislado para pruebas. No agentes, commits ni publicación.

## Contracts and compatibility
HTTP sin cambios: GET /api/auth/me, /account, /movements?page&size, /transfers/:reference y /transfers/by-key/:key; POST existentes intactos. DTO Identity/Account/MovementPage/Receipt/Pending se reutilizan. La navegación cambia el contrato de URL del cliente de anclas a /#/módulo; enlaces previos sinruta van a resumen. OPENING no tiene referencia, no genera comprobante. Las consultas por referencia conservan404y401 del backend. La búsqueda global requeriría filtros server-side y conteos; no se agrega endpoint ni se finge alcance global.

