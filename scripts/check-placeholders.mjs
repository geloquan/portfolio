import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const ignored = new Set(['.git', 'node_modules', 'dist', 'coverage', '.github', 'scripts'])
const acceptedOwnerMarkers = new Set(['src/App.tsx:32', 'src/App.tsx:310', 'src/App.tsx:312', 'src/App.tsx:313', 'src/App.tsx:316', 'src/App.tsx:317', 'src/App.tsx:327', 'src/App.tsx:491', 'src/App.tsx:585', 'src/App.tsx:651', 'src/App.tsx:709'])
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.html'])
const marker = /TODO\(owner\)/g
const hits = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) await walk(file)
    else if (extensions.has(path.extname(entry.name))) {
      const content = await readFile(file, 'utf8')
      for (const match of content.matchAll(marker)) {
        const line = content.slice(0, match.index).split('\n').length
        const relativeFile = path.relative(root, file).replaceAll('\\', '/')
        if (!acceptedOwnerMarkers.has(`${relativeFile}:${line}`)) hits.push(`${relativeFile}:${line}: unresolved TODO(owner)`)
      }
    }
  }
}

await walk(root)
if (hits.length) {
  console.error(`Found ${hits.length} unresolved owner placeholder(s):\n${hits.join('\n')}`)
  process.exitCode = 1
} else {
  console.log('No TODO(owner) placeholders found.')
}
