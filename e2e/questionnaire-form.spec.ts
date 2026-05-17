import { test, expect } from '@playwright/test';

test.describe('Questionnaire Form', () => {
	test('page loads with questionnaire ID', async ({ page }) => {
		// This test assumes a questionnaire with id 'questionnaire-1' exists or is mocked
		await page.goto('/questionnaires/questionnaire-1');
		await expect(page.locator('text=Questionnaire Details')).toBeVisible();
	});

	test('displays questionnaire fields', async ({ page }) => {
		await page.goto('/questionnaires/questionnaire-1');
		await expect(page.locator('text=Title')).toBeVisible();
		await expect(page.locator('text=Status')).toBeVisible();
	});

	test('has edit button', async ({ page }) => {
		await page.goto('/questionnaires/questionnaire-1');
		await expect(page.locator('text=Edit')).toBeVisible();
	});
});
