import type { Room } from '../schema'

export const rooms: Room[] = [
  {
    id: 'phong-khach',
    names: { vi: 'Phòng khách' },
    palette: { wall: '#e9e2d6', floor: '#a0764f', accent: '#3f6f5a' },
    props: ['sofa', 'plant', 'window', 'lamp'],
  },
]
