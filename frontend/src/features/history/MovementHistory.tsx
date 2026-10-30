import { Icon } from '../../shared/components/BankIdentity';
import type { MovementPage } from '../../shared/types/bank';
import { money } from '../../shared/utils/money';
/** Own-account history with bounded navigation and confirmed receipt links. */
export function MovementHistory({
  history,
  busy,
  onPage,
  onReceipt,
  compact = false,
  title = 'Histórico de movimientos',
}: {
  compact?: boolean;
  title?: string;
  history: MovementPage;
  busy: boolean;
  onPage: (page: number) => void;
  onReceipt: (reference: string) => void;
}) {
  return (
    <section className="history-card" aria-labelledby="history-title">
      <div className="history-header">
        <div>
          <h2 id="history-title" tabIndex={-1}>
            {title}
          </h2>
          <p>
            {compact
              ? 'Los últimos cinco movimientos de tu cuenta.'
              : 'Cada movimiento, con todos sus detalles.'}
          </p>
        </div>
        <span className="history-sort">
          <Icon name="history" />
          Más recientes primero
        </span>
      </div>
      {history.items.length === 0 && (
        <p className="empty" role="status">
          No hay movimientos en esta página.
        </p>
      )}
      <div className="movements">
        {history.items.map((m) => (
          <div className="movement" key={m.id}>
            <div className={`movement-icon ${m.type.toLowerCase()}`}>
              <Icon
                name={m.type === 'SENT' ? 'send' : m.type === 'RECEIVED' ? 'receive' : 'plus'}
              />
            </div>
            <div className="movement-description">
              <strong>
                {m.type === 'SENT'
                  ? 'Transferencia enviada'
                  : m.type === 'RECEIVED'
                    ? 'Transferencia recibida'
                    : 'Apertura de cuenta'}
              </strong>
              <span>
                {m.type === 'OPENING'
                  ? 'Saldo inicial de demostración'
                  : `Cuenta ${m.counterparty}`}{' '}
                · {new Date(m.occurredAt).toLocaleString('es-CO')}
              </span>
              {m.reference && (
                <button className="text-button" onClick={() => onReceipt(m.reference!)}>
                  <span className="receipt-link">
                    Ver comprobante <Icon name="right" />
                  </span>
                  <span className="reference">{m.reference}</span>
                </button>
              )}
            </div>
            <strong className={`movement-amount ${m.type === 'SENT' ? 'debit' : 'credit'}`}>
              {m.type === 'SENT' ? '−' : '+'} {money(m.amount)}
            </strong>
          </div>
        ))}
      </div>
      {history.items.length === 1 && history.items[0].type === 'OPENING' && (
        <p className="empty">
          Tu primera transferencia aparecerá aquí. El saldo inicial ya está listo.
        </p>
      )}
      {!compact && (
        <div className="pagination">
          <button
            className="quiet"
            disabled={history.page === 0 || busy}
            onClick={() => onPage(history.page - 1)}
          >
            ← Anterior
          </button>
          <span>Página {history.page + 1}</span>
          <button
            className="quiet"
            disabled={!history.hasNext || busy}
            onClick={() => onPage(history.page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </section>
  );
}
