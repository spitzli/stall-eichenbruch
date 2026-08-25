'use client'

import React, { useEffect, useRef, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

// ponytail: native <dialog> handles modal, focus trap, Escape and backdrop – no lightbox lib
export const Lightbox: React.FC<{ images: MediaType[] }> = ({ images }) => {
  const [index, setIndex] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (index === null) dialog.current?.close()
    else if (!dialog.current?.open) dialog.current?.showModal()
  }, [index])

  const step = (d: number) => setIndex((i) => (i === null ? null : (i + d + images.length) % images.length))

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4">
        {images.map((image, i) => (
          <button
            key={image.id ?? i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Bild vergrößern: ${image.alt || ''}`}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Media resource={image} imgClassName="w-full h-auto" size="(min-width: 768px) 33vw, 50vw" />
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialog.current && setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        className="m-auto max-w-none max-h-none w-screen h-screen bg-transparent p-0 backdrop:bg-foreground/85 open:grid place-items-center"
      >
        {index !== null && images[index] && (
          <figure className="relative flex flex-col items-center gap-3 p-4">
            <Media
              resource={images[index]}
              imgClassName="w-[92vw] h-[80vh] object-contain"
              size="92vw"
            />
            {images[index].alt && (
              <figcaption className="text-background/80 text-sm">{images[index].alt}</figcaption>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Vorheriges Bild"
                  className="absolute left-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/90 text-foreground text-xl hover:bg-hay"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Nächstes Bild"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/90 text-foreground text-xl hover:bg-hay"
                >
                  ›
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Schließen"
              className="absolute right-2 top-2 size-11 rounded-full bg-background/90 text-foreground text-xl hover:bg-hay"
            >
              ×
            </button>
          </figure>
        )}
      </dialog>
    </>
  )
}
