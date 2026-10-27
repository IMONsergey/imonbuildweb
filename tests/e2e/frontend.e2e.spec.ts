import { test, expect } from '@playwright/test'

test('Главная: типографика, первый экран и связи', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/I’MON/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Бренд, продукт')
  await expect(page.locator('.hero-video video')).toHaveCount(1)
  await expect(page.getByRole('link', { name: /I’MON/ }).first()).toHaveAttribute('href', '/')
  await expect(page.getByRole('link', { name: /Проекты/ }).first()).toHaveAttribute('href', '/work')
  await expect(page.locator('.imon-faq-item')).toHaveCount(6)
  await expect(page.locator('.imon-featured-card')).toHaveCount(2)
  await expect(page.locator('.imon-featured-card').first()).toHaveAttribute('href', '/cases/askona-life-group')
})

test('Проекты: отобранные карточки и переход в кейс', async ({ page }) => {
  await page.goto('/work')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Work')
  await expect(page.locator('.project-card')).toHaveCount(2)
  await page.locator('.project-card').first().click()
  await expect(page).toHaveURL(/\/cases\/askona-life-group$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Askona Life Group')
})

test('Кейсы: страницы и локальные медиа', async ({ page }) => {
  await page.goto('/cases/page')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('GAC M8')
  await expect(page.locator('.case-story-visual figcaption').first()).toBeVisible()
  await page.goto('/cases/askona-life-group')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Askona Life Group')
})

test('Журнал: исходные маршруты доступны, но шаблонные материалы не индексируются', async ({ page }) => {
  await page.goto('/news')
  await expect(page.locator('.imon-news-card')).toHaveCount(8)
  await page.locator('.imon-news-card').first().click()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('Форма: поля обязательны, без согласия нельзя отправлять', async ({ page }) => {
  await page.goto('/contact')
  await page.locator('.imon-contact-form-details > summary').click()
  const form = page.locator('.lead-form')
  await expect(form.locator('input[type="email"]')).toBeVisible()
  await expect(form.locator('textarea')).toBeVisible()
  await form.locator('button[type="submit"]').click()
  expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false)
  await form.locator('input[type="text"]').first().fill('Тест')
  await form.locator('input[type="email"]').fill('test@example.invalid')
  await form.locator('textarea').fill('Тестовое описание проекта, это форма QA')
  expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false)
})

test('Без авторизации черновики открыть нельзя', async ({ request }) => {
  const response = await request.get('/api/preview?path=/contact', { maxRedirects: 0 })
  expect(response.status()).toBe(401)
})

test('Мобильная навигация и отсутствие горизонтального скролла', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Проверка только для мобильного проекта')
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Открыть меню' })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: /Проекты/ }).click()
  await expect(page).toHaveURL(/\/work$/)
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: window.innerWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 1)
})


test('Архив не попадает в портфолио и публичный API', async ({ page, request }) => {
  await page.goto('/work')
  await expect(page.locator('.project-card')).toHaveCount(2)
  await expect(page.locator('.project-card').first()).toHaveAttribute('href', '/cases/askona-life-group')
  await expect(page.locator('.project-card').nth(1)).toHaveAttribute('href', '/cases/page')
  const archived = await request.get('/work/be-fresh')
  expect(archived.status()).toBe(404)
  const projects = await request.get('/api/projects?limit=100')
  const data = await projects.json()
  expect(data.docs.map((doc: { sourcePath: string }) => doc.sourcePath).sort()).toEqual(['/cases/askona-life-group', '/cases/page'])
})

test('Подписи кейса видимы и отделены от alt', async ({ page }) => {
  await page.goto('/cases/askona-life-group')
  const first = page.locator('.case-story-visual').first()
  await expect(first.locator('figcaption')).toContainText('корпоративный сайт группы')
  await expect(first.locator('img')).toHaveAttribute('alt', 'Главная страница Askona Life Group на ноутбуке')
  expect(await first.locator('figcaption').textContent()).not.toBe(await first.locator('img').getAttribute('alt'))
  await expect(page.locator('.case-related-link')).toHaveCount(1)
  await expect(page.locator('.case-related-link')).toHaveAttribute('href', '/cases/page')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

for (const [title, route] of [['Askona Life Group', '/cases/askona-life-group'], ['GAC M8', '/cases/page']]) {
  test(`${title}: mobile layout and complete media`, async ({ page, isMobile }) => {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    if (isMobile) {
      const device = await page.evaluate(() => ({ ua: navigator.userAgent, touch: navigator.maxTouchPoints, coarse: matchMedia('(pointer: coarse)').matches, width: innerWidth }))
      expect(device.ua).toContain('iPhone')
      expect(device.touch).toBeGreaterThan(0)
      expect(device.coarse).toBe(true)
      expect(device.width).toBe(390)
    }
    const captions = page.locator('.case-story-content figcaption')
    expect(await captions.count()).toBeGreaterThan(10)
    for (const img of await page.locator('.case-story-content img').all()) {
      await img.scrollIntoViewIfNeeded()
      await expect(img).toBeVisible()
      await expect.poll(() => img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const heading = await page.locator('.case-hero h1').boundingBox()
    const summary = await page.locator('.case-hero > p').boundingBox()
    expect(heading!.y + heading!.height).toBeLessThanOrEqual(summary!.y)
    await expect(page.locator('.case-related-link')).toHaveCount(1)
  })
}
