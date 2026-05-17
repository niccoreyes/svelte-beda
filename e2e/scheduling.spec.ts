import { test, expect } from '@playwright/test';

test.describe('Scheduling Flow', () => {
	test('scheduling page loads with calendar', async ({ page }) => {
		await page.goto('/scheduling');
		await expect(page.locator('text=Scheduling')).toBeVisible();
		await expect(page.locator('.fc')).toBeVisible();
	});

	test('calendar shows month view by default', async ({ page }) => {
		await page.goto('/scheduling');
		await expect(page.locator('.fc-daygrid')).toBeVisible();
	});

	test('can switch to list view', async ({ page }) => {
		await page.goto('/scheduling');
		await page.click('text=List');
		await expect(page.locator('table, [data-testid="appointment-list"]')).toBeVisible();
	});

	test('can open new appointment modal', async ({ page }) => {
		await page.goto('/scheduling');
		await page.click('text=New Appointment');
		await expect(page.locator('text=New Appointment')).toBeVisible();
		await expect(page.locator('text=Patient')).toBeVisible();
		await expect(page.locator('text=Practitioner')).toBeVisible();
	});

	test('new appointment modal can be closed', async ({ page }) => {
		await page.goto('/scheduling');
		await page.click('text=New Appointment');
		await page.click('[aria-label="Close"], button:has-text("Cancel")');
		await expect(page.locator('text=New Appointment')).not.toBeVisible();
	});
});
