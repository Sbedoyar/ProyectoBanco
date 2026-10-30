import { Link } from 'react-router';
import { useBankContext } from '../../app/BankingContext';
import { TransferForm } from './TransferForm';
import { ReceiptPanel } from '../receipt/ReceiptPanel';
import { money } from '../../shared/utils/money';
import { PageHeading } from '../../shared/components/PageHeading';
import { Icon } from '../../shared/components/BankIdentity';
/** Dedicated transfer flow; the original coordinator owns all monetary submission and retries. */
export function TransferPage() {
  const b = useBankContext();
  return (
    <>
      <PageHeading
        title="Transferencias"
        description="De tu cuenta a otra, con cada paso a la vista."
      />
      <ol className="transfer-progress" aria-label="Progreso de la transferencia">
        <li className={!b.receipt ? 'current' : 'complete'}>
          <span>1</span>Datos y revisión
        </li>
        <li className={b.pending ? 'current' : b.receipt ? 'complete' : ''}>
          <span>2</span>Confirmación
        </li>
        <li className={b.receipt ? 'current' : ''}>
          <span>3</span>Comprobante
        </li>
      </ol>
      <div className="transfer-module">
        <div>
          {b.receipt ? (
            <>
              <ReceiptPanel receipt={b.receipt} onClose={() => b.setReceipt(null)} />
              <div className="module-end-link">
                <Link to={`/comprobantes/${b.receipt.reference}`}>
                  Abrir comprobante en su página <Icon name="right" />
                </Link>
              </div>
            </>
          ) : (
            <TransferForm
              busy={b.busy}
              pending={b.pending}
              onTransfer={b.transfer}
              onEdit={() => b.setMessage(null)}
            />
          )}
        </div>
        <aside className="transfer-context">
          <span className="context-icon">
            <Icon name="wallet" />
          </span>
          <h2>Tu cuenta de origen</h2>
          <p>El dinero sale únicamente de tu cuenta.</p>
          <dl>
            <dt>Número de cuenta</dt>
            <dd>{b.account!.number}</dd>
            <dt>Saldo disponible</dt>
            <dd data-testid="balance">{money(b.account!.balance)}</dd>
          </dl>
          <div className="context-note">
            <Icon name="shield" />
            <p>
              Todo el dinero es ficticio. El saldo sólo cambia cuando el backend confirma la
              operación.
            </p>
          </div>
          <Link to="/movimientos">Consultar movimientos</Link>
        </aside>
      </div>
    </>
  );
}
