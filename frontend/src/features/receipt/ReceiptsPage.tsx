import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useBankContext } from '../../app/BankingContext';
import { useMovementPage } from '../history/useMovementPage';
import { filterMovements, movementPage } from '../history/filterMovements';
import { MovementHistory } from '../history/MovementHistory';
import { ReceiptPanel } from './ReceiptPanel';
import { PageHeading, QueryState } from '../../shared/components/PageHeading';
import { api, ApiError } from '../../shared/api/client';
import type { Receipt } from '../../shared/types/bank';

/** Discovers confirmed references from paginated own movements; never invents a separate archive. */
export function ReceiptsPage() {
  const [params, setParams] = useSearchParams();
  const page = movementPage(params.get('page'));
  const query = params.get('q') ?? '';
  const result = useMovementPage(page);
  const navigate = useNavigate();
  return (
    <>
      <PageHeading
        title="Comprobantes"
        description="Consulta de nuevo los datos y el QR de tus transferencias."
      />
      <section className="filter-panel receipts-search">
        <div>
          <label htmlFor="receipt-query">Buscar en esta página</label>
          <input
            id="receipt-query"
            type="search"
            value={query}
            placeholder="Referencia, cuenta o monto"
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setParams(next, { replace: true });
            }}
          />
        </div>
        <p>
          Se muestran comprobantes enviados y recibidos de esta página de movimientos. La apertura
          de cuenta no genera comprobante.
        </p>
      </section>
      <QueryState loading={result.loading} error={result.error} onRetry={result.retry} />
      {result.data && (
        <MovementHistory
          title="Transferencias de esta página"
          history={{
            ...result.data,
            items: filterMovements(
              result.data.items.filter((row) => row.reference !== null),
              'ALL',
              query,
            ),
          }}
          busy={result.loading}
          onPage={(value) => {
            const next = new URLSearchParams(params);
            next.set('page', String(value));
            setParams(next);
          }}
          onReceipt={(reference) => navigate(`/comprobantes/${reference}`)}
        />
      )}
    </>
  );
}
/** Reloadable GET-only receipt page; stale responses cannot cross references or users. */
export function ReceiptDetailPage() {
  const { reference = '' } = useParams();
  const { user, report } = useBankContext();
  const key = `${user?.id}:${reference}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; receipt: Receipt | null; error: unknown }>({
    key: '',
    receipt: null,
    error: null,
  });
  useEffect(() => {
    let active = true;
    setState({ key, receipt: null, error: null });
    api<Receipt>(`/transfers/${encodeURIComponent(reference)}`)
      .then((receipt) => {
        if (active) setState({ key, receipt, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, receipt: null, error });
      });
    return () => {
      active = false;
    };
  }, [key, reference, attempt]);
  useEffect(() => {
    if (state.key === key && state.error instanceof ApiError && state.error.status === 401)
      report(state.error);
  }, [state, key, report]);
  const current = state.key === key ? state : null;
  const navigate = useNavigate();
  return (
    <>
      <PageHeading
        title="Comprobante de transferencia"
        description="Un resultado confirmado. Consultarlo no vuelve a mover dinero."
      />
      <Link className="back-link" to="/comprobantes">
        Volver a comprobantes
      </Link>
      <QueryState
        label="Cargando comprobante…"
        loading={!current || (!current.receipt && !current.error)}
        error={current?.error}
        onRetry={() => setAttempt((n) => n + 1)}
      />
      {current?.receipt && (
        <ReceiptPanel receipt={current.receipt} onClose={() => navigate('/comprobantes')} />
      )}
    </>
  );
}
