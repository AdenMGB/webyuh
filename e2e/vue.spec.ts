import { test, expect } from '@playwright/test'

test('visits the AdenMGB homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toContainText('AdenMGB')
  await expect(page.getByText('We build')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'BetterSEQTA+' })).toBeVisible()
})

test('links out to BetterSEQTA', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: /betterseqta\.org/i })
  await expect(link).toHaveAttribute('href', 'https://betterseqta.org/')
})
