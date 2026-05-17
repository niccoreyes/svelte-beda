import { test, expect } from '@playwright/test';

test.describe('Patient Documents', () => {
	test('documents page loads', async ({ page }) => {
		await page.goto('/patients/patient-1/documents');
		await expect(page.locator('text=Documents')).toBeVisible();
	});

	test('can open create document modal', async ({ page }) => {
		await page.goto('/patients/patient-1/documents');
		await page.click('text=New Document');
		await expect(page.locator('text=Choose Document Type')).toBeVisible();
	});

	test('document wizard has steps', async ({ page }) => {
		await page.goto('/patients/patient-1/documents');
		await page.click('text=New Document');
		await expect(page.locator('text=Clinical Note')).toBeVisible();
		await expect(page.locator('text=Referral')).toBeVisible();
		await expect(page.locator('text=Prescription')).toBeVisible();
	});
});
