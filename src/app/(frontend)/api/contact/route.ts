import { getPayload } from 'payload'
import config from '@/payload.config'
import { receiveInquiry } from '@/lib/contact'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return receiveInquiry(req, async () => {
    const payload = await getPayload({ config })
    return {
      find: async (submissionId) => (await payload.find({
        collection: 'leads', overrideAccess: true, limit: 1, depth: 0,
        where: { submissionId: { equals: submissionId } },
      })).docs[0],
      countRecent: async (ipHash, since) => (await payload.count({
        collection: 'leads', overrideAccess: true,
        where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
      })).totalDocs,
      create: (data) => payload.create({ collection: 'leads', overrideAccess: true, data }),
    }
  }, process.env.PAYLOAD_SECRET, process.env.NEXT_PUBLIC_SERVER_URL)
}
