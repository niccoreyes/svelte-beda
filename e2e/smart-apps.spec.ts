import { test, expect } from '@playwright/test';

test.describe('SMART App Launch', () => {
	test('patient apps tab shows SMART apps', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Apps');
		await expect(page.locator('text=SMART Apps')).toBeVisible();
	});

	test('SMART app launcher has launch buttons', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Apps');
		await expect(page.locator('text=Launch')).toBeVisible();
	});
});
