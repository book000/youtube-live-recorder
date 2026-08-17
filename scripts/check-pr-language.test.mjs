// Minimal self-check for check-pr-language.mjs's language-ratio logic.
// Run with: node --test scripts/check-pr-language.test.mjs

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkPullRequestLanguage } from './check-pr-language.mjs'

test('passes for an English title and body', () => {
  const failures = checkPullRequestLanguage(
    'fix: correct off-by-one error in pagination',
    'This change fixes an off-by-one error introduced in the previous release.'
  )
  assert.deepEqual(failures, [])
})

test('fails for a mostly-Japanese title', () => {
  const failures = checkPullRequestLanguage(
    'fix: ページネーションのオフバイワンエラーを修正する',
    'This change fixes an off-by-one error.'
  )
  assert.equal(failures.length, 1)
  assert.match(failures[0], /title/i)
})

test('fails for a mostly-Japanese body', () => {
  const failures = checkPullRequestLanguage(
    'fix: correct pagination bug',
    '前回のリリースで発生したオフバイワンエラーを修正しました。'
  )
  assert.equal(failures.length, 1)
  assert.match(failures[0], /body/i)
})

test('code blocks and inline code do not count toward the Japanese ratio', () => {
  const failures = checkPullRequestLanguage(
    'fix: correct pagination bug',
    [
      'Fixes an off-by-one error.',
      '',
      '```bash',
      '日本語のコメントを含むコードブロック',
      '```',
      '',
      'See `変数名の例` for the affected variable.',
    ].join('\n')
  )
  assert.deepEqual(failures, [])
})

test('an empty body is skipped, not treated as a failure', () => {
  const failures = checkPullRequestLanguage('fix: correct pagination bug', '')
  assert.deepEqual(failures, [])
})

test('null/undefined title and body are treated as empty, not a failure', () => {
  assert.deepEqual(checkPullRequestLanguage(null, null), [])
  assert.deepEqual(checkPullRequestLanguage(undefined, undefined), [])
})

test('the Japanese ratio threshold is inclusive at exactly 0.8', () => {
  // 8 Japanese characters + 2 Latin characters = ratio of exactly 0.8.
  const atThreshold = checkPullRequestLanguage('あいうえおかきくAB', '')
  assert.equal(atThreshold.length, 1)

  // 7 Japanese characters + 3 Latin characters = ratio just below 0.8.
  const belowThreshold = checkPullRequestLanguage('あいうえおかきABC', '')
  assert.deepEqual(belowThreshold, [])
})
