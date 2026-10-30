import { useEffect, useState } from 'react';
import { api, ApiError, refreshCsrf } from '../shared/api/client';
import { readPending } from '../features/transfer/pending';
import type { Account, Identity, MovementPage, Pending, Receipt } from '../shared/types/bank';
type Message = { text: string; error: boolean; fields?: Record<string, string> };

/** Coordinates session and uncertain requests; only explicit submission/retry sends money. */
export function useBanking() {
  const [booting, setBooting] = useState(true),
    [busy, setBusy] = useState(false),
    [user, setUser] = useState<Identity | null>(null),
    [account, setAccount] = useState<Account | null>(null),
    [history, setHistory] = useState<MovementPage | null>(null),
    [pending, setPending] = useState<Pending | null>(null),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [message, setMessage] = useState<Message | null>(null);

  async function load() {
    const [a, h] = await Promise.all([api<Account>('/account'), api<MovementPage>('/movements')]);
    setAccount(a);
    setHistory(h);
  }
  function report(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      setUser(null);
      setAccount(null);
      setHistory(null);
      setReceipt(null);
      setMessage({
        text: 'Tu sesión terminó. Inicia sesión para continuar; no se reenviará ninguna transferencia.',
        error: true,
      });
    } else
      setMessage({
        text: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        error: true,
        fields: error instanceof ApiError ? error.fields : {},
      });
  }
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const u = await api<Identity>('/auth/me');
        if (!active) return;
        setUser(u);
        setPending(readPending(u.id));
        await load();
      } catch (error) {
        if (active && !(error instanceof ApiError && error.status === 401)) report(error);
      } finally {
        if (active) setBooting(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);
  async function access(mode: 'login' | 'register', data: Record<string, string>) {
    setBusy(true);
    setMessage(null);
    try {
      await refreshCsrf();
      if (mode === 'register') {
        await api('/auth/register', { method: 'POST', body: JSON.stringify(data) });
        setMessage({
          text: 'Tu cuenta se creó con $1.000.000 COP ficticios. Ahora inicia sesión.',
          error: false,
        });
      } else {
        const u = await api<Identity>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        await refreshCsrf();
        setUser(u);
        setPending(readPending(u.id));
        await load();
      }
    } catch (e) {
      if (mode === 'login' && e instanceof ApiError && e.code === 'INVALID_CREDENTIALS')
        setMessage({ text: e.message, error: true });
      else report(e);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setAccount(null);
      setHistory(null);
      setReceipt(null);
      setPending(null);
      setMessage(null);
      await refreshCsrf();
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  function clearPending(operation: Pending) {
    sessionStorage.removeItem(`bank.pending.${operation.owner}`);
    setPending(null);
  }
  async function confirmed(value: Receipt, operation: Pending) {
    clearPending(operation);
    setReceipt(value);
    setMessage(null);
    try {
      await load();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) report(e);
      else
        setMessage({
          text: 'La transferencia está confirmada, pero no pudimos actualizar el saldo. Recarga la cuenta antes de continuar.',
          error: true,
        });
    }
  }
  async function send(operation: Pending) {
    setBusy(true);
    setMessage(null);
    try {
      const value = await api<Receipt>('/transfers', {
        method: 'POST',
        headers: { 'Idempotency-Key': operation.key },
        body: JSON.stringify({
          targetAccountNumber: operation.targetAccountNumber,
          amount: operation.amount,
        }),
      });
      await confirmed(value, operation);
    } catch (e) {
      if (e instanceof ApiError && [400, 404, 409].includes(e.status)) {
        clearPending(operation);
        report(e);
      } else if (e instanceof ApiError && e.status === 401) {
        report(e);
      } else if (e instanceof ApiError && e.status === 403) {
        setMessage({ text: e.message + ' Comprueba la operación antes de reenviar.', error: true });
        await refreshCsrf();
      } else {
        setMessage({
          text: 'No pudimos confirmar la respuesta. Comprueba el resultado; se conserva la misma operación para evitar duplicados.',
          error: true,
        });
      }
    } finally {
      setBusy(false);
    }
  }
  async function transfer(target: string, amount: string) {
    if (!user || pending) return;
    const operation = {
      owner: user.id,
      key: crypto.randomUUID(),
      targetAccountNumber: target,
      amount,
    };
    sessionStorage.setItem(`bank.pending.${user.id}`, JSON.stringify(operation));
    setPending(operation);
    await send(operation);
  }
  async function check() {
    if (!pending) return;
    setBusy(true);
    try {
      const value = await api<Receipt>(`/transfers/by-key/${pending.key}`);
      await confirmed(value, pending);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404)
        setMessage({
          text: 'Aún no hay un resultado confirmado. Puedes reintentar la misma operación de forma segura.',
          error: false,
        });
      else report(e);
    } finally {
      setBusy(false);
    }
  }
  return {
    booting,
    busy,
    user,
    account,
    history,
    pending,
    receipt,
    message,
    load,
    report,
    access,
    logout,
    transfer,
    check,
    send,
    setMessage,
    setReceipt,
    setBusy,
    setHistory,
  };
}
