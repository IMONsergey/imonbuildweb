import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { chromium } from '@playwright/test'

const base = process.env.IMON_QA_URL || 'http://127.0.0.1:3108'
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(base)) {
  throw new Error('QA script can only run against localhost; never run on production.')
}

const credentials = readFileSync(resolve(process.cwd(), '.initial-admin'), 'utf8')
const email = credentials.match(/^Email: (.+)$/m)?.[1]
const password = credentials.match(/^Password: (.+)$/m)?.[1]
if (!email || !password) throw new Error('Missing local admin credentials')
const payload = await getPayload({ config })
const suffix = Date.now().toString(36)
const path = '/qa-draft-' + suffix
const qaEmail = 'imon-qa-' + suffix + '@example.invalid'
let qaPage: number | string | undefined
const browser = await chromium.launch({ channel: 'chrome', headless: true })
let leadId: number | string | undefined
try {
  const draft = await payload.create({
    collection: 'pages',
    overrideAccess: true,
    draft: true,
    data: { path, title: 'QA Preview ' + suffix, kind: 'standard', intro: 'Только для предварительного просмотра', _status: 'draft' },
  })
  qaPage = draft.id
  const localDraft = await payload.find({ collection: 'pages', limit: 1, draft: true, overrideAccess: true, where: { path: { equals: path } } })
  console.log('Local draft lookup:', localDraft.docs.length, localDraft.docs[0]?._status)
  const guest = await browser.newContext()
  const response = await guest.request.get(base + path)
  if (response.status() !== 404) throw new Error('Unpublished document leaked to public visitor: ' + response.status())
  const unauthorized = await guest.request.get(base + '/api/preview?path=' + encodeURIComponent(path))
  if (unauthorized.status() !== 401) throw new Error('Preview auth bypass: ' + unauthorized.status())
  console.log('PASS: unpublished page returns 404; unauthorized preview returns 401')

  const admin = await browser.newContext()
  const page = await admin.newPage()
  await page.goto(base + '/admin/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('#field-email').fill(email)
  await page.locator('#field-password').fill(password)
  await page.locator('button[type=submit]').click()
  await page.waitForURL(/\/admin\/?$/, { timeout: 45000 })
  console.log('PASS: seeded administrator logged into Payload CMS')
  console.log('Login cookie names:', (await admin.cookies()).map(cookie => cookie.name).join(','))
  const previewResponse = await page.goto(base + '/api/preview?path=' + encodeURIComponent(path), { waitUntil: 'domcontentloaded', timeout: 45000 })
  console.log('Preview HTTP:', previewResponse?.status(), 'destination:', new URL(page.url()).pathname)
  console.log('Preview cookie names:', (await admin.cookies()).map(cookie => cookie.name).join(','))
  if (previewResponse?.status() !== 200) throw new Error('Preview returned HTTP ' + previewResponse?.status())
  console.log('Preview text:', (await page.locator('body').innerText()).slice(0, 220))
  await page.getByRole('heading', { name: 'QA Preview ' + suffix }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.preview-indicator').waitFor({ state: 'visible', timeout: 20000 })
  console.log('PASS: authenticated draft preview renders a private page')
  await page.goto(base + '/api/preview/exit')
  const after = await page.goto(base + path, { waitUntil: 'domcontentloaded' })
  if (after?.status() !== 404) throw new Error('Preview mode did not exit: ' + after?.status())
  console.log('PASS: preview exit restores public-only mode')

  const leadResponse = await guest.request.post(base + '/api/contact', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      name: 'QA Тест',
      email: qaEmail,
      company: 'I’MON QA',
      message: 'Тестовая заявка в изолированном тестовом сценарии',
      source: '/contact',
      consent: true,
      website: '',
    }),
  })
  if (leadResponse.status() !== 201) throw new Error('Form submission failed: ' + leadResponse.status() + ' ' + (await leadResponse.text()).slice(0,150))
  const saved = await payload.find({ collection: 'leads', overrideAccess: true, limit: 1, where: { email: { equals: qaEmail } } })
  if (!saved.docs.length) throw new Error('Lead is not stored in the database')
  leadId = saved.docs[0].id
  console.log('PASS: form saved a valid lead in SQLite')
} finally {
  await browser.close()
  if (qaPage !== undefined) await payload.delete({ collection: 'pages', id: qaPage, overrideAccess: true })
  if (leadId !== undefined) await payload.delete({ collection: 'leads', id: leadId, overrideAccess: true })
  console.log('QA test records cleaned from local database')
}
process.exit(0)
