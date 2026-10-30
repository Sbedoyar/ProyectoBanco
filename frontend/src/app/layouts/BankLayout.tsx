import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Brand, Icon, SimulationNotice } from '../../shared/components/BankIdentity';
import { useBankContext } from '../BankingContext';
import { BankFeedback } from '../BankFeedback';
import { routeTitle } from '../routes';
const navigation = [
  { path: '/resumen', label: 'Resumen', icon: 'overview' },
  { path: '/transferencias', label: 'Transferencias', icon: 'transfer' },
  { path: '/movimientos', label: 'Movimientos', icon: 'history' },
  { path: '/comprobantes', label: 'Comprobantes', icon: 'receipt' },
  { path: '/perfil', label: 'Mi perfil', icon: 'wallet' },
] as const;
/** Persistent bank chrome with true active routes and a responsive module navigation. */
export function BankLayout() {
  const b = useBankContext();
  const navigate = useNavigate();
  const user = b.user!;
  const { pathname } = useLocation();
  return (
    <div className="bank-layout">
      <aside className="sidebar" aria-label="Navegación principal">
        <Brand />
        <nav className="bank-nav" aria-label="Módulos bancarios">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="learning-note">
            <span className="learning-icon">
              <Icon name="shield" />
            </span>
            <strong>Tu espacio para aprender</strong>
            <p>Explora la banca digital con dinero ficticio.</p>
            <span className="learning-badge">Simulación académica</span>
          </div>
          <button
            className="logout-button"
            onClick={() => {
              void b.logout().then(() => navigate('/login', { replace: true, state: null }));
            }}
            disabled={b.busy}
          >
            <Icon name="logout" />
            Cerrar sesión
          </button>
          <p className="sidebar-foot">
            ProyectoBanco <span>2026</span>
          </p>
        </div>
      </aside>
      <div className="bank-body">
        <header className="topbar">
          <div className="breadcrumb">
            <Icon name="wallet" />
            <span>Mi banca</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{routeTitle(pathname)}</strong>
          </div>
          <div className="user-profile">
            <span className="avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="user-name">
              {user.name}
              <small>Cuenta personal</small>
            </span>
          </div>
        </header>
        <SimulationNotice />
        <BankFeedback />
        <main id="main-content" tabIndex={-1} className="dashboard">
          <div key={pathname} className="route-page">
            <Outlet />
          </div>
          <footer>
            <span>Banco académico</span>
            <span>Tu dinero es ficticio. La experiencia es real.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
