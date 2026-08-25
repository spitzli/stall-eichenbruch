import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

const colsSpanClasses = {
  full: '12',
  half: '6',
  oneThird: '4',
  twoThirds: '8',
}

export const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => (
  <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-10 gap-x-12">
    {columns?.map((col, index) => {
      const { enableLink, link, richText, size } = col

      return (
        <div
          className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size || 'half']}`, {
            'md:col-span-2': size !== 'full',
          })}
          key={index}
        >
          {richText && <RichText data={richText} enableGutter={false} />}
          {enableLink && (
            <div className="mt-6">
              <CMSLink {...link} />
            </div>
          )}
        </div>
      )
    })}
  </div>
)
