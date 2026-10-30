import { useNavigate, useSearchParams } from 'react-router';
import { useMovementPage } from './useMovementPage';
import { filterMovements, movementPage, type MovementKind } from './filterMovements';
import { MovementHistory } from './MovementHistory';
import { PageHeading, QueryState } from '../../shared/components/PageHeading';

/** History pagination remains server-side; optional filters apply visibly to the loaded page only. */
export function MovementsPage() {
  const [params, setParams] = useSearchParams();
  const page = movementPage(params.get('page'));
  const query = params.get('q') ?? '';
  const raw = params.get('type');
  const kind: MovementKind =
    raw === 'SENT' || raw === 'RECEIVED' || raw === 'OPENING' ? raw : 'ALL';
  const result = useMovementPage(page);
  const navigate = useNavigate();
  function filter(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }
  return (
    <>
      <PageHeading
        title="Movimientos"
        description="Consulta el detalle de tu cuenta, una página a la vez."
      />
      <section className="filter-panel" aria-label="Filtros de movimientos">
        <div>
          <label htmlFor="movement-query">Buscar en esta página</label>
          <input
            id="movement-query"
            type="search"
            value={query}
            onChange={(e) => filter('q', e.target.value)}
            placeholder="Referencia, cuenta o monto"
          />
        </div>
        <div>
          <label htmlFor="movement-kind">Tipo de movimiento</label>
          <select id="movement-kind" value={kind} onChange={(e) => filter('type', e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="SENT">Enviados</option>
            <option value="RECEIVED">Recibidos</option>
            <option value="OPENING">Apertura</option>
          </select>
        </div>
        <p>La búsqueda y los filtros se aplican sólo a los movimientos de la página cargada.</p>
      </section>
      <QueryState loading={result.loading} error={result.error} onRetry={result.retry} />
      {result.data && (
        <MovementHistory
          history={{ ...result.data, items: filterMovements(result.data.items, kind, query) }}
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
