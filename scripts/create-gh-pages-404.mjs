import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve('dist')
const indexPath = resolve(distDir, 'index.html')
const notFoundPath = resolve(distDir, '404.html')

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html does not exist. Run vite build first.')
}

copyFileSync(indexPath, notFoundPath)
