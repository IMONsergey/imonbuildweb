import { test, expect } from '@playwright/test'

test('Главная: типографика, первый экран и связи', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/I’MON/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Бренд, продукт')
  await expect(page.locator('.hero-video video')).toHaveCount(1)
  await expect(page.getByRole('link', { name: /I’MON/ }).first()).toHaveAttribute('href', '/')
  await expect(page.getByRole('link', { name: /Проекты/ }).first()).toHaveAttribute('href', '/work')
  await expect(page.locator('.faq-item')).toHaveCount(6)
})

test('Проекты: фильтрация и карточки', async ({ page }) => {
  await page.goto('/work')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Work')
  await expect(page.locator('.project-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Брендинг' }).click()
  const selected = await page.locator('.project-card').count()
  expect(selected).toBeGreaterThan(0)
  expect(selected).toBeLessThanOrEqual(6)
  await page.getByRole('button', { name: 'Все', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(6)
})

test('Кейсы: страницы и локальные медиа', async ({ page }) => {
  await page.goto('/cases/page')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('GAC M8')
  await expect(page.locator('.gallery-item img').first()).toBeVisible()
  await page.goto('/cases/askona-life-group')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Askona Life Group')
})

test('Журнал: исходные маршруты доступны, но шаблонные материалы не индексируются', async ({ page }) => {
  await page.goto('/news')
  await expect(page.locator('.project-card')).toHaveCount(8)
  await page.locator('.project-card').first().click()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('Форма: поля обязательны, без согласия нельзя отправлять', async ({ page }) => {
  await page.goto('/contact')
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
