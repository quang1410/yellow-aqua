import type { Catalog, Species } from '@/features/catalog'
import { SIM_STEP_SEC, step, type Env, type SimEvent, type SimState, type StepResult, type TankDesign } from '@/features/tank/engine'

const model: Species['model'] = {
  body: 'slim',
  colors: { base: '#888888', accent: '#999999', belly: '#aaaaaa' },
  pattern: 'none',
  fins: 'short',
}

function sp(id: string, p: Partial<Species>): Species {
  return {
    id,
    group: 'tetra',
    names: { vi: id, viAlt: [], scientific: id },
    zone: 'mid',
    adultCm: 4,
    tempC: [22, 28],
    ph: [6, 8],
    minTankL: 40,
    bioload: 1,
    temperament: 'peaceful',
    finNipper: false,
    longFinned: false,
    eatsShrimp: false,
    eatsSnails: false,
    schoolMin: 1,
    breeding: 'egg',
    model,
    reviewed: null,
    sources: ['test'],
    ...p,
  }
}

export const cat: Catalog = {
  species: [
    sp('neon', { adultCm: 3.5, tempC: [20, 26], ph: [6, 7.5], schoolMin: 6 }),
    sp('guppy', { group: 'livebearer', zone: 'top', adultCm: 5, ph: [6.8, 8], bioload: 1.2, longFinned: true, schoolMin: 3, breeding: 'livebearer', minTankL: 30 }),
    sp('betta', { group: 'labyrinth', zone: 'top', adultCm: 6.5, tempC: [24, 30], bioload: 1.5, longFinned: true, temperament: 'semi', maxPerTank: 1, minTankL: 20 }),
    sp('tiger-barb', { group: 'cyprinid', adultCm: 6, tempC: [22, 27], bioload: 1.5, finNipper: true, temperament: 'semi', schoolMin: 6, minTankL: 80 }),
    sp('panda-cory', { group: 'catfish', zone: 'bottom', adultCm: 5, tempC: [20, 25], schoolMin: 6 }),
    sp('cherry-shrimp', { group: 'shrimp', zone: 'bottom', adultCm: 2.5, bioload: 0.2, schoolMin: 5, minTankL: 10 }),
    sp('nerite-snail', { group: 'snail', zone: 'bottom', adultCm: 2.5, bioload: 0.3, breeding: 'none', minTankL: 20 }),
    sp('assassin-snail', { group: 'snail', zone: 'bottom', adultCm: 2.5, bioload: 0.3, eatsSnails: true, breeding: 'none', minTankL: 20 }),
    sp('angelfish', { group: 'cichlid', adultCm: 14, tempC: [24, 30], bioload: 4, temperament: 'semi', eatsShrimp: true, minTankL: 150 }),
  ],
  plants: [],
  decor: [
    { id: 'da', names: { vi: 'Đá' }, kind: 'rock', raisesKH: true, model: { shape: 'boulder', color: '#888888' } },
  ],
  layouts: [],
  rooms: [],
  foods: [
    { id: 'flake', names: { vi: 'Cám nổi' }, sinks: false, zones: ['top', 'mid'], nutrition: 1, waste: 1, preferredBy: ['tetra'] },
    { id: 'pellet', names: { vi: 'Viên chìm' }, sinks: true, zones: ['bottom'], nutrition: 1.2, waste: 1.2, preferredBy: ['catfish'] },
  ],
  gear: {
    lights: { fixtures: [{ id: 'led', names: { vi: 'LED' } }], colors: [{ id: 'w', names: { vi: 'Trắng' }, hex: '#ffffff', plantBoost: 1 }] },
    filters: [
      { id: 'loc-thung', names: { vi: 'Lọc thùng' }, flowLph: 600, bioCapacity: 1.2 },
      { id: 'loc-treo', names: { vi: 'Lọc treo' }, flowLph: 300, bioCapacity: 0.8 },
    ],
    glass: [{ id: 'g', names: { vi: 'Kính' } }],
    cabinets: [{ id: 'c', names: { vi: 'Tủ' }, color: '#000000' }],
    tankPresets: [{ id: 'be-60', names: { vi: 'Bể 60' }, sizeCm: { w: 60, d: 30, h: 36 } }],
  },
}

// Phòng 24,5 °C → nước khoảng 25 °C: nằm trong khoảng nhiệt của mọi loài mẫu
export const ENV: Env = { roomTempC: 24.5, powerOn: true }

export function makeDesign(patch: Partial<TankDesign> = {}): TankDesign {
  return {
    v: 1,
    id: 'tank-1',
    name: 'Bể thử',
    createdAt: 0,
    seed: 1,
    mode: 'relaxed',
    layoutId: null,
    substrate: 'aqua-soil',
    items: [],
    sizeCm: { w: 60, d: 30, h: 36 },
    glassId: 'g',
    cabinetId: 'c',
    roomId: 'phong-khach',
    timeOfDay: 'auto',
    light: { fixtureId: 'led', colorId: 'w', brightness: 1, on: true },
    equipment: { filterId: 'loc-thung', heater: false, chiller: false, fan: false, co2: false, airStone: false },
    ...patch,
  }
}

/** Chạy `hours` giờ mô phỏng theo bước SIM_STEP_SEC, gom mọi event. */
export function run(design: TankDesign, state: SimState, hours: number, env: Env = ENV): StepResult {
  let s = state
  const events: SimEvent[] = []
  const steps = Math.round((hours * 3600) / SIM_STEP_SEC)
  for (let i = 0; i < steps; i++) {
    const r = step(design, cat, s, env, SIM_STEP_SEC)
    s = r.state
    events.push(...r.events)
  }
  return { state: s, events }
}

export function avgHunger(s: SimState): number {
  return s.fish.reduce((a, f) => a + f.hunger, 0) / Math.max(1, s.fish.length)
}

export function countOf(s: SimState, speciesId: string): number {
  return s.fish.filter((f) => f.speciesId === speciesId).length
}

export function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o)
    for (const v of Object.values(o)) deepFreeze(v)
  }
  return o
}
