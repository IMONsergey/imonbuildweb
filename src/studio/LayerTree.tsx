'use client'
import { isRecord, readPath, type FieldSpec, type RecordData } from './model'

export function LayerTree({ fields, data, prefix, selection, select, depth = 0 }: {
  fields: FieldSpec[]; data: RecordData; prefix: string; selection: string
  select: (path: string) => void; depth?: number
}) {
  if (depth > 5) return null
  return <div className="st-layer-children">{fields.filter(field => !['studio','blockName','id'].includes(field.name) && !field.name.endsWith('Path') && !['href','layout','display','number','limit'].includes(field.name)).map(field => {
    const path = prefix + '.' + field.name, value = readPath(data,path)
    if (field.type === 'array') {
      const rows = Array.isArray(value) ? value : []
      return <details key={path} className="st-nested-layers" open={selection.startsWith(path + '.')}>
        <summary><span>{field.label}</span><small>{rows.length}</small></summary>
        {rows.map((row,index) => <details key={isRecord(row) && typeof row.id === 'string' ? row.id : index} open={selection.startsWith(path + '.' + index + '.')} className="st-nested-layers">
          <summary><span>{isRecord(row) ? String(row.heading || row.title || row.question || row.name || row.role || 'Элемент ' + (index + 1)).slice(0,40) : 'Элемент'}</span></summary>
          <LayerTree fields={field.fields || []} {...{data,selection,select}} prefix={path + '.' + index} depth={depth + 1}/>
        </details>)}
      </details>
    }
    if (field.type === 'group') return <details key={path} className="st-nested-layers"><summary>{field.label}</summary><LayerTree fields={field.fields || []} {...{data,selection,select}} prefix={path} depth={depth + 1}/></details>
    if (!['text','textarea','richText','upload'].includes(field.type)) return null
    return <button type="button" key={path} className={'st-leaf-layer ' + (selection === path ? 'active' : '')} title={field.label} onClick={() => select(path)}>
      <i aria-hidden="true">{field.type === 'upload' ? '▧' : 'T'}</i><span>{field.label}</span>
    </button>
  })}</div>
}
