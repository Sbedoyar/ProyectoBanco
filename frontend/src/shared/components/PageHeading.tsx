import type { ReactNode } from 'react';
/** Heading and restrained page-specific context shared by independent banking modules. */
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title module-heading">
      <div>
        <h1 data-page-title tabIndex={-1}>
          {title}
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
/** Explicit loading, failure and retry for GET-only routed data. */
export function QueryState({
  loading,
  error,
  onRetry,
  label = 'Cargando movimientos…',
}: {
  label?: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  return loading ? (
    <p className="query-state" role="status">
      {label}
    </p>
  ) : error ? (
    <div className="query-state" role="alert">
      <p>{error instanceof Error ? error.message : 'No fue posible cargar la información.'}</p>
      <button className="secondary" onClick={onRetry}>
        Volver a intentar
      </button>
    </div>
  ) : null;
}
