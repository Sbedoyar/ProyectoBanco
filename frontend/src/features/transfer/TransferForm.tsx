import { Icon } from '../../shared/components/BankIdentity';
import { validateTransfer, type TransferValidation } from './validation';
import { useState, type FormEvent } from 'react';
import type { Pending } from '../../shared/types/bank';
import { money } from '../../shared/utils/money';

/** Reviews an exact intent before delegating submission; pending state prevents a new operation. */
export function TransferForm({
  busy,
  pending,
  onTransfer,
  onEdit,
}: {
  busy: boolean;
  pending: Pending | null;
  onTransfer: (target: string, amount: string) => Promise<void>;
  onEdit?: () => void;
}) {
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [review, setReview] = useState(false);
  const [validation, setValidation] = useState<TransferValidation | null>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateTransfer(target, amount);
    setValidation(error);
    if (error) {
      document.getElementById(error.field)?.focus();
      return;
    }
    setReview(true);
  }
  return (
    <section className="transfer-card" aria-labelledby="transfer-title">
      <div className="section-heading">
        <span className="section-icon">
          <Icon name="send" />
        </span>
        <div>
          <h2 id="transfer-title" tabIndex={-1}>
            Hacer una transferencia
          </h2>
          <p>De tu cuenta a otra, en unos pasos.</p>
        </div>
      </div>
      {pending ? (
        <div className="pending-inline">
          <span className="pending-symbol">
            <Icon name="history" />
          </span>
          <h3>Hay una operación pendiente de comprobar</h3>
          <p>Comprueba su resultado antes de empezar una nueva.</p>
        </div>
      ) : review ? (
        <div className="review">
          <span className="review-symbol">
            <Icon name="receipt" />
          </span>
          <h3>Revisa antes de enviar</h3>
          <dl>
            <dt>Cuenta destino</dt>
            <dd>{target}</dd>
            <dt>Monto</dt>
            <dd>{money(amount)}</dd>
          </dl>
          <p>El movimiento se realiza con dinero ficticio.</p>
          <div className="actions">
            <button className="secondary" onClick={() => setReview(false)} disabled={busy}>
              Editar
            </button>
            <button
              onClick={() => {
                void onTransfer(target, amount);
                setReview(false);
              }}
              disabled={busy}
            >
              Confirmar transferencia <Icon name="send" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          {validation && (
            <p id="transfer-error" role="alert" className="field-error">
              {validation.message}
            </p>
          )}
          <label htmlFor="target">Cuenta destino</label>
          <input
            id="target"
            name="target"
            aria-invalid={validation?.field === 'target'}
            aria-describedby={
              validation?.field === 'target' ? 'target-hint transfer-error' : 'target-hint'
            }
            inputMode="numeric"
            autoComplete="off"
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              setValidation(null);
              onEdit?.();
            }}
            placeholder="12 dígitos"
            required
            maxLength={12}
            disabled={busy}
          />
          <p id="target-hint" className="hint">
            Usa el número de otra cuenta de esta simulación.
          </p>
          <label htmlFor="amount">
            Monto a transferir <span>COP</span>
          </label>
          <input
            id="amount"
            name="amount"
            aria-invalid={validation?.field === 'amount'}
            aria-describedby={
              validation?.field === 'amount' ? 'amount-hint transfer-error' : 'amount-hint'
            }
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(',', '.'));
              setValidation(null);
              onEdit?.();
            }}
            placeholder="0.00"
            required
            disabled={busy}
          />
          <p id="amount-hint" className="hint">
            Hasta dos decimales. Sin comisiones.
          </p>
          <button className="wide" disabled={busy}>
            {busy ? 'Enviando…' : 'Revisar transferencia'} <Icon name="right" />
          </button>
        </form>
      )}
    </section>
  );
}
