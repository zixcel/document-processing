import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
const root = mkdtempSync(join(tmpdir(), 'document-consumer-'))
writeFileSync(join(root, 'user.npmrc'), '')
writeFileSync(join(root, 'global.npmrc'), '')
const env = { ...process.env, NPM_CONFIG_USERCONFIG: join(root, 'user.npmrc'), NPM_CONFIG_GLOBALCONFIG: join(root, 'global.npmrc'),
  NPM_CONFIG_CACHE: join(root, 'cache'), NPM_CONFIG_REGISTRY: 'https://registry.npmjs.org', NODE_AUTH_TOKEN: '', NPM_TOKEN: '' }
function run(command, args, cwd) { return execFileSync(command, args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }
try {
  for (const directory of ['.', 'packages/document-html', 'packages/document-markdown']) {
    const data = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', root], resolve(directory)))
    const packed = (Array.isArray(data) ? data : Object.values(data))[0]
    assert.equal(packed.filename, packed.filename.split('/').at(-1))
  }
  const consumer = join(root, 'consumer')
  mkdirSync(consumer)
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  const tools = JSON.parse(readFileSync(resolve('package.json'), 'utf8')).devDependencies
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund',
    ...readdirSync(root).filter(name => name.endsWith('.tgz')).map(name => join(root, name)), `typescript@${tools.typescript}`], consumer)
  cpSync(resolve('test/consumer.mts'), join(consumer, 'consumer.mts'))
  run(process.execPath, [join(consumer, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict',
    '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', 'consumer.mts'], consumer)
  cpSync(resolve('playground/parse-documents/demo.mjs'), join(consumer, 'demo.mjs'))
  process.stdout.write(run(process.execPath, ['demo.mjs'], consumer))
  console.log('Three archive packages: public types, plain/HTML/Markdown adapters and legacy refusal passed')
} finally { rmSync(root, { recursive: true, force: true }) }
