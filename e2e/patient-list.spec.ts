import { test, expect } from '@playwright/test';

test.describe('Patient List Page', () => {
	test('page loads and displays title', async ({ page }) => {
		await page.goto('/patients');
		await expect(page.locator('text=Patients')).toBeVisible();
	});

	test('displays search bar', async ({ page }) => {
		await page.goto('/patients');
		await expect(page.locator('[placeholder*="Search"], input[type="search"]')).toBeVisible();
	});

	test('shows empty state when no patients', async ({ page }) => {
		await page.goto('/patients');
		await expect(page.locator('text=No patients found')).toBeVisible();
	});
});
