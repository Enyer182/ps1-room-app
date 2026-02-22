import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

function printUsage() {
  console.log('Usage:')
  console.log('  Single file:')
  console.log('    npm run convert:chd -- "C:\\path\\game.cue"')
  console.log('    npm run convert:chd -- "C:\\path\\game.cue" "C:\\path\\game.chd"')
  console.log('')
  console.log('  Batch in folder:')
  console.log('    npm run convert:chd -- --dir "C:\\path\\roms"')
}

function runChdmanCreateCd(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const child = spawn(npxCommand, ['chdman', 'createcd', '-i', inputPath, '-o', outputPath], {
      stdio: 'inherit',
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`chdman exited with code ${code ?? 1}`))
    })
  })
}

async function convertSingle(inputArg, outputArg) {
  const inputPath = path.resolve(inputArg)
  if (path.extname(inputPath).toLowerCase() !== '.cue') {
    throw new Error('Input must be a .cue file.')
  }

  const outputPath = outputArg
    ? path.resolve(outputArg)
    : path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}.chd`)

  await runChdmanCreateCd(inputPath, outputPath)
  console.log(`\nCHD created: ${outputPath}`)
}

async function convertDirectory(dirArg) {
  const dirPath = path.resolve(dirArg)
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const cueFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.cue')
    .map((entry) => path.join(dirPath, entry.name))

  if (!cueFiles.length) {
    throw new Error(`No .cue files found in: ${dirPath}`)
  }

  for (const cuePath of cueFiles) {
    const outputPath = path.join(dirPath, `${path.basename(cuePath, '.cue')}.chd`)
    console.log(`\nConverting: ${cuePath}`)
    await runChdmanCreateCd(cuePath, outputPath)
    console.log(`Done: ${outputPath}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    printUsage()
    process.exit(1)
  }

  if (args[0] === '--dir') {
    if (!args[1]) {
      printUsage()
      process.exit(1)
    }
    await convertDirectory(args[1])
    return
  }

  await convertSingle(args[0], args[1])
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
