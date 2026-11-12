import type { Plant } from '../schema'

export const plants: Plant[] = [
  {
    id: 'ngoc-trai-cuba',
    names: { vi: 'Ngọc trai Cuba', scientific: 'Hemianthus callitrichoides' },
    placement: 'foreground',
    light: 'high',
    co2: 'required',
    growth: 'mid',
    model: { kind: 'carpet', color: '#5fbf3c', heightCm: 2 },
    reviewed: null,
  },
  {
    id: 'rotala-do',
    names: { vi: 'Rotala đỏ', scientific: 'Rotala rotundifolia' },
    placement: 'background',
    light: 'mid',
    co2: 'helpful',
    growth: 'fast',
    model: { kind: 'stem', color: '#c9573a', heightCm: 30 },
    reviewed: null,
  },
]
