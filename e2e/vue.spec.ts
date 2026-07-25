import { test, expect } from '@playwright/test'

test('visits the homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('HomeWebsite')
})
