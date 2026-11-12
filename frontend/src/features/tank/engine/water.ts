import type { Catalog, Species } from '@/features/catalog'
import {
  AMMONIA_PER_FOOD_UNIT_L,
  AMMONIA_PER_LOAD_L_HOUR,
  AOB_CAPACITY,
  AOB_GROWTH,
  CHILLER_SET,
  CHLORINE_DECAY_PER_HOUR,
  CONVERT_K,
  CYCLED_AT,
  DIRT_BANDS,
  FAN_COOLING,
  FISH_WASTE_PER_HOUR,
  FOOD_DECAY_PER_HOUR,
  FOOD_WASTE_PER_UNIT,
  GEAR_HEAT,
  GROW_K,
  HEATER_SET,
  LITRES_PER_LOAD,
  NH3_TO_NO2,
  NO2_TO_NO3,
  NO_FILTER_BIO,
  NOB_CAPACITY,
  NOB_GROWTH,
  PLANT_NO3_UPTAKE,
  TEMP_APPROACH_PER_HOUR,
  THERMO_RATE,
  WATER_CHANGE_COOLDOWN_MS,
  CHLORINE_PER_FRACTION,
  DEFAULT_WATER_CHANGE,
} from './constants'
import { clampOr } from './math'
import { waterVolumeL } from './state'
import type { Env, SimEvent, SimState, TankDesign, WaterLabel } from './types'

export interface WaterReading {
  label: WaterLabel
  tempC: number
  kit: { nh3: number; no2: number; no3: number }
  cycled: boolean
  nextWaterChangeOkAtMs: number | null
}

const KIT = {
  nh3: [0, 0.25, 0.5, 1, 2, 4, 8],
  no2: [0, 0.25, 0.5, 1, 2, 5],
  no3: [0, 5, 10, 20, 40, 80, 160],
} as const

function floorToStep(v: number, steps: readonly number[]): number {
  let out = steps[0]!
  for (const s of steps) if (v >= s) out = s
  return out
}

export function loadUnits(s: SimState, species: Map<string, Species>): number {
  let used = 0
  for (const f of s.fish) used += (species.get(f.speciesId)?.bioload ?? 1) * f.growth
  return used
}

export function isCycled(s: SimState): boolean {
  return Math.min(s.water.bacteria, s.water.bacteriaN) >= CYCLED_AT
}

export function dirtOf(s: SimState): number {
  const w = s.water
  return w.waste + Math.min(0.3, w.nh3 * 0.12 + w.no2 * 0.06) + Math.min(0.2, w.no3 / 400)
}

export function labelOf(s: SimState): WaterLabel {
  const d = dirtOf(s)
  if (d < DIRT_BANDS.cloudy) return 'clear'
  if (d < DIRT_BANDS.dirty) return 'cloudy'
  if (d < DIRT_BANDS.foul) return 'dirty'
  return 'foul'
}

export function readWater(_design: TankDesign, s: SimState): WaterReading {
  return {
    label: labelOf(s),
    tempC: Math.round(s.water.tempC * 10) / 10,
    kit: {
      nh3: floorToStep(s.water.nh3, KIT.nh3),
      no2: floorToStep(s.water.no2, KIT.no2),
      no3: floorToStep(s.water.no3, KIT.no3),
    },
    cycled: isCycled(s),
    nextWaterChangeOkAtMs: s.lastWaterChangeMs === null ? null : s.lastWaterChangeMs + WATER_CHANGE_COOLDOWN_MS,
  }
}

function filterBio(design: TankDesign, catalog: Catalog, env: Env): number {
  const f = design.equipment.filterId ? catalog.gear.filters.find((x) => x.id === design.equipment.filterId) : undefined
  if (!f || !env.powerOn) return NO_FILTER_BIO
  return f.bioCapacity
}

