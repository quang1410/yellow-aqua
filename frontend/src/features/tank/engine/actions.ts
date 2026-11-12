import type { Catalog } from '@/features/catalog'
import { DEFAULT_FEED_PINCH, FEED_PINCH_RANGE, SIPHON_KEEP, UNITS_PER_PINCH, WATER_CHANGE_COOLDOWN_MS } from './constants'
import { clampOr } from './math'
import { changeWater } from './water'
import { cloneState, makeFish } from './state'
import type { Action, SimEvent, SimState, StepResult, TankDesign, Warning } from './types'

export function applyAction(
  _design: TankDesign,
  catalog: Catalog,
  state: SimState,
  action: Action,
  _nowMs: number, // giữ để khớp giao diện; mốc thời gian của cá luôn là thời gian mô phỏng
): StepResult & { warnings: Warning[] } {
  const s = cloneState(state)
  const events: SimEvent[] = []
  const at = state.simTimeMs
  switch (action.type) {
    case 'feed': {
      const food = catalog.foods.find((f) => f.id === action.foodId)
      if (!food) break
      const amount = clampOr(action.amount, FEED_PINCH_RANGE[0], FEED_PINCH_RANGE[1], DEFAULT_FEED_PINCH)
      const units = amount * food.nutrition * UNITS_PER_PINCH
      if (food.sinks) s.food.sinking += units
      else s.food.floating += units
      events.push({ atMs: at, type: 'fed' })
      break
    }
    case 'add-fish': {
      if (!catalog.species.some((x) => x.id === action.speciesId)) break
      for (let i = 0; i < action.count; i++) s.fish.push(makeFish(s, action.speciesId, s.simTimeMs))
      events.push({ atMs: at, type: 'fish-added', speciesId: action.speciesId, count: action.count })
      break
    }
    case 'remove-fish': {
      let left = action.count
      for (let i = s.fish.length - 1; i >= 0 && left > 0; i--) {
        if (s.fish[i]!.speciesId === action.speciesId) {
          s.fish.splice(i, 1)
          left -= 1
        }
      }
      const removed = action.count - left
      if (removed > 0) events.push({ atMs: at, type: 'fish-removed', speciesId: action.speciesId, count: removed })
      break
    }
    case 'siphon': {
      s.water.waste *= SIPHON_KEEP
      events.push({ atMs: at, type: 'siphoned' })
      break
    }
    case 'water-change': {
      if (state.lastWaterChangeMs !== null && at - state.lastWaterChangeMs < WATER_CHANGE_COOLDOWN_MS) {
        return { state, events: [], warnings: [{ code: 'water-change-cooldown', severity: 'block', speciesIds: [] }] }
      }
      changeWater(s, action.fraction, action.conditioned, events)
      break
    }
  }
  return { state: s, events, warnings: [] }
}
