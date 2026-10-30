import { type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Icon } from '../../shared/components/BankIdentity';
import { useBankContext } from '../../app/BankingContext';
import { BankFeedback } from '../../app/BankFeedback';
/** Routed access form retaining credential validation and explicit login after registration. */
export function Access({ mode }: { mode: 'login' | 'register' }) {
  const { busy, access: onSubmit } = useBankContext();
  const location = useLocation();
  const message = <BankFeedback />;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    void onSubmit(mode, data);
  }
  return (
    <div className="auth-card">
      <span className="access-emblem">
        <Icon name={mode === 'login' ? 'wallet' : 'plus'} />
      </span>
      <h2 data-page-title tabIndex={-1}>
        {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
      </h2>
      <p>
        {mode === 'login'
          ? 'Qué bueno tenerte de vuelta. Tu cuenta te espera.'
          : 'Empieza con $1.000.000 COP ficticios y una cuenta a tu nombre.'}
      </p>
      <div className="auth-feedback">{message}</div>
      <form onSubmit={submit} key={mode}>
        {mode === 'register' && (
          <>
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              disabled={busy}
              placeholder="¿Cómo te llamas?"
            />
          </>
        )}
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          disabled={busy}
          placeholder="tu@correo.com"
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === 'register' ? 12 : 1}
          maxLength={128}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          disabled={busy}
          placeholder="Escribe tu contraseña"
        />
        {mode === 'register' && (
          <p className="hint">Entre 12 y 128 caracteres. Tu cuenta se crea automáticamente.</p>
        )}
        <button className="wide" disabled={busy}>
          {busy ? 'Conectando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          <Icon name="right" />
        </button>
      </form>
      <div className="access-switch">
        <Link
          className="text-button"
          to={mode === 'login' ? '/registro' : '/login'}
          state={location.state}
        >
          {mode === 'login'
            ? '¿Primera vez? Crea tu cuenta'
            : 'Ya tengo una cuenta. Iniciar sesión'}
        </Link>
      </div>
      <div className="access-opening">
        <Icon name="shield" />
        <span>
          Una cuenta personal. Un entorno de aprendizaje.
          <br />
          Siempre con dinero ficticio.
        </span>
      </div>
    </div>
  );
}
