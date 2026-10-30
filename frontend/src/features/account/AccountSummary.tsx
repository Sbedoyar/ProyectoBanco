import type { Account } from '../../shared/types/bank';
import { money } from '../../shared/utils/money';
import { Icon } from '../../shared/components/BankIdentity';

/** Presents the exact server balance and account number; no client balance calculations. */
export function AccountSummary({ account }: { account: Account }) {
  return (
    <section className="balance-card" aria-label="Tu cuenta">
      <div className="balance-card-art" aria-hidden="true">
        <svg viewBox="0 0 440 400" fill="none">
          <path
            d="M450 40C210 40 210 330 450 330M470 75C270 75 270 295 470 295M470 110C330 110 330 260 470 260"
            stroke="currentColor"
            strokeWidth="36"
          />
        </svg>
      </div>
      <div className="balance-top">
        <span>
          <Icon name="wallet" />
          Saldo disponible
        </span>
        <span className="balance-status">
          <i />
          Activa
        </span>
      </div>
      <p className="balance" data-testid="balance">
        {money(account.balance)}
      </p>
      <p className="balance-label">Tu saldo para nuevos movimientos</p>
      <div className="balance-foot">
        <div className="account-number">
          <span>Mi cuenta de demostración</span>
          <strong>{account.number}</strong>
        </div>
        <span className="account-currency">
          COP
          <Icon name="globe" />
        </span>
      </div>
      <span className="balance-disclosure">Dinero ficticio</span>
    </section>
  );
}
