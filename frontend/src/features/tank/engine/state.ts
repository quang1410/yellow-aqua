import type { Catalog } from '@/features/catalog'
import { HUNGER_START } from './constants'
import type { FishIndividual, SimState, TankDesign } from './types'

export function waterVolumeL(design: TankDesign): number {
  const { w, d, h } = design.sizeCm
  return ((w * d * h) / 1000) * 0.85
}

export function cloneState(s: SimState): SimState {
  return {
    ...s,
    fish: s.fish.map((f) => ({ ...f })),
    water: { ...s.water },
    food: { ...s.food },
    flags: { ...s.flags },
  }
}

export function makeFish(s: SimState, speciesId: string, nowMs: number, growth = 1): FishIndividual {
  const fish: FishIndividual = { uid: `f${s.nextUid}`, speciesId, growth, health: 1, hunger: HUNGER_START, bornAt: nowMs }
  s.nextUid += 1
  return fish
}

export function createSimState(
  design: TankDesign,
  catalog: Catalog,
  nowMs: number,
  stock: Record<string, number> = {},
): SimState {
  const cycled = design.mode === 'relaxed'
  const s: SimState = {
    v: 1,
    tankId: design.id,
    simTimeMs: nowMs,
    lastRealMs: nowMs,
    fish: [],
    water: {
      tempC: 26,
      nh3: 0,
      no2: 0,
      no3: cycled ? 5 : 0,
      chlorine: 0,
      waste: 0.05,
      bacteria: cycled ? 1 : 0.02,
      bacteriaN: cycled ? 1 : 0.02,
      o2: 0.8,
    },
    food: { floating: 0, sinking: 0 },
    lastWaterChangeMs: null,
    rng: design.seed >>> 0,
    nextUid: 1,
    flags: { cycleAnnounced: cycled, ammoniaHigh: false, label: 'clear', tempAlert: 'ok' },
  }
  for (const [speciesId, count] of Object.entries(stock)) {
    if (!catalog.species.some((x) => x.id === speciesId)) continue
    for (let i = 0; i < count; i++) s.fish.push(makeFish(s, speciesId, nowMs))
  }
  return s
}
