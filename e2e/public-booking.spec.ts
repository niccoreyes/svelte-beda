import { test, expect } from '@playwright/test';

test.describe('Public Appointment Booking', () => {
	test('booking page loads without auth', async ({ page }) => {
		await page.goto('/appointment/book');
		await expect(page.locator('text=Book Appointment')).toBeVisible();
	});

	test('booking flow shows service selection', async ({ page }) => {
		await page.goto('/appointment/book');
		await expect(page.locator('text=Select Service')).toBeVisible();
	});

	test('booking flow has patient info form', async ({ page }) => {
		await page.goto('/appointment/book');
		await page.click('text=Next');
		await expect(page.locator('text=First Name')).toBeVisible();
	});
});
