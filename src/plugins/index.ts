import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateDescription, GenerateImage, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { Page } from '@/payload-types'
import { excerpt } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/site'

// "Generate" buttons in the SEO tab: title from the page, description + image from the hero
const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME
}

const generateDescription: GenerateDescription<Page> = ({ doc }) => excerpt(doc?.hero?.text) || ''

const generateImage: GenerateImage<Page> = ({ doc }) => {
  const media = doc?.hero?.media
  return media ? String(typeof media === 'object' ? media.id : media) : ''
}

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug && doc.slug !== 'home' ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // uploads live in Vercel Blob (the serverless filesystem is ephemeral); locally without a token they stay in public/media
  vercelBlobStorage({
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
  redirectsPlugin({
    collections: ['pages'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'Nach Änderungen muss die Website neu gebaut werden.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateDescription,
    generateImage,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
      state: false,
      country: false,
    },
    // notification mails without an explicit recipient go to the address in the site-info global
    beforeEmail: async (emails, { data, req }) => {
      const formId = typeof data.form === 'object' ? data.form.id : data.form
      const [siteInfo, form] = await Promise.all([
        req.payload.findGlobal({ slug: 'site-info', depth: 0, req }),
        req.payload.findByID({ collection: 'forms', id: formId, depth: 0, req }),
      ])
      if (!siteInfo.email) return emails
      // emails[i] corresponds to form.emails[i]; only entries without their own recipient are redirected
      return emails.map((email, i) =>
        form.emails?.[i]?.emailTo ? email : { ...email, to: siteInfo.email! },
      )
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
]
