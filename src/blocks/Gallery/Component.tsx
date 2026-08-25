import React from 'react'

import type { GalleryBlock as Props, Media } from '@/payload-types'

import { Lightbox } from './Lightbox'

export const GalleryBlock: React.FC<Props> = ({ heading, images }) => {
  const resolved = (images || []).filter((i): i is Media => typeof i === 'object')
  if (resolved.length === 0) return null

  return (
    <>
      {heading && <h2 className="text-3xl md:text-4xl mb-8">{heading}</h2>}
      <Lightbox images={resolved} />
    </>
  )
}
