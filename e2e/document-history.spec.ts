import { test, expect } from '@playwright/test';

test.describe('Document History Diff', () => {
	test('documents page has history action', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Documents');
		await expect(page.locator('text=History')).toBeVisible();
	});

	test('history modal shows versions', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Documents');
		await page.click('text=History');
		await expect(page.locator('text=Version')).toBeVisible();
	});
});
