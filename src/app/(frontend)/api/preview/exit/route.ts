import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'

export async function GET(request: NextRequest) {
  const preview = await draftMode()
  preview.disable()
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete('imon-editor-preview')
  response.cookies.delete('imon-preview-token')
  return response
}
