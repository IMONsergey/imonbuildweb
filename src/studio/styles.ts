import { isRecord, fieldSelectors, type Breakpoint, type RecordData } from './model'

export type MotionType = 'none' | 'fade' | 'rise' | 'scale' | 'parallax'
export type NodeStyle = {
  paddingTop?: number; paddingBottom?: number; paddingLeft?: number; paddingRight?: number
  marginTop?: number; marginBottom?: number; maxWidth?: number; minHeight?: number
  widthPercent?: number; height?: number; aspectRatio?: number
  fontSize?: number; lineHeight?: number; fontWeight?: number; letterSpacing?: number
  borderRadius?: number; gap?: number; gridColumns?: number
  display?: 'block' | 'flex' | 'grid'; flexDirection?: 'row' | 'column'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  overflow?: 'visible' | 'hidden'
  shadow?: 'none' | 'subtle' | 'soft'
  color?: string; backgroundColor?: string; hidden?: boolean; textAlign?: 'left' | 'center' | 'right'
  motion?: MotionType; motionDuration?: number; motionDelay?: number; motionDistance?: number
}
export type LayoutGuides = { columns: number; gap: number; margin: number }
export type StudioDesign = {
  version: 1
  nodes: Record<string, Partial<Record<Breakpoint, NodeStyle>>>
  guides?: Partial<Record<Breakpoint, LayoutGuides>>
}
const limits: Record<string, [number, number]> = {
  paddingTop: [0, 600], paddingBottom: [0, 600], paddingLeft: [0, 300], paddingRight: [0, 300],
  marginTop: [-800, 600], marginBottom: [-800, 600], maxWidth: [100, 4000], minHeight: [0, 2400],
  widthPercent: [5, 100], height: [0, 2400], aspectRatio: [0.1, 5],
  fontSize: [8, 280], lineHeight: [0.75, 3], fontWeight: [100, 900], letterSpacing: [-10, 30],
  borderRadius: [0, 200], gap: [0, 200], gridColumns: [1, 12],
  motionDuration: [0.15, 6], motionDelay: [0, 5], motionDistance: [0, 180],
}
const enums = {
  display: ['block', 'flex', 'grid'],
  flexDirection: ['row', 'column'],
  alignItems: ['start', 'center', 'end', 'stretch'],
  justifyContent: ['start', 'center', 'end', 'space-between', 'space-around'],
  overflow: ['visible', 'hidden'],
  shadow: ['none', 'subtle', 'soft'],
  textAlign: ['left', 'center', 'right'],
  motion: ['none', 'fade', 'rise', 'scale', 'parallax'],
} as const

const defaultGuides: Record<Breakpoint, LayoutGuides> = {
  desktop: { columns: 12, gap: 16, margin: 16 },
  tablet: { columns: 8, gap: 12, margin: 12 },
  phone: { columns: 4, gap: 10, margin: 12 },
}

