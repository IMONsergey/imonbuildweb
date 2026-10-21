'use client'
import { useEffect } from 'react'
import { isRecord, readPath, type RecordData } from './model'
import { designCSS } from './styles'

export function CanvasBridge({ data }: { data: RecordData }) {
  useEffect(() => {
    const parent = window.parent
    if (parent === window) return
    let interactive = false, selected = '', editor: HTMLElement | null = null, dragging = ''
    const send = (message: RecordData) => parent.postMessage({ source: 'imon-canvas', ...message }, location.origin)
    document.documentElement.dataset.studioEditing = 'true'
    const outline = document.createElement('div'), label = document.createElement('button'), hover = document.createElement('div')
    outline.className = 'studio-selection-outline'; hover.className = 'studio-hover-outline'; label.className = 'studio-selection-label'; label.type = 'button'; label.draggable = true
    outline.append(label); document.body.append(outline, hover)
    const style = document.createElement('style')
    style.textContent = `html[data-studio-editing=true] {scroll-behavior:auto!important} html[data-studio-editing=true] .preview-indicator {display:none!important} html[data-studio-editing=true] [data-animate],html[data-studio-editing=true] [data-tone-title] {opacity:1!important;filter:none!important;transform:none!important} .studio-selection-outline,.studio-hover-outline {position:fixed;pointer-events:none;z-index:2147483600;border:2px solid #008aff;display:none;box-sizing:border-box} .studio-hover-outline {border:1px solid #008aff}.studio-selection-label{position:absolute;bottom:100%;left:-2px;border:0;background:#008aff;color:white;font:11px/22px Arial,sans-serif;padding:0 7px;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:auto;cursor:grab}.studio-selection-outline[data-position=inside] .studio-selection-label{top:0;bottom:auto} [contenteditable=true]{outline:0!important;cursor:text!important}`
    document.head.append(style)
    const query = (path: string) => document.querySelector<HTMLElement>(`[data-studio-field="${CSS.escape(path)}"]`) || document.querySelector<HTMLElement>(`[data-studio-path="${CSS.escape(path)}"]`)
    const rectangle = (box: HTMLElement, target: HTMLElement | null) => {
      if (!target || interactive) { box.style.display = 'none'; return }
      const rect = target.getBoundingClientRect()
      if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) { box.style.display = 'none'; return }
      const top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom)
      Object.assign(box.style, { display: 'block', left: rect.left + 'px', top: top + 'px', width: rect.width + 'px', height: Math.max(0, bottom - top) + 'px' })
      box.dataset.position = top < 25 ? 'inside' : 'outside'
    }
    const redraw = () => { rectangle(outline, query(selected)); if (editor) rectangle(outline, editor) }
    const finish = () => {
      if (!editor) return
      send({ type: 'edit', path: editor.dataset.studioField, value: editor.innerText })
      editor.removeAttribute('contenteditable'); editor = null; send({ type: 'edit-end' })
    }
    const click = (event: MouseEvent) => {
      if (interactive || event.target === label) return
      const target = event.target as HTMLElement
      if (editor && editor.contains(target)) return
      event.preventDefault(); event.stopPropagation(); finish()
      const field = target.closest<HTMLElement>('[data-studio-field]')
      const node = target.closest<HTMLElement>('[data-studio-path]')
      selected = field?.dataset.studioField || node?.dataset.studioPath || ''
      label.textContent = selected || 'Страница'; redraw()
      send({ type: 'select', path: selected, node: node?.dataset.studioNode || 'hero' })
    }
    const doubleClick = (event: MouseEvent) => {
      if (interactive) return
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-studio-field]')
      const path = target?.dataset.studioField
      if (!target || !path || target.dataset.studioEditable === 'false' || typeof readPath(data, path) !== 'string' || target.querySelector('input,button,img,video')) return
      event.preventDefault(); event.stopPropagation(); finish()
      editor = target; target.contentEditable = 'true'; target.focus(); send({ type: 'edit-start' })
      const range = document.createRange(); range.selectNodeContents(target); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range)
      target.addEventListener('blur', finish, { once: true })
    }
    const onInput = () => { if (editor) send({ type: 'edit', path: editor.dataset.studioField, value: editor.innerText }) }
    const onPaste = (event: ClipboardEvent) => {
      if (!editor) return
      event.preventDefault(); const text = event.clipboardData?.getData('text/plain') || ''
      const selection = window.getSelection(); if (selection?.rangeCount) { const range = selection.getRangeAt(0); range.deleteContents(); const node = document.createTextNode(text); range.insertNode(node); range.setStartAfter(node); range.collapse(true); selection.removeAllRanges(); selection.addRange(range) }; onInput()
    }
    const move = (event: MouseEvent) => { if (!interactive && !editor) rectangle(hover, (event.target as HTMLElement).closest('[data-studio-field],[data-studio-path]')) }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); finish(); send({ type: 'save' }) }
    }
    const message = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || !isRecord(event.data) || event.data.source !== 'imon-studio') return
      const command = event.data
      if (command.type === 'mode') { finish(); interactive = command.preview === true; window.dispatchEvent(new CustomEvent('imon:canvas-mode', { detail: { preview: interactive } })); document.documentElement.dataset.studioEditing = interactive ? 'false' : 'true'; hover.style.display = 'none'; redraw() }
      if (command.type === 'select' && typeof command.path === 'string') {
        selected = command.path; label.textContent = selected || 'Страница'
        if (command.scroll === true) query(selected)?.scrollIntoView({ behavior: 'instant', block: 'center' })
        redraw()
      }
      if (command.type === 'patch' && typeof command.path === 'string' && typeof command.value === 'string') {
        const element = query(command.path)
        if (element?.hasAttribute('data-studio-field') && element !== editor && !element.querySelector('input,img,video')) element.textContent = command.value
        redraw()
      }
      if (command.type === 'design') {
        let element = document.getElementById('studio-design-overrides')
        if (!element) { element = document.createElement('style'); element.id = 'studio-design-overrides'; document.head.append(element) }
        element.textContent = designCSS(command.design, data); redraw()
      }
      if (command.type === 'scroll' && typeof command.y === 'number') window.scrollTo(0, Math.max(0, command.y))
    }
    const onScroll = () => { redraw(); send({ type: 'scroll', y: window.scrollY }) }
    const dragStart = (event: DragEvent) => { dragging = query(selected)?.closest<HTMLElement>('[data-studio-path]')?.dataset.studioPath || ''; event.dataTransfer?.setData('text/plain', dragging) }
    const dragOver = (event: DragEvent) => {
      if (!dragging && !event.dataTransfer?.types.includes('application/x-imon-block')) return
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = dragging ? 'move' : 'copy'
      rectangle(hover, (event.target as HTMLElement).closest('[data-studio-path]'))
    }
    const drop = (event: DragEvent) => {
      const blockType = event.dataTransfer?.getData('application/x-imon-block')
      if (blockType && /^[a-z][a-zA-Z0-9]{1,60}$/.test(blockType)) {
        event.preventDefault(); event.stopPropagation()
        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-studio-path]')
        const rectangle = target?.getBoundingClientRect()
        const before = !!rectangle && event.clientY < rectangle.top + rectangle.height / 2
        send({ type: 'insert', blockType, path: target?.dataset.studioPath || '', before })
        dragging = ''; hover.style.display = 'none'; return
      }
      if (!dragging) return
      event.preventDefault()
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-studio-path]')?.dataset.studioPath
      if (target && target !== dragging) send({ type: 'reorder', from: dragging, to: target })
      dragging = ''; hover.style.display = 'none'
    }
    label.addEventListener('dragstart', dragStart)
    document.addEventListener('click', click, true); document.addEventListener('dblclick', doubleClick, true); document.addEventListener('input', onInput); document.addEventListener('paste', onPaste); document.addEventListener('mousemove', move); document.addEventListener('keydown', keydown); document.addEventListener('dragover', dragOver); document.addEventListener('drop', drop)
    window.addEventListener('message', message); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', redraw)
    send({ type: 'ready' })
    return () => {
      finish(); outline.remove(); hover.remove(); style.remove(); delete document.documentElement.dataset.studioEditing
      document.removeEventListener('click', click, true); document.removeEventListener('dblclick', doubleClick, true); document.removeEventListener('input', onInput); document.removeEventListener('paste', onPaste); document.removeEventListener('mousemove', move); document.removeEventListener('keydown', keydown); document.removeEventListener('dragover', dragOver); document.removeEventListener('drop', drop)
      window.removeEventListener('message', message); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', redraw)
    }
  }, [data])
  return null
}
