import { isRecord, fieldSelectors, type Breakpoint, type RecordData } from './model'

export type NodeStyle = {
  paddingTop?: number; paddingBottom?: number; paddingLeft?: number; paddingRight?: number
  marginTop?: number; marginBottom?: number; maxWidth?: number; minHeight?: number
  fontSize?: number; lineHeight?: number; borderRadius?: number; gap?: number
  color?: string; backgroundColor?: string; hidden?: boolean; textAlign?: 'left' | 'center' | 'right'
}
export type StudioDesign = { version: 1; nodes: Record<string, Partial<Record<Breakpoint, NodeStyle>>> }
const limits: Record<string, [number, number]> = {
  paddingTop: [0, 600], paddingBottom: [0, 600], paddingLeft: [0, 300], paddingRight: [0, 300],
  marginTop: [0, 600], marginBottom: [0, 600], maxWidth: [100, 4000], minHeight: [0, 2400],
  fontSize: [8, 280], lineHeight: [0.75, 3], borderRadius: [0, 200], gap: [0, 200],
}
export function normalizeDesign(value: unknown): StudioDesign {
  const design: StudioDesign = { version: 1, nodes: {} }
  if (!isRecord(value) || !isRecord(value.nodes)) return design
  for (const [node, rules] of Object.entries(value.nodes).slice(0, 400)) {
    if (!/^(hero|root|(?:block|field)-[a-zA-Z0-9_-]{1,600})$/.test(node) || !isRecord(rules)) continue
    for (const breakpoint of ['desktop', 'tablet', 'phone'] as const) {
      const input = rules[breakpoint]
      if (!isRecord(input)) continue
      const style: NodeStyle = {}
      for (const [key, val] of Object.entries(input)) {
        if (key in limits && typeof val === 'number' && Number.isFinite(val)) {
          const [min, max] = limits[key]; (style as RecordData)[key] = Math.max(min, Math.min(max, val))
        } else if (['color', 'backgroundColor'].includes(key) && typeof val === 'string' && /^(#[a-f0-9]{3,8}|transparent)$/i.test(val)) {
          (style as RecordData)[key] = val
        } else if (key === 'hidden' && typeof val === 'boolean') style.hidden = val
        else if (key === 'textAlign' && ['left', 'center', 'right'].includes(String(val))) style.textAlign = val as NodeStyle['textAlign']
      }
      if (Object.keys(style).length) { design.nodes[node] ||= {}; design.nodes[node][breakpoint] = style }
    }
  }
  return design
}
export function designCSS(value: unknown, document?: unknown): string {
  const design = normalizeDesign(value), fields = fieldSelectors(document)
  const css: Record<Breakpoint, string[]> = { desktop: [], tablet: [], phone: [] }
  for (const [id, variants] of Object.entries(design.nodes)) {
    const field = id.startsWith('field-')
    const selector = field ? fields[id] : `[data-studio-node="${id}"]`
    if (!selector) continue
    for (const breakpoint of ['desktop', 'tablet', 'phone'] as const) {
      const style = { ...variants.desktop, ...(breakpoint !== 'desktop' ? variants.tablet : {}), ...(breakpoint === 'phone' ? variants.phone : {}) }
      const container: string[] = [], heading: string[] = []
      for (const [key, val] of Object.entries(style)) {
        if (key === 'hidden') { if (val) container.push('display:none!important'); continue }
        const prop = key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())
        const rule = prop + ':' + val + (typeof val === 'number' && key !== 'lineHeight' ? 'px' : '') + '!important'
        if (!field && ['fontSize', 'lineHeight'].includes(key)) heading.push(rule)
        else container.push(rule)
      }
      if (container.length) css[breakpoint].push(selector + '{' + container.join(';') + '}')
      if (heading.length) css[breakpoint].push(selector + ' h1,' + selector + ' h2,' + selector + ' h3{' + heading.join(';') + '}')
    }
  }
  // Disjoint media ranges let an explicit unhide restore the original display mode.
  return '@media(min-width:1101px){' + css.desktop.join('\n') + '}\n@media(min-width:701px) and (max-width:1100px){' + css.tablet.join('\n') + '}\n@media(max-width:700px){' + css.phone.join('\n') + '}'
}
export function changeNodeStyle(design: unknown, node: string, breakpoint: Breakpoint, key: keyof NodeStyle, value: unknown): StudioDesign {
  const next = normalizeDesign(design)
  next.nodes[node] ||= {}; next.nodes[node][breakpoint] ||= {}
  if (value === '' || value === undefined) delete next.nodes[node][breakpoint]![key]
  else (next.nodes[node][breakpoint] as RecordData)[key] = value
  return normalizeDesign(next)
}
