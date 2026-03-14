import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/My Google AI Studio App/);

    // Check that the root element exists
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should display system health bar', async ({ page }) => {
    await page.goto('/');

    // Check for health metrics (API Latency, ML Inference, etc.)
    await expect(page.locator('text=API Latency')).toBeVisible();
    await expect(page.locator('text=ML Inference')).toBeVisible();
  });

  test('should display transaction feed', async ({ page }) => {
    await page.goto('/');

    // Check for transaction feed section
    await expect(page.locator('text=Live Transaction Feed')).toBeVisible();
  });
});
