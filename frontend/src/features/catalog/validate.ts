import { CatalogSchema, type Catalog } from './schema'

export function byId<T extends { id: string }>(list: readonly T[], id: string): T | undefined {
  return list.find((x) => x.id === id)
}

function duplicates(kind: string, ids: string[]): string[] {
  const seen = new Set<string>()
  const errs: string[] = []
  for (const i of ids) {
    if (seen.has(i)) errs.push(`${kind}: duplicate id "${i}"`)
    seen.add(i)
  }
  return errs
}

function nfc(where: string, value: string): string[] {
  return value === value.normalize('NFC') ? [] : [`${where}: "${value}" is not NFC`]
}

/** Trả về danh sách lỗi dễ đọc; mảng rỗng nghĩa là catalog hợp lệ. */
export function validateCatalog(c: Catalog): string[] {
  const parsed = CatalogSchema.safeParse(c)
  const errs: string[] = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  // Dữ liệu sai cấu trúc thì dừng ở đây: các kiểm tra sau đọc thẳng vào các trường.
  if (!parsed.success) return errs

  errs.push(...duplicates('species', c.species.map((s) => s.id)))
  errs.push(...duplicates('plants', c.plants.map((s) => s.id)))
  errs.push(...duplicates('decor', c.decor.map((s) => s.id)))
  errs.push(...duplicates('layouts', c.layouts.map((s) => s.id)))
  errs.push(...duplicates('rooms', c.rooms.map((s) => s.id)))
  errs.push(...duplicates('foods', c.foods.map((s) => s.id)))
  errs.push(...duplicates('gear lights', c.gear.lights.fixtures.map((s) => s.id)))
  errs.push(...duplicates('gear light colors', c.gear.lights.colors.map((s) => s.id)))
  errs.push(...duplicates('gear filters', c.gear.filters.map((s) => s.id)))
  errs.push(...duplicates('gear glass', c.gear.glass.map((s) => s.id)))
  errs.push(...duplicates('gear cabinets', c.gear.cabinets.map((s) => s.id)))
  errs.push(...duplicates('gear tank presets', c.gear.tankPresets.map((s) => s.id)))

  for (const s of c.species) {
    if (s.tempC[0] > s.tempC[1]) errs.push(`species ${s.id}: tempC range is reversed`)
    if (s.ph[0] > s.ph[1]) errs.push(`species ${s.id}: ph range is reversed`)
    errs.push(...nfc(`species ${s.id}`, s.names.vi))
    for (const alt of s.names.viAlt) errs.push(...nfc(`species ${s.id} alt`, alt))
  }
  for (const p of c.plants) errs.push(...nfc(`plant ${p.id}`, p.names.vi))
  for (const d of c.decor) errs.push(...nfc(`decor ${d.id}`, d.names.vi))
  for (const r of c.rooms) errs.push(...nfc(`room ${r.id}`, r.names.vi))
  for (const f of c.foods) errs.push(...nfc(`food ${f.id}`, f.names.vi))
  for (const g of [...c.gear.lights.fixtures, ...c.gear.lights.colors, ...c.gear.filters, ...c.gear.glass, ...c.gear.cabinets, ...c.gear.tankPresets]) {
    errs.push(...nfc(`gear ${g.id}`, g.names.vi))
  }

  for (const l of c.layouts) {
    errs.push(...nfc(`layout ${l.id}`, l.names.vi))
    errs.push(...nfc(`layout ${l.id} description`, l.descriptionVi))
    errs.push(...duplicates(`layout ${l.id} items`, l.items.map((i) => i.uid)))
    for (const item of l.items) {
      const exists = item.kind === 'plant' ? byId(c.plants, item.refId) : byId(c.decor, item.refId)
      if (!exists) errs.push(`layout ${l.id}: ${item.kind} "${item.refId}" does not exist`)
    }
    for (const sid of Object.keys(l.suggestedStock)) {
      if (!byId(c.species, sid)) errs.push(`layout ${l.id}: suggested species "${sid}" does not exist`)
    }
  }
  return errs
}
