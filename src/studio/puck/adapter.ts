import type { Data } from '@puckeditor/core'
import { isRecord, type RecordData, type StudioDocument, blockField } from '../model'
import { normalizeDesign, type MotionType, type StudioDesign, type NodeStyle } from '../styles'

/**
 * Puck edits an existing Payload document. The public React renderer, source CMS block
 * structure, and any unmanaged properties remain unchanged.
 */
export type PuckData = Data<Record<string, Record<string, unknown>>, Record<string, unknown>>
const motionKinds: MotionType[] = ['none', 'fade', 'rise', 'scale', 'parallax']
const motionNumbers = {
  __motionDuration: 'motionDuration',
  __motionDelay: 'motionDelay',
  __motionDistance: 'motionDistance',
} as const

function motionProps(design: StudioDesign, id: string): RecordData {
  const variants = design.nodes['block-' + id]
  const desktop = variants?.desktop
  return {
    __motion: desktop?.motion ?? '',
    __motionDuration: desktop?.motionDuration ?? null,
    __motionDelay: desktop?.motionDelay ?? null,
    __motionDistance: desktop?.motionDistance ?? null,
    __motionTablet: variants?.tablet?.motion ?? '',
    __motionPhone: variants?.phone?.motion ?? '',
  }
}

export function documentToPuck(document: Pick<StudioDocument, 'collection' | 'data'>): PuckData {
  const source = document.data
  const key = blockField(document.collection)
  const blocks = Array.isArray(source[key]) ? source[key] : []
  const design = normalizeDesign(source.studio)
  return {
    root: { props: {
      title: typeof source.title === 'string' ? source.title : '',
      intro: typeof source.intro === 'string' ? source.intro : '',
      heroTitle: typeof source.heroTitle === 'string' ? source.heroTitle : '',
      summary: typeof source.summary === 'string' ? source.summary : '',
      excerpt: typeof source.excerpt === 'string' ? source.excerpt : '',
      heroImage: source.heroImage || null,
      heroVideo: source.heroVideo || null,
    } },
    content: blocks.filter(isRecord).map((block, index) => {
      const { blockType, ...props } = structuredClone(block)
      const id = typeof props.id === 'string' && /^[\w-]+$/.test(props.id) ? props.id : `legacy-${index}-${blockType}`
      return { type: String(blockType), props: { ...props, id, ...motionProps(design, id) } }
    }),
  }
}

function writeMotion(design: StudioDesign, node: string, field: 'desktop' | 'tablet' | 'phone', motion: unknown): void {
  if (typeof motion !== 'string') return
  if (motion && !motionKinds.includes(motion as MotionType)) return
  const settings = design.nodes[node]
  if (!settings && !motion) return
  const existing = settings?.[field] || {}
  const update: NodeStyle = { ...existing }
  if (motion) update.motion = motion as MotionType
  else delete update.motion
  if (!Object.keys(update).length) {
    if (settings) {
      delete settings[field]
      if (!Object.keys(settings).length) delete design.nodes[node]
    }
  } else {
    design.nodes[node] ||= {}
    design.nodes[node][field] = update
  }
}

export function puckToDocument(
  puckData: PuckData,
  original: RecordData,
  collection: StudioDocument['collection'],
): RecordData {
  const document = structuredClone(original)
  const fields = collection === 'pages'
    ? ['title', 'heroTitle', 'intro', 'heroImage', 'heroVideo']
    : collection === 'projects'
      ? ['title', 'summary']
      : ['title', 'excerpt']
  for (const field of fields) {
    const value = puckData.root?.props?.[field]
    if (field === 'heroImage' || field === 'heroVideo') {
      if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) document[field] = value
      else if (isRecord(value) && typeof value.id === 'number') document[field] = value.id
      else if (value === null && field in document) document[field] = null
    } else if (typeof value === 'string' && (field in document || value !== '')) document[field] = value
  }
  const content = puckData.content || []
  const used = new Set<string>()
  const design = normalizeDesign(original.studio)
  let hasDesignChange = false
  document[blockField(collection)] = content.map(entry => {
    const props: RecordData = isRecord(entry.props) ? structuredClone(entry.props) : {}
    let id = typeof props.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(props.id) ? props.id : ''
    if (!id || used.has(id)) {
      id = crypto.randomUUID()
      hasDesignChange = true
    }
    used.add(id)
    const node = 'block-' + id
    for (const key of ['__motion', '__motionTablet', '__motionPhone']) {
      if (key in props) {
        const before = JSON.stringify(design.nodes[node])
        writeMotion(design, node, key === '__motion' ? 'desktop' : key === '__motionTablet' ? 'tablet' : 'phone', props[key])
        if (JSON.stringify(design.nodes[node]) !== before) hasDesignChange = true
        delete props[key]
      }
    }
    for (const [key, field] of Object.entries(motionNumbers)) {
      const val = props[key]
      delete props[key]
      if (val !== null && val !== undefined && val !== '' && typeof val === 'number' && Number.isFinite(val)) {
        const before = JSON.stringify(design.nodes[node])
        design.nodes[node] ||= {}
        design.nodes[node].desktop ||= {}
        ;(design.nodes[node].desktop as RecordData)[field] = val
        if (JSON.stringify(design.nodes[node]) !== before) hasDesignChange = true
      } else if (design.nodes[node]?.desktop && field in design.nodes[node].desktop) {
        delete (design.nodes[node].desktop as RecordData)[field]
        hasDesignChange = true
        if (!Object.keys(design.nodes[node].desktop!).length) delete design.nodes[node].desktop
      }
    }
    props.id = id
    return { ...props, blockType: entry.type }
  })
  const trimmed = normalizeDesign(design)
  if (hasDesignChange) document.studio = trimmed
  return document
}

export function comparePuckData(a: PuckData, b: PuckData): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
