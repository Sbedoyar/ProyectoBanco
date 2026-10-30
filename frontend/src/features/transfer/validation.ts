import { validAmount } from '../../shared/utils/money';
/** The invalid control and message used for accessible focus and descriptions. */
export type TransferValidation = { field: 'target' | 'amount'; message: string };
/** Validates presentation input without determining funds or authorizing a transfer. */
export function validateTransfer(target: string, amount: string): TransferValidation | null {
  if (!/^\d{12}$/.test(target))
    return { field: 'target', message: 'Escribe los 12 dígitos de la cuenta destino.' };
  if (!validAmount(amount))
    return { field: 'amount', message: 'Escribe un monto mayor a cero con hasta dos decimales.' };
  return null;
}
