import { describe, expect, it } from 'vitest'
import { t, vi } from './vi'

describe('t()', () => {
  it('returns the Vietnamese string for a key', () => {
    expect(t('unverified')).toBe('Chưa kiểm chứng')
  })

  it('interpolates with a single brace and never leaves the placeholder behind', () => {
    const text = t('fishCount', { n: 17 })
    expect(text).toBe('17 con')
    expect(text).not.toContain('{')
  })

  it('leaves an unknown placeholder visible rather than printing undefined', () => {
    expect(t('fishCount', { other: 1 })).toBe('{n} con')
  })

  it('never uses double-brace placeholders in any string', () => {
    for (const text of Object.values(vi)) expect(text).not.toContain('{{')
  })

  it('keeps every string in Unicode NFC', () => {
    for (const text of Object.values(vi)) expect(text).toBe(text.normalize('NFC'))
  })
})
