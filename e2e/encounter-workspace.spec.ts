import { test, expect } from '@playwright/test';

test.describe('Encounter Workspace', () => {
	test('page loads and displays title', async ({ page }) => {
		await page.goto('/encounters');
		await expect(page.locator('text=Encounters')).toBeVisible();
	});

	test('displays search bar for patients', async ({ page }) => {
		await page.goto('/encounters');
		await expect(page.locator('[placeholder*="Search"], input[type="search"]')).toBeVisible();
	});

	test('shows empty state when no encounters', async ({ page }) => {
		await page.goto('/encounters');
		await expect(page.locator('text=No encounters found')).toBeVisible();
	});
});
