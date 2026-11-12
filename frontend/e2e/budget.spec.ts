import { expect, test } from '@playwright/test'

const BUDGET_BYTES = 3_000_000

test('first load of /ho stays within 3 MB on slow 4G', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  let bytes = 0
  cdp.on('Network.loadingFinished', (e) => {
    bytes += e.encodedDataLength
  })
  await page.goto('/ho')
  await page.locator('[data-tank-ready="true"]').waitFor({ timeout: 30_000 })
  test.info().annotations.push({ type: 'bytes', description: String(bytes) })
  console.log(`first-load bytes: ${bytes}`)
  expect(bytes).toBeLessThanOrEqual(BUDGET_BYTES)
})
