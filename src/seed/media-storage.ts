import { BlobNotFoundError, head } from '@vercel/blob'
import type { Media } from '../payload-types'

/** A CMS record alone does not prove its upload succeeded. Check master and generated sizes. */
export async function filesStored(media: Media): Promise<boolean> {
  const filenames = [
    media.filename,
    ...Object.values(media.sizes || {}).map((size) => size?.filename),
  ].filter((name): name is string => Boolean(name))
  const present = await Promise.all(
    filenames.map(async (filename) => {
      try {
        await head(filename, { token: process.env.BLOB_READ_WRITE_TOKEN })
        return true
      } catch (error) {
        if (error instanceof BlobNotFoundError) return false
        throw error
      }
    }),
  )
  return present.length > 0 && present.every(Boolean)
}
