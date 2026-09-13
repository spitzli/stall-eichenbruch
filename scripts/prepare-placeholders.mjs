import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'public/images/stall')
await mkdir(output, { recursive: true })
await sharp(path.join(root, 'assets/placeholders/fuehrmaschine.svg'))
  .webp({ quality: 90, effort: 6 })
  .toFile(path.join(output, 'fuehrmaschine-platzhalter.webp'))
console.log('Created neutral Führmaschine photo placeholder (1200 × 900).')
