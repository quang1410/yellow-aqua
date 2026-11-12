import type { Gear } from '../schema'

export const gear: Gear = {
  lights: {
    fixtures: [{ id: 'thanh-led', names: { vi: 'Thanh LED' } }],
    colors: [{ id: 'trang-6500k', names: { vi: 'Trắng 6500K' }, hex: '#f4f7ff', plantBoost: 1 }],
  },
  filters: [{ id: 'loc-thung', names: { vi: 'Lọc thùng' }, flowLph: 600, bioCapacity: 1.2 }],
  glass: [{ id: 'kinh-sieu-trong', names: { vi: 'Kính siêu trong' } }],
  cabinets: [{ id: 'go-soi', names: { vi: 'Gỗ sồi' }, color: '#b48a5a' }],
  tankPresets: [{ id: 'be-60', names: { vi: 'Bể 60 cm' }, sizeCm: { w: 60, d: 30, h: 36 } }],
}
