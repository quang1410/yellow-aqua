import { describe, expect, it } from 'vitest'
import { applyAction, createSimState, readWater, type SimState, type TankDesign } from '.'
import { cat, ENV, makeDesign, run } from '@/test/simFixtures'

function cycledState(d: TankDesign, stock: Record<string, number>): SimState {
  const s = createSimState(d, cat, 0, stock)
  return {
    ...s,
    simTimeMs: 30 * 86_400_000,
    lastRealMs: 30 * 86_400_000,
    water: { ...s.water, bacteria: 1, bacteriaN: 1, no3: 20 },
    flags: { ...s.flags, cycleAnnounced: true },
  }
}

function maxOver(d: TankDesign, s: SimState, hours: number, pick: (s: SimState) => number): number {
  let best = -Infinity
  let cur = s
  for (let h = 0; h < hours; h++) {
    cur = run(d, cur, 1).state
    best = Math.max(best, pick(cur))
  }
  return best
}

describe('water: nitrogen cycle', () => {
  it('new realistic tank cycles: ammonia, then nitrite, then nitrate', () => {
    const d = makeDesign({ mode: 'realistic' })
    const s = createSimState(d, cat, 0, { neon: 6 })
    expect(run(d, s, 24).state.water.nh3).toBeGreaterThan(0.5)
    expect(maxOver(d, s, 96, (x) => x.water.no2)).toBeGreaterThan(0.5)
    const r = run(d, s, 96)
    expect(readWater(d, r.state).cycled).toBe(true)
    expect(r.state.water.nh3).toBeLessThan(0.25)
    expect(r.state.water.no2).toBeLessThan(0.25)
    expect(r.state.water.no3).toBeGreaterThan(5)
    expect(r.events.filter((e) => e.type === 'cycle-complete')).toHaveLength(1)
  })

  it('the cycle does not finish before day 2', () => {
    const d = makeDesign({ mode: 'realistic' })
    const r = run(d, createSimState(d, cat, 0, { neon: 6 }), 40)
    expect(readWater(d, r.state).cycled).toBe(false)
  })

  it('relaxed tank is cycled from the start', () => {
    const d = makeDesign({ mode: 'relaxed' })
    const r = run(d, createSimState(d, cat, 0, { neon: 6 }), 24)
    expect(r.state.water.nh3).toBeLessThan(0.25)
    expect(readWater(d, r.state).cycled).toBe(true)
  })

  it('reports kit readings rounded down to test-kit steps', () => {
    const d = makeDesign({ mode: 'realistic' })
    const s = createSimState(d, cat, 0)
    const w = readWater(d, { ...s, water: { ...s.water, nh3: 0.7, no2: 1.9, no3: 33 } })
    expect(w.kit).toEqual({ nh3: 0.5, no2: 1, no3: 20 })
  })
})

describe('water: maintenance', () => {
  it('tap water without conditioner adds chlorine stress', () => {
    const d = makeDesign({ mode: 'realistic' })
    const s = cycledState(d, { neon: 6 })
    const bad = applyAction(d, cat, s, { type: 'water-change', fraction: 0.3, conditioned: false }, s.simTimeMs)
    expect(bad.events.map((e) => e.type)).toContain('chlorine-stress')
    expect(bad.state.water.chlorine).toBeGreaterThan(0)
    const good = applyAction(d, cat, s, { type: 'water-change', fraction: 0.3, conditioned: true }, s.simTimeMs)
    expect(good.state.water.chlorine).toBe(0)
    expect(good.events.map((e) => e.type)).toEqual(['water-changed'])
  })

  it('siphon removes most waste; water change dilutes nitrate', () => {
    const d = makeDesign()
    const base = cycledState(d, { neon: 6 })
    const s = { ...base, water: { ...base.water, waste: 0.5, no3: 40 } }
    expect(applyAction(d, cat, s, { type: 'siphon' }, s.simTimeMs).state.water.waste).toBeLessThanOrEqual(0.15)
    const wc = applyAction(d, cat, s, { type: 'water-change', fraction: 0.3, conditioned: true }, s.simTimeMs)
    expect(wc.state.water.no3).toBeCloseTo(28, 0)
  })

  it('water change has a 4-hour cooldown', () => {
    const d = makeDesign()
    const s = cycledState(d, { neon: 6 })
    const first = applyAction(d, cat, s, { type: 'water-change', fraction: 0.2, conditioned: true }, s.simTimeMs)
    const second = applyAction(d, cat, first.state, { type: 'water-change', fraction: 0.2, conditioned: true }, s.simTimeMs)
    expect(second.warnings.map((w) => w.code)).toEqual(['water-change-cooldown'])
    expect(second.state).toEqual(first.state)
    expect(readWater(d, first.state).nextWaterChangeOkAtMs).toBe(s.simTimeMs + 4 * 3_600_000)
    const later = run(d, first.state, 4).state
    expect(applyAction(d, cat, later, { type: 'water-change', fraction: 0.2, conditioned: true }, later.simTimeMs).warnings).toEqual([])
  })

  it('labels follow waste and nitrogen, with an event on each worse label', () => {
    const d = makeDesign()
    const base = cycledState(d, { neon: 6 })
    const states = [0.1, 0.4, 0.65, 0.95].map((waste) => ({ ...base, water: { ...base.water, waste, no3: 0 } }))
    expect(states.map((x) => readWater(d, x).label)).toEqual(['clear', 'cloudy', 'dirty', 'foul'])
    const r = run(d, states[1]!, 0.1)
    expect(r.events.map((e) => e.type)).toContain('water-cloudy')
  })
})

describe('water: temperature', () => {
  const hot = { ...ENV, roomTempC: 33 }
  const cold = { ...ENV, roomTempC: 20 }
  const eq = (p: Partial<TankDesign['equipment']>) =>
    makeDesign({ equipment: { ...makeDesign().equipment, ...p } })

  it('without gear the water follows a hot room', () => {
    const d = eq({})
    expect(run(d, createSimState(d, cat, 0), 12, hot).state.water.tempC).toBeGreaterThan(31)
  })
  it('a fan keeps the water about 2 °C cooler', () => {
    const plain = run(eq({}), createSimState(eq({}), cat, 0), 24, hot).state.water.tempC
    const fan = run(eq({ fan: true }), createSimState(eq({ fan: true }), cat, 0), 24, hot).state.water.tempC
    expect(plain - fan).toBeGreaterThan(1.5)
    expect(plain - fan).toBeLessThan(2.5)
  })
  it('a chiller holds 27 °C or below', () => {
    const d = eq({ chiller: true })
    expect(run(d, createSimState(d, cat, 0), 12, hot).state.water.tempC).toBeLessThanOrEqual(27)
  })
  it('a heater holds 25 °C or above', () => {
    const d = eq({ heater: true })
    expect(run(d, createSimState(d, cat, 0), 24, cold).state.water.tempC).toBeGreaterThanOrEqual(25)
  })
  it('warns once when the water leaves a species range', () => {
    const d = eq({})
    const r = run(d, createSimState(d, cat, 0, { neon: 6 }), 24, hot)
    expect(r.events.filter((e) => e.type === 'too-hot')).toHaveLength(1)
  })
})
