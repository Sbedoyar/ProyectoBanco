import { describe, it, expect } from 'vitest';
import { filterMovements, movementPage } from './filterMovements';
import type { Movement } from '../../shared/types/bank';
const rows: Movement[] = [
  {
    id: 'o',
    type: 'OPENING',
    reference: null,
    amount: '1000000.00',
    currency: 'COP',
    occurredAt: '2026-10-24T00:00:00Z',
    counterparty: '—',
  },
  {
    id: 's',
    type: 'SENT',
    reference: 'reference-a',
    amount: '12.34',
    currency: 'COP',
    occurredAt: '2026-10-24T01:00:00Z',
    counterparty: '********0022',
  },
  {
    id: 'r',
    type: 'RECEIVED',
    reference: 'reference-b',
    amount: '1000.00',
    currency: 'COP',
    occurredAt: '2026-10-24T02:00:00Z',
    counterparty: '********0033',
  },
];
describe('page-local movement filters', () => {
  it('keeps direction distinct without inventing rows', () => {
    expect(filterMovements(rows, 'SENT', '')).toEqual([rows[1]]);
    expect(filterMovements(rows, 'OPENING', '')).toEqual([rows[0]]);
  });
  it('searches references, counterpart and visible decimal format', () => {
    expect(filterMovements(rows, 'ALL', 'REFERENCE-A')).toEqual([rows[1]]);
    expect(filterMovements(rows, 'ALL', '0033')).toEqual([rows[2]]);
    expect(filterMovements(rows, 'ALL', '1.000,00')).toEqual([rows[2]]);
  });
  it('combines filters and preserves original page order/data', () => {
    expect(filterMovements(rows, 'RECEIVED', 'reference-a')).toEqual([]);
    expect(filterMovements(rows, 'ALL', '')).toEqual(rows);
    expect(rows).toHaveLength(3);
  });
  it('bounds query-string pages to the existing API limits', () => {
    for (const value of ['-1', '1.2', 'NaN', '1000001', 'Infinity'])
      expect(movementPage(value)).toBe(0);
    expect(movementPage('2')).toBe(2);
    expect(movementPage(null)).toBe(0);
  });
});
