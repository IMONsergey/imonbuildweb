import Link from 'next/link'
import { cookies, draftMode } from 'next/headers'
export async function PreviewIndicator({ forceVisible = false }: { forceVisible?: boolean }) {
  const { isEnabled } = await draftMode()
  const customPreview = (await cookies()).get('imon-editor-preview')?.value === '1'
  if (!isEnabled && !customPreview && !forceVisible) return null
  return <div className="preview-indicator" role="status">
    Режим предпросмотра — изменения могут быть не опубликованы
    <Link href="/api/preview/exit">Выйти</Link>
  </div>
}
