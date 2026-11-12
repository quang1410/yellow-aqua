import type { Catalog } from './schema'
import { species } from './data/species'
import { plants } from './data/plants'
import { decor } from './data/decor'
import { layouts } from './data/layouts'
import { rooms } from './data/rooms'
import { foods } from './data/foods'
import { gear } from './data/gear'

export * from './schema'
export { validateCatalog, byId } from './validate'

export const catalog: Catalog = { species, plants, decor, layouts, rooms, foods, gear }
