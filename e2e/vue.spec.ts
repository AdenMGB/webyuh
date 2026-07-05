import { test, expect } from '@playwright/test'

test('visits the retro homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome To My Website' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AdenMGB' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'My GitHub' })).toBeVisible()
})

test('navigates to the arcade page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'My Arcade' }).click()
  await expect(page).toHaveURL('/arcade')
  await expect(page.getByRole('heading', { name: 'Arcade' })).toBeVisible()
})
