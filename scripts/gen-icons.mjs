// Génère les icônes PWA à partir du logo (recadrage centré carré).
// Lancer : node scripts/gen-icons.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'image.png')
const out = (f) => join(root, 'public', f)
const GREEN = '#0e7c66'

const meta = await sharp(src).metadata()
const side = Math.min(meta.width, meta.height)
const left = Math.round((meta.width - side) / 2)
const top = Math.round((meta.height - side) / 2)

// Carré recadré au centre, en mémoire
const square = await sharp(src).extract({ left, top, width: side, height: side }).png().toBuffer()

// Icônes « any » (recadrage plein cadre)
for (const size of [192, 512]) {
  await sharp(square).resize(size, size).png().toFile(out(`pwa-${size}x${size}.png`))
}
// Apple touch icon (180, fond opaque par sécurité)
await sharp(square).resize(180, 180).flatten({ background: GREEN }).png().toFile(out('apple-touch-icon.png'))

// Maskable 512 : logo à 78% sur fond vert (zone de sécurité respectée)
const inner = Math.round(512 * 0.78)
const logo = await sharp(square).resize(inner, inner).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: GREEN } })
  .composite([{ input: logo, gravity: 'center' }])
  .png().toFile(out('maskable-512x512.png'))

console.log('Icônes générées dans public/ :', meta.width + 'x' + meta.height, '-> carré', side)
