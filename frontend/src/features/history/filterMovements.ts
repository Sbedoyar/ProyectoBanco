import { money } from '../../shared/utils/money';
import type { Movement } from '../../shared/types/bank';
export type MovementKind = 'ALL' | Movement['type'];
/** Filters only supplied page rows, never claims a global server search. */
export function filterMovements(rows: Movement[], kind: MovementKind, query: string) {
  const text = query.trim().toLocaleLowerCase('es-CO');
  return rows.filter(
    (row) =>
      (kind === 'ALL' || row.type === kind) &&
      (!text ||
        [
          row.reference ?? '',
          row.counterparty,
          row.amount,
          money(row.amount),
          row.type,
          {
            OPENING: 'Apertura de cuenta',
            SENT: 'Transferencia enviada',
            RECEIVED: 'Transferencia recibida',
          }[row.type],
        ].some((value) => value.toLocaleLowerCase('es-CO').includes(text))),
  );
}
/** Bounds URL pagination to the existing backend contract. */
export function movementPage(value: string | null) {
  const n = Number(value ?? 0);
  return Number.isSafeInteger(n) && n >= 0 && n <= 1000000 ? n : 0;
}
