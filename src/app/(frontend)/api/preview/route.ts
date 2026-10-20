import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { issuePreviewToken, previewMaxAgeSeconds } from '@/lib/previewToken'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')
  if (!path || !/^\/(?!\/)[a-z0-9/\-]*$/i.test(path)) {
    return NextResponse.json({ message: 'Некорректный адрес страницы' }, { status: 400 })
  }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ message: 'Доступ только для авторизованного редактора' }, { status: 401 })
  const preview = await draftMode()
  preview.enable()
  const token = issuePreviewToken(path)
  const url = new URL(path, request.nextUrl.origin)
  url.searchParams.set('preview', '1')
  url.searchParams.set('preview_token', token)
  const response = NextResponse.redirect(url, { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set('imon-editor-preview', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: request.nextUrl.protocol === 'https:',
  })
  response.cookies.set('imon-preview-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: request.nextUrl.protocol === 'https:',
    maxAge: previewMaxAgeSeconds,
  })
  return response
}
