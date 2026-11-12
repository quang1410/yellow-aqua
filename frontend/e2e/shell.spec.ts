import { expect, test } from '@playwright/test'

test('shell is Vietnamese and installable', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/ho$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  const manifest = await (await page.request.get('/manifest.webmanifest')).json()
  expect(manifest.name).toBe('Yellow Aqua')
  expect(manifest.lang).toBe('vi')
  expect(manifest.display).toBe('standalone')
})

test('tank page works offline after first visit', async ({ page, context }) => {
  await page.goto('/ho')
  await page.locator('[data-tank-ready="true"]').waitFor()
  await page.locator('html[data-offline-ready="true"]').waitFor({ timeout: 20_000 })
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('[data-tank-ready="true"]')).toBeVisible()
  await context.setOffline(false)
})
