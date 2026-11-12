import { describe, expect, it } from 'vitest'
import { advanceTo, applyAction, createSimState, type Action } from '.'
import { cat, deepFreeze, ENV, makeDesign } from '@/test/simFixtures'

const d = makeDesign({ mode: 'realistic' })
const fresh = () => createSimState(d, cat, 1_000, { neon: 2, guppy: 1 })

describe('actions', () => {
  it('add-fish stamps newborn fish with sim time, not the real clock', () => {
    const s = fresh()
    const r = applyAction(d, cat, s, { type: 'add-fish', speciesId: 'neon', count: 2 }, 999_999_999)
    const added = r.state.fish.slice(-2)
    expect(added.map((f) => f.bornAt)).toEqual([s.simTimeMs, s.simTimeMs])
    expect(r.events).toEqual([{ atMs: s.simTimeMs, type: 'fish-added', speciesId: 'neon', count: 2 }])
  })

  it('add-fish ignores an unknown species', () => {
    const r = applyAction(d, cat, fresh(), { type: 'add-fish', speciesId: 'unknown-species', count: 3 }, 0)
    expect(r.state.fish).toHaveLength(3)
    expect(r.events).toEqual([])
  })

  it('remove-fish removes only the requested species and reports the real count', () => {
    const r = applyAction(d, cat, fresh(), { type: 'remove-fish', speciesId: 'neon', count: 5 }, 0)
    expect(r.state.fish.map((f) => f.speciesId)).toEqual(['guppy'])
    expect(r.events).toEqual([{ atMs: 1_000, type: 'fish-removed', speciesId: 'neon', count: 2 }])
  })

  it('siphon keeps only a fifth of the waste', () => {
    const s = fresh()
    s.water.waste = 0.5
    const r = applyAction(d, cat, s, { type: 'siphon' }, 0)
    expect(r.state.water.waste).toBeCloseTo(0.1, 5)
    expect(r.events.map((e) => e.type)).toEqual(['siphoned'])
  })

  it('feed clamps the amount to 0.5–3 pinches and treats NaN as one pinch', () => {
    const floating = (amount: number) =>
      applyAction(d, cat, fresh(), { type: 'feed', foodId: 'flake', amount }, 0).state.food.floating
    expect(floating(99)).toBe(30)
    expect(floating(0.01)).toBe(5)
    expect(floating(Number.NaN)).toBe(10)
  })

  it('feed with an unknown food does nothing', () => {
    const r = applyAction(d, cat, fresh(), { type: 'feed', foodId: 'unknown-food', amount: 1 }, 0)
    expect(r.events).toEqual([])
    expect(r.state.food).toEqual({ floating: 0, sinking: 0 })
  })

  it('water-change treats a NaN fraction as 20 percent', () => {
    const s = fresh()
    s.water.no3 = 20
    const r = applyAction(d, cat, s, { type: 'water-change', fraction: Number.NaN, conditioned: true }, 0)
    expect(r.state.water.no3).toBeCloseTo(16, 5)
  })

  it('no action and no catch-up mutates a deeply frozen state', () => {
    const s = deepFreeze(fresh())
    const actions: Action[] = [
      { type: 'feed', foodId: 'flake', amount: 1 },
      { type: 'add-fish', speciesId: 'neon', count: 1 },
      { type: 'remove-fish', speciesId: 'neon', count: 1 },
      { type: 'siphon' },
      { type: 'water-change', fraction: 0.2, conditioned: true },
    ]
    for (const a of actions) expect(() => applyAction(d, cat, s, a, 0)).not.toThrow()
    expect(() => advanceTo(d, cat, s, ENV, 3_600_000)).not.toThrow()
    expect(() => advanceTo(d, cat, s, ENV, 0)).not.toThrow()
  })
})
