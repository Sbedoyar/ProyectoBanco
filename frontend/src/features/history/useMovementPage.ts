import { useEffect, useState } from 'react';
import { useBankContext } from '../../app/BankingContext';
import { api, ApiError } from '../../shared/api/client';
import type { MovementPage } from '../../shared/types/bank';

/** Loads one owner-scoped server page; stale page/user responses are discarded. */
export function useMovementPage(page: number, size = 20) {
  const { user, account, receipt, report } = useBankContext();
  const key = `${user?.id}:${page}:${size}:${account?.balance}:${receipt?.reference}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data: MovementPage | null; error: unknown }>({
    key: '',
    data: null,
    error: null,
  });
  useEffect(() => {
    let active = true;
    setState({ key, data: null, error: null });
    api<MovementPage>(`/movements?page=${page}&size=${size}`)
      .then((data) => {
        if (active) setState({ key, data, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, data: null, error });
      });
    return () => {
      active = false;
    };
  }, [key, page, size, attempt]);
  useEffect(() => {
    if (state.key === key && state.error instanceof ApiError && state.error.status === 401)
      report(state.error);
  }, [state, key, report]);
  const current = state.key === key ? state : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: !current || (!current.data && !current.error),
    retry: () => setAttempt((n) => n + 1),
  };
}
