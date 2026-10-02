import { expect, test } from '@playwright/test';

test('la simulation de référence affiche la mensualité et l’échéancier attendus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/395,11/).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('janvier 2021').first()).toBeVisible();
  await expect(page.getByText('février 2021').first()).toBeVisible();
});

test('une saisie invalide affiche le message associé au champ', async ({ page }) => {
  await page.goto('/');
  const income = page.getByLabel('Revenu annuel', { exact: false }).first();
  await income.fill('54000');
  await page.getByRole('button', { name: 'Mettre à jour la simulation' }).click();
  await expect(page.getByText(/Le revenu annuel doit être compris entre .* par an\./)).toBeVisible();
});
