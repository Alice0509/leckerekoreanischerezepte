import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const snapshot = JSON.parse(
  await fs.readFile(
    'migration-data/contentful-published-snapshot.json',
    'utf8'
  )
)

function absoluteUrl(url) {
  if (!url) return null
  if (url.startsWith('//')) return `https:${url}`
  return url
}

async function sha256FromUrl(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
}

const mismatches = []
let checked = 0

for (const asset of snapshot.assets) {
  const enUrl = absoluteUrl(asset.fields?.file?.en?.url)
  const deUrl = absoluteUrl(asset.fields?.file?.de?.url)

  if (!enUrl || !deUrl) continue

  const enHash = await sha256FromUrl(enUrl)
  const deHash = await sha256FromUrl(deUrl)

  checked += 1

  if (enHash !== deHash) {
    mismatches.push({
      id: asset.sys?.id,
      title: asset.fields?.title ?? null,
      enUrl,
      deUrl,
      enHash,
      deHash,
    })
  }

  if (checked % 10 === 0 || checked === snapshot.assets.length) {
    console.log(`[asset-bytes] Checked ${checked}/${snapshot.assets.length}`)
  }
}

console.log('')
console.log('=== ASSET BYTE COMPARISON ===')
console.log(`Assets checked: ${checked}`)
console.log(`Exact EN/DE matches: ${checked - mismatches.length}`)
console.log(`Byte mismatches: ${mismatches.length}`)

if (mismatches.length > 0) {
  console.log('')
  console.log(JSON.stringify(mismatches, null, 2))
}
