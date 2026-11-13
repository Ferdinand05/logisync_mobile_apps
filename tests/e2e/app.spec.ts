import { expect, test } from '@playwright/test';

test('redirects unauthenticated visitors to the login page', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#boot-splash')).toHaveCount(0);
  await expect(page).toHaveURL(/\/login(\?|$)/);
  await expect(page.getByRole('heading', { name: 'Selamat datang' })).toBeVisible();
  await expect(page.locator('ion-input#email')).toBeVisible();
  await expect(page.locator('ion-input#password')).toBeVisible();
});
