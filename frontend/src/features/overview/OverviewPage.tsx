import { Link, useNavigate } from 'react-router';
import { useBankContext } from '../../app/BankingContext';
import { AccountSummary } from '../account/AccountSummary';
import { MovementHistory } from '../history/MovementHistory';
import { useMovementPage } from '../history/useMovementPage';
import { Icon } from '../../shared/components/BankIdentity';
import { PageHeading, QueryState } from '../../shared/components/PageHeading';
/** Bounded overview: account, actions and the latest five real movements. */
export function OverviewPage() {
  const b = useBankContext();
  const navigate = useNavigate();
  const recent = useMovementPage(0, 5);
  return (
    <>
      <div className="greeting">Hola, {b.user!.name.trim().split(' ')[0]}</div>
      <PageHeading
        title="Tu cuenta, al día."
        description="Un vistazo a tu cuenta. Elige tu próximo movimiento."
      />
      <div className="overview-grid">
        <AccountSummary account={b.account!} />
        <section className="quick-actions">
          <h2>¿Qué quieres hacer hoy?</h2>
          <p>Cada tarea tiene su propio espacio.</p>
          <Link to="/transferencias">
            <span className="action-symbol">
              <Icon name="transfer" />
            </span>
            <span>
              <strong>Hacer una transferencia</strong>
              <small>Revisa y confirma antes de enviar</small>
            </span>
            <Icon name="right" />
          </Link>
          <Link to="/movimientos">
            <span className="action-symbol">
              <Icon name="history" />
            </span>
            <span>
              <strong>Consultar movimientos</strong>
              <small>Enviados, recibidos y apertura</small>
            </span>
            <Icon name="right" />
          </Link>
          <Link to="/comprobantes">
            <span className="action-symbol">
              <Icon name="receipt" />
            </span>
            <span>
              <strong>Ver comprobantes</strong>
              <small>Vuelve a consultar tus transferencias</small>
            </span>
            <Icon name="right" />
          </Link>
        </section>
      </div>
      <QueryState loading={recent.loading} error={recent.error} onRetry={recent.retry} />
      {recent.data && (
        <MovementHistory
          history={recent.data}
          busy={false}
          onPage={() => {}}
          onReceipt={(ref) => navigate(`/comprobantes/${ref}`)}
          compact
          title="Actividad reciente"
        />
      )}
      <div className="module-end-link">
        <Link to="/movimientos">
          Ver el histórico completo <Icon name="right" />
        </Link>
      </div>
    </>
  );
}
