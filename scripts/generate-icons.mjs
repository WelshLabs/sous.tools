import sharp from "sharp"
import pngToIco from "png-to-ico"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const out = path.join(root, "public", "icons")
await mkdir(out, { recursive: true })

const mark = `<path d="M25 72C5 72 5 45 25 35C20 10 50 5 50 25C50 5 80 10 75 35C95 45 95 72 75 72Z" fill="none" stroke="#48DFFF" stroke-width="8" stroke-linejoin="round"/><rect x="25" y="78" width="50" height="10" rx="3" fill="#48DFFF"/>`
const microMark = `<path d="M20 70C4 69 5 43 24 34C20 12 47 8 50 26C53 8 80 12 76 34C95 43 96 69 80 70Z" fill="none" stroke="#48DFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="77" width="60" height="12" rx="4" fill="#48DFFF"/>`

function svg({ micro = false, maskable = false, monochrome = false } = {}) {
  const pad = maskable ? 20 : micro ? 5 : 12
  const artwork = monochrome ? mark.replaceAll("#48DFFF", "#000000") : micro ? microMark : mark
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="bg" cx="35%" cy="18%"><stop stop-color="#12245A"/><stop offset="1" stop-color="#050816"/></radialGradient></defs>${monochrome ? "" : `<rect width="100" height="100" rx="${maskable ? 0 : 22}" fill="url(#bg)"/><rect x="1" y="1" width="98" height="98" rx="${maskable ? 0 : 21}" fill="none" stroke="#3867FF" stroke-opacity=".55" stroke-width="2"/>`}<g transform="translate(${pad} ${pad}) scale(${(100 - pad * 2) / 100})">${artwork}</g></svg>`
}

const standardSvg = svg()
const microSvg = svg({ micro: true })
const maskableSvg = svg({ maskable: true })
const monoSvg = svg({ monochrome: true })
await Promise.all([
  writeFile(path.join(out, "icon.svg"), standardSvg),
  writeFile(path.join(out, "favicon.svg"), microSvg),
  writeFile(path.join(out, "maskable.svg"), maskableSvg),
  writeFile(path.join(out, "monochrome.svg"), monoSvg),
])

async function png(name, size, source = standardSvg) {
  const target = path.join(out, name)
  await sharp(Buffer.from(source)).resize(size, size).png().toFile(target)
  return target
}

const browser16 = await png("favicon-16.png", 16, microSvg)
const browser32 = await png("favicon-32.png", 32, microSvg)
await Promise.all([
  png("apple-touch-icon.png", 180),
  png("pwa-192.png", 192), png("pwa-512.png", 512),
  png("maskable-192.png", 192, maskableSvg), png("maskable-512.png", 512, maskableSvg),
  png("macos-1024.png", 1024),
  ...[16, 32, 48, 64, 128, 256, 512].map((size) => png(`linux-${size}.png`, size, size <= 32 ? microSvg : standardSvg)),
])
const windowsSizes = await Promise.all([16, 24, 32, 48, 64, 128, 256].map((size) => png(`windows-${size}.png`, size, size <= 32 ? microSvg : standardSvg)))
await writeFile(path.join(out, "favicon.ico"), await pngToIco([browser16, browser32, windowsSizes[3]]))
await writeFile(path.join(out, "windows.ico"), await pngToIco(windowsSizes))
console.log(`Generated ChefOS icon suite in ${out}`)
