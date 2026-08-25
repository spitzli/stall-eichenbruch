import type { CollectionConfig } from 'payload'

import type { Page } from '@/payload-types'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const BLOCK_LABELS = { mediaBlock: 'Bild', gallery: 'Galerie', team: 'Team' } as const

/** "Startseite (Galerie), Pension (Bild)" – pages whose blocks reference the media id (depth 0 data). */
export const blockUsage = (pages: Page[], mediaId: number): string => {
  const hits: string[] = []
  for (const page of pages) {
    for (const block of page.layout || []) {
      const ids =
        block.blockType === 'mediaBlock'
          ? [block.media]
          : block.blockType === 'gallery'
            ? block.images
            : block.blockType === 'team'
              ? (block.members || []).map((m) => m.photo)
              : []
      if (ids.some((id) => (typeof id === 'object' ? id?.id : id) === mediaId)) {
        hits.push(`${page.title} (${BLOCK_LABELS[block.blockType as keyof typeof BLOCK_LABELS]})`)
      }
    }
  }
  return hits.length ? hits.join(', ') : '–'
}

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-Text',
      admin: { description: 'Kurze Bildbeschreibung – wichtig für Google und Screenreader.' },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    // "Verwendet in": reverse lookups for every place a page can reference an image.
    // Joins work for group paths; joins through blocks crash @payloadcms/drizzle 3.88,
    // so block usage is computed by a virtual field instead.
    {
      type: 'collapsible',
      label: 'Verwendet in',
      admin: { initCollapsed: false },
      fields: [
        ...(
          [
            ['usedInHero', 'Hero-Bild', 'hero.media'],
            ['usedInSeo', 'SEO-Bild', 'meta.image'],
          ] as const
        ).map(([name, label, on]) => ({
          name,
          type: 'join' as const,
          label,
          collection: 'pages' as const,
          on,
          maxDepth: 0,
          admin: { allowCreate: false, defaultColumns: ['title', 'slug', '_status'] },
        })),
        {
          name: 'usedInBlocks',
          type: 'text',
          virtual: true,
          label: 'Bild-, Galerie- und Team-Blöcke',
          admin: { readOnly: true },
          hooks: {
            afterRead: [
              async ({ data, req }) => {
                // only for admin requests – public page renders should not pay for this
                if (!req.user || !data?.id) return undefined
                const ctx = req.context as { pagesForUsage?: Promise<Page[]> }
                ctx.pagesForUsage ??= req.payload
                  .find({ collection: 'pages', depth: 0, draft: true, limit: 500, pagination: false, req })
                  .then((r) => r.docs)
                return blockUsage(await ctx.pagesForUsage, data.id as number)
              },
            ],
          },
        },
      ],
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
