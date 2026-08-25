import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = ({
  captionClassName,
  className,
  enableGutter = false,
  imgClassName,
  media,
  staticImage,
}) => {
  const caption = media && typeof media === 'object' ? media.caption : undefined

  return (
    <figure className={cn({ container: enableGutter }, className)}>
      {(media || staticImage) && (
        <Media
          imgClassName={cn('w-full h-auto rounded-[2rem]', imgClassName)}
          resource={media}
          src={staticImage}
        />
      )}
      {caption && (
        <figcaption className={cn('mt-4 text-sm text-muted-foreground', captionClassName)}>
          <RichText data={caption} enableGutter={false} enableProse={false} />
        </figcaption>
      )}
    </figure>
  )
}
