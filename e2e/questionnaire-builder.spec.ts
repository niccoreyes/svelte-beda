import { test, expect } from '@playwright/test';

test.describe('Questionnaire Builder', () => {
	test('builder page loads', async ({ page }) => {
		await page.goto('/questionnaires/builder');
		await expect(page.locator('text=Questionnaire Builder')).toBeVisible();
	});

	test('builder has item palette', async ({ page }) => {
		await page.goto('/questionnaires/builder');
		await expect(page.locator('text=Items')).toBeVisible();
	});

	test('builder has save form', async ({ page }) => {
		await page.goto('/questionnaires/builder');
		await expect(page.locator('text=Save')).toBeVisible();
	});

	test('builder has AI generation panel', async ({ page }) => {
		await page.goto('/questionnaires/builder');
		await expect(page.locator('text=AI Generate')).toBeVisible();
	});
});
