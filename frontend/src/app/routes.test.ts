import { describe, it, expect } from 'vitest';
import { safeReturnPath, routeTitle } from './routes';
describe('protected route destinations', () => {
  it('preserves known modules and receipt deep links', () => {
    expect(safeReturnPath('/movimientos?page=2')).toBe('/movimientos?page=2');
    expect(safeReturnPath('/comprobantes/12345678-1234-1234-1234-123456789012')).toContain(
      '/comprobantes/',
    );
  });
  it('rejects external or unknown return targets', () => {
    for (const value of [
      'https://example.com',
      '//example.com',
      '/admin',
      null,
      {},
      '/comprobantes/../../admin',
    ])
      expect(safeReturnPath(value)).toBe('/resumen');
  });
  it('names nested receipt routes contextually', () => {
    expect(routeTitle('/comprobantes/ref')).toBe('Comprobante');
    expect(routeTitle('/perfil')).toBe('Mi perfil');
  });
});
