'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { trackPublicEvent, type AnalyticsConfig } from '@/lib/analytics'

const subscribe = () => () => {}

export function Analytics({ config }: { config: AnalyticsConfig }) {
  const pathname = usePathname()
  const allowed = useSyncExternalStore(subscribe, () => config.domains.includes(window.location.hostname.toLowerCase()), () => false)
  const [ready, setReady] = useState(false)
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    if (!allowed) return
    window.imonAnalytics = config
    return () => { delete window.imonAnalytics }
  }, [allowed, config])
  useEffect(() => {
    if (!ready || lastPath.current === pathname) return
    lastPath.current = pathname
    trackPublicEvent()
  }, [ready, pathname])
  if (!allowed) return null
  return <Script id="imon-umami" src={config.scriptURL} strategy="afterInteractive"
    data-website-id={config.websiteId} data-domains={config.domains.join(',')}
    data-auto-track="false" onReady={() => setReady(true)} />
}
