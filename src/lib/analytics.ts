export type AnalyticsConfig = { websiteId: string; scriptURL: string; domains: string[] }

export function analyticsConfig(env: Record<string, string | undefined>): AnalyticsConfig | null {
  if (env.IMON_ANALYTICS_ENABLED !== 'true' || env.NODE_ENV !== 'production') return null
  const websiteId = env.UMAMI_WEBSITE_ID || ''
  if (!/^[0-9a-f-]{36}$/i.test(websiteId)) return null
  try {
    const script = new URL(env.UMAMI_SCRIPT_URL || '')
    if (script.protocol !== 'https:' || script.username || script.password || script.search || script.hash) return null
    const domains = (env.UMAMI_DOMAINS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
    if (!domains.length || domains.some(x => !/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(x) || x.endsWith('.localhost'))) return null
    return { websiteId, scriptURL: script.href, domains }
  } catch { return null }
}

type Tracker = { track: (data: Record<string, unknown>) => Promise<unknown> | unknown }
declare global {
  interface Window { umami?: Tracker; imonAnalytics?: AnalyticsConfig }
}

// Explicit allowlist: no form values, query strings, hashes, referrers, titles or person identifiers.
export function trackPublicEvent(event?: 'inquiry_received') {
  try {
    const config = window.imonAnalytics
    if (!config || !config.domains.includes(window.location.hostname.toLowerCase()) || !window.umami) return
    const path = window.location.pathname
    if (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/')) return
    const result = window.umami.track({
      website: config.websiteId, hostname: window.location.hostname, url: path,
      language: navigator.language, ...(event ? { name: event } : {}),
    })
    void Promise.resolve(result).catch(() => undefined)
  } catch { /* Analytics must never affect a successful inquiry. */ }
}
