import fs from 'node:fs/promises'

const snapshot = JSON.parse(
  await fs.readFile(
    'migration-data/contentful-published-snapshot.json',
    'utf8'
  )
)

function fileFingerprint(file) {
  if (!file) return null

  return JSON.stringify({
    fileName: file.fileName ?? null,
    contentType: file.contentType ?? null,
    size: file.details?.size ?? null,
    width: file.details?.image?.width ?? null,
    height: file.details?.image?.height ?? null,
  })
}

const summary = {
  total: snapshot.assets.length,
  bothLocales: 0,
  enOnly: 0,
  deOnly: 0,
  neither: 0,
  sameExactUrl: 0,
  differentUrlSameMetadata: 0,
  differentMetadata: 0,
}

const contentTypes = new Map()
const metadataMismatches = []
const missingLocales = []

for (const asset of snapshot.assets) {
  const en = asset.fields?.file?.en ?? null
  const de = asset.fields?.file?.de ?? null

  for (const file of [en, de]) {
    if (file?.contentType) {
      contentTypes.set(
        file.contentType,
        (contentTypes.get(file.contentType) || 0) + 1
      )
    }
  }

  if (en && de) {
    summary.bothLocales += 1

    if (en.url === de.url) {
      summary.sameExactUrl += 1
    } else if (fileFingerprint(en) === fileFingerprint(de)) {
      summary.differentUrlSameMetadata += 1
    } else {
      summary.differentMetadata += 1
      metadataMismatches.push({
        id: asset.sys?.id,
        title: asset.fields?.title ?? null,
        en: {
          url: en.url,
          fileName: en.fileName,
          contentType: en.contentType,
          size: en.details?.size,
          image: en.details?.image ?? null,
        },
        de: {
          url: de.url,
          fileName: de.fileName,
          contentType: de.contentType,
          size: de.details?.size,
          image: de.details?.image ?? null,
        },
      })
    }

    continue
  }

  if (en) summary.enOnly += 1
  else if (de) summary.deOnly += 1
  else summary.neither += 1

  if (!en || !de) {
    missingLocales.push({
      id: asset.sys?.id,
      title: asset.fields?.title ?? null,
      hasEn: Boolean(en),
      hasDe: Boolean(de),
    })
  }
}

console.log('=== ASSET LOCALE SUMMARY ===')
console.log(`Total assets: ${summary.total}`)
console.log(`EN + DE files: ${summary.bothLocales}`)
console.log(`EN only: ${summary.enOnly}`)
console.log(`DE only: ${summary.deOnly}`)
console.log(`Neither: ${summary.neither}`)
console.log(`Same exact EN/DE URL: ${summary.sameExactUrl}`)
console.log(
  `Different URL, same metadata: ${summary.differentUrlSameMetadata}`
)
console.log(`Different metadata: ${summary.differentMetadata}`)

console.log('')
console.log('=== CONTENT TYPES ===')
for (const [type, count] of [...contentTypes.entries()].sort()) {
  console.log(`${type}: ${count}`)
}

console.log('')
console.log('=== METADATA MISMATCHES ===')
if (metadataMismatches.length === 0) {
  console.log('none')
} else {
  console.log(JSON.stringify(metadataMismatches, null, 2))
}

console.log('')
console.log('=== MISSING FILE LOCALES ===')
if (missingLocales.length === 0) {
  console.log('none')
} else {
  console.log(JSON.stringify(missingLocales, null, 2))
}
