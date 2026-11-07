import { createHmac } from 'node:crypto'

export type Inquiry = {
  name: string; email: string; company: string; message: string; source: string
  consent: true; status: 'new'; ipHash: string; submissionId: string; requestHash: string
}
export type InquiryStore = {
  find: (submissionId: string) => Promise<{ requestHash?: string | null } | undefined>
  countRecent: (ipHash: string, since: string) => Promise<number>
  create: (data: Inquiry) => Promise<unknown>
}
const headers = { 'Cache-Control': 'no-store' }
const reject = (message: string, status: number) => Response.json({ ok: false, message }, { status, headers })
const accepted = (submissionId: string, duplicate: boolean) =>
  Response.json({ ok: true, receipt: submissionId, duplicate }, { status: duplicate ? 200 : 201, headers })
const normalize = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max + 1) : ''
export const submissionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function readInput(req: Request): Promise<unknown> {
  const reader = req.body?.getReader()
  if (!reader) throw new Error('empty')
  let length = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 14_000) { await reader.cancel(); throw new Error('too-large') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export async function receiveInquiry(req: Request, store: () => Promise<InquiryStore>, secret: string | undefined, serverURL?: string) {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return reject('Недопустимый источник запроса.', 403)
  const origin = req.headers.get('origin')
  if (origin) {
    try {
      if (origin !== new URL(serverURL || req.url).origin) return reject('Недопустимый источник запроса.', 403)
    } catch { return reject('Форма временно недоступна.', 503) }
  }
  if (Number(req.headers.get('content-length') || 0) > 14_000) return reject('Слишком большой запрос.', 413)
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) return reject('Неверный формат.', 415)
  let input: unknown
  try { input = await readInput(req) } catch (error) {
    return reject(error instanceof Error && error.message === 'too-large' ? 'Слишком большой запрос.' : 'Некорректные данные.',
      error instanceof Error && error.message === 'too-large' ? 413 : 400)
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return reject('Некорректные данные.', 400)
  const value = input as Record<string, unknown>
  if (value.website) return Response.json({ ok: true }, { headers })
  const submissionId = normalize(value.submissionId, 36).toLowerCase()
  if (!submissionPattern.test(submissionId)) return reject('Обновите страницу и попробуйте еще раз.', 422)
  const name = normalize(value.name, 120)
  const email = normalize(value.email, 254).toLowerCase()
  const company = normalize(value.company, 180)
  const message = normalize(value.message, 4000)
  const sourceInput = normalize(value.source, 250)
  const source = /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(sourceInput) ? sourceInput : '/'
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || message.length < 10 || message.length > 4000 || company.length > 180)
    return reject('Проверьте имя, email и описание задачи (минимум 10 символов).', 422)
  if (value.consent !== true) return reject('Необходимо согласие на обработку данных.', 422)
  if (!secret || secret.length < 32) return reject('Форма временно недоступна.', 503)
  const hash = (data: string) => createHmac('sha256', secret).update(data).digest('hex')
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown'
  const ipHash = hash(ip).slice(0, 40)
  const requestHash = hash(JSON.stringify({ name, email, company, message, source, consent: true }))
  const replay = (existing: { requestHash?: string | null }) => existing.requestHash === requestHash
    ? accepted(submissionId, true) : reject('Заявка с этим номером уже принята с другими данными. Обновите страницу.', 409)
  try {
    const db = await store()
    const existing = await db.find(submissionId)
    if (existing) return replay(existing)
    if (await db.countRecent(ipHash, new Date(Date.now() - 3_600_000).toISOString()) >= 5)
      return reject('Слишком много отправок. Попробуйте позже или напишите на info@imon.agency.', 429)
    try {
      await db.create({ name, email, company, message, source, consent: true, status: 'new', ipHash, submissionId, requestHash })
    } catch {
      // The unique database index is the concurrency guard. Also recovers a lost write acknowledgement.
      const winner = await db.find(submissionId)
      if (winner) return replay(winner)
      throw new Error('persistence-unconfirmed')
    }
    return accepted(submissionId, false)
  } catch {
    // Database errors may contain the complete inquiry. Never log them.
    console.error('Lead persistence unavailable')
    return reject('Не удалось подтвердить получение заявки. Повторите отправку или напишите на info@imon.agency.', 503)
  }
}
