import { test, expect } from '@playwright/test';

test.describe('Patient Detail Page', () => {
	test('page loads with patient ID', async ({ page }) => {
		// This test assumes a patient with id 'patient-1' exists or is mocked
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=Overview')).toBeVisible();
	});

	test('displays patient tabs', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=Overview')).toBeVisible();
		await expect(page.locator('text=Encounters')).toBeVisible();
		await expect(page.locator('text=Documents')).toBeVisible();
		await expect(page.locator('text=Forms')).toBeVisible();
		await expect(page.locator('text=Resources')).toBeVisible();
	});

	test('can switch to encounters tab', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Encounters');
		await expect(page.locator('text=No encounters found, text=Encounter')).toBeVisible();
	});
});
