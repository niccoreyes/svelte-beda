import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
	test('signin page loads with login options', async ({ page }) => {
		await page.goto('/signin');
		await expect(page.locator('text=BEDA EMR')).toBeVisible();
		await expect(page.locator('text=Sign in with SSO')).toBeVisible();
		await expect(page.locator('text=Continue as Guest')).toBeVisible();
	});

	test('guest access navigates to patients', async ({ page }) => {
		await page.goto('/signin');
		await page.click('text=Continue as Guest');
		await expect(page).toHaveURL(/\/patients/);
		await expect(page.locator('text=Patients')).toBeVisible();
	});

	test('reset password page loads', async ({ page }) => {
		await page.goto('/reset-password/test-code-123');
		await expect(page.locator('text=Reset Password')).toBeVisible();
		await expect(page.locator('text=New Password')).toBeVisible();
		await expect(page.locator('text=Confirm Password')).toBeVisible();
	});

	test('reset password validates matching passwords', async ({ page }) => {
		await page.goto('/reset-password/test-code-123');
		await page.fill('input[type="password"]', 'password1');
		await page.locator('input[type="password"]').nth(1).fill('password2');
		await page.click('button:has-text("Reset Password")');
		await expect(page.locator('text=Passwords do not match')).toBeVisible();
	});

	test('sidebar shows role-based menu items for guest', async ({ page }) => {
		await page.goto('/patients');
		await expect(page.locator('text=Patients')).toBeVisible();
		await expect(page.locator('text=Practitioners')).toBeVisible();
		await expect(page.locator('text=Encounters')).toBeVisible();
	});
});
