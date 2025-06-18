// scripts/copy-icons.js
import { cp, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, '../node_modules/@iconify/json')
const destDir = join(__dirname, '../public/collections')

// Copy collections.json
await mkdir(destDir, { recursive: true })
await cp(join(srcDir, 'collections.json'), join(destDir, 'collections.json'))

// Copy all json/*.json files
await mkdir(join(destDir, 'json'), { recursive: true })
await cp(join(srcDir, 'json'), join(destDir, 'json'), { recursive: true })