import { test, expect } from '@playwright/test';

test.describe('Patient Dynamic Dashboard', () => {
	test('overview tab shows dashboard cards', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=General Information')).toBeVisible();
		await expect(page.locator('text=Appointments')).toBeVisible();
		await expect(page.locator('text=Summary')).toBeVisible();
	});

	test('dashboard shows patient demographics', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=Birth Date')).toBeVisible();
		await expect(page.locator('text=Gender')).toBeVisible();
	});

	test('encounters tab is visible', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await expect(page.locator('text=Encounters')).toBeVisible();
		await page.click('text=Encounters');
		await expect(page.locator('text=Status')).toBeVisible();
	});

	test('documents tab has fill and view actions', async ({ page }) => {
		await page.goto('/patients/patient-1');
		await page.click('text=Documents');
		await expect(page.locator('text=Fill')).toBeVisible();
		await expect(page.locator('text=View')).toBeVisible();
	});
});
