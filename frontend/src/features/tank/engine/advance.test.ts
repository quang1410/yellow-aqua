import { describe, expect, it } from 'vitest'
import { advanceTo, createSimState, MAX_AWAY_DAYS } from '.'
import { cat, ENV, makeDesign } from '@/test/simFixtures'

const DAY = 86_400_000

describe('advanceTo', () => {
  it('caps away time at 10 days', () => {
    expect(MAX_AWAY_DAYS).toBe(10)
    const d = makeDesign({ mode: 'relaxed' })
    const s = createSimState(d, cat, 0, { neon: 6 })
    const r = advanceTo(d, cat, s, ENV, 30 * DAY)
    expect(r.capped).toBe(true)
    expect(r.awayMs).toBe(30 * DAY)
    expect(r.state.simTimeMs - s.simTimeMs).toBe(10 * DAY)
    expect(r.state.lastRealMs).toBe(30 * DAY)
  })

  it('advances exactly the away time when under the cap', () => {
    const d = makeDesign()
    const s = createSimState(d, cat, 0, { neon: 6 })
    const r = advanceTo(d, cat, s, ENV, 5 * 3_600_000 + 30_000)
    expect(r.capped).toBe(false)
    expect(r.state.simTimeMs).toBe(5 * 3_600_000 + 30_000)
  })

  it('handles clock going backwards', () => {
    const d = makeDesign()
    const s = { ...createSimState(d, cat, 0), lastRealMs: 10_000_000 }
    const r = advanceTo(d, cat, s, ENV, 5_000)
    expect(r.state.simTimeMs).toBe(s.simTimeMs)
    expect(r.events).toEqual([])
    expect(r.state.lastRealMs).toBe(5_000)
  })

  it('returns an independent copy when the clock goes backwards', () => {
    const d = makeDesign()
    const s = { ...createSimState(d, cat, 0, { neon: 3 }), lastRealMs: 10_000_000 }
    const r = advanceTo(d, cat, s, ENV, 5_000)
    expect(r.state.fish).not.toBe(s.fish)
    expect(r.state.water).not.toBe(s.water)
    expect(r.state.food).not.toBe(s.food)
    expect(r.state.flags).not.toBe(s.flags)
    expect(r.state.fish).toEqual(s.fish)
  })

  it('merges repeated events of the same kind within an hour', () => {
    const d = makeDesign({ mode: 'realistic', equipment: { ...makeDesign().equipment, filterId: null } })
    const r = advanceTo(d, cat, createSimState(d, cat, 0, { neon: 12 }), ENV, 7 * DAY)
    const died = r.events.filter((e) => e.type === 'fish-died')
    const total = died.reduce((a, e) => a + (e.count ?? 1), 0)
    expect(total).toBe(12 - r.state.fish.length)
    for (let i = 1; i < died.length; i++) expect(died[i]!.atMs - died[i - 1]!.atMs).toBeGreaterThanOrEqual(3_600_000)
  })

  it('10-day catch-up for 120 fish finishes under 1.5 s', () => {
    const d = makeDesign({ sizeCm: { w: 120, d: 45, h: 45 } })
    const s = createSimState(d, cat, 0, { neon: 120 })
    const t0 = performance.now()
    advanceTo(d, cat, s, ENV, 10 * DAY)
    expect(performance.now() - t0).toBeLessThan(1500)
  })
})