export function normalizeDesign(value: unknown): StudioDesign {
  const design: StudioDesign = { version: 1, nodes: {} }
  if (!isRecord(value)) return design
  if (isRecord(value.nodes)) for (const [node, rules] of Object.entries(value.nodes).slice(0, 400)) {
    if (!/^(hero|root|(?:block|field)-[a-zA-Z0-9_-]{1,600})$/.test(node) || !isRecord(rules)) continue
    for (const breakpoint of ['desktop', 'tablet', 'phone'] as const) {
      const input = rules[breakpoint]
      if (!isRecord(input)) continue
      const style: NodeStyle = {}
      for (const [key, val] of Object.entries(input)) {
        if (key in limits && typeof val === 'number' && Number.isFinite(val)) {
          const [min, max] = limits[key]
          ;(style as RecordData)[key] = Math.max(min, Math.min(max, val))
        } else if (['color', 'backgroundColor'].includes(key) && typeof val === 'string' && /^(#[a-f0-9]{3,8}|transparent)$/i.test(val)) {
          ;(style as RecordData)[key] = val
        } else if (key === 'hidden' && typeof val === 'boolean') {
          style.hidden = val
        } else if (key in enums && typeof val === 'string' && (enums as Record<string,readonly string[]>)[key].includes(val)) {
          ;(style as RecordData)[key] = val
        }
      }
      if (Object.keys(style).length) {
        design.nodes[node] ||= {}
        design.nodes[node][breakpoint] = style
      }
    }
  }
  if (isRecord(value.guides)) {
    const guides: Partial<Record<Breakpoint, LayoutGuides>> = {}
    for (const bp of ['desktop', 'tablet', 'phone'] as const) {
      const raw = value.guides[bp]
      if (!isRecord(raw)) continue
      const copy = { ...defaultGuides[bp] }
      for (const key of ['columns', 'gap', 'margin'] as const) {
        const val = raw[key]
        if (typeof val === 'number' && Number.isFinite(val)) {
          const max = key === 'columns' ? 24 : key === 'gap' ? 100 : 250
          copy[key] = Math.min(max, Math.max(key === 'columns' ? 1 : 0, Math.round(val)))
        }
      }
      guides[bp] = copy
    }
    if (Object.keys(guides).length) design.guides = guides
  }
  return design
}
export function currentGuides(value: unknown, breakpoint: Breakpoint): LayoutGuides {
  return normalizeDesign(value).guides?.[breakpoint] || defaultGuides[breakpoint]
}
export function changeGuides(design: unknown, breakpoint: Breakpoint, value: Partial<LayoutGuides>): StudioDesign {
  const next = normalizeDesign(design)
  next.guides ||= {}
  next.guides[breakpoint] = { ...currentGuides(next, breakpoint), ...value }
  return normalizeDesign(next)
}

const shadows = {
  none: 'none',
  subtle: '0 4px 18px rgba(0,0,0,.10)',
  soft: '0 14px 45px rgba(0,0,0,.16)',
} as const

function declarations(id: string, field: boolean, style: NodeStyle) {
  const container: string[] = []
  const heading: string[] = []
  for (const [key, val] of Object.entries(style)) {
    if (key === 'hidden') {
      if (val) container.push('display:none!important')
      continue
    }
    if (key === 'motion') {
      container.push('--imon-motion-type:' + val)
      container.push('--imon-motion-scope:' + id)
      continue
    }
    if (key === 'motionDuration' || key === 'motionDelay' || key === 'motionDistance') {
      const prop = key.replace('motion', '').toLowerCase()
      container.push('--imon-motion-' + prop + ':' + val)
      continue
    }
    if (key === 'gridColumns') {
      container.push('grid-template-columns:repeat(' + val + ',minmax(0,1fr))!important')
      continue
    }
    if (key === 'shadow') {
      container.push('box-shadow:' + shadows[val as keyof typeof shadows] + '!important')
      continue
    }
    if (key === 'widthPercent') {
      container.push('width:' + val + '%!important')
      continue
    }
    const prop = key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())
    const unitless = key === 'lineHeight' || key === 'fontWeight' || key === 'aspectRatio'
    const normalized = key === 'alignItems' || key === 'justifyContent' ? val === 'start' ? 'flex-start' : val === 'end' ? 'flex-end' : val : val
    const rule = prop + ':' + normalized + (typeof val === 'number' && !unitless ? 'px' : '') + '!important'
    if (!field && ['fontSize', 'lineHeight', 'fontWeight', 'letterSpacing'].includes(key)) heading.push(rule)
    else container.push(rule)
  }
  return { container, heading }
}

export function designCSS(value: unknown, document?: unknown): string {
  const design = normalizeDesign(value), fields = fieldSelectors(document)
  const css: Record<Breakpoint, string[]> = { desktop: [], tablet: [], phone: [] }
  for (const [id, variants] of Object.entries(design.nodes)) {
    const field = id.startsWith('field-')
    const selector = field ? fields[id] : `[data-studio-node="${id}"]`
    if (!selector) continue
    for (const breakpoint of ['desktop', 'tablet', 'phone'] as const) {
      const style: NodeStyle = { ...variants.desktop, ...(breakpoint !== 'desktop' ? variants.tablet : {}), ...(breakpoint === 'phone' ? variants.phone : {}) }
      const { container, heading } = declarations(id, field, style)
      if (container.length) css[breakpoint].push(selector + '{' + container.join(';') + '}')
      if (heading.length) css[breakpoint].push(selector + ' h1,' + selector + ' h2,' + selector + ' h3{' + heading.join(';') + '}')
    }
  }
  // Non-overlapping media queries mean a narrower explicit unhide preserves the original display.
  return '@media(min-width:1101px){' + css.desktop.join('\n') + '}\n@media(min-width:701px) and (max-width:1100px){' + css.tablet.join('\n') + '}\n@media(max-width:700px){' + css.phone.join('\n') + '}'
}
export function changeNodeStyle(design: unknown, node: string, breakpoint: Breakpoint, key: keyof NodeStyle, value: unknown): StudioDesign {
  const next = normalizeDesign(design)
  next.nodes[node] ||= {}
  next.nodes[node][breakpoint] ||= {}
  if (value === '' || value === undefined) delete next.nodes[node][breakpoint]![key]
  else (next.nodes[node][breakpoint] as RecordData)[key] = value
  return normalizeDesign(next)
}
