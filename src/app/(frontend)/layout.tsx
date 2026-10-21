import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './styles.css'
import './editorial.css'
import './case-fidelity.css'
import './about-fidelity.css'
import './inner-fidelity.css'
import './article-fidelity.css'
import './source-parity.css'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { default: 'I’MON — бренд, продукт и digital', template: '%s — I’MON' },
  description: 'I’MON — стратегический партнёр по бренду, продукту, коммуникации и цифровым платформам.',
  openGraph: { type: 'website', siteName: 'I’MON', locale: 'ru_RU' },
}

export default function SiteRootLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body><a href="#main-content" className="skip-link">К содержимому</a>{children}</body></html>
}
