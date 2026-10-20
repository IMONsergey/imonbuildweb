import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_AGE_SECONDS = 15 * 60

function secret(): string {
  const value = process.env.PAYLOAD_SECRET
  if (!value || value.length < 32) throw new Error('PAYLOAD_SECRET is not configured')
  return value
}

function sign(body: string): string {
  return createHmac('sha256', secret()).update(body).digest('base64url')
}

export function issuePreviewToken(path: string): string {
  const body = Buffer.from(JSON.stringify({
    path,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  })).toString('base64url')
  return body + '.' + sign(body)
}

export function validatePreviewToken(token: string | undefined, path: string): boolean {
  if (!token || token.length > 1024) return false
  const [body, signature, extra] = token.split('.')
  if (!body || !signature || extra) return false
  try {
    const expected = Buffer.from(sign(body), 'base64url')
    const actual = Buffer.from(signature, 'base64url')
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false
    const data: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!data || typeof data !== 'object') return false
    const record = data as Record<string, unknown>
    return record.path === path &&
      typeof record.expiresAt === 'number' &&
      record.expiresAt > Date.now() &&
      record.expiresAt <= Date.now() + MAX_AGE_SECONDS * 1000
  } catch {
    return false
  }
}

export const previewMaxAgeSeconds = MAX_AGE_SECONDS
