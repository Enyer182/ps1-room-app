import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function downloadFile(url, targetPath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed download ${url}: HTTP ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer))
}

async function main() {
  const args = process.argv.slice(2)
  const objectIdArg = args[0]
  if (!objectIdArg) {
    throw new Error('Usage: node scripts/fetch_met_painting.mjs <ObjectID> [--full]')
  }

  const objectId = Number(objectIdArg)
  if (!Number.isFinite(objectId) || objectId <= 0) {
    throw new Error('ObjectID must be a positive number.')
  }

  const apiUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`Met API failed for object ${objectId}: HTTP ${response.status}`)
  }
  const payload = await response.json()

  if (!payload.isPublicDomain) {
    throw new Error(`Object ${objectId} is not marked as public domain.`)
  }
  if (!payload.primaryImage) {
    throw new Error(`Object ${objectId} has no primary image.`)
  }

  const useFull = args.includes('--full')
  const imageUrl = useFull || !payload.primaryImageSmall ? payload.primaryImage : payload.primaryImageSmall
  const ext = path.extname(new URL(imageUrl).pathname) || '.jpg'
  const slug = String(payload.title || `met_${objectId}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const fileName = `${slug || `met_${objectId}`}_${objectId}${ext}`

  const outputDir = path.resolve('public', 'decor', 'posters')
  const outputPath = path.join(outputDir, fileName)
  await downloadFile(imageUrl, outputPath)

  await fs.writeFile(
    path.join(outputDir, `${path.parse(fileName).name}.json`),
    JSON.stringify(
      {
        source: 'https://www.metmuseum.org',
        api: apiUrl,
        objectID: payload.objectID,
        title: payload.title,
        artist: payload.artistDisplayName,
        objectDate: payload.objectDate,
        medium: payload.medium,
        isPublicDomain: payload.isPublicDomain,
        imageQuality: useFull ? 'primaryImage' : 'primaryImageSmall',
        primaryImage: payload.primaryImage,
        primaryImageSmall: payload.primaryImageSmall,
        objectURL: payload.objectURL,
        downloadedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )

  console.log(`Painting downloaded: ${outputPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
