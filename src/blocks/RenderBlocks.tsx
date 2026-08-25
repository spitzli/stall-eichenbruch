import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ServicesBlock } from '@/blocks/Services/Component'
import { FacilitiesBlock } from '@/blocks/Facilities/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { ContactBlock } from '@/blocks/Contact/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TeamBlock } from '@/blocks/Team/Component'

const blockComponents = {
  services: ServicesBlock,
  facilities: FacilitiesBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  gallery: GalleryBlock,
  contact: ContactBlock,
  mediaBlock: MediaBlock,
  team: TeamBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = ({ blocks }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block
        const Block = blockType && blockComponents[blockType]
        if (!Block) return null

        return (
          <section className="container py-10 md:py-14" key={index} id={block.blockName || undefined}>
            {/* @ts-expect-error block prop types are per-block; the map above guarantees the match */}
            <Block {...block} disableInnerContainer />
          </section>
        )
      })}
    </Fragment>
  )
}
