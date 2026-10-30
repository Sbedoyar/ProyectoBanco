import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { useBankContext } from './BankingContext';
import { BankFeedback } from './BankFeedback';
import { BankLayout } from './layouts/BankLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Access } from '../features/auth/Access';
import { OverviewPage } from '../features/overview/OverviewPage';
import { TransferPage } from '../features/transfer/TransferPage';
import { MovementsPage } from '../features/history/MovementsPage';
import { ReceiptsPage, ReceiptDetailPage } from '../features/receipt/ReceiptsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { routeTitle, safeReturnPath } from './routes';

function RequireSession() {
  const b = useBankContext();
  const location = useLocation();
  if (b.booting)
    return (
      <p className="loading" role="status">
        Preparando tu cuenta…
      </p>
    );
  if (!b.user)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!b.account || !b.history) {
    if (b.busy)
      return (
        <p className="loading" role="status">
          Cargando tu cuenta…
        </p>
      );
    return (
      <main id="main-content" className="loading">
        <BankFeedback />
        <p>No se pudo cargar la cuenta.</p>
        <button onClick={() => void b.load().catch(b.report)}>Volver a cargar</button>
        <button className="secondary" onClick={() => void b.logout()}>
          Cerrar sesión
        </button>
      </main>
    );
  }
  return <Outlet />;
}
function GuestOnly() {
  const b = useBankContext();
  const location = useLocation();
  if (b.booting)
    return (
      <p className="loading" role="status">
        Preparando tu cuenta…
      </p>
    );
  return b.user ? <Navigate to={safeReturnPath(location.state?.from)} replace /> : <Outlet />;
}
function RouteFocus() {
  const { pathname } = useLocation();
  const { user, account, booting } = useBankContext();
  const hasAccount = Boolean(account);
  useEffect(() => {
    document.title = `${routeTitle(pathname)} · Banco académico`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector<HTMLElement>('[data-page-title]')?.focus();
  }, [pathname, user?.id, hasAccount, booting]);
  return null;
}
/** Client routes share one bank coordinator and server-authorized data. */
export default function App() {
  return (
    <>
      <a
        className="skip"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <RouteFocus />
      <Routes>
        <Route element={<GuestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Access mode="login" />} />
            <Route path="/registro" element={<Access mode="register" />} />
          </Route>
        </Route>
        <Route element={<RequireSession />}>
          <Route element={<BankLayout />}>
            <Route path="/resumen" element={<OverviewPage />} />
            <Route path="/transferencias" element={<TransferPage />} />
            <Route path="/movimientos" element={<MovementsPage />} />
            <Route path="/comprobantes" element={<ReceiptsPage />} />
            <Route path="/comprobantes/:reference" element={<ReceiptDetailPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/resumen" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
