import type { Catalog, Species } from '@/features/catalog'
import {
  BABY_GROWTH,
  BREED_MAX_AVG_HUNGER,
  BREED_PER_DAY,
  EAT_UNITS_PER_MIN,
  GROWTH_PER_HOUR,
  HUNGER_BANDS,
  HUNGER_PER_HOUR,
  HUNGRY_GROWTH_FACTOR,
  MAX_RENDERED_CREATURES,
  MID_SINKING_REACH,
  RECOVERY_PER_HOUR,
  RELAXED_HEALTH_FLOOR,
  STRESS,
} from './constants'
import { nextRandom } from './rng'
import { makeFish } from './state'
import type { HungerLabel, SimEvent, SimState, TankDesign } from './types'
import { labelOf } from './water'

export function hungerLabel(h: number): HungerLabel {
  if (h < HUNGER_BANDS.full) return 'full'
  if (h < HUNGER_BANDS.satisfied) return 'satisfied'
  if (h < HUNGER_BANDS.peckish) return 'peckish'
  return 'hungry'
}

export function speciesMap(catalog: Catalog): Map<string, Species> {
  return new Map(catalog.species.map((x) => [x.id, x]))
}

/** Hệ số cỡ thân: số đơn vị thức ăn để con cá này no từ lúc đói hẳn. */
export function massOf(sp: Species, growth: number): number {
  return Math.min(6, Math.max(0.15, (sp.adultCm / 4) ** 2 * Math.max(0.4, growth)))
}

/** Đói tăng dần; cá ăn ở phần thức ăn mà tầng nước của nó với tới. Sửa trực tiếp `s`. */
export function feedAndHunger(s: SimState, species: Map<string, Species>, dtSec: number): void {
  const dtH = dtSec / 3600
  const bite = EAT_UNITS_PER_MIN * (dtSec / 60)
  for (const f of s.fish) {
    f.hunger = Math.min(1, f.hunger + HUNGER_PER_HOUR * dtH)
    const sp = species.get(f.speciesId)
    if (!sp || f.hunger <= 0.02) continue
    const mass = massOf(sp, f.growth)
    const want = Math.min(bite, f.hunger * mass)
    let eaten = 0
    if (sp.zone !== 'bottom') {
      const take = Math.min(want, s.food.floating)
      s.food.floating -= take
      eaten += take
    }
    const reach = sp.zone === 'bottom' ? 1 : sp.zone === 'mid' ? MID_SINKING_REACH : 0
    if (reach > 0 && eaten < want) {
      const take = Math.min((want - eaten) * reach, s.food.sinking)
      s.food.sinking -= take
      eaten += take
    }
    f.hunger = Math.max(0, f.hunger - eaten / mass)
  }
}

/** Sức khỏe, chết (chỉ chế độ Thực tế), lớn, và cá đẻ con sinh sản. Sửa trực tiếp `s`. */
export function healthGrowthBreeding(
  design: TankDesign,
  s: SimState,
  species: Map<string, Species>,
  dtSec: number,
  events: SimEvent[],
): void {
  const dtH = dtSec / 3600
  const w = s.water
  const foul = labelOf(s) === 'foul'
  const at = s.simTimeMs
  const dead: string[] = []

  for (const f of s.fish) {
    const sp = species.get(f.speciesId)
    if (!sp) continue
    let stress = 0
    if (w.nh3 > STRESS.nh3From) stress += (w.nh3 - STRESS.nh3From) * STRESS.nh3Per
    if (w.no2 > STRESS.no2From) stress += (w.no2 - STRESS.no2From) * STRESS.no2Per
    if (w.no3 > STRESS.no3From) stress += STRESS.no3Flat
    const off = Math.max(0, sp.tempC[0] - w.tempC, w.tempC - sp.tempC[1])
    stress += off * STRESS.tempPerDegree
    if (f.hunger > STRESS.starvingFrom) stress += STRESS.starvingFlat
    stress += w.chlorine * STRESS.chlorinePer
    if (w.o2 < STRESS.o2From) stress += (STRESS.o2From - w.o2) * STRESS.o2Per
    if (foul) stress += STRESS.foulFlat

    if (stress < 0.001) f.health = Math.min(1, f.health + RECOVERY_PER_HOUR * dtH)
    else f.health -= stress * dtH
    if (design.mode === 'relaxed') f.health = Math.max(RELAXED_HEALTH_FLOOR, f.health)
    else if (f.health <= 0) dead.push(f.uid)

    if (f.growth < 1) {
      const rate = GROWTH_PER_HOUR * (hungerLabel(f.hunger) === 'hungry' ? HUNGRY_GROWTH_FACTOR : 1)
      f.growth = Math.min(1, f.growth + rate * dtH)
      if (f.growth === 1) events.push({ atMs: at, type: 'fish-grown', speciesId: f.speciesId, count: 1 })
    }
  }

  if (dead.length) {
    const gone = new Set(dead)
    for (const f of s.fish) if (gone.has(f.uid)) events.push({ atMs: at, type: 'fish-died', speciesId: f.speciesId, count: 1 })
    s.fish = s.fish.filter((f) => !gone.has(f.uid))
  }

  // Cá đẻ con sinh sản
  const label = labelOf(s)
  if (label !== 'clear') return
  const bySpecies = new Map<string, { adults: number; hunger: number; n: number }>()
  for (const f of s.fish) {
    const e = bySpecies.get(f.speciesId) ?? { adults: 0, hunger: 0, n: 0 }
    if (f.growth >= 1) e.adults += 1
    e.hunger += f.hunger
    e.n += 1
    bySpecies.set(f.speciesId, e)
  }
  for (const [id, e] of bySpecies) {
    const sp = species.get(id)
    if (!sp || sp.breeding !== 'livebearer' || e.adults < 2 || e.hunger / e.n >= BREED_MAX_AVG_HUNGER) continue
    const room = MAX_RENDERED_CREATURES - s.fish.length
    if (room <= 0) return
    const [roll, r1] = nextRandom(s.rng)
    s.rng = r1
    if (roll >= BREED_PER_DAY * (dtH / 24)) continue
    const [sizeRoll, r2] = nextRandom(s.rng)
    s.rng = r2
    const n = Math.min(room, 1 + Math.floor(sizeRoll * 3))
    for (let i = 0; i < n; i++) s.fish.push(makeFish(s, id, at, BABY_GROWTH))
    events.push({ atMs: at, type: 'fish-born', speciesId: id, count: n })
  }
}
