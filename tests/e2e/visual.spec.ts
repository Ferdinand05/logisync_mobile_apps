import { expect, test } from '@playwright/test';

const viewports = [
  { width: 390, height: 844, name: 'home-390' },
  { width: 360, height: 640, name: 'home-360' },
  { width: 320, height: 568, name: 'home-320' },
];

async function seedSession(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('logisync.token', 'visual-token');
    localStorage.setItem(
      'logisync.user',
      JSON.stringify({
        id: 1,
        name: 'Andi Pratama',
        email: 'andi@logisync.id',
        role: 'staff',
      }),
    );
  });
}

for (const viewport of viewports) {
  test(`home ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedSession(page);
    await page.goto('/home');
    await expect(page.locator('#boot-splash')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Andi Pratama' })).toBeVisible();
    await page.screenshot({
      path: `${process.env.TEMP}/logisync-visual/${viewport.name}.png`,
      fullPage: true,
    });
  });
}

test('splash 390', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>('#boot-splash img');
    return Boolean(image?.complete && image.naturalWidth > 0);
  });
  await page.screenshot({ path: `${process.env.TEMP}/logisync-visual/splash-390.png` });
});

test('lokasi 390', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedSession(page);
  await page.route('**/api/locations*', (route) =>
    route.fulfill({
      json: {
        data: [
          { id: 1, code: 'GDG-A', name: 'Gudang Utama' },
          { id: 2, code: 'GDG-B', name: 'Gudang Bahan Baku' },
        ],
      },
    }),
  );
  await page.goto('/stock');
  await expect(page.locator('#boot-splash')).toHaveCount(0);
  await expect(page.getByText('Gudang Utama')).toBeVisible();
  await page.screenshot({ path: `${process.env.TEMP}/logisync-visual/lokasi-390.png`, fullPage: true });
});
