import test from 'node:test'
import assert from 'node:assert/strict'
import { checkRepository, checkSourceLanguages } from './source-languages.mts'
test('tracked JavaScript is limited to classified independent consumers', checkRepository)
test('unreviewed implementation, stale inventory and runtime exceptions refuse', () => {
  const purpose = 'Independent plain JavaScript consumer of built distributions'
  assert.throws(() => checkSourceLanguages(['src/hidden.mjs'], {}))
  assert.throws(() => checkSourceLanguages([], { 'test/stale.mjs': purpose }))
  assert.throws(() => checkSourceLanguages(['src/hidden.mjs'], { 'src/hidden.mjs': purpose }))
})
