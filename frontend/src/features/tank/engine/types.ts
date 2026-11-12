import type { Layout, PlacedItem } from '@/features/catalog'

export type Mode = 'relaxed' | 'realistic'
export type WaterLabel = 'clear' | 'cloudy' | 'dirty' | 'foul'
export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'night'

export interface TankDesign {
  v: 1
  id: string
  name: string
  createdAt: number
  seed: number
  mode: Mode
  layoutId: string | null
  substrate: Layout['substrate']
  items: PlacedItem[]
  sizeCm: { w: number; d: number; h: number }
  glassId: string
  cabinetId: string
  roomId: string
  timeOfDay: 'auto' | TimeOfDay
  light: { fixtureId: string; colorId: string; brightness: number; on: boolean }
  equipment: { filterId: string | null; heater: boolean; chiller: boolean; fan: boolean; co2: boolean; airStone: boolean }
}

/** Mọi số trong khoảng 0..1, trừ bornAt (ms). */
export interface FishIndividual {
  uid: string
  speciesId: string
  growth: number
  health: number
  hunger: number
  bornAt: number
}

/** nh3/no2/no3 tính bằng ppm; tempC bằng °C; waste, bacteria, bacteriaN, o2, chlorine trong 0..1. */
export interface WaterState {
  tempC: number
  nh3: number
  no2: number
  no3: number
  chlorine: number
  waste: number
  bacteria: number
  bacteriaN: number
  o2: number
}

export interface SimState {
  v: 1
  tankId: string
  simTimeMs: number
  lastRealMs: number
  fish: FishIndividual[]
  water: WaterState
  /** Thức ăn trong nước, tính bằng đơn vị dinh dưỡng (1 nhúm cám ≈ 10 đơn vị). */
  food: { floating: number; sinking: number }
  lastWaterChangeMs: number | null
  rng: number
  nextUid: number
  flags: { cycleAnnounced: boolean; ammoniaHigh: boolean; label: WaterLabel; tempAlert: 'ok' | 'hot' | 'cold' }
}

export type SimEventType =
  | 'fed'
  | 'siphoned'
  | 'water-changed'
  | 'fish-added'
  | 'fish-removed'
  | 'fish-born'
  | 'fish-grown'
  | 'fish-died'
  | 'water-cloudy'
  | 'water-dirty'
  | 'ammonia-spike'
  | 'chlorine-stress'
  | 'too-hot'
  | 'too-cold'
  | 'cycle-complete'

export interface SimEvent {
  atMs: number
  type: SimEventType
  speciesId?: string
  count?: number
}

export interface Env {
  roomTempC: number
  powerOn: boolean
}

export type Action =
  | { type: 'feed'; foodId: string; amount: number }
  | { type: 'add-fish'; speciesId: string; count: number }
  | { type: 'remove-fish'; speciesId: string; count: number }
  | { type: 'siphon' }
  | { type: 'water-change'; fraction: number; conditioned: boolean }

export type HungerLabel = 'full' | 'satisfied' | 'peckish' | 'hungry'

export interface StepResult {
  state: SimState
  events: SimEvent[]
}

export type WarningCode =
  | 'temp-range'
  | 'ph-range'
  | 'fin-nipper'
  | 'eats-shrimp'
  | 'eats-snails'
  | 'aggressive'
  | 'school-too-small'
  | 'tank-too-small'
  | 'over-capacity'
  | 'species-limit'
  | 'render-cap'
  | 'cycle-not-ready'
  | 'water-change-cooldown'

export interface Warning {
  code: WarningCode
  severity: 'info' | 'warn' | 'block'
  speciesIds: string[]
}
