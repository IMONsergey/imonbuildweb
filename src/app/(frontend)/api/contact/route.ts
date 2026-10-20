import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { createHmac } from 'node:crypto'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function reject(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status, headers: { 'Cache-Control': 'no-store' } })
}
function normalize(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum + 1) : ''
}

export async function POST(req: NextRequest) {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return reject('Недопустимый источник запроса.', 403)
  if (Number(req.headers.get('content-length') || 0) > 14_000) return reject('Слишком большой запрос.', 413)
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) return reject('Неверный формат.', 415)
  let input: Record<string, unknown>
  try { input = await req.json() as Record<string, unknown> } catch { return reject('Некорректные данные.', 400) }

  if (input.website) return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  const name = normalize(input.name, 120)
  const email = normalize(input.email, 254).toLowerCase()
  const company = normalize(input.company, 180)
  const message = normalize(input.message, 4000)
  const source = normalize(input.source, 250)
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || message.length < 10 || message.length > 4000 || company.length > 180) {
    return reject('Проверьте имя, email и описание задачи (минимум 10 символов).', 422)
  }
  if (input.consent !== true) return reject('Необходимо согласие на обработку данных.', 422)
  const secret=process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 32) return reject('Форма временно недоступна.', 503)
  const ip=(req.headers.get('x-forwarded-for')||'').split(',')[0]?.trim() || 'unknown'
  const ipHash=createHmac('sha256',secret).update(ip).digest('hex').slice(0,40)

  try {
    const payload=await getPayload({ config })
    const recent=await payload.count({
      collection:'leads',
      where:{ and:[
        { ipHash:{ equals:ipHash } },
        { createdAt:{ greater_than:new Date(Date.now()-60*60*1000).toISOString() } },
      ] },
      overrideAccess:true,
    })
    if (recent.totalDocs >= 5) return reject('Слишком много отправок. Попробуйте позже или напишите на info@imon.agency.',429)
    await payload.create({
      collection:'leads', overrideAccess:true,
      data:{ name,email,company,message,source,status:'new',consent:true,ipHash },
    })
    return NextResponse.json({ ok:true },{ status:201,headers:{'Cache-Control':'no-store'} })
  } catch (error) {
    console.error('Lead persistence failed',error instanceof Error ? error.message : 'Unknown error')
    return reject('Не удалось отправить заявку. Напишите напрямую на info@imon.agency.',503)
  }
}
