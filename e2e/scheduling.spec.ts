import { test, expect } from '@playwright/test';

test.describe('Scheduling Page', () => {
	test('page loads and displays title', async ({ page }) => {
		await page.goto('/scheduling');
		await expect(page.locator('text=Scheduling')).toBeVisible();
	});

	test('shows coming soon message', async ({ page }) => {
		await page.goto('/scheduling');
		await expect(page.locator('text=Scheduling calendar coming soon')).toBeVisible();
	});
});
