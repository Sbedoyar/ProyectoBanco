import { Outlet } from 'react-router';
import { Brand, Icon, SimulationNotice } from '../../shared/components/BankIdentity';
/** Shared access identity; routed forms preserve the same visual language. */
export function AuthLayout() {
  return (
    <main id="main-content" tabIndex={-1} className="auth-layout">
      {' '}
      <section className="auth-story">
        <header className="auth-brand-row">
          <Brand light />
          <span className="academic-tag">Hecho para aprender</span>
        </header>
        <div className="auth-intro">
          <h1>
            Tu dinero,
            <br /> en movimiento.
          </h1>
          <p>
            Un espacio para aprender a transferir, seguir tus movimientos y tener cada detalle a la
            mano.
          </p>
        </div>
        <div className="connection-art" aria-hidden="true">
          <div className="connection-line" />
          <div className="art-account art-source">
            <span className="art-account-icon">
              <Icon name="wallet" />
            </span>
            <span>Tu punto de partida</span>
            <strong>
              $1.000.000<span>COP ficticios</span>
            </strong>
            <div className="art-account-foot">
              <span>Cuenta de demostración</span>
              <span className="art-dots">••••</span>
            </div>
          </div>
          <div className="art-transfer">
            <Icon name="transfer" />
          </div>
          <div className="art-confirmation">
            <span>
              <Icon name="check" />
            </span>
            <div>
              Transferir con claridad<small>Revisa. Confirma. Conserva.</small>
            </div>
            <Icon name="receipt" />
          </div>
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
        </div>
        <div className="auth-story-foot">
          <Icon name="globe" />
          <span>
            Pensado en pesos colombianos.
            <br />
            <strong>Diseñado para practicar.</strong>
          </span>
        </div>
      </section>
      <section className="auth-content">
        <div className="auth-top-note">
          <span className="live-dot" />
          Una experiencia de banca digital
        </div>
        <Outlet />
        <SimulationNotice />
      </section>
    </main>
  );
}
