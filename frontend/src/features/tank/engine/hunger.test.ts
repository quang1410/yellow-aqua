import { describe, expect, it } from 'vitest'
import { applyAction, createRng, createSimState, hungerLabel, step, waterVolumeL } from '.'
import { avgHunger, cat, deepFreeze, ENV, makeDesign, run } from '@/test/simFixtures'

describe('hunger and feeding', () => {
  it('hunger rises over 6 hours, feeding lowers it', () => {
    const d = makeDesign({ mode: 'relaxed' })
    let s = createSimState(d, cat, 0, { neon: 6 })
    const h0 = avgHunger(s)
    s = run(d, s, 6).state
    expect(avgHunger(s)).toBeGreaterThan(h0 + 0.2)
    const fed = applyAction(d, cat, s, { type: 'feed', foodId: 'flake', amount: 1 }, s.simTimeMs)
    expect(fed.events.map((e) => e.type)).toContain('fed')
    const after = run(d, fed.state, 0.5).state
    expect(avgHunger(after)).toBeLessThan(avgHunger(s) - 0.2)
  })

  it('an unfed tank reaches "hungry" after 12–16 hours from full', () => {
    const d = makeDesign()
    const s0 = createSimState(d, cat, 0, { neon: 6 })
    const full = { ...s0, fish: s0.fish.map((f) => ({ ...f, hunger: 0 })) }
    expect(hungerLabel(avgHunger(run(d, full, 11).state))).not.toBe('hungry')
    expect(hungerLabel(avgHunger(run(d, full, 16).state))).toBe('hungry')
  })

  it('bottom dwellers eat sinking food, not floating flakes', () => {
    const d = makeDesign()
    const s = run(d, createSimState(d, cat, 0, { 'panda-cory': 6 }), 6).state
    const flake = run(d, applyAction(d, cat, s, { type: 'feed', foodId: 'flake', amount: 1 }, s.simTimeMs).state, 0.5)
    expect(avgHunger(s) - avgHunger(flake.state)).toBeLessThan(0.05)
    const pellet = run(d, applyAction(d, cat, s, { type: 'feed', foodId: 'pellet', amount: 1 }, s.simTimeMs).state, 0.5)
    expect(avgHunger(s) - avgHunger(pellet.state)).toBeGreaterThan(0.2)
  })

  it('uneaten food becomes waste', () => {
    const d = makeDesign()
    const s = createSimState(d, cat, 0, { neon: 1 })
    const fed = applyAction(d, cat, s, { type: 'feed', foodId: 'flake', amount: 3 }, 0).state
    const later = run(d, fed, 2).state
    expect(later.food.floating + later.food.sinking).toBeLessThan(1)
    expect(later.water.waste).toBeGreaterThan(fed.water.waste)
  })

  it('same seed gives identical state', () => {
    const d = makeDesign({ seed: 7 })
    const a = run(d, createSimState(d, cat, 0, { guppy: 4 }), 48).state
    const b = run(d, createSimState(d, cat, 0, { guppy: 4 }), 48).state
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('does not mutate the input state', () => {
    const d = makeDesign()
    const s = deepFreeze(createSimState(d, cat, 0, { neon: 6 }))
    expect(() => step(d, cat, s, ENV, 60)).not.toThrow()
    expect(() => applyAction(d, cat, s, { type: 'feed', foodId: 'flake', amount: 1 }, 0)).not.toThrow()
  })

  it('labels hunger in four bands', () => {
    expect(hungerLabel(0.05)).toBe('full')
    expect(hungerLabel(0.3)).toBe('satisfied')
    expect(hungerLabel(0.55)).toBe('peckish')
    expect(hungerLabel(0.9)).toBe('hungry')
  })

  it('rng is deterministic and in [0, 1)', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('computes usable water volume', () => {
    expect(waterVolumeL(makeDesign())).toBeCloseTo(55.08, 1)
  })
})
