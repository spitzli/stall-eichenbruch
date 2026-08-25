import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Stall Eichenbruch/)
    await expect(page.locator('header')).toContainText('Stall Eichenbruch')
  })
})
