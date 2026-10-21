import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
export function checkSourceLanguages(paths: string[], admitted: Record<string, unknown>): void {
  const actual = paths.filter(name => /\.(?:c?js|mjs)$/.test(name))
  assert.deepEqual([...actual].sort(), Object.keys(admitted).sort(), 'Unclassified JavaScript or stale consumer inventory')
  for (const [name, purpose] of Object.entries(admitted)) {
    assert.match(name, /^(?:test\/|packages\/[^/]+\/test\/|playground\/)/)
    assert.ok(typeof purpose === 'string' && purpose.length > 30)
  }
}
export function checkRepository(): void {
  const paths = execFileSync('git', ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', 'ls-files', '-z'], { encoding: 'utf8', timeout: 10000, maxBuffer: 1048576 }).split('\0').filter(Boolean)
  checkSourceLanguages(paths, {})
}
