import { describe, it, expect } from 'vitest';
import { validAmount, money } from './money';
import { qrPayload } from '../../features/receipt/qrPayload';
describe('COP exacto', () => {
  it('rechaza precisión extra, exponentes y montos no positivos', () => {
    for (const v of ['0', '0.00', '-1', '1.230', '0.001', '1e3', 'NaN', ''])
      expect(validAmount(v)).toBe(false);
    for (const v of ['1', '0.01', '1000000.99']) expect(validAmount(v)).toBe(true);
  });
  it('formatea sin perder céntimos en valores grandes', () => {
    expect(money('99999999999999999.99')).toBe('$ 99.999.999.999.999.999,99 COP');
  });
  it('QR sólo usa comprobante y marca simulación', () => {
    const r = {
      reference: 'abc',
      occurredAt: '2026-10-24T05:00:00Z',
      amount: '0.01',
      currency: 'COP' as const,
      sourceAccountMasked: '********0001',
      targetAccountMasked: '********0002',
    };
    expect(JSON.parse(qrPayload(r))).toEqual({ version: 1, simulation: true, ...r });
  });
});
