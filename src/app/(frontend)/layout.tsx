import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './styles.css'
import type { ReactNode } from 'react'
import { Analytics } from '@/components/Analytics'
import { analyticsConfig } from '@/lib/analytics'

export const metadata: Metadata = {
  title: { default: 'I’MON — бренд, продукт и digital', template: '%s — I’MON' },
  description: 'I’MON — стратегический партнёр по бренду, продукту, коммуникации и цифровым платформам.',
  openGraph: { type: 'website', siteName: 'I’MON', locale: 'ru_RU' },
}

export default function SiteRootLayout({ children }: { children: ReactNode }) {
  const analytics = analyticsConfig(process.env)
  return <html lang="ru"><body><a href="#main-content" className="skip-link">К содержимому</a>{children}{analytics && <Analytics config={analytics} />}</body></html>
}
