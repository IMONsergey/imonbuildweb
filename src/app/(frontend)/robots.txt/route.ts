import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://imon.agency').replace(/\/$/, '')
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /privacy-policy',
    'Disallow: /term-condition',
    '',
    'Sitemap: ' + site + '/sitemap.xml',
    '',
  ].join('\n')
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
  })
}
