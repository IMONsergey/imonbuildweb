import { test, expect } from '@playwright/test'

// Credentials are never committed to a test suite or copied into the repository.
test('Редакторская панель показывает защищённую форму входа', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
})

test('API заявок не принимает запросы без JSON', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: 'not-json',
    headers: { 'Content-Type': 'text/plain' },
  })
  expect(response.status()).toBe(415)
})
