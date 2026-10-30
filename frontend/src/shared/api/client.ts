/** A safe API error; network failures retain their separate, uncertain outcome semantics. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
let token = '';
/** Fetches the session's CSRF token; call after login and logout. */
export async function refreshCsrf(): Promise<void> {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error('No fue posible preparar la conexión segura.');
  token = (await response.json()).token;
}
/** Performs a same-origin JSON request. A rejected fetch is not treated as a rejected transfer.
 * @param path API-relative endpoint
 * @param options standard fetch options; mutating requests automatically receive CSRF
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET';
  if (method !== 'GET' && !token) await refreshCsrf();
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      ...(method !== 'GET' ? { 'X-CSRF-TOKEN': token } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const value = await response.json();
    throw new ApiError(
      response.status,
      value.code ?? 'REQUEST_FAILED',
      value.message ?? 'No se pudo completar la solicitud.',
      value.fieldErrors ?? {},
    );
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
