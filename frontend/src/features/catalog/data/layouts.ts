import type { Layout } from '../schema'

export const layouts: Layout[] = [
  {
    id: 'ha-long',
    names: { vi: 'Vịnh đá Hạ Long' },
    descriptionVi: 'Những khối đá dựng đứng như núi đá vôi giữa vịnh, thảm cây thấp như mặt nước xanh.',
    substrate: 'aqua-soil',
    items: [
      { uid: 'r1', kind: 'decor', refId: 'da-nui-xam', x: 0.35, z: 0.55, scale: 1.4, flip: false, rotY: 0.2 },
      { uid: 'r2', kind: 'decor', refId: 'da-nui-xam', x: 0.62, z: 0.45, scale: 1, flip: true, rotY: 1.1 },
      { uid: 'p1', kind: 'plant', refId: 'ngoc-trai-cuba', x: 0.5, z: 0.2, scale: 1, flip: false, rotY: 0 },
      { uid: 'p2', kind: 'plant', refId: 'rotala-do', x: 0.85, z: 0.85, scale: 1.2, flip: false, rotY: 0 },
    ],
    suggestedStock: { neon: 8, 'cherry-shrimp': 6 },
  },
]
