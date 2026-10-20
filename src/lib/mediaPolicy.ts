/** Only the existing, explicit video providers can be embedded in authored content. */
export function isVideoEmbed(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 1500) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    return url.hostname === 'kinescope.io' && /^\/embed\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
      || url.hostname === 'www.youtube-nocookie.com' && /^\/embed\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
      || url.hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname)
  } catch { return false }
}
