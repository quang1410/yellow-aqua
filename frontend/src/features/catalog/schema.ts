import { z } from 'zod'

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be kebab-case')
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'color must be #rrggbb')
const range = z.tuple([z.number(), z.number()])

export const ZoneSchema = z.enum(['top', 'mid', 'bottom'])
export const SpeciesGroupSchema = z.enum([
  'tetra',
  'cyprinid',
  'livebearer',
  'labyrinth',
  'cichlid',
  'catfish',
  'loach',
  'shrimp',
  'snail',
])
export const ReviewSchema = z.object({ by: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export const SpeciesModelSchema = z.object({
  body: z.enum(['slim', 'deep', 'disc', 'torpedo', 'flat-belly', 'shrimp', 'snail']),
  colors: z.object({ base: hex, accent: hex, belly: hex }),
  pattern: z.enum(['none', 'stripe-h', 'stripe-v', 'spots', 'neon-line']),
  fins: z.enum(['short', 'long', 'veil', 'sail']),
})

export const SpeciesSchema = z.object({
  id,
  group: SpeciesGroupSchema,
  names: z.object({ vi: z.string().min(1), viAlt: z.array(z.string()), scientific: z.string().min(1) }),
  zone: ZoneSchema,
  adultCm: z.number().positive(),
  tempC: range,
  ph: range,
  minTankL: z.number().positive(),
  bioload: z.number().positive(),
  temperament: z.enum(['peaceful', 'semi', 'aggressive']),
  finNipper: z.boolean(),
  longFinned: z.boolean(),
  eatsShrimp: z.boolean(),
  eatsSnails: z.boolean(),
  schoolMin: z.number().int().min(1),
  breeding: z.enum(['livebearer', 'egg', 'none']),
  maxPerTank: z.number().int().positive().optional(),
  model: SpeciesModelSchema,
  reviewed: ReviewSchema.nullable(),
  sources: z.array(z.string()),
})

export const PlantSchema = z.object({
  id,
  names: z.object({ vi: z.string().min(1), scientific: z.string().min(1) }),
  placement: z.enum(['foreground', 'midground', 'background', 'moss', 'floating']),
  light: z.enum(['low', 'mid', 'high']),
  co2: z.enum(['none', 'helpful', 'required']),
  growth: z.enum(['slow', 'mid', 'fast']),
  model: z.object({
    kind: z.enum(['stem', 'rosette', 'carpet', 'moss', 'grass', 'floating']),
    color: hex,
    heightCm: z.number().positive(),
  }),
  reviewed: ReviewSchema.nullable(),
})

export const DecorSchema = z.object({
  id,
  names: z.object({ vi: z.string().min(1) }),
  kind: z.enum(['rock', 'wood', 'leaf']),
  raisesKH: z.boolean(),
  model: z.object({ shape: z.enum(['boulder', 'slab', 'spire', 'branch', 'root', 'leaf']), color: hex }),
})

export const PlacedItemSchema = z.object({
  uid: z.string().min(1),
  kind: z.enum(['plant', 'decor']),
  refId: z.string(),
  x: z.number().min(0).max(1),
  z: z.number().min(0).max(1),
  scale: z.number().min(0.5).max(2),
  flip: z.boolean(),
  rotY: z.number(),
})

export const SubstrateSchema = z.enum(['aqua-soil', 'sand', 'gravel'])

export const LayoutSchema = z.object({
  id,
  names: z.object({ vi: z.string().min(1) }),
  descriptionVi: z.string(),
  substrate: SubstrateSchema,
  items: z.array(PlacedItemSchema),
  suggestedStock: z.record(z.string(), z.number().int().positive()),
})

export const RoomPropSchema = z.enum([
  'sofa',
  'bed',
  'desk',
  'shelf',
  'plant',
  'window',
  'lamp',
  'counter',
  'railing',
])

export const RoomSchema = z.object({
  id,
  names: z.object({ vi: z.string().min(1) }),
  palette: z.object({ wall: hex, floor: hex, accent: hex }),
  props: z.array(RoomPropSchema),
})

export const FoodSchema = z.object({
  id,
  names: z.object({ vi: z.string().min(1) }),
  sinks: z.boolean(),
  zones: z.array(ZoneSchema).min(1),
  nutrition: z.number().positive(),
  waste: z.number().nonnegative(),
  preferredBy: z.array(SpeciesGroupSchema),
})

const named = z.object({ id, names: z.object({ vi: z.string().min(1) }) })

export const GearSchema = z.object({
  lights: z.object({
    fixtures: z.array(named),
    colors: z.array(named.extend({ hex, plantBoost: z.number() })),
  }),
  filters: z.array(named.extend({ flowLph: z.number().positive(), bioCapacity: z.number().positive() })),
  glass: z.array(named),
  cabinets: z.array(named.extend({ color: hex })),
  tankPresets: z.array(
    named.extend({
      sizeCm: z.object({ w: z.number().positive(), d: z.number().positive(), h: z.number().positive() }),
    }),
  ),
})

export const CatalogSchema = z.object({
  species: z.array(SpeciesSchema),
  plants: z.array(PlantSchema),
  decor: z.array(DecorSchema),
  layouts: z.array(LayoutSchema),
  rooms: z.array(RoomSchema),
  foods: z.array(FoodSchema),
  gear: GearSchema,
})

export type Zone = z.infer<typeof ZoneSchema>
export type SpeciesGroup = z.infer<typeof SpeciesGroupSchema>
export type Review = z.infer<typeof ReviewSchema>
export type SpeciesModel = z.infer<typeof SpeciesModelSchema>
export type Species = z.infer<typeof SpeciesSchema>
export type Plant = z.infer<typeof PlantSchema>
export type Decor = z.infer<typeof DecorSchema>
export type PlacedItem = z.infer<typeof PlacedItemSchema>
export type Substrate = z.infer<typeof SubstrateSchema>
export type Layout = z.infer<typeof LayoutSchema>
export type Room = z.infer<typeof RoomSchema>
export type Food = z.infer<typeof FoodSchema>
export type Gear = z.infer<typeof GearSchema>
export type Catalog = z.infer<typeof CatalogSchema>
