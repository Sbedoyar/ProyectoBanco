import { test, expect, request as requests } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test('reinicio real conserva saldo, histórico y apertura única', async () => {
  test.setTimeout(180000);
  const client = await requests.newContext({ baseURL: 'http://127.0.0.1:8081' });
  const recipient = await requests.newContext({ baseURL: 'http://127.0.0.1:8081' });
  const email = `${crypto.randomUUID()}@example.test`;
  const recipientEmail = `${crypto.randomUUID()}@example.test`;
  const password = 'Academia2026!';
  const token = async () => (await (await client.get('/api/auth/csrf')).json()).token as string;
  let t = await token();
  expect(
    (
      await client.post('/api/auth/register', {
        headers: { 'X-CSRF-TOKEN': t },
        data: { name: 'Persistencia', email, password },
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await client.post('/api/auth/login', {
        headers: { 'X-CSRF-TOKEN': t },
        data: { email, password },
      })
    ).status(),
  ).toBe(200);
  const recipientToken = (await (await recipient.get('/api/auth/csrf')).json()).token;
  expect(
    (
      await recipient.post('/api/auth/register', {
        headers: { 'X-CSRF-TOKEN': recipientToken },
        data: { name: 'Destino persistente', email: recipientEmail, password },
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await recipient.post('/api/auth/login', {
        headers: { 'X-CSRF-TOKEN': recipientToken },
        data: { email: recipientEmail, password },
      })
    ).status(),
  ).toBe(200);
  const destination = await (await recipient.get('/api/account')).json();
  t = await token();
  const transfer = await client.post('/api/transfers', {
    headers: { 'X-CSRF-TOKEN': t, 'Idempotency-Key': crypto.randomUUID() },
    data: { targetAccountNumber: destination.number, amount: '200.25' },
  });
  expect(transfer.status()).toBe(201);
  const receipt = await transfer.json();
  const before = await (await client.get('/api/account')).json();
  const history = await (await client.get('/api/movements')).json();
  expect(before.balance).toBe('999799.75');
  expect(
    history.items.filter((m: { reference: string }) => m.reference === receipt.reference),
  ).toHaveLength(1);

  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '../scripts/restart-test.ps1'],
    {
      timeout: 30000,
      stdio: 'ignore',
      windowsHide: true,
    },
  );
  await expect
    .poll(
      async () => {
        try {
          return (await client.get('/api/auth/csrf')).status();
        } catch {
          return 0;
        }
      },
      { timeout: 90000, intervals: [1000, 2000, 3000] },
    )
    .toBe(200);
  expect((await client.get('/api/account')).status()).toBe(401);
  t = await token();
  expect(
    (
      await client.post('/api/auth/login', {
        headers: { 'X-CSRF-TOKEN': t },
        data: { email, password },
      })
    ).status(),
  ).toBe(200);
  expect(await (await client.get('/api/account')).json()).toEqual(before);
  expect(await (await client.get('/api/movements')).json()).toEqual(history);
  expect(history.items.filter((m: { type: string }) => m.type === 'OPENING')).toHaveLength(1);
  const newRecipientToken = (await (await recipient.get('/api/auth/csrf')).json()).token;
  expect(
    (
      await recipient.post('/api/auth/login', {
        headers: { 'X-CSRF-TOKEN': newRecipientToken },
        data: { email: recipientEmail, password },
      })
    ).status(),
  ).toBe(200);
  expect((await (await recipient.get('/api/account')).json()).balance).toBe('1000200.25');
  await client.dispose();
  await recipient.dispose();
});
