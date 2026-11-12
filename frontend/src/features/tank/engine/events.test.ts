import { describe, expect, it } from 'vitest'
import { mergeEvents } from './step'
import type { SimEvent } from '.'

const HOUR = 3_600_000

describe('mergeEvents', () => {
  it('sums counts of the same event and species within an hour', () => {
    const events: SimEvent[] = [
      { atMs: 0, type: 'fish-died', speciesId: 'neon', count: 1 },
      { atMs: 10 * 60_000, type: 'fish-died', speciesId: 'neon', count: 2 },
    ]
    expect(mergeEvents(events)).toEqual([{ atMs: 0, type: 'fish-died', speciesId: 'neon', count: 3 }])
  })

  it('keeps events more than an hour apart, and different species apart', () => {
    const events: SimEvent[] = [
      { atMs: 0, type: 'fish-died', speciesId: 'neon', count: 1 },
      { atMs: HOUR, type: 'fish-died', speciesId: 'neon', count: 1 },
      { atMs: HOUR + 1, type: 'fish-died', speciesId: 'guppy', count: 1 },
    ]
    expect(mergeEvents(events)).toHaveLength(3)
  })

  it('drops a repeated event that carries no count instead of inventing one', () => {
    const events: SimEvent[] = [
      { atMs: 0, type: 'ammonia-spike' },
      { atMs: 5 * 60_000, type: 'ammonia-spike' },
    ]
    expect(mergeEvents(events)).toEqual([{ atMs: 0, type: 'ammonia-spike' }])
  })

  it('does not mutate its input', () => {
    const events: SimEvent[] = [
      { atMs: 0, type: 'fish-born', speciesId: 'guppy', count: 1 },
      { atMs: 1, type: 'fish-born', speciesId: 'guppy', count: 1 },
    ]
    const copy = structuredClone(events)
    mergeEvents(events)
    expect(events).toEqual(copy)
  })
})
