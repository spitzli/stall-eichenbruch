import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const photos = JSON.parse(await readFile(path.join(root, 'scripts/photos.json'), 'utf8'))
const output = path.join(root, 'public/images/stall')
const manifestPath = path.join(root, 'docs/photos-manifest.json')
const digest = (data) => createHash('sha256').update(data).digest('hex')
const manifest = []
const names = new Set()
await mkdir(output, { recursive: true })
await mkdir(path.dirname(manifestPath), { recursive: true })

for (const photo of photos) {
  assert(/^[a-z0-9-]+$/.test(photo.name), `Unsafe name: ${photo.name}`)
  assert(!names.has(photo.name), `Duplicate name: ${photo.name}`)
  names.add(photo.name)
  const original = await readFile(path.join(root, photo.source))
  const sourceMetadata = await sharp(original).metadata()
  // Only explicitly reviewed masters are used; unreviewed generations never reach the site.
  const input = photo.restored ? await readFile(path.join(root, photo.restored)) : original
  const inputMetadata = await sharp(input).metadata()
  assert(
    Math.abs(
      inputMetadata.width / inputMetadata.height - sourceMetadata.width / sourceMetadata.height,
    ) < 0.01,
    `Restoration changed the aspect ratio: ${photo.name}`,
  )
  // Web resolution stays bounded by the source; generation is not proof of recovered detail.
  const { data, info } = await sharp(input)
    .rotate()
    .resize({
      width: Math.min(1920, sourceMetadata.width),
      height: Math.min(1920, sourceMetadata.height),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true })
  const widths = [...new Set([640, 960, 1440, info.width].filter((w) => w <= info.width))].sort(
    (a, b) => a - b,
  )
  const files = []
  for (const width of widths) {
    // WebP for responsive use; AVIF additionally at full web resolution.
    for (const format of width === info.width ? ['webp', 'avif'] : ['webp']) {
      const filename = `${photo.name}${width === info.width ? '' : `-${width}`}.${format}`
      const pipeline = sharp(data, { raw: info }).resize({ width, withoutEnlargement: true })
      const encoded =
        format === 'webp'
          ? await pipeline.webp({ quality: 84, effort: 6 }).toBuffer()
          : await pipeline.avif({ quality: 58, effort: 5 }).toBuffer()
      const metadata = await sharp(encoded).metadata()
      assert(metadata.width === width)
      assert(!metadata.exif, 'EXIF/GPS should not be published')
      assert(Math.abs(metadata.width / metadata.height - info.width / info.height) < 0.01)
      await writeFile(path.join(output, filename), encoded)
      files.push({
        url: `/images/stall/${filename}`,
        format,
        width: metadata.width,
        height: metadata.height,
        bytes: encoded.length,
      })
    }
  }
  assert.equal(
    digest(await readFile(path.join(root, photo.source))),
    digest(original),
    'Original was modified',
  )
  manifest.push({
    ...photo,
    processing: photo.restored
      ? 'GPT Image restoration via Codex built-in image_gen; reviewed against original. Web encoding: orientation, sRGB, source-bounded resize, compression.'
      : 'Original photo: orientation, sRGB conversion, resizing and compression only. No AI restoration.',
    inputSha256: digest(input),
    original: {
      width: sourceMetadata.width,
      height: sourceMetadata.height,
      bytes: original.length,
      sha256: digest(original),
    },
    files,
  })
  console.log(`${photo.name}: ${info.width}×${info.height}, ${files.length} web files`)
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
const originalBytes = manifest.reduce((sum, photo) => sum + photo.original.bytes, 0)
const webBytes = manifest.reduce(
  (sum, photo) => sum + photo.files.find((file) => file.url.endsWith(`/${photo.name}.webp`)).bytes,
  0,
)
console.log(
  `${manifest.length} originals unchanged; full-size WebP: ${(webBytes / 1024 / 1024).toFixed(2)} MiB vs ${(originalBytes / 1024 / 1024).toFixed(2)} MiB (${Math.round((1 - webBytes / originalBytes) * 100)}% smaller).`,
)
