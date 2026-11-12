import { describe, expect, it } from 'vitest'
import { catalog, validateCatalog, type Catalog } from '.'

describe('catalog validation', () => {
  it('sample catalog is valid', () => expect(validateCatalog(catalog)).toEqual([]))

  it('rejects a layout that references a missing plant', () => {
    const bad = structuredClone(catalog)
    bad.layouts[0]!.items.push({
      uid: 'x',
      kind: 'plant',
      refId: 'missing-plant',
      x: 0.5,
      z: 0.5,
      scale: 1,
      flip: false,
      rotY: 0,
    })
    expect(validateCatalog(bad)).toContainEqual(expect.stringContaining('missing-plant'))
  })

  it('rejects suggested stock for an unknown species', () => {
    const bad = structuredClone(catalog)
    bad.layouts[0]!.suggestedStock['unknown-species'] = 3
    expect(validateCatalog(bad)).toContainEqual(expect.stringContaining('unknown-species'))
  })

  it('rejects duplicate ids and reversed ranges', () => {
    const bad = structuredClone(catalog)
    bad.species.push(structuredClone(bad.species[0]!))
    bad.species[0]!.tempC = [28, 22]
    const errs = validateCatalog(bad)
    expect(errs.some((e) => e.includes('duplicate'))).toBe(true)
    expect(errs.some((e) => e.includes('tempC'))).toBe(true)
  })

  it('rejects placed items outside the tank bounds', () => {
    const bad = structuredClone(catalog)
    bad.layouts[0]!.items[0]!.x = 1.4
    bad.layouts[0]!.items[0]!.scale = 3
    const errs = validateCatalog(bad)
    expect(errs.length).toBeGreaterThanOrEqual(2)
  })

  it('all Vietnamese names are NFC', () => {
    for (const s of catalog.species) expect(s.names.vi).toBe(s.names.vi.normalize('NFC'))
    for (const p of catalog.plants) expect(p.names.vi).toBe(p.names.vi.normalize('NFC'))
    for (const l of catalog.layouts) expect(l.names.vi).toBe(l.names.vi.normalize('NFC'))
  })

  it('rejects names that are not NFC', () => {
    const bad = structuredClone(catalog)
    bad.species[0]!.names.vi = 'Cá neon'.normalize('NFD')
    expect(validateCatalog(bad)).toContainEqual(expect.stringContaining('NFC'))
  })

  it('does not throw on malformed data and reports it instead', () => {
    const bad = structuredClone(catalog)
    ;(bad.species[0] as unknown as { tempC: unknown }).tempC = undefined
    expect(() => validateCatalog(bad)).not.toThrow()
    expect(validateCatalog(bad).length).toBeGreaterThan(0)
  })

  it.each([
    ['species alternative name', (c: Catalog) => (c.species[0]!.names.viAlt = ['Cá neon xanh'.normalize('NFD')])],
    ['layout description', (c: Catalog) => (c.layouts[0]!.descriptionVi = 'Vịnh đá Hạ Long'.normalize('NFD'))],
    ['food name', (c: Catalog) => (c.foods[0]!.names.vi = 'Cám nổi'.normalize('NFD'))],
    ['glass name', (c: Catalog) => (c.gear.glass[0]!.names.vi = 'Kính siêu trong'.normalize('NFD'))],
    ['cabinet name', (c: Catalog) => (c.gear.cabinets[0]!.names.vi = 'Gỗ sồi'.normalize('NFD'))],
  ])('rejects a non-NFC %s', (_label, mutate) => {
    const bad = structuredClone(catalog)
    mutate(bad)
    expect(validateCatalog(bad)).toContainEqual(expect.stringContaining('NFC'))
  })

  it('rejects duplicate gear ids', () => {
    const bad = structuredClone(catalog)
    bad.gear.filters.push(structuredClone(bad.gear.filters[0]!))
    bad.gear.glass.push(structuredClone(bad.gear.glass[0]!))
    const dupes = validateCatalog(bad).filter((e) => e.includes('duplicate'))
    expect(dupes.length).toBeGreaterThanOrEqual(2)
  })
})
