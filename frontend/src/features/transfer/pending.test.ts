import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { readPending } from './pending';
const data = new Map<string, string>();
beforeEach(() => {
  data.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => data.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());
describe('pending intent recovery', () => {
  it('restores the same key and amount only for its owner', () => {
    const intent = {
      owner: 1,
      key: 'retained-key',
      targetAccountNumber: '100000000002',
      amount: '125.50',
    };
    data.set('bank.pending.1', JSON.stringify(intent));
    expect(readPending(1)).toEqual(intent);
    expect(readPending(2)).toBeNull();
  });
  it('removes malformed JSON without sending any request', () => {
    data.set('bank.pending.1', '{broken');
    expect(readPending(1)).toBeNull();
    expect(data.has('bank.pending.1')).toBe(false);
  });
  it('rejects another owner stored under the current key', () => {
    data.set(
      'bank.pending.1',
      JSON.stringify({ owner: 2, key: 'key', targetAccountNumber: '100000000002', amount: '1' }),
    );
    expect(readPending(1)).toBeNull();
    expect(data.has('bank.pending.1')).toBe(false);
  });
  it('rejects incomplete data', () => {
    data.set('bank.pending.1', JSON.stringify({ owner: 1, key: 'key' }));
    expect(readPending(1)).toBeNull();
  });
});
