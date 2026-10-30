import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useBankContext } from './BankingContext';
import { money } from '../shared/utils/money';

/** Shared request feedback and explicit pending recovery, without automatic retries. */
export function BankFeedback() {
  const b = useBankContext();
  const messageRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    if (b.message) messageRef.current?.focus();
  }, [b.message]);
  return (
    <>
      {b.message && (
        <div
          className={`message ${b.message.error ? 'error' : ''}`}
          role={b.message.error ? 'alert' : 'status'}
          tabIndex={-1}
          ref={messageRef}
        >
          <p>{b.message.text}</p>
          {b.message.fields && (
            <ul>
              {Object.entries(b.message.fields).map(([field, text]) => (
                <li key={field}>
                  <a
                    href={`#${field}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(field)?.focus();
                    }}
                  >
                    {field}: {text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {b.user && b.pending && (
        <div className="message" role="status">
          <p>
            Operación pendiente: {money(b.pending.amount)} hacia la cuenta terminada en{' '}
            {b.pending.targetAccountNumber.slice(-4)}.
          </p>
          <button disabled={b.busy} onClick={() => void b.check()}>
            Comprobar resultado
          </button>
          <button className="secondary" disabled={b.busy} onClick={() => void b.send(b.pending!)}>
            Reintentar misma operación
          </button>
        </div>
      )}
      {b.user &&
        b.receipt &&
        !b.pending &&
        pathname !== '/transferencias' &&
        !pathname.startsWith('/comprobantes/') && (
          <div className="message confirmation-note">
            <span>Tu última transferencia está confirmada.</span>
            <Link to={`/comprobantes/${b.receipt.reference}`}>Ver último comprobante</Link>
          </div>
        )}
    </>
  );
}
