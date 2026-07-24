import { test, expect } from '@playwright/test'

test('visits the homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Building better tools for students')
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'GitHub' }).first()).toBeVisible()
})

test('navigates to the arcade page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Arcade' }).first().click()
  await expect(page).toHaveURL('/arcade')
  await expect(page.getByRole('heading', { name: 'Arcade' })).toBeVisible()
})