/** Thức ăn phân hủy, chất thải, chu trình nitơ, clo, nhiệt độ, oxy, event đổi nhãn. Sửa trực tiếp `s`. */
export function waterStep(
  design: TankDesign,
  catalog: Catalog,
  s: SimState,
  species: Map<string, Species>,
  env: Env,
  dtSec: number,
  events: SimEvent[],
): void {
  const dtH = dtSec / 3600
  const vol = waterVolumeL(design)
  const w = s.water
  const at = s.simTimeMs

  // Thức ăn phân hủy → chất thải và amoniac
  const keep = Math.exp(-FOOD_DECAY_PER_HOUR * dtH)
  const decayed = (s.food.floating + s.food.sinking) * (1 - keep)
  s.food.floating *= keep
  s.food.sinking *= keep
  const load = loadUnits(s, species)
  const ratio = load / (vol / LITRES_PER_LOAD)
  w.waste = Math.min(1, w.waste + decayed * FOOD_WASTE_PER_UNIT * (100 / vol) + FISH_WASTE_PER_HOUR * ratio * dtH)
  w.nh3 += (AMMONIA_PER_LOAD_L_HOUR * load * dtH + AMMONIA_PER_FOOD_UNIT_L * decayed) / vol

  // Vi sinh nitrat hóa
  const bio = filterBio(design, catalog, env)
  const toNo2 = Math.min(w.nh3, AOB_CAPACITY * bio * w.bacteria * (w.nh3 / (w.nh3 + CONVERT_K)) * dtH)
  w.nh3 -= toNo2
  w.no2 += toNo2 * NH3_TO_NO2
  const toNo3 = Math.min(w.no2, NOB_CAPACITY * bio * w.bacteriaN * (w.no2 / (w.no2 + CONVERT_K)) * dtH)
  w.no2 -= toNo3
  w.no3 += toNo3 * NO2_TO_NO3
  w.bacteria = Math.min(1, w.bacteria + AOB_GROWTH * w.bacteria * (1 - w.bacteria) * (w.nh3 / (w.nh3 + GROW_K)) * dtH)
  w.bacteriaN = Math.min(1, w.bacteriaN + NOB_GROWTH * w.bacteriaN * (1 - w.bacteriaN) * (w.no2 / (w.no2 + GROW_K)) * dtH)
  const plants = design.items.filter((i) => i.kind === 'plant').length
  if (design.light.on) w.no3 = Math.max(0, w.no3 - PLANT_NO3_UPTAKE * plants * design.light.brightness * dtH)

  // Clo bay dần
  w.chlorine = Math.max(0, w.chlorine * Math.exp(-CHLORINE_DECAY_PER_HOUR * dtH) - 0.001 * dtH)

  // Nhiệt độ
  const eq = design.equipment
  const target = env.roomTempC + (env.powerOn ? GEAR_HEAT : 0) - (eq.fan && env.powerOn ? FAN_COOLING : 0)
  w.tempC += (target - w.tempC) * (1 - Math.exp(-TEMP_APPROACH_PER_HOUR * dtH))
  if (env.powerOn && eq.heater && w.tempC < HEATER_SET) w.tempC += Math.min(HEATER_SET - w.tempC, THERMO_RATE * dtH)
  if (env.powerOn && eq.chiller && w.tempC > CHILLER_SET) w.tempC -= Math.min(w.tempC - CHILLER_SET, THERMO_RATE * dtH)

  // Oxy
  const o2Target =
    0.55 +
    (eq.filterId && env.powerOn ? 0.25 : 0) +
    (eq.airStone && env.powerOn ? 0.2 : 0) -
    Math.max(0, w.tempC - 25) * 0.03 -
    Math.min(0.3, ratio * 0.1)
  w.o2 += (Math.min(1, Math.max(0.05, o2Target)) - w.o2) * (1 - Math.exp(-dtH))

  // Sự kiện
  if (!s.flags.ammoniaHigh && w.nh3 > 1) {
    s.flags.ammoniaHigh = true
    events.push({ atMs: at, type: 'ammonia-spike' })
  } else if (s.flags.ammoniaHigh && w.nh3 < 0.5) s.flags.ammoniaHigh = false

  const order: WaterLabel[] = ['clear', 'cloudy', 'dirty', 'foul']
  const label = labelOf(s)
  const prev = s.flags.label
  if (order.indexOf(label) > order.indexOf(prev)) {
    events.push({ atMs: at, type: label === 'cloudy' ? 'water-cloudy' : 'water-dirty' })
  }
  s.flags.label = label

  if (!s.flags.cycleAnnounced && isCycled(s) && w.nh3 < 0.25 && w.no2 < 0.25) {
    s.flags.cycleAnnounced = true
    events.push({ atMs: at, type: 'cycle-complete' })
  }

  let alert: 'ok' | 'hot' | 'cold' = 'ok'
  for (const f of s.fish) {
    const sp = species.get(f.speciesId)
    if (!sp) continue
    if (w.tempC > sp.tempC[1] + 0.5) alert = 'hot'
    else if (w.tempC < sp.tempC[0] - 0.5 && alert === 'ok') alert = 'cold'
  }
  if (alert !== s.flags.tempAlert && alert !== 'ok') {
    events.push({ atMs: at, type: alert === 'hot' ? 'too-hot' : 'too-cold' })
  }
  s.flags.tempAlert = alert
}

/** Thay nước, có hoặc không khử clo. Sửa trực tiếp `s`; nơi gọi phải kiểm thời gian chờ trước. */
export function changeWater(s: SimState, fraction: number, conditioned: boolean, events: SimEvent[]): void {
  const f = clampOr(fraction, 0.1, 0.5, DEFAULT_WATER_CHANGE)
  const w = s.water
  w.nh3 *= 1 - f
  w.no2 *= 1 - f
  w.no3 *= 1 - f
  w.waste *= 1 - f * 0.3
  if (conditioned) w.chlorine = 0
  else {
    w.chlorine = Math.min(1, w.chlorine + f * CHLORINE_PER_FRACTION)
    w.bacteria *= 1 - f * 0.4
    w.bacteriaN *= 1 - f * 0.4
  }
  s.lastWaterChangeMs = s.simTimeMs
  events.push({ atMs: s.simTimeMs, type: 'water-changed' })
  if (!conditioned && s.fish.length > 0) events.push({ atMs: s.simTimeMs, type: 'chlorine-stress' })
}
