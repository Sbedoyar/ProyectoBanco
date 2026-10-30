import { describe, it, expect } from 'vitest';
import { validateTransfer } from './validation';
describe('transfer review validation', () => {
  it('selects the destination control before amount validation', () => {
    expect(validateTransfer('123', '0')).toEqual({
      field: 'target',
      message: 'Escribe los 12 dígitos de la cuenta destino.',
    });
  });
  it('selects the amount control and rejects extra precision', () => {
    expect(validateTransfer('100000000002', '1.001')?.field).toBe('amount');
  });
  it('accepts a syntactically valid intent without pretending to check funds', () => {
    expect(validateTransfer('100000000002', '99999999999999999.99')).toBeNull();
  });
});
