import type { DisplayBlock } from '@/lib/defaultBlocks'
import { Blocks } from './Blocks'

export function AboutSections({ blocks }: { blocks: DisplayBlock[] }) {
  return <Blocks blocks={blocks}/>
}
