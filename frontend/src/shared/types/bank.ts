/** Public API identity; contains no authentication credentials. */
export type Identity = { id: number; name: string; email: string };
/** Own account; decimal strings preserve monetary precision across JSON. */
export type Account = { number: string; balance: string; currency: 'COP' };
/** Confirmed receipt returned by the server. */
export type Receipt = {
  reference: string;
  occurredAt: string;
  amount: string;
  currency: 'COP';
  sourceAccountMasked: string;
  targetAccountMasked: string;
};
/** History rows carry their own direction and a nullable transfer reference. */
export type Movement = {
  id: string;
  type: 'OPENING' | 'SENT' | 'RECEIVED';
  reference: string | null;
  amount: string;
  currency: string;
  occurredAt: string;
  counterparty: string;
};
/** Bounded history page. */
export type MovementPage = { items: Movement[]; page: number; size: number; hasNext: boolean };
/** An operation's identity is retained until a definitive server response. */
export type Pending = { owner: number; key: string; targetAccountNumber: string; amount: string };
