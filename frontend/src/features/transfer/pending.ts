import type { Pending } from '../../shared/types/bank';
/** Reads a pending intent only for its authenticated owner, ignoring malformed browser state. */
export function readPending(owner: number): Pending | null {
  const raw = sessionStorage.getItem(`bank.pending.${owner}`);
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(`bank.pending.${owner}`);
    return null;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'owner' in value &&
    value.owner === owner &&
    'key' in value &&
    typeof value.key === 'string' &&
    'amount' in value &&
    typeof value.amount === 'string' &&
    'targetAccountNumber' in value &&
    typeof value.targetAccountNumber === 'string'
  )
    return value as Pending;
  sessionStorage.removeItem(`bank.pending.${owner}`);
  return null;
}
