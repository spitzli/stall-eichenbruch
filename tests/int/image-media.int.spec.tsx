import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Media } from '../../src/payload-types'

const imageProps = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    imageProps.current = props
    return null
  },
}))
vi.mock('../../src/utilities/getMediaUrl', () => ({ getMediaUrl: (url: string) => url }))
import { ImageMedia } from '../../src/components/Media/ImageMedia'

afterEach(cleanup)

describe('Responsive image rendering', () => {
  it('honors CMS focal points and uses valid sizes and Next 16 preload', () => {
    render(
      <ImageMedia
        fill
        priority
        resource={
          {
            id: 1,
            url: '/images/stall/stall-eichenbruch-gebaeude.webp',
            width: 1200,
            height: 400,
            alt: 'Stallgebäude',
            focalX: 90,
            focalY: 50,
            createdAt: '',
            updatedAt: '',
          } as Media
        }
      />,
    )
    expect(imageProps.current.style).toEqual({ objectPosition: '90% 50%' })
    expect(imageProps.current.sizes).toBe('100vw')
    expect(imageProps.current.preload).toBe(true)
    expect(imageProps.current.loading).toBeUndefined()
    expect(imageProps.current.alt).toBe('Stallgebäude')
  })

  it('keeps explicitly supplied gallery sizes and lazy loading', () => {
    render(
      <ImageMedia
        src={{ src: '/photo.webp', width: 600, height: 400 }}
        size="(min-width: 768px) 33vw, 82vw"
      />,
    )
    expect(imageProps.current.sizes).toBe('(min-width: 768px) 33vw, 82vw')
    expect(imageProps.current.loading).toBe('lazy')
  })
})
