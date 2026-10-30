import { describe, it, expect, vi, afterEach } from 'vitest';
import { api, ApiError, refreshCsrf } from './client';
afterEach(() => vi.unstubAllGlobals());
describe('API outcome semantics', () => {
  it('adds refreshed CSRF to an explicit mutating request', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'test-token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reference: 'confirmed' })));
    vi.stubGlobal('fetch', fetch);
    await refreshCsrf();
    await expect(
      api('/transfers', { method: 'POST', headers: { 'Idempotency-Key': 'same-key' }, body: '{}' }),
    ).resolves.toEqual({ reference: 'confirmed' });
    expect(fetch.mock.calls[1][1]).toMatchObject({
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-CSRF-TOKEN': 'test-token', 'Idempotency-Key': 'same-key' },
    });
  });
  it('preserves server rejection status and actionable field errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'VALIDATION_ERROR',
            message: 'Revisa los campos',
            fieldErrors: { amount: 'Monto inválido' },
          }),
          { status: 400 },
        ),
      ),
    );
    await expect(api('/account')).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      fields: { amount: 'Monto inválido' },
    });
  });
  it('keeps a lost response distinct from a definitive rejection', async () => {
    const failure = new TypeError('Network failed');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(failure));
    try {
      await api('/transfers', { method: 'POST' });
      throw new Error('Expected rejection');
    } catch (e) {
      expect(e).toBe(failure);
      expect(e).not.toBeInstanceOf(ApiError);
    }
  });
  it('handles logout without parsing an empty body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(api('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });
});
