import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
const base = 'http://127.0.0.1:8081/api';
const password = 'Academia2026!';
async function csrf(client: APIRequestContext) {
  const r = await client.get(`${base}/auth/csrf`);
  expect(r.ok()).toBe(true);
  return (await r.json()).token as string;
}
async function session(name: string) {
  const client = await requests.newContext();
  const email = `${crypto.randomUUID()}@example.test`;
  let token = await csrf(client);
  expect(
    (
      await client.post(`${base}/auth/register`, {
        headers: { 'X-CSRF-TOKEN': token },
        data: { name, email, password },
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await client.post(`${base}/auth/login`, {
        headers: { 'X-CSRF-TOKEN': token },
        data: { email, password },
      })
    ).status(),
  ).toBe(200);
  token = await csrf(client);
  const account = await (await client.get(`${base}/account`)).json();
  return { client, email, token, account };
}
async function login(page: Page, email: string) {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Tu cuenta, al día.' })).toBeVisible();
}
async function openTransfers(page: Page) {
  if (!page.url().includes('#/transferencias'))
    await page
      .getByRole('navigation', { name: 'Módulos bancarios' })
      .getByRole('link', { name: 'Transferencias', exact: true })
      .click();
  await expect(page.getByRole('heading', { name: 'Transferencias', exact: true })).toBeVisible();
}
async function prepare(page: Page, target: string, amount: string) {
  await openTransfers(page);
  await page.getByLabel('Cuenta destino', { exact: true }).fill(target);
  await page.getByLabel('Monto a transferir').fill(amount);
  await page.getByRole('button', { name: 'Revisar transferencia' }).click();
}
test('HTTP: autorización, CSRF, identidad única y logout', async () => {
  const anon = await requests.newContext();
  expect((await anon.get(`${base}/account`)).status()).toBe(401);
  expect((await anon.post(`${base}/transfers`, { data: {} })).status()).toBe(401);
  const a = await session('Usuario de seguridad');
  expect((await a.client.post(`${base}/transfers`, { data: {} })).status()).toBe(403);
  await expect((await a.client.get(`${base}/account?ownerId=999`)).json()).resolves.toMatchObject({
    number: a.account.number,
  });
  expect(
    (
      await a.client.post(`${base}/auth/register`, {
        headers: { 'X-CSRF-TOKEN': a.token },
        data: { name: 'Duplicado', email: a.email.toUpperCase(), password },
      })
    ).status(),
  ).toBe(409);
  expect(
    (await a.client.post(`${base}/auth/logout`, { headers: { 'X-CSRF-TOKEN': a.token } })).status(),
  ).toBe(204);
  expect((await a.client.get(`${base}/account`)).status()).toBe(401);
  const t = await csrf(anon);
  expect(
    (
      await anon.post(`${base}/auth/login`, {
        headers: { 'X-CSRF-TOKEN': t },
        data: { email: a.email, password: 'incorrecta' },
      })
    ).status(),
  ).toBe(401);
  await a.client.dispose();
  await anon.dispose();
});
test('recorrido real: registro, transferencia, QR decodificado e histórico privado', async ({
  page,
}) => {
  const destination = await session('Destinatario de prueba');
  const email = `${crypto.randomUUID()}@example.test`;
  await page.goto('/');
  await expect(page.getByText('SIMULACIÓN ACADÉMICA', { exact: false })).toBeVisible();
  await page.screenshot({ path: '../.local/ui-artifacts/access-1280.png', fullPage: true });
  await page.getByRole('link', { name: '¿Primera vez? Crea tu cuenta' }).click();
  await page
    .getByLabel('Nombre', { exact: true })
    .fill('Alejandra María Martínez de la Universidad');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Crear cuenta', exact: false }).click();
  await expect(page.getByRole('status')).toContainText('Tu cuenta se creó');
  await page.getByRole('link', { name: 'Ya tengo una cuenta. Iniciar sesión' }).click();
  await login(page, email);
  for (const width of [360, 768, 1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `../.local/ui-artifacts/account-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await prepare(page, destination.account.number, '150000');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeVisible();
  await expect(page.getByTestId('balance')).toHaveText('$ 850.000,00 COP');
  const image = page.getByTestId('qr');
  await expect(image).toBeVisible();
  const src = await image.getAttribute('src');
  const png = PNG.sync.read(Buffer.from(src!.split(',')[1], 'base64'));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded).not.toBeNull();
  const payload = JSON.parse(decoded!.data);
  expect(payload).toMatchObject({
    version: 1,
    simulation: true,
    amount: '150000.00',
    currency: 'COP',
    targetAccountMasked: `********${destination.account.number.slice(-4)}`,
  });
  expect(payload.reference).toBe(await page.getByTestId('reference').textContent());
  expect(Object.keys(payload).sort()).toEqual(
    [
      'version',
      'simulation',
      'reference',
      'occurredAt',
      'amount',
      'currency',
      'sourceAccountMasked',
      'targetAccountMasked',
    ].sort(),
  );
  const persisted = await (await page.request.get('/api/transfers/' + payload.reference)).json();
  expect(payload).toMatchObject(persisted);
  const incoming = await (await destination.client.get(`${base}/movements`)).json();
  expect(
    incoming.items.filter((m: { reference: string }) => m.reference === payload.reference),
  ).toHaveLength(1);
  expect((await (await destination.client.get(`${base}/account`)).json()).balance).toBe(
    '1150000.00',
  );
  await page.screenshot({ path: '../.local/ui-artifacts/receipt-1440.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar comprobante' }).click();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
  await login(page, email);
  await expect(page.getByTestId('balance')).toHaveText('$ 850.000,00 COP');
  await expect(page.getByText('Transferencia enviada', { exact: true })).toBeVisible();
  await expect(page.getByText(payload.reference, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('balance')).toHaveText('$ 850.000,00 COP');
  await expect(page.getByText('Transferencia enviada', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await login(page, destination.email);
  await expect(page.getByTestId('balance')).toHaveText('$ 1.150.000,00 COP');
  await expect(page.getByText('Transferencia recibida', { exact: true })).toBeVisible();
  await expect(page.getByText(payload.reference, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('balance')).toHaveText('$ 1.150.000,00 COP');
  await expect(page.getByText('Transferencia recibida', { exact: true })).toBeVisible();
  await page.screenshot({ path: '../.local/ui-artifacts/received-1440.png', fullPage: true });
  await destination.client.dispose();
});
test('respuesta perdida conserva clave y reintenta sin segundo débito', async ({ page }) => {
  const a = await session('Origen incierto');
  const b = await session('Destino incierto');
  await login(page, a.email);
  let capturedKey = '';
  let count = 0;
  await page.route('**/api/transfers', async (route) => {
    if (route.request().method() === 'POST') {
      capturedKey = route.request().headers()['idempotency-key'];
      count++;
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      await route.abort('failed');
    } else await route.continue();
  });
  await prepare(page, b.account.number, '125.50');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('button', { name: 'Comprobar resultado' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('No pudimos confirmar');
  await page.unroute('**/api/transfers');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Comprobar resultado' })).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar misma operación' }).click();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeVisible();
  await expect(page.getByTestId('balance')).toHaveText('$ 999.874,50 COP');
  const receipt = await (await a.client.get(`${base}/transfers/by-key/${capturedKey}`)).json();
  expect(receipt.amount).toBe('125.50');
  const rows = await (await a.client.get(`${base}/movements`)).json();
  expect(rows.items.filter((m: { type: string }) => m.type === 'SENT')).toHaveLength(1);
  expect(count).toBe(1);
  await a.client.dispose();
  await b.client.dispose();
});
test('validación, rechazo sin QR y reflow/teclado', async ({ page }) => {
  const a = await session('Validación con nombre largo de prueba académica');
  const b = await session('Destino');
  await login(page, a.email);
  await prepare(page, b.account.number, '1000000.01');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('alert')).toContainText('saldo es insuficiente');
  await expect(page.getByTestId('qr')).toHaveCount(0);
  await expect(page.getByTestId('balance')).toHaveText('$ 1.000.000,00 COP');
  await page.getByLabel('Monto a transferir').fill('0.001');
  await page.getByRole('button', { name: 'Revisar transferencia' }).click();
  await expect(page.getByRole('alert')).toContainText('hasta dos decimales');
  await expect(page.getByLabel('Monto a transferir')).toBeFocused();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.screenshot({ path: '../.local/ui-artifacts/validation-360.png', fullPage: true });
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON');
  await a.client.dispose();
  await b.client.dispose();
});

test('fallo de QR regenera imagen sin repetir transferencia', async ({ page }) => {
  const a = await session('QR resiliente');
  const b = await session('Destino QR');
  await login(page, a.email);
  let posts = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/api/transfers')) posts++;
  });
  await page.evaluate(() => {
    Reflect.set(window, 'savedToDataURL', HTMLCanvasElement.prototype.toDataURL);
    HTMLCanvasElement.prototype.toDataURL = () => {
      throw new Error('Falla de render inducida por la prueba');
    };
  });
  await prepare(page, b.account.number, '10');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('button', { name: 'Regenerar QR' })).toBeVisible();
  await expect(page.getByTestId('balance')).toHaveText('$ 999.990,00 COP');
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toDataURL = Reflect.get(window, 'savedToDataURL');
  });
  await page.getByRole('button', { name: 'Regenerar QR' }).click();
  await expect(page.getByTestId('qr')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Guardar QR' }).click();
  expect((await download).suggestedFilename()).toMatch(/^comprobante-.*\.png$/);
  expect(posts).toBe(1);
  await a.client.dispose();
  await b.client.dispose();
});
test('sesión terminada exige acceso y conserva intención sin POST automático', async ({ page }) => {
  const a = await session('Sesión pendiente');
  const b = await session('Destino sesión');
  await login(page, a.email);
  let posts = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/api/transfers')) posts++;
  });
  await page.route('**/api/transfers', async (route) => {
    await route.fetch();
    await route.abort('failed');
  });
  await prepare(page, b.account.number, '5');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos confirmar');
  await page.unroute('**/api/transfers');
  const t = await (await page.request.get('/api/auth/csrf')).json();
  expect(
    (
      await page.request.post('/api/auth/logout', { headers: { 'X-CSRF-TOKEN': t.token } })
    ).status(),
  ).toBe(204);
  await page.getByRole('button', { name: 'Comprobar resultado' }).click();
  await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
  await login(page, b.email);
  await expect(page.getByRole('button', { name: 'Comprobar resultado' })).toHaveCount(0);
  expect(posts).toBe(1);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await login(page, a.email);
  expect(posts).toBe(1);
  await openTransfers(page);
  await page.getByRole('button', { name: 'Comprobar resultado' }).click();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeVisible();
  expect(posts).toBe(1);
  await expect(page.getByTestId('balance')).toHaveText('$ 999.995,00 COP');
  await a.client.dispose();
  await b.client.dispose();
});
test('contraste medido de textos/controles y reflow al ampliar', async ({ page }) => {
  const a = await session('Accesibilidad de muestra');
  await login(page, a.email);
  await openTransfers(page);
  const pairs = await page.evaluate(() => {
    function ratio(first: string, second: string) {
      function lum(value: string) {
        const channels = value
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      }
      const x = lum(first),
        y = lum(second);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    }
    const input = getComputedStyle(document.querySelector('#target')!);
    const hint = getComputedStyle(document.querySelector('#target-hint')!);
    const button = getComputedStyle(document.querySelector('button.wide')!);
    return {
      hint: ratio(hint.color, input.backgroundColor),
      button: ratio(button.color, button.backgroundColor),
      boundary: ratio(input.borderTopColor, input.backgroundColor),
    };
  });
  expect(pairs.hint).toBeGreaterThanOrEqual(4.5);
  expect(pairs.button).toBeGreaterThanOrEqual(4.5);
  expect(pairs.boundary).toBeGreaterThanOrEqual(3);
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '30px';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../.local/ui-artifacts/reflow-text-200.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '15px';
    document.body.style.zoom = '2';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  console.log('Measured contrast', pairs);
  await a.client.dispose();
});

test('credenciales incorrectas muestran error de acceso sin fingir sesión vencida', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill('no-existe@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.');
  await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
});

test('HTTP: cookies de sesión, rotación y privacidad entre tres titulares', async () => {
  const a = await session('Titular A');
  const b = await session('Titular B');
  const outsider = await session('Titular ajeno');
  const cookies = (await a.client.storageState()).cookies;
  expect(cookies.find((c) => c.name === 'JSESSIONID')).toMatchObject({
    httpOnly: true,
    sameSite: 'Lax',
  });
  const key = crypto.randomUUID();
  const created = await a.client.post(`${base}/transfers`, {
    headers: { 'X-CSRF-TOKEN': a.token, 'Idempotency-Key': key },
    data: { targetAccountNumber: b.account.number, amount: '42.25' },
  });
  expect(created.status()).toBe(201);
  const receipt = await created.json();
  expect((await outsider.client.get(`${base}/transfers/${receipt.reference}`)).status()).toBe(404);
  expect((await outsider.client.get(`${base}/transfers/by-key/${key}`)).status()).toBe(404);
  const ownHistory = await (
    await outsider.client.get(`${base}/movements?ownerId=${a.account.number}`)
  ).json();
  expect(ownHistory.items).toHaveLength(1);
  expect(ownHistory.items[0].type).toBe('OPENING');
  expect(
    (
      await a.client.post(`${base}/transfers`, {
        headers: { 'X-CSRF-TOKEN': a.token, 'Idempotency-Key': crypto.randomUUID() },
        data: {
          sourceAccountNumber: outsider.account.number,
          targetAccountNumber: b.account.number,
          amount: '1',
        },
      })
    ).status(),
  ).toBe(400);
  expect((await (await a.client.get(`${base}/account`)).json()).balance).toBe('999957.75');
  const before = cookies.find((c) => c.name === 'JSESSIONID')!.value;
  expect(
    (
      await a.client.post(`${base}/auth/login`, {
        headers: { 'X-CSRF-TOKEN': a.token },
        data: { email: a.email, password },
      })
    ).status(),
  ).toBe(200);
  const after = (await a.client.storageState()).cookies.find((c) => c.name === 'JSESSIONID')!.value;
  expect(after).not.toBe(before);
  await a.client.dispose();
  await b.client.dispose();
  await outsider.client.dispose();
});

test('revisión editable y procesamiento impiden una segunda intención', async ({ page }) => {
  const a = await session('Revisión y espera');
  const b = await session('Destino revisión');
  await login(page, a.email);
  await prepare(page, b.account.number, '20.50');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(page.getByLabel('Monto a transferir')).toHaveValue('20.50');
  await page.getByLabel('Monto a transferir').fill('25.75');
  await page.getByRole('button', { name: 'Revisar transferencia' }).click();
  await expect(page.getByText('$ 25,75 COP', { exact: true })).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let posts = 0;
  await page.route('**/api/transfers', async (route) => {
    posts++;
    await gate;
    await route.continue();
  });
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeDisabled();
  await expect(
    page.getByRole('heading', { name: 'Hay una operación pendiente de comprobar' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reintentar misma operación' })).toBeDisabled();
  release();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeVisible();
  await expect(page.getByTestId('balance')).toHaveText('$ 999.974,25 COP');
  expect(posts).toBe(1);
  await a.client.dispose();
  await b.client.dispose();
});

test('diseño: acceso móvil, navegación, fuente local y comprobante con animación reducida', async ({
  page,
}) => {
  const a = await session('María Alejandra de la Universidad');
  const b = await session('Destino de diseño');
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../.local/ui-artifacts/design-login-320.png', fullPage: true });
  await page.getByRole('link', { name: '¿Primera vez? Crea tu cuenta' }).click();
  await expect(page.getByLabel('Nombre', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../.local/ui-artifacts/design-register-320.png', fullPage: true });
  await page.getByRole('link', { name: 'Ya tengo una cuenta. Iniciar sesión' }).click();
  await login(page, a.email);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('500 15px Manrope'))).toBe(true);
  await openTransfers(page);
  await expect(page.getByRole('heading', { name: 'Transferencias', exact: true })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page, b.account.number, '99999999999999999.99');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Monto a transferir').fill('12.34');
  await page.getByRole('button', { name: 'Revisar transferencia' }).click();
  await page.screenshot({ path: '../.local/ui-artifacts/design-review-320.png', fullPage: true });
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeFocused();
  await expect(page.getByTestId('qr')).toBeVisible();
  expect(await page.locator('.receipt').evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'none',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../.local/ui-artifacts/design-receipt-320.png', fullPage: true });
  await page.getByRole('link', { name: 'Movimientos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Movimientos', exact: true })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Tu comprobante' })).toBeVisible();
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: `../.local/ui-artifacts/design-receipt-${width}.png`,
      fullPage: true,
    });
  }
  expect(pageErrors).toEqual([]);
  await a.client.dispose();
  await b.client.dispose();
});

test('módulos: resumen acotado, filtros por página, comprobante GET recargable y perfil real', async ({
  page,
}) => {
  test.setTimeout(180000);
  const a = await session('Titular de módulos');
  const b = await session('Destino módulos');
  let reference = '';
  for (let index = 0; index < 21; index++) {
    const response = await a.client.post(`${base}/transfers`, {
      headers: { 'X-CSRF-TOKEN': a.token, 'Idempotency-Key': crypto.randomUUID() },
      data: { targetAccountNumber: b.account.number, amount: '1.00' },
    });
    expect(response.status()).toBe(201);
    reference = (await response.json()).reference;
  }
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/transfers')) posts++;
  });
  await login(page, a.email);
  await expect(page.getByLabel('Cuenta destino', { exact: true })).toHaveCount(0);
  await expect(page.locator('.movement')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Siguiente' })).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Módulos bancarios' })
      .getByRole('link', { name: 'Resumen', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  const nav = page.getByRole('navigation', { name: 'Módulos bancarios' });
  await nav.getByRole('link', { name: 'Movimientos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Movimientos', exact: true })).toBeFocused();
  await expect(page.locator('.movement')).toHaveCount(20);
  await expect(
    page.getByText(
      'La búsqueda y los filtros se aplican sólo a los movimientos de la página cargada.',
    ),
  ).toBeVisible();
  await page.getByLabel('Tipo de movimiento').selectOption('SENT');
  await page.getByLabel('Buscar en esta página').fill(reference);
  await expect(page.locator('.movement')).toHaveCount(1);
  await page.getByLabel('Buscar en esta página').fill('no-coincide');
  await expect(page.locator('.movement')).toHaveCount(0);
  await page.getByLabel('Buscar en esta página').fill('');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Página 2', { exact: true })).toBeVisible();
  await expect(page.locator('.movement')).toHaveCount(1);
  await page.getByLabel('Tipo de movimiento').selectOption('OPENING');
  await expect(page.getByText('Apertura de cuenta', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Tipo de movimiento')).toHaveValue('OPENING');
  await expect(page.getByText('Página 2', { exact: true })).toBeVisible();
  await nav.getByRole('link', { name: 'Comprobantes', exact: true }).click();
  await expect(page.locator('.movement')).toHaveCount(20);
  await expect(page.getByText('Apertura de cuenta', { exact: true })).toHaveCount(0);
  await page
    .locator('.movement')
    .first()
    .getByRole('button', { name: /Ver comprobante/ })
    .click();
  await expect(page).toHaveURL(new RegExp(`#/comprobantes/${reference}$`));
  await expect(page.getByTestId('qr')).toBeVisible();
  await expect(page.getByTestId('reference')).toHaveText(reference);
  await page.reload();
  await expect(page.getByTestId('qr')).toBeVisible();
  await expect(page.getByTestId('reference')).toHaveText(reference);
  expect(posts).toBe(0);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Comprobantes', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId('reference')).toHaveText(reference);
  await nav.getByRole('link', { name: 'Mi perfil', exact: true }).click();
  await expect(page.getByText(a.email, { exact: true })).toBeVisible();
  await expect(page.getByText(a.account.number, { exact: true })).toBeVisible();
  await expect(page.locator('input')).toHaveCount(0);
  for (const width of [1440, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [label, title] of [
      ['Resumen', 'Tu cuenta, al día.'],
      ['Transferencias', 'Transferencias'],
      ['Movimientos', 'Movimientos'],
      ['Comprobantes', 'Comprobantes'],
      ['Mi perfil', 'Mi perfil'],
    ]) {
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      await expect(page.getByText('Cargando movimientos…', { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `../.local/ui-artifacts/module-${label.toLowerCase().replaceAll(' ', '-')}-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(posts).toBe(0);
  expect((await (await a.client.get(`${base}/account`)).json()).balance).toBe('999979.00');
  await a.client.dispose();
  await b.client.dispose();
});

test('rutas protegidas: retorno al detalle, logout y privacidad tras cambiar de titular', async ({
  page,
}) => {
  const a = await session('Titular privado');
  const b = await session('Otro titular');
  const response = await a.client.post(`${base}/transfers`, {
    headers: { 'X-CSRF-TOKEN': a.token, 'Idempotency-Key': crypto.randomUUID() },
    data: { targetAccountNumber: b.account.number, amount: '2' },
  });
  expect(response.status()).toBe(201);
  const ref = (await response.json()).reference;
  const outsider = await session('Ajeno a la transferencia');
  let posts = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/api/transfers')) posts++;
  });
  await page.goto(`/#/comprobantes/${ref}`);
  await expect(page).toHaveURL(/#\/login$/);
  await page.getByLabel('Correo electrónico').fill(a.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: false }).click();
  await expect(page).toHaveURL(new RegExp(`#/comprobantes/${ref}$`));
  await expect(page.getByTestId('qr')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('reference')).toHaveText(ref);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
  await page.goto(`/#/comprobantes/${ref}`);
  await expect(page).toHaveURL(/#\/login$/);
  await page.getByLabel('Correo electrónico').fill(outsider.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('No se encontró la operación');
  await expect(page.getByTestId('qr')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.goto('/#/movimientos');
  await expect(page).toHaveURL(/#\/login$/);
  await expect(page.locator('.bank-nav')).toHaveCount(0);
  expect(posts).toBe(0);
  await a.client.dispose();
  await b.client.dispose();
  await outsider.client.dispose();
});

test('operación pendiente sobrevive módulos y recarga sin POST automático', async ({ page }) => {
  const a = await session('Pendiente entre módulos');
  const b = await session('Destino de recuperación');
  await login(page, a.email);
  let posts = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/api/transfers')) posts++;
  });
  await page.route('**/api/transfers', async (route) => {
    await route.fetch();
    await route.abort('failed');
  });
  await prepare(page, b.account.number, '5.25');
  await page.getByRole('button', { name: 'Confirmar transferencia' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos confirmar');
  await page.unroute('**/api/transfers');
  await page
    .getByRole('navigation', { name: 'Módulos bancarios' })
    .getByRole('link', { name: 'Movimientos', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Comprobar resultado' })).toBeVisible();
  expect(posts).toBe(1);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Comprobar resultado' })).toBeVisible();
  expect(posts).toBe(1);
  await page.getByRole('button', { name: 'Comprobar resultado' }).click();
  await page.getByRole('link', { name: 'Ver último comprobante' }).click();
  await expect(page.getByTestId('qr')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('qr')).toBeVisible();
  expect(posts).toBe(1);
  expect((await (await a.client.get(`${base}/account`)).json()).balance).toBe('999994.75');
  const history = await (await a.client.get(`${base}/movements`)).json();
  expect(history.items.filter((m: { type: string }) => m.type === 'SENT')).toHaveLength(1);
  await a.client.dispose();
  await b.client.dispose();
});
