/**
 * Đo FPS trung bình của /ho ở chất lượng medium, CPU chậm 4 lần.
 * Mặc định mở Chrome có giao diện để dùng GPU thật; đặt PERF_HEADLESS=1 để chạy ẩn.
 * Cần `npm run build` trước. Thoát mã 1 khi FPS trung bình dưới 30.
 */
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const PORT = 3101
const MIN_FPS = 30

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // server chưa lên
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`server did not start: ${url}`)
}

async function main(): Promise<number> {
  const server = spawn('npx', ['next', 'start', '--port', String(PORT)], { stdio: 'ignore' })
  try {
    await waitForServer(`http://localhost:${PORT}/ho`, 60_000)
    const browser = await chromium.launch({ channel: 'chrome', headless: process.env.PERF_HEADLESS === '1' })
    const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6 })
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await page.goto(`http://localhost:${PORT}/ho?quality=medium&layout=${process.env.PERF_LAYOUT ?? ''}`)
    await page.locator('[data-tank-ready="true"]').waitFor({ timeout: 60_000 })
    const hasMeter = await page.evaluate(() => typeof (window as { __yellowAqua?: { fps?: () => number } }).__yellowAqua?.fps === 'function')
    if (!hasMeter) {
      console.log('perf: chưa có số đo (window.__yellowAqua.fps chưa có)')
      await browser.close()
      return 0
    }
    await page.waitForTimeout(8_000)
    const fps = await page.evaluate(() => (window as unknown as { __yellowAqua: { fps: () => number } }).__yellowAqua.fps())
    await browser.close()
    console.log(`perf: ${fps.toFixed(1)} FPS (ngưỡng ${MIN_FPS})`)
    return fps >= MIN_FPS ? 0 : 1
  } finally {
    server.kill()
  }
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
