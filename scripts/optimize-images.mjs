/**
 * Resize and recompress game images in place, keeping the same format and filename
 * (so the `img` column in the database doesn't need to change).
 *
 * Usage: npm run optimize-images [-- <folder>]   (default: public/assets)
 *
 * - Applies EXIF orientation
 * - Shrinks images wider than MAX_WIDTH (never enlarges)
 * - Re-encodes at QUALITY
 * - Only overwrites a file when the result is at least MIN_GAIN smaller
 */
import sharp from "sharp"
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { extname, join, relative } from "node:path"

const MAX_WIDTH = 500 // cards display at ~120-250px, the game sheet at ~240px: 500px covers 2x screens
const QUALITY = 80
const MIN_GAIN = 0.05

const root = process.argv[2] ?? "public/assets"

const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

const encoders = {
  ".jpg": img => img.jpeg({ quality: QUALITY, mozjpeg: true }),
  ".jpeg": img => img.jpeg({ quality: QUALITY, mozjpeg: true }),
  ".png": img => img.png({ compressionLevel: 9, palette: true }),
  ".webp": img => img.webp({ quality: QUALITY }),
}

const mb = bytes => `${(bytes / 1048576).toFixed(1)} Mo`

let before = 0
let after = 0
let changed = 0

for (const file of walk(root)) {
  const encode = encoders[extname(file).toLowerCase()]
  if (!encode) continue

  const original = readFileSync(file)
  before += original.length

  const pipeline = sharp(original)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
  const optimized = await encode(pipeline).toBuffer()

  if (optimized.length <= original.length * (1 - MIN_GAIN)) {
    writeFileSync(file, optimized)
    after += optimized.length
    changed++
    console.log(`✔ ${relative(root, file)}  ${(original.length / 1024).toFixed(0)} Ko → ${(optimized.length / 1024).toFixed(0)} Ko`)
  } else {
    after += original.length
  }
}

console.log(`\n${changed} image(s) optimisée(s) — ${mb(before)} → ${mb(after)}`)
