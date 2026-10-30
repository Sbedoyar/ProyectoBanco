import type { Receipt } from '../../shared/types/bank';
/** Builds the versioned QR payload exclusively from a confirmed receipt. */
export function qrPayload(receipt: Receipt): string {
  return JSON.stringify({ version: 1, simulation: true, ...receipt });
}
