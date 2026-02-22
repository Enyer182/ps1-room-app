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

function parseArgs(rawArgs) {
  const args = [...rawArgs]
  const assetId = args.shift()
  if (!assetId) {
    throw new Error('Usage: node scripts/fetch_polyhaven_model.mjs <AssetId> [--res 1k|2k|4k]')
  }

  let resolution = '1k'
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--res' && args[i + 1]) {
      resolution = args[i + 1]
      i += 1
    }
  }

  return { assetId, resolution }
}

async function main() {
  const { assetId, resolution } = parseArgs(process.argv.slice(2))
  const filesResponse = await fetch(`https://api.polyhaven.com/files/${encodeURIComponent(assetId)}`)
  if (!filesResponse.ok) {
    throw new Error(`Poly Haven files API failed for ${assetId}: HTTP ${filesResponse.status}`)
  }
  const filesPayload = await filesResponse.json()

  const gltfResolution = filesPayload?.gltf?.[resolution]?.gltf
  if (!gltfResolution || !gltfResolution.url || !gltfResolution.include) {
    throw new Error(`No glTF payload for ${assetId} at resolution ${resolution}`)
  }

  const outputDir = path.resolve('public', 'decor', 'models', assetId)
  await ensureDir(outputDir)

  const gltfFileName = path.basename(new URL(gltfResolution.url).pathname)
  await downloadFile(gltfResolution.url, path.join(outputDir, gltfFileName))

  const includes = Object.entries(gltfResolution.include)
  for (const [relativePath, info] of includes) {
    if (!info || typeof info !== 'object' || typeof info.url !== 'string') {
      continue
    }
    const safeRelativePath = relativePath.replace(/\\/g, '/')
    await downloadFile(info.url, path.join(outputDir, safeRelativePath))
  }

  const infoResponse = await fetch(`https://api.polyhaven.com/info/${encodeURIComponent(assetId)}`)
  const infoPayload = infoResponse.ok ? await infoResponse.json() : null

  await fs.writeFile(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(
      {
        source: 'https://polyhaven.com/',
        assetId,
        resolution,
        license: 'CC0 (site-wide statement from Poly Haven)',
        downloadedAt: new Date().toISOString(),
        info: infoPayload,
      },
      null,
      2,
    ),
  )

  console.log(`Model downloaded: ${path.join(outputDir, gltfFileName)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
