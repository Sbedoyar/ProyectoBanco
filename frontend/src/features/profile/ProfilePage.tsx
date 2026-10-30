import { useBankContext } from '../../app/BankingContext';
import { PageHeading } from '../../shared/components/PageHeading';
import { Icon } from '../../shared/components/BankIdentity';
/** Read-only profile based exclusively on authenticated identity and own account data. */
export function ProfilePage() {
  const b = useBankContext();
  return (
    <>
      <PageHeading title="Mi perfil" description="Tus datos y tu cuenta, en un solo lugar." />
      <section className="profile-card">
        <span className="profile-avatar">{b.user!.name.trim().charAt(0).toUpperCase()}</span>
        <div>
          <h2>{b.user!.name}</h2>
          <p>Cuenta personal de demostración</p>
        </div>
        <dl>
          <dt>Nombre</dt>
          <dd>{b.user!.name}</dd>
          <dt>Correo electrónico</dt>
          <dd>{b.user!.email}</dd>
          <dt>Número de cuenta</dt>
          <dd>{b.account!.number}</dd>
          <dt>Moneda</dt>
          <dd>Pesos colombianos (COP)</dd>
        </dl>
        <p className="context-note">
          <Icon name="shield" />
          Estos datos son de consulta. La edición de perfil no está disponible en esta aplicación.
        </p>
      </section>
    </>
  );
}
