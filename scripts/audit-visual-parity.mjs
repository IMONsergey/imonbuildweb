import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const source = 'https://fantastic-future-931954.framer.app'
const local = process.env.IMON_AUDIT_BASE || 'http://127.0.0.1:3120'
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 768, height: 960 }]
const routes = JSON.parse(await readFile('src/content/source.json','utf8')).map(page => page.path)
const critical = new Set(['/', '/work', '/about', '/contact', '/news', '/cases/page', '/cases/askona-life-group', '/work/limbo', '/news/designing-with-intention-how-clarity-shapes-digital-experiences'])
const out = 'audit/parity-20261021'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const rows = []
const screenshotSlug = route => (route === '/' ? 'home' : route.slice(1).replace(/[^a-z0-9-]+/gi, '-')).slice(0, 80)

async function inspect(target, viewport, route) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message.slice(0, 250)))
  const timeout = 30000
  const item = { site: target === source ? 'source' : 'local', viewport: viewport.width, route, errors }
  try {
    const response = await page.goto(target + route, { waitUntil: 'domcontentloaded', timeout })
    item.status = response.status()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(900)
    await page.evaluate(() => scrollTo({top: document.documentElement.scrollHeight * .8, behavior: 'instant'}))
    await page.waitForTimeout(450)
    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}))
    await page.waitForTimeout(650)
    item.metrics = await page.evaluate(() => {
      const select = selector => Array.from(document.querySelectorAll(selector))
      const rect = element => {
        const r = element.getBoundingClientRect(), style = getComputedStyle(element)
        return { text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 135),
          x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height),
          font: style.fontFamily, size: style.fontSize, weight: style.fontWeight,
          line: style.lineHeight, spacing: style.letterSpacing, display: style.display }
      }
      const bad = select('img').filter(im => im.complete && im.currentSrc && !im.naturalWidth).map(im => im.currentSrc.slice(0, 110))
      const overflow = select('body *').filter(el => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && s.position !== 'fixed' && s.visibility !== 'hidden' && r.right > innerWidth + 20 && r.left >= 0
      }).slice(0, 9).map(el => ({ tag: el.tagName, class: String(el.className).slice(0, 80), right: Math.round(el.getBoundingClientRect().right) }))
      return {
        height: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        h1: select('h1').slice(0, 2).map(rect),
        h2: select('h2').slice(0, 18).map(rect),
        images: select('img').length,
        videos: select('video').length,
        sections: select('section').length,
        links: select('a[href]').length,
        forms: select('form').length,
        headings: select('h1,h2,h3').length,
        nav: select('header a').slice(0, 12).map(el => ({ text: el.innerText.slice(0, 35), href: el.getAttribute('href') })),
        brokenImages: bad,
        overflow
      }
    })
    if (critical.has(route) && viewport.width !== 768) {
      const name = screenshotSlug(route) + '-' + viewport.width + '-' + item.site
      await page.screenshot({ path: path.join(out, name + '-top.png'), animations: 'disabled', timeout: 16000 })
      const mid = Math.max(0, Math.floor((item.metrics.height - viewport.height) * .5))
      await page.evaluate(y => scrollTo(0, y), mid)
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(out, name + '-middle.png'), animations: 'disabled', timeout: 16000 })
    }
  } catch(error) { item.error = error.message.slice(0, 400) }
  finally { rows.push(item); await context.close() }
  return item
}

const tasks = []
for (const viewport of viewports) {
  for (const route of routes) {
    if (viewport.width === 768 && !critical.has(route)) continue
    tasks.push({ viewport, route, target: source })
    tasks.push({ viewport, route, target: local })
  }
}
let cursor = 0
async function worker(index) {
  while (cursor < tasks.length) {
    const task = tasks[cursor++]
    const result = await inspect(task.target, task.viewport, task.route)
    console.log('AUDIT', index, result.site, result.viewport, result.route, result.status || result.error, result.metrics?.height || '')
  }
}
try {
  await Promise.all([worker(1),worker(2),worker(3)])
} finally {
  await writeFile(path.join(out,'metrics.json'),JSON.stringify(rows,null,2))
  await browser.close()
}
const pairs = []
for (const width of [1440,390,768]) for (const route of routes) {
  const a = rows.find(row => row.site === 'source' && row.viewport === width && row.route === route)
  const b = rows.find(row => row.site === 'local' && row.viewport === width && row.route === route)
  if (!a || !b) continue
  const h1 = a.metrics?.h1?.[0],h2=b.metrics?.h1?.[0]
  const height = a.metrics?.height, localHeight=b.metrics?.height
  pairs.push({
    route,width,
    sourceStatus:a.status, localStatus:b.status,
    sourceHeight:height, localHeight,
    delta: height && localHeight ? localHeight-height : null,
    deltaPercent:height&&localHeight ? +((localHeight-height)/height*100).toFixed(1) : null,
    h1Text:a.metrics?.h1?.[0]?.text,
    rebuiltH1:h2?.text,
    h1Size: h1?.size, rebuiltH1Size:h2?.size,
    h1Y:h1?.y, rebuiltH1Y:h2?.y,
    sourceImages:a.metrics?.images,localImages:b.metrics?.images,
    sourceVideos:a.metrics?.videos,localVideos:b.metrics?.videos,
    sourceSections:a.metrics?.sections,localSections:b.metrics?.sections,
    sourceHeadings:a.metrics?.headings,localHeadings:b.metrics?.headings,
    sourceBroken:a.metrics?.brokenImages?.length,localBroken:b.metrics?.brokenImages?.length,
    localOverflow:b.metrics?.overflow?.length,
    errors:[...(a.errors||[]),...(b.errors||[])],
    issue:a.error||b.error
  })
}
await writeFile(path.join(out,'pairs.json'),JSON.stringify(pairs,null,2))
console.log('FINISHED',rows.length,'captures;',pairs.length,'paired routes;','errors=',rows.filter(row=>row.error || row.errors.length).length)
console.log('TOP DISCREPANCIES:', JSON.stringify(pairs.filter(x=>x.deltaPercent!==null).sort((a,b)=>Math.abs(b.deltaPercent)-Math.abs(a.deltaPercent)).slice(0,18)))
