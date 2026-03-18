import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const targets = [
  'app.js',
  'server.js',
  'config',
  'controllers',
  'middlewares',
  'models',
  'routes',
  'tests',
]

const files = []

const collectFiles = (targetPath) => {
  const fullPath = join(rootDir, targetPath)
  const stats = statSync(fullPath)

  if (stats.isDirectory()) {
    for (const entry of readdirSync(fullPath)) {
      collectFiles(join(targetPath, entry))
    }
    return
  }

  if (fullPath.endsWith('.js')) {
    files.push(fullPath)
  }
}

for (const target of targets) {
  collectFiles(target)
}

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    console.error(`Syntax validation failed for ${relative(rootDir, file)}`)
    process.exit(result.status ?? 1)
  }
}

console.log(`Validated ${files.length} JavaScript files successfully.`)
