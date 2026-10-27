import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const output = process.env.IMON_SCREENSHOTS || '/tmp/imon-case-screenshots'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.IMON_CHROMIUM_EXECUTABLE_PATH || undefined, headless: true })
for (const [size, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
  for (const [name, route] of [['askona', '/cases/askona-life-group'], ['gac', '/cases/page'], ['portfolio', '/work']]) {
    await page.goto((process.env.IMON_E2E_BASE_URL || 'http://localhost:3004') + route, { waitUntil: 'networkidle' })
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 800) {
      await page.evaluate(y => scrollTo(0, y), y)
      await page.waitForTimeout(50)
    }
    await page.evaluate(() => scrollTo(0, 0))
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${output}/${name}-${size}.png`, fullPage: true })
    console.log(name, size, await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) })))
  }
  await page.close()
}
await browser.close()
