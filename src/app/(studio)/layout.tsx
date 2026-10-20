import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/inter'
import '@/studio/studio.css'
export const metadata: Metadata = { title: 'I’MON Studio', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>
}
