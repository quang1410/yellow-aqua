import { describe, expect, it } from 'vitest'
import { applyAction, createSimState, type SimEvent, type SimState, type TankDesign } from '.'
import { cat, countOf, makeDesign, run } from '@/test/simFixtures'

/** Chạy `days` ngày, cho ăn `foodId` mỗi 8 giờ. */
function careFor(d: TankDesign, s0: SimState, days: number, foodId = 'flake'): { state: SimState; events: SimEvent[] } {
  let s = s0
  const events: SimEvent[] = []
  for (let i = 0; i < days * 3; i++) {
    s = applyAction(d, cat, s, { type: 'feed', foodId, amount: 0.5 }, s.simTimeMs).state
    const r = run(d, s, 8)
    s = r.state
    events.push(...r.events)
  }
  return { state: s, events }
}

describe('life', () => {
  it('realistic: neglected fish die', () => {
    const d = makeDesign({ mode: 'realistic', equipment: { ...makeDesign().equipment, filterId: null } })
    const r = run(d, createSimState(d, cat, 0, { neon: 10 }), 7 * 24)
    expect(countOf(r.state, 'neon')).toBeLessThan(10)
    expect(r.events.some((e) => e.type === 'fish-died' && e.speciesId === 'neon')).toBe(true)
  })

  it('relaxed: neglected fish never die and stay at 0.3 health or above', () => {
    const d = makeDesign({ mode: 'relaxed', equipment: { ...makeDesign().equipment, filterId: null } })
    const r = run(d, createSimState(d, cat, 0, { neon: 10 }), 7 * 24)
    expect(countOf(r.state, 'neon')).toBe(10)
    expect(Math.min(...r.state.fish.map((f) => f.health))).toBeGreaterThanOrEqual(0.3)
    expect(r.events.some((e) => e.type === 'fish-died')).toBe(false)
  })

  it('healthy fish in good water keep full health', () => {
    const d = makeDesign()
    const r = careFor(d, createSimState(d, cat, 0, { neon: 6 }), 3)
    expect(Math.min(...r.state.fish.map((f) => f.health))).toBeGreaterThan(0.95)
  })

  it('livebearers breed in good conditions, deterministically by seed', () => {
    const d = makeDesign({ seed: 11 })
    const a = careFor(d, createSimState(d, cat, 0, { guppy: 4 }), 10)
    expect(a.events.some((e) => e.type === 'fish-born' && e.speciesId === 'guppy')).toBe(true)
    expect(countOf(a.state, 'guppy')).toBeGreaterThan(4)
    const b = careFor(d, createSimState(d, cat, 0, { guppy: 4 }), 10)
    expect(countOf(b.state, 'guppy')).toBe(countOf(a.state, 'guppy'))
  })

  it('a different seed gives a different history', () => {
    const a = careFor(makeDesign({ seed: 11 }), createSimState(makeDesign({ seed: 11 }), cat, 0, { guppy: 4 }), 10)
    const b = careFor(makeDesign({ seed: 12 }), createSimState(makeDesign({ seed: 12 }), cat, 0, { guppy: 4 }), 10)
    expect(JSON.stringify(a.state.fish)).not.toBe(JSON.stringify(b.state.fish))
  })

  it('egg layers do not breed in the tank', () => {
    const d = makeDesign()
    const r = careFor(d, createSimState(d, cat, 0, { neon: 10 }), 10)
    expect(r.events.some((e) => e.type === 'fish-born')).toBe(false)
  })

  it('babies grow up in about 3 days, slower when hungry', () => {
    const d = makeDesign()
    const base = createSimState(d, cat, 0, { guppy: 1 })
    const baby = { ...base, fish: [{ ...base.fish[0]!, growth: 0.4 }] }
    const fed = careFor(d, baby, 3)
    expect(fed.state.fish[0]!.growth).toBe(1)
    expect(fed.events.some((e) => e.type === 'fish-grown')).toBe(true)
    const hungry = run(d, baby, 72).state
    expect(hungry.fish[0]!.growth).toBeLessThan(0.85)
  })

  /** Chạy `hours` giờ, mỗi giờ đặt lại chất thải về `waste` và hạ đói về 0,1 để cô lập điều kiện đang thử. */
  function holdConditions(d: TankDesign, s0: SimState, hours: number, waste: number): { state: SimState; events: SimEvent[] } {
    let s = s0
    const events: SimEvent[] = []
    for (let h = 0; h < hours; h++) {
      const r = run(d, s, 1)
      events.push(...r.events)
      s = { ...r.state, water: { ...r.state.water, waste }, fish: r.state.fish.map((f) => ({ ...f, hunger: 0.1 })) }
    }
    return { state: s, events }
  }

  it('livebearers breed in clear water (control for the cloudy-water test)', () => {
    const d = makeDesign({ seed: 11 })
    const r = holdConditions(d, createSimState(d, cat, 0, { guppy: 4 }), 240, 0.05)
    expect(r.events.some((e) => e.type === 'fish-born')).toBe(true)
  })

  it('livebearers do not breed in cloudy water', () => {
    const d = makeDesign({ seed: 11 })
    const r = holdConditions(d, createSimState(d, cat, 0, { guppy: 4 }), 240, 0.45)
    expect(r.events.some((e) => e.type === 'fish-born')).toBe(false)
  })

  it('never breeds above the 120-creature render cap', () => {
    const d = makeDesign({ seed: 11, sizeCm: { w: 120, d: 45, h: 45 } })
    const r = holdConditions(d, createSimState(d, cat, 0, { guppy: 10, neon: 110 }), 240, 0.05)
    expect(r.state.fish.length).toBeLessThanOrEqual(120)
    expect(r.events.some((e) => e.type === 'fish-born')).toBe(false)
  })

  it('a baby needs about two and a half days: not grown at 48 h, grown by 72 h', () => {
    const d = makeDesign()
    const base = createSimState(d, cat, 0, { guppy: 1 })
    const baby = { ...base, fish: [{ ...base.fish[0]!, growth: 0.4 }] }
    expect(careFor(d, baby, 2).state.fish[0]!.growth).toBeLessThan(1)
    expect(careFor(d, baby, 3).state.fish[0]!.growth).toBe(1)
  })

  it('an unfed fish in clean realistic water survives 8 days and is dead by day 14', () => {
    const d = makeDesign({ mode: 'realistic' })
    const base = createSimState(d, cat, 0, { neon: 6 })
    const cycled = { ...base, water: { ...base.water, bacteria: 1, bacteriaN: 1 }, flags: { ...base.flags, cycleAnnounced: true } }
    const dayEight = holdConditionsKeepFood(d, cycled, 8 * 24)
    expect(countOf(dayEight, 'neon')).toBe(6)
    const dayFourteen = holdConditionsKeepFood(d, cycled, 14 * 24)
    expect(countOf(dayFourteen, 'neon')).toBe(0)
  })
})

/** Chạy `hours` giờ không cho ăn, nhưng vớt chất thải mỗi giờ để chỉ còn tác động của việc bỏ đói. */
function holdConditionsKeepFood(d: TankDesign, s0: SimState, hours: number): SimState {
  let s = s0
  for (let h = 0; h < hours; h++) {
    const r = run(d, s, 1)
    s = { ...r.state, water: { ...r.state.water, waste: 0.05, nh3: 0, no2: 0 } }
  }
  return s
}
