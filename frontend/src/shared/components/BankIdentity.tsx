import type { CSSProperties } from 'react';

const paths = {
  overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  wallet: 'M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6 M16 12h5v5h-5z',
  transfer: 'M4 7h16 M15 2l5 5-5 5 M20 17H4 M9 12l-5 5 5 5',
  send: 'M7 17 17 7 M7 7h10v10',
  receive: 'M17 7 7 17 M7 7v10h10',
  history: 'M3 11a9 9 0 1 1 3 8 M3 4v7h7 M12 7v5l3 2',
  logout: 'M9 4H4v16h5 M13 7l5 5-5 5 M8 12h13',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z M8 12l3 3 5-6',
  check: 'M5 12l4 4L19 6',
  right: 'M4 12h16 M14 6l6 6-6 6',
  down: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  receipt: 'M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h8',
  plus: 'M12 5v14 M5 12h14',
  globe: 'M3 12h18 M12 3c5 5 5 13 0 18 M12 3c-5 5-5 13 0 18 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
};

/** Decorative line icon; the surrounding visible label supplies the accessible name. */
export function Icon({
  name,
  className = '',
  style,
}: {
  name: keyof typeof paths;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Shared identity across public access and the authenticated workspace. */
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? 'brand-light' : ''}`}
      href="/"
      aria-label="Banco académico, inicio"
    >
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        banco<span className="brand-caption">académico</span>
      </span>
    </a>
  );
}

/** Persistent disclosure; the application handles only fictional money. */
export function SimulationNotice() {
  return (
    <div className="notice">
      <Icon name="shield" />
      <span>Simulación académica</span>
      <span>Todo el dinero es ficticio.</span>
    </div>
  );
}
