# Plan visual

## Diagnóstico y decisión
La base actual funciona pero su composición horizontal, etiquetas en mayúsculas y glifos mezclados se perciben académicos. Rediseño visual autorizado, conservando handlers, nombres accesibles y estados. Riesgo: foco, contraste y reflow; mitigar con regresiones UI y capturas.

## Tokens
Tinta #172B4D, índigo #454CE7, lavanda #E8E9FF, superficie #FFFFFF, fondo #F5F7FC, menta #A9E8D4. Manrope local OFL para interfaz y cifras, pesos400–800; sistema como fallback. Iconos SVG propios con trazo1.7, mismo viewBox24. Sin iconos de fuentes ni librería adicional.

## Composición
Acceso: panel gráfico azul con símbolo de conexiones entre cuentas y copy real de simulación; formulario blanco a la derecha. Dashboard: navegación lateral funcional por anclas, cabecera de contexto y titular, saldo y transferencia como centro operativo; histórico debajo con columnas y referencias. Alineación izquierda, ancho de lectura limitado. Comprobante como recibo con cabecera de confirmación, datos legibles y QR en panel propio. Móvil: navegación compacta arriba, una columna y controles completos.

ASCII:

    acceso: [marca + arte de conexiones | login/registro]
    banca:  [nav | cabecera                         ]
            [nav | saldo           | transferencia ]
            [nav | movimientos y comprobante       ]

## Revisión crítica antes de código
Se descartó dashboard con gráficas, tarjetas de crédito y KPIs ficticios: el producto sólo conoce saldo y movimientos. Se descartó negro/neón y la repetición de cards idénticas. El gesto propio será una conexión entre dos cuentas en azul/lavanda, usado en acceso y saldo; el resto permanece sobrio. Sin etiquetas decorativas en mayúsculas ni numeración sin secuencia. Motion sólo feedback de foco/botón y aparición de confirmación, reducido por preferencia.

## Referencias
Consulta24-10-2026: https://monzo.com/ texto y separación por tareas/cuenta (párrafos80–84 y188); no copiar marca ni promesas/productos. https://fonts.google.com/specimen/Manrope como referencia tipográfica (sin texto extraíble); fuente/licencia verificar al descargar desde repositorio oficial Google Fonts. https://wise.com/design/ inaccesible por herramienta; no se usa como evidencia visual. Referencias locales: capturas002/evidence/ui y CSS/componentes actuales inspeccionados. Validar la propuesta con render real, no inferir diseño del texto web.

## Cambios y recuperación
Presentación Access/AccountPanel/AccountSummary/TransferForm/MovementHistory/ReceiptPanel, shared/components, styles y assets. useBanking/API/moneda/QR/pending/validación y backend se congelan con hash. Copia local ignorada para recuperar archivos; ningún cambio de datos. Catálogo existente preservado, E2E puede añadir capturas y comprobaciones sin retirar aserciones. Vite primero y JAR después, detener backends propios antes de empaquetar. Baseline ejecutado002:39 pruebas; repetir regresiones frontend/UI para este rediseño y comprobar invariantes.

## Rollback / Migration reversal
Recuperar únicamente archivos frontend desde .local/redesign-before/src. Sin migración de esquema o datos; no deshacer transacciones. UI nueva autorizada explícitamente; no se necesita otra aprobación de dirección visual.

