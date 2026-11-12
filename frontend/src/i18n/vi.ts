export const vi = {
  appName: 'Yellow Aqua',
  appDescription: 'Hồ thủy sinh 3D: thư giãn, học nuôi cá và chăm bể thật.',
  preparingTank: 'Đang chuẩn bị hồ…',
  webglUnavailable: 'Máy này chưa hiển thị được hồ 3D. Hãy thử trình duyệt Chrome mới nhất hoặc bật tăng tốc phần cứng.',
  notPersistent: 'Dữ liệu sẽ không được lưu trên máy này.',
  unverified: 'Chưa kiểm chứng',
  fishCount: '{n} con',
} as const

export type MessageKey = keyof typeof vi

/** Lấy chuỗi tiếng Việt và điền các chỗ `{name}`. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const text: string = vi[key]
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m))
}
