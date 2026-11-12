import type { Food } from '../schema'

export const foods: Food[] = [
  {
    id: 'flake',
    names: { vi: 'Cám nổi' },
    sinks: false,
    zones: ['top', 'mid'],
    nutrition: 1,
    waste: 1,
    preferredBy: ['tetra', 'cyprinid', 'livebearer', 'labyrinth'],
  },
  {
    id: 'pellet',
    names: { vi: 'Viên chìm' },
    sinks: true,
    zones: ['bottom'],
    nutrition: 1.2,
    waste: 1.2,
    preferredBy: ['catfish', 'loach', 'shrimp', 'cichlid'],
  },
]
