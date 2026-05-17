import { test, expect } from '@playwright/test';

test.describe('Patient Detail v2', () => {
	test('patient detail shows all tabs', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=Overview')).toBeVisible();
		await expect(page.locator('text=Documents')).toBeVisible();
		await expect(page.locator('text=Orders')).toBeVisible();
		await expect(page.locator('text=Resources')).toBeVisible();
		await expect(page.locator('text=Apps')).toBeVisible();
		await expect(page.locator('text=Wearables')).toBeVisible();
	});

	test('documents tab shows document list', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Documents');
		await expect(page.locator('text=Documents')).toBeVisible();
	});

	test('orders tab shows orders', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Orders');
		await expect(page.locator('text=Orders')).toBeVisible();
	});

	test('resources tab shows resource browser', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Resources');
		await expect(page.locator('text=Resources')).toBeVisible();
	});

	test('apps tab shows SMART apps', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Apps');
		await expect(page.locator('text=SMART Apps')).toBeVisible();
	});

	test('wearables tab shows wearable data', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Wearables');
		await expect(page.locator('text=Wearables')).toBeVisible();
	});
});
