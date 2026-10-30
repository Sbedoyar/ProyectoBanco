const titles: Record<string, string> = {
  '/login': 'Inicia sesión',
  '/registro': 'Crea tu cuenta',
  '/resumen': 'Resumen',
  '/transferencias': 'Transferencias',
  '/movimientos': 'Movimientos',
  '/comprobantes': 'Comprobantes',
  '/perfil': 'Mi perfil',
};
/** Context title shared by browser and persistent application header. */
export function routeTitle(path: string) {
  return path.startsWith('/comprobantes/') ? 'Comprobante' : (titles[path] ?? 'Resumen');
}
/** Accepts only known internal protected destinations after authentication. */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string') return '/resumen';
  const path = value.split('?')[0];
  return ['/resumen', '/transferencias', '/movimientos', '/comprobantes', '/perfil'].includes(
    path,
  ) || /^\/comprobantes\/[0-9a-f-]{36}$/i.test(path)
    ? value
    : '/resumen';
}
