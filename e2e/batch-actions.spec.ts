import { test, expect } from '@playwright/test';

test.describe('Batch Actions', () => {
	test('encounters page has checkboxes', async ({ page }) => {
		await page.goto('/encounters');
		await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
	});

	test('select all checkbox appears in header', async ({ page }) => {
		await page.goto('/encounters');
		await expect(page.locator('thead input[type="checkbox"]')).toBeVisible();
	});

	test('batch toolbar appears on selection', async ({ page }) => {
		await page.goto('/encounters');
		await page.locator('tbody input[type="checkbox"]').first().click();
		await expect(page.locator('text=Finish Encounters')).toBeVisible();
	});
});
