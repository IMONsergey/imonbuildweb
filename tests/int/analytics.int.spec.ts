import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyticsConfig, trackPublicEvent } from '@/lib/analytics'
const env = { NODE_ENV: 'production', IMON_ANALYTICS_ENABLED: 'true', UMAMI_WEBSITE_ID: '4d389eb3-9788-4bcf-adbe-e3090876fc54', UMAMI_SCRIPT_URL: 'https://analytics.example/script.js', UMAMI_DOMAINS: 'localhost,new.example' }
afterEach(() => { delete window.umami; delete window.imonAnalytics; window.history.replaceState({}, '', '/'); vi.restoreAllMocks() })
describe('analytics privacy', () => {
  it('requires opt-in, production, HTTPS and explicit valid domains', () => {
    const good = { ...env, UMAMI_DOMAINS: 'new.example' }
    expect(analyticsConfig(good)?.domains).toEqual(['new.example'])
    for (const patch of [{ IMON_ANALYTICS_ENABLED: '' }, { NODE_ENV: 'development' }, { UMAMI_SCRIPT_URL: 'http://analytics.example/script.js' }, { UMAMI_DOMAINS: '' }, { UMAMI_DOMAINS: '*' }, { UMAMI_DOMAINS: 'localhost' }])
      expect(analyticsConfig({ ...good, ...patch })).toBeNull()
  })
  it('sends a strictly limited payload and excludes query, fragment and form content', () => {
    const track = vi.fn(); window.umami = { track }
    window.imonAnalytics = { websiteId: env.UMAMI_WEBSITE_ID, scriptURL: env.UMAMI_SCRIPT_URL, domains: [window.location.hostname] }
    window.history.replaceState({}, '', '/contact?email=secret@example.invalid#private')
    trackPublicEvent('inquiry_received')
    expect(track).toHaveBeenCalledWith({ website: env.UMAMI_WEBSITE_ID, hostname: window.location.hostname, url: '/contact', language: navigator.language, name: 'inquiry_received' })
  })
  it('excludes unapproved hosts and admin/API routes', () => {
    const track = vi.fn(); window.umami = { track }
    window.imonAnalytics = { websiteId: env.UMAMI_WEBSITE_ID, scriptURL: env.UMAMI_SCRIPT_URL, domains: ['elsewhere.example'] }
    trackPublicEvent(); expect(track).not.toHaveBeenCalled()
    window.imonAnalytics.domains = [window.location.hostname]
    for (const path of ['/admin', '/admin/collections/leads', '/api/preview']) { window.history.replaceState({}, '', path); trackPublicEvent() }
    expect(track).not.toHaveBeenCalled()
  })
  it('does not propagate blocked analytics failures', () => {
    window.imonAnalytics = { websiteId: env.UMAMI_WEBSITE_ID, scriptURL: env.UMAMI_SCRIPT_URL, domains: [window.location.hostname] }
    window.umami = { track: () => { throw Error('blocked') } }
    expect(() => trackPublicEvent('inquiry_received')).not.toThrow()
  })
})
