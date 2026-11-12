import type { Catalog } from '@/features/catalog'
import { MAX_AWAY_DAYS, MERGE_WINDOW_MS, SIM_STEP_SEC } from './constants'
import { feedAndHunger, healthGrowthBreeding, speciesMap } from './life'
import { cloneState } from './state'
import type { Env, SimEvent, SimState, StepResult, TankDesign } from './types'
import { waterStep } from './water'

/** Tiến `s` thêm dtSec, sửa trực tiếp. Nội bộ: bên ngoài dùng `step` hoặc `advanceTo`. */
export function stepMut(
  design: TankDesign,
  catalog: Catalog,
  s: SimState,
  env: Env,
  dtSec: number,
  events: SimEvent[],
  species = speciesMap(catalog),
): void {
  feedAndHunger(s, species, dtSec)
  waterStep(design, catalog, s, species, env, dtSec, events)
  healthGrowthBreeding(design, s, species, dtSec, events)
  s.simTimeMs += dtSec * 1000
}

export function step(design: TankDesign, catalog: Catalog, state: SimState, env: Env, dtSec: number): StepResult {
  const s = cloneState(state)
  const events: SimEvent[] = []
  stepMut(design, catalog, s, env, dtSec, events)
  return { state: s, events }
}

/** Gộp các event cùng loại + cùng loài xảy ra trong vòng một giờ thành một event, cộng dồn `count`. */
export function mergeEvents(events: SimEvent[]): SimEvent[] {
  const out: SimEvent[] = []
  for (const e of events) {
    const prev = [...out].reverse().find((p) => p.type === e.type && p.speciesId === e.speciesId)
    if (prev && e.atMs - prev.atMs < MERGE_WINDOW_MS) {
      // Chỉ cộng dồn khi event có `count`; event không có số đếm thì bỏ bản lặp.
      if (prev.count !== undefined || e.count !== undefined) prev.count = (prev.count ?? 1) + (e.count ?? 1)
    } else out.push({ ...e })
  }
  return out
}

/** Tua mô phỏng tới thời điểm thật `nowMs`, tối đa MAX_AWAY_DAYS. Không bao giờ chạy lùi. */
export function advanceTo(
  design: TankDesign,
  catalog: Catalog,
  state: SimState,
  env: Env,
  nowMs: number,
): StepResult & { awayMs: number; capped: boolean } {
  const awayMs = nowMs - state.lastRealMs
  if (awayMs <= 0) return { state: { ...cloneState(state), lastRealMs: nowMs }, events: [], awayMs: 0, capped: false }
  const capMs = MAX_AWAY_DAYS * 86_400_000
  const capped = awayMs > capMs
  let left = Math.min(awayMs, capMs)
  const s = cloneState(state)
  const species = speciesMap(catalog)
  const events: SimEvent[] = []
  while (left > 0) {
    const dtMs = Math.min(left, SIM_STEP_SEC * 1000)
    stepMut(design, catalog, s, env, dtMs / 1000, events, species)
    left -= dtMs
  }
  s.lastRealMs = nowMs
  return { state: s, events: mergeEvents(events), awayMs, capped }
}
