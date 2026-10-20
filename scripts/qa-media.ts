import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
let mediaId: number | string | null = null
try {
  const media = await payload.create({
    collection: 'media',
    overrideAccess: true,
    filePath: process.cwd() + '/public/media/F4e3531JxZ9ow8dFIQEFtOi92o.png',
    data: { alt: 'Временный тест импорта локального изображения' },
  })
  mediaId = media.id
  if (!media.url || !media.filename) throw new Error('Upload did not produce a media record')
  console.log('PASS: Payload imported an existing source asset as editable Media entry')
  console.log('URL path:', media.url)
} finally {
  if (mediaId !== null) {
    await payload.delete({ collection: 'media', id: mediaId, overrideAccess: true })
    console.log('PASS: QA media record cleaned')
  }
}
process.exit(0)
