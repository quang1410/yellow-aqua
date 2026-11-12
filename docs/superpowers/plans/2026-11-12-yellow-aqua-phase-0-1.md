# Yellow Aqua — Giai đoạn 0 và 1: Kế hoạch triển khai

> **Lưu ý (12/11/2026):** các đường dẫn file trong kế hoạch này theo cấu trúc monorepo ban đầu (`apps/web`, `packages/*`). Repo đã tổ chức lại theo thẻ K-02: `frontend/` (npm), engine ở `frontend/src/features/tank/engine/`, catalog ở `frontend/src/features/catalog/`, test đặt cạnh code. Tiến độ thực tế theo `docs/roadmap/kanban.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Quy tắc của chủ dự án (cao hơn mọi skill):** KHÔNG chạy `git commit`, `git push`, `git stash`, `git reset --hard`, không đổi nhánh. Mỗi task dừng ở "test chạy qua"; để mọi thay đổi trong cây làm việc, chưa stage. Chủ dự án tự review và commit.

**Goal:** Một PWA tiếng Việt chạy hồ thủy sinh 3D tự làm, có mô phỏng chu trình nitơ, cảnh báo tương thích loài, nhiều bể, hai chế độ chơi, chạy offline, đạt ngân sách hiệu năng trên điện thoại tầm trung.

**Architecture:** Monorepo pnpm gồm 3 phần. `packages/catalog` chứa dữ liệu loài/cây/đá/bố cục và schema kiểm tra. `packages/sim` là mô phỏng TypeScript thuần, tất định, chạy trong Web Worker. `apps/web` là Next.js: cảnh 3D Three.js dựng hình bằng code, giao diện, lưu IndexedDB, PWA. Giai đoạn 0–1 **chưa có backend Go**; backend bắt đầu ở giai đoạn 2.

**Tech Stack:** Node 22, pnpm, TypeScript (strict), Next.js App Router (bản stable mới nhất lúc bắt đầu, ghi phiên bản cụ thể vào `package.json`), Three.js, Dexie, Serwist, zod, Vitest, Testing Library, Playwright, Web Audio API.

**Spec:** `docs/superpowers/specs/2026-11-12-yellow-aqua-design.md` — người làm đọc cả spec lẫn kế hoạch này.

## Global Constraints

- Node 22 (`.nvmrc` = `22`; máy chủ dự án đã có 22.23.5). Trình quản lý gói: pnpm workspaces.
- Toàn bộ chữ trên giao diện là tiếng Việt, lưu trong `apps/web/src/i18n/vi.ts`; mọi chuỗi người dùng nhập được chuẩn hóa Unicode NFC.
- Font: Be Vietnam Pro qua `next/font/google`.
- Lần tải đầu của `/ho` ≤ **3 000 000 byte** truyền qua mạng cho tới khi `[data-tank-ready="true"]` xuất hiện.
- ≥ **30 FPS** trung bình ở chất lượng `medium` với CPU giả lập chậm 4 lần.
- `/ho` và dữ liệu loài chạy được khi **offline** sau lần tải đầu.
- **Không** dùng bất kỳ file, tên bố cục, tên phòng, hằng số mô phỏng hay âm thanh nào của nuoica.com. Mọi hình 3D dựng bằng code; mọi âm thanh tổng hợp bằng Web Audio (0 file âm thanh). *[Claude: thay cho "âm thanh CC0" trong spec vì nhẹ hơn và không có rủi ro giấy phép.]*
- Dữ liệu có `reviewed: null` phải hiện nhãn **"Chưa kiểm chứng"** ở mọi nơi hiển thị thông tin chăm sóc.
- Tổng số sinh vật được dựng hình trong một bể ≤ **120**.
- Vercel: region `sin1` ghi trong `vercel.json`.
- Không thêm thống kê, tracker hay backend ở giai đoạn này.

## Review Focus

1. **Đồng hồ máy chạy lùi hoặc vắng mặt rất lâu**: người dùng chỉnh giờ máy về quá khứ, hoặc mở lại sau 3 tháng → mô phỏng không chạy ngược, không treo, chỉ tua tối đa 14 ngày. *Test: Task 7, `advanceTo handles clock going backwards` và `caps away time at 14 days`.*
2. **IndexedDB không dùng được hoặc dữ liệu cũ hỏng** (tab ẩn danh, bộ nhớ đầy, bản ghi từ phiên bản cũ) → app vẫn mở được với bộ nhớ tạm, có thông báo "Dữ liệu sẽ không được lưu", không trắng màn hình. *Test: Task 10, `falls back to memory repo` và `drops records that fail schema`.*
3. **WebGL không có hoặc bị mất context** (máy yếu, tab chạy nền lâu) → hiện thông báo thay vì canvas trắng; tự dựng lại khi context trở lại. *Test: Task 11, e2e `shows fallback when WebGL is unavailable`.*
4. **Màn hình nhỏ 360×640, xoay ngang, tai thỏ** → thanh công cụ và panel luôn bấm được, panel cuộn được, tôn trọng safe area. *Test: Task 18, e2e chạy toàn bộ luồng ở 360×640.*
5. **Thả quá nhiều cá ở chế độ Thư giãn** → vẫn chặn ở 120 sinh vật và 3 lần sức chứa để giữ FPS; nút thêm bị vô hiệu kèm lý do. *Test: Task 8, `relaxed mode still blocks above render cap`.*

---

## Cấu trúc file

```
.nvmrc  package.json  pnpm-workspace.yaml  tsconfig.base.json  eslint.config.mjs  .prettierrc
packages/catalog/
  src/schema.ts            zod schema + kiểu Catalog
  src/data/species.ts      20 loài
  src/data/plants.ts  decor.ts  layouts.ts  rooms.ts  foods.ts  gear.ts
  src/index.ts             export catalog, validateCatalog
  test/catalog.test.ts
packages/sim/
  src/types.ts  rng.ts  constants.ts
  src/state.ts             createSimState
  src/step.ts              step, advanceTo
  src/actions.ts           applyAction
  src/water.ts             nitơ, clo, chất thải, nhiệt độ, oxy, readWater
  src/life.ts              đói, lớn, sức khỏe, chết, sinh sản
  src/compat.ts            checkAddition, stockingCapacity, tankPh
  src/index.ts
  test/fixtures.ts  hunger.test.ts  water.test.ts  life.test.ts  advance.test.ts  compat.test.ts
apps/web/
  next.config.ts  vercel.json  playwright.config.ts
  src/app/layout.tsx  page.tsx  manifest.ts  sw.ts  ho/page.tsx
  src/i18n/vi.ts
  src/styles/tokens.css
  src/storage/db.ts  repo.ts  memory-repo.ts
  src/session/sim.worker.ts  protocol.ts  useTankSession.ts
  src/tank3d/scene.ts  quality.ts  tank-mesh.ts  lighting.ts  room.ts  interaction.ts
  src/tank3d/procedural/fish.ts  plants.ts  hardscape.ts
  src/tank3d/life/boids.ts  moments.ts  critters.ts
  src/audio/engine.ts  music.ts  sfx.ts
  src/ui/TankApp.tsx  Dock.tsx  Drawer.tsx  StatusHud.tsx  AwayDialog.tsx  PhotoDialog.tsx  UnverifiedBadge.tsx  shortcuts.ts
  src/ui/panels/LifePanel.tsx  FeedPanel.tsx  CarePanel.tsx  ScapePanel.tsx  CustomizePanel.tsx  TanksPanel.tsx  MomentsPanel.tsx  AudioWidget.tsx
  test/…                   Vitest + Testing Library
  e2e/…                    Playwright
  scripts/perf-fps.ts
```

Package names: `@yellow-aqua/catalog`, `@yellow-aqua/sim`, `web`.

---

# GIAI ĐOẠN 0 — Nền móng

### Task 1: Monorepo và công cụ

**Files:**
- Create: các file gốc ở cây trên; `packages/catalog/package.json`, `packages/sim/package.json`, mỗi package có `vitest.config.ts` và `test/smoke.test.ts`
- Create: `apps/web` bằng `pnpm create next-app@latest apps/web --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"`

**Interfaces:**
- Produces: lệnh gốc `pnpm test` (chạy Vitest mọi package), `pnpm typecheck`, `pnpm lint`, `pnpm build`.

- [ ] **Step 1:** Tạo `packages/sim/test/smoke.test.ts` và `packages/catalog/test/smoke.test.ts`, mỗi file một test `it('runs', () => expect(1 + 1).toBe(2))`.
- [ ] **Step 2:** Chạy `pnpm test` khi chưa có cấu hình workspace. Mong đợi: lỗi không tìm thấy package / vitest.
- [ ] **Step 3:** Tạo workspace (`pnpm-workspace.yaml` gồm `apps/*`, `packages/*`), `tsconfig.base.json` bật `strict`, `noUncheckedIndexedAccess`; ESLint + Prettier dùng chung; script gốc chạy theo `pnpm -r`.
- [ ] **Step 4:** Chạy `pnpm install && pnpm test && pnpm typecheck && pnpm lint`. Mong đợi: tất cả PASS.

### Task 2: Schema dữ liệu và dữ liệu mẫu

**Files:**
- Create: `packages/catalog/src/schema.ts`, `src/data/*.ts` (mỗi file 1–3 mục mẫu), `src/index.ts`
- Test: `packages/catalog/test/catalog.test.ts`

**Interfaces:**
- Produces (từ `@yellow-aqua/catalog`):

```ts
export type Zone = 'top' | 'mid' | 'bottom'
export type SpeciesGroup = 'tetra'|'cyprinid'|'livebearer'|'labyrinth'|'cichlid'|'catfish'|'loach'|'shrimp'|'snail'
export interface Review { by: string; date: string }            // ISO yyyy-mm-dd
export interface SpeciesModel {
  body: 'slim'|'deep'|'disc'|'torpedo'|'flat-belly'|'shrimp'|'snail'
  colors: { base: string; accent: string; belly: string }      // hex
  pattern: 'none'|'stripe-h'|'stripe-v'|'spots'|'neon-line'
  fins: 'short'|'long'|'veil'|'sail'
}
export interface Species {
  id: string; group: SpeciesGroup
  names: { vi: string; viAlt: string[]; scientific: string }
  zone: Zone; adultCm: number; tempC: [number, number]; ph: [number, number]
  minTankL: number; bioload: number                              // đơn vị tải/con trưởng thành
  temperament: 'peaceful'|'semi'|'aggressive'
  finNipper: boolean; longFinned: boolean; eatsShrimp: boolean; eatsSnails: boolean
  schoolMin: number; breeding: 'livebearer'|'egg'|'none'
  maxPerTank?: number                                            // ví dụ betta đực = 1
  model: SpeciesModel; reviewed: Review | null; sources: string[]
}
export interface Plant { id; names:{vi;scientific}; placement:'foreground'|'midground'|'background'|'moss'|'floating'; light:'low'|'mid'|'high'; co2:'none'|'helpful'|'required'; growth:'slow'|'mid'|'fast'; model:{kind:'stem'|'rosette'|'carpet'|'moss'|'grass'|'floating'; color:string; heightCm:number}; reviewed: Review|null }
export interface Decor { id; names:{vi}; kind:'rock'|'wood'|'leaf'; raisesKH:boolean; model:{shape:'boulder'|'slab'|'spire'|'branch'|'root'|'leaf'; color:string} }
export interface PlacedItem { uid:string; kind:'plant'|'decor'; refId:string; x:number; z:number; scale:number; flip:boolean; rotY:number } // x,z ∈ [0,1]; scale ∈ [0.5,2]
export interface Layout { id; names:{vi}; descriptionVi:string; substrate:'aqua-soil'|'sand'|'gravel'; items:PlacedItem[]; suggestedStock:Record<string,number> }
export interface Room { id; names:{vi}; palette:{wall:string;floor:string;accent:string}; props:('sofa'|'bed'|'desk'|'shelf'|'plant'|'window'|'lamp'|'counter'|'railing')[] }
export interface Food { id; names:{vi}; sinks:boolean; zones:Zone[]; nutrition:number; waste:number; preferredBy:SpeciesGroup[] }
export interface Gear { lights:{fixtures:{id;names:{vi}}[]; colors:{id;names:{vi};hex:string;plantBoost:number}[]}; filters:{id;names:{vi};flowLph:number;bioCapacity:number}[]; glass:{id;names:{vi}}[]; cabinets:{id;names:{vi};color:string}[]; tankPresets:{id;names:{vi};sizeCm:{w:number;d:number;h:number}}[] }
export interface Catalog { species:Species[]; plants:Plant[]; decor:Decor[]; layouts:Layout[]; rooms:Room[]; foods:Food[]; gear:Gear }
export const catalog: Catalog
export function validateCatalog(c: Catalog): string[]   // [] = hợp lệ
export function byId<T extends {id:string}>(list: T[], id: string): T | undefined
```

- [ ] **Step 1: Viết test hỏng**

```ts
import { catalog, validateCatalog } from '../src'
it('sample catalog is valid', () => expect(validateCatalog(catalog)).toEqual([]))
it('rejects a layout that references a missing plant', () => {
  const bad = structuredClone(catalog)
  bad.layouts[0]!.items.push({ uid:'x', kind:'plant', refId:'khong-ton-tai', x:.5, z:.5, scale:1, flip:false, rotY:0 })
  expect(validateCatalog(bad)).toContainEqual(expect.stringContaining('khong-ton-tai'))
})
it('rejects duplicate ids and reversed ranges', () => {
  const bad = structuredClone(catalog)
  bad.species.push(structuredClone(bad.species[0]!))
  bad.species[0]!.tempC = [28, 22]
  const errs = validateCatalog(bad)
  expect(errs.some(e => e.includes('duplicate'))).toBe(true)
  expect(errs.some(e => e.includes('tempC'))).toBe(true)
})
it('all Vietnamese names are NFC', () => {
  for (const s of catalog.species) expect(s.names.vi).toBe(s.names.vi.normalize('NFC'))
})
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/catalog test` → FAIL (module chưa có).
- [ ] **Step 3:** Viết schema zod tương ứng kiểu trên; `validateCatalog` = parse zod + kiểm tra id trùng, khoảng [min,max] đúng chiều, mọi `refId`/`suggestedStock` trỏ tới mục có thật, x/z/scale trong giới hạn. Dữ liệu mẫu: loài `neon`, `guppy`, `cherry-shrimp`; 2 cây; 1 đá; 1 bố cục; 1 phòng; 2 thức ăn; `gear` đủ mỗi nhóm 1 mục.
- [ ] **Step 4:** `pnpm --filter @yellow-aqua/catalog test` → PASS.

### Task 3: Khung app Next.js, giao diện nền, PWA offline

**Files:**
- Create/Modify: `apps/web/src/app/layout.tsx` (`<html lang="vi">`, font, theme), `page.tsx` (redirect tới `/ho`), `ho/page.tsx` (client-only, tạm hiện "Đang chuẩn bị hồ…" rồi đặt `data-tank-ready="true"`), `manifest.ts`, `sw.ts`, `next.config.ts` (Serwist), `vercel.json` (`{"regions":["sin1"]}`), `src/i18n/vi.ts`, `src/styles/tokens.css`
- Test: `apps/web/e2e/shell.spec.ts`, `apps/web/playwright.config.ts` (project `mobile` = Pixel 7, project `small` = 360×640)

**Interfaces:**
- Produces: `t(key: keyof typeof vi, vars?: Record<string,string|number>): string` trong `src/i18n/vi.ts`; CSS variables `--bg --surface --text --muted --accent --danger --radius --safe-bottom`, đổi theo `prefers-color-scheme` và `[data-theme]`.

- [ ] **Step 1: Viết e2e hỏng**

```ts
test('shell is Vietnamese and installable', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/ho$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  const manifest = await (await page.request.get('/manifest.webmanifest')).json()
  expect(manifest.lang).toBe('vi')
  expect(manifest.display).toBe('standalone')
})
test('tank page works offline after first visit', async ({ page, context }) => {
  await page.goto('/ho'); await page.locator('[data-tank-ready="true"]').waitFor()
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true); await page.reload()
  await expect(page.locator('[data-tank-ready="true"]')).toBeVisible()
})
```

- [ ] **Step 2:** `pnpm --filter web build && pnpm --filter web e2e shell` → FAIL.
- [ ] **Step 3:** Làm các file trên. Service worker: precache app shell + route `/ho`, cache-first cho `/_next/static`. Manifest: tên "Yellow Aqua", `lang: 'vi'`, `display: 'standalone'`, màu nền lấy từ token, icon SVG tự vẽ (giọt nước + lá).
- [ ] **Step 4:** Chạy lại lệnh Step 2 (e2e chạy trên bản build `next start`) → PASS.

### Task 4: Kiểm tra ngân sách hiệu năng tự động

**Files:**
- Create: `apps/web/e2e/budget.spec.ts`, `apps/web/scripts/perf-fps.ts`; script `perf` trong `apps/web/package.json`

**Interfaces:**
- Consumes: `data-tank-ready`.
- Produces: `window.__yellowAqua?.fps(): number` (trung bình 5 giây gần nhất) — Task 11 cung cấp; trước đó script báo "chưa có số đo" và thoát mã 0.

- [ ] **Step 1: Viết test**

```ts
test('first load of /ho stays within 3 MB on slow 4G', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline:false, latency:150, downloadThroughput:1_600_000/8, uploadThroughput:750_000/8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  let bytes = 0
  cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength })
  await page.goto('/ho'); await page.locator('[data-tank-ready="true"]').waitFor({ timeout: 30_000 })
  expect(bytes).toBeLessThanOrEqual(3_000_000)
})
```

- [ ] **Step 2:** Chạy `pnpm --filter web e2e budget`. Mong đợi: PASS ngay (trang còn rỗng). Đây là test giữ ngưỡng cho các task sau.
- [ ] **Step 3:** `perf-fps.ts`: mở Chrome **có giao diện** (để có GPU thật), CPU chậm 4 lần, mở `/ho?quality=medium`, chờ 3 giây, đọc `window.__yellowAqua.fps()`, in số và thoát mã 1 nếu < 30.
- [ ] **Step 4:** `pnpm --filter web perf` → in "chưa có số đo", mã 0.

---

# GIAI ĐOẠN 1 — Hồ ảo

### Task 5: Lõi mô phỏng — kiểu dữ liệu, tất định, đói và cho ăn

**Files:**
- Create: `packages/sim/src/types.ts`, `rng.ts`, `constants.ts`, `state.ts`, `step.ts`, `actions.ts`, `life.ts` (phần đói), `index.ts`
- Test: `packages/sim/test/fixtures.ts`, `hunger.test.ts`

**Interfaces:**
- Consumes: kiểu từ `@yellow-aqua/catalog` (chỉ `import type`).
- Produces:

```ts
export type Mode = 'relaxed' | 'realistic'
export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'night'
export interface TankDesign {
  v: 1; id: string; name: string; createdAt: number; seed: number; mode: Mode
  layoutId: string | null; substrate: Layout['substrate']; items: PlacedItem[]
  sizeCm: { w: number; d: number; h: number }
  glassId: string; cabinetId: string; roomId: string; timeOfDay: 'auto' | TimeOfDay
  light: { fixtureId: string; colorId: string; brightness: number; on: boolean }   // brightness 0..1
  equipment: { filterId: string | null; heater: boolean; chiller: boolean; fan: boolean; co2: boolean; airStone: boolean }
}
export interface FishIndividual { uid: string; speciesId: string; growth: number; health: number; hunger: number; bornAt: number } // 0..1 mỗi số
export interface WaterState { tempC: number; nh3: number; no2: number; no3: number; chlorine: number; waste: number; bacteria: number; o2: number } // ppm; waste/bacteria/o2/chlorine 0..1
export interface SimState { v: 1; tankId: string; simTimeMs: number; lastRealMs: number; fish: FishIndividual[]; water: WaterState; food: { floating: number; sinking: number }; lastWaterChangeMs: number | null; rng: number; nextUid: number; flags: { cycleAnnounced: boolean } }
export type SimEventType = 'fed'|'siphoned'|'water-changed'|'fish-added'|'fish-removed'|'fish-born'|'fish-grown'|'fish-died'|'water-cloudy'|'water-dirty'|'ammonia-spike'|'chlorine-stress'|'too-hot'|'too-cold'|'cycle-complete'
export interface SimEvent { atMs: number; type: SimEventType; speciesId?: string; count?: number }
export interface Env { roomTempC: number; powerOn: boolean }        // giai đoạn 1: roomTempC = 27, powerOn = true
export type Action =
  | { type: 'feed'; foodId: string; amount: number }                // amount 0.5..3 (nhúm)
  | { type: 'add-fish'; speciesId: string; count: number }
  | { type: 'remove-fish'; speciesId: string; count: number }
  | { type: 'siphon' }
  | { type: 'water-change'; fraction: number; conditioned: boolean } // fraction 0.1..0.5
export type HungerLabel = 'full' | 'satisfied' | 'peckish' | 'hungry'
export interface StepResult { state: SimState; events: SimEvent[] }
export type WarningCode = 'temp-range'|'ph-range'|'fin-nipper'|'eats-shrimp'|'eats-snails'|'aggressive'|'school-too-small'|'tank-too-small'|'over-capacity'|'species-limit'|'render-cap'|'cycle-not-ready'|'water-change-cooldown'
export interface Warning { code: WarningCode; severity: 'info'|'warn'|'block'; speciesIds: string[] }   // Task 8 sinh ra các cảnh báo loài

export const SIM_STEP_SEC = 60
export function createRng(seed: number): () => number              // mulberry32, trả về [0,1)
export function createSimState(design: TankDesign, catalog: Catalog, nowMs: number, stock?: Record<string, number>): SimState
export function step(design: TankDesign, catalog: Catalog, state: SimState, env: Env, dtSec: number): StepResult
export function applyAction(design: TankDesign, catalog: Catalog, state: SimState, action: Action, nowMs: number): StepResult & { warnings: Warning[] }
export function hungerLabel(h: number): HungerLabel                // <0.2 full, <0.45 satisfied, <0.7 peckish, còn lại hungry
export function waterVolumeL(design: TankDesign): number           // w*d*h/1000 * 0.85
```

Mọi hàm **thuần**: không sửa `state` đầu vào, trả về state mới. Mọi ngẫu nhiên đi qua `state.rng`.

- [ ] **Step 1: Viết test hỏng** (`fixtures.ts` dựng một catalog nhỏ: `neon`, `guppy`, `betta`, `tiger-barb`, `panda-cory`, `cherry-shrimp`, `nerite-snail`, `assassin-snail`, `angelfish`; hàm `makeDesign(patch?)` bể 60×30×36, lọc có; `ENV = { roomTempC: 27, powerOn: true }`; `run(design, state, hours, env = ENV)` gọi `step` lặp với `SIM_STEP_SEC`; `avgHunger(state)`. Task 6 thêm `cycledState(design, stock)` = state Thực tế đã đặt `bacteria = 1` và `simTimeMs` đủ xa để không vướng thời gian chờ thay nước; `maxOver(design, state, hours, pick)`.)

```ts
it('hunger rises over 6 hours, feeding lowers it', () => {
  const d = makeDesign({ mode: 'relaxed' })
  let s = createSimState(d, cat, 0, { neon: 6 })
  const h0 = avgHunger(s)
  s = run(d, s, 6).state
  expect(avgHunger(s)).toBeGreaterThan(h0 + 0.2)
  const fed = applyAction(d, cat, s, { type: 'feed', foodId: 'flake', amount: 1 }, s.simTimeMs)
  const after = run(d, fed.state, 0.5).state
  expect(avgHunger(after)).toBeLessThan(avgHunger(s) - 0.2)
  expect(fed.events.map(e => e.type)).toContain('fed')
})
it('bottom dwellers eat sinking food, not floating flakes', () => { /* panda-cory + flake → hunger giảm < 0.05; + sinking pellet → giảm > 0.2 */ })
it('uneaten food becomes waste', () => { /* feed 3 nhúm cho 1 con → sau 2h food≈0 và water.waste tăng */ })
it('same seed gives identical state', () => {
  const a = run(makeDesign({ seed: 7 }), createSimState(makeDesign({ seed: 7 }), cat, 0, { guppy: 4 }), 48).state
  const b = run(makeDesign({ seed: 7 }), createSimState(makeDesign({ seed: 7 }), cat, 0, { guppy: 4 }), 48).state
  expect(JSON.stringify(a)).toBe(JSON.stringify(b))
})
it('does not mutate the input state', () => { /* Object.freeze sâu state rồi gọi step → không ném lỗi */ })
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/sim test hunger` → FAIL.
- [ ] **Step 3:** Hiện thực. Hằng số đặt trong `constants.ts` với tên rõ nghĩa và **giá trị tự chọn** (không lấy từ nuoica.com); mục tiêu: bể bỏ đói 12–16 giờ thì chuyển sang `hungry`. Thức ăn trôi hoặc chìm; mỗi phút, cá ở tầng phù hợp với `food.zones` ăn theo tỷ lệ; phần thừa phân hủy thành `waste` sau khoảng 1 giờ.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 6: Nước — chu trình nitơ, clo, hút phân, thay nước, nhiệt độ

**Files:**
- Create: `packages/sim/src/water.ts`; Modify: `step.ts`, `actions.ts`, `state.ts`
- Test: `packages/sim/test/water.test.ts`

**Interfaces:**
- Produces:

```ts
export type WaterLabel = 'clear' | 'cloudy' | 'dirty' | 'foul'
export interface WaterReading {
  label: WaterLabel; tempC: number
  kit: { nh3: 0|0.25|0.5|1|2|4|8; no2: 0|0.25|0.5|1|2|5; no3: 0|5|10|20|40|80|160 }  // làm tròn xuống bậc gần nhất như bộ test thật
  cycled: boolean                                               // bacteria >= 0.9
  nextWaterChangeOkAtMs: number | null
}
export function readWater(design: TankDesign, state: SimState): WaterReading
```
- `createSimState`: `relaxed` → `bacteria = 1`; `realistic` → `bacteria = 0.02`.
- Thay nước: tối thiểu cách nhau **3 giờ** mô phỏng; nếu sớm hơn thì `applyAction` trả `warnings: [{code:'water-change-cooldown', …}]` và không đổi state.

- [ ] **Step 1: Viết test hỏng**

```ts
it('new realistic tank cycles: ammonia, then nitrite, then nitrate', () => {
  const d = makeDesign({ mode: 'realistic' })
  let s = createSimState(d, cat, 0, { neon: 6 })
  const day1 = run(d, s, 24).state
  expect(day1.water.nh3).toBeGreaterThan(0.5)
  const peakNo2 = maxOver(d, s, 96, st => st.water.no2)
  expect(peakNo2).toBeGreaterThan(0.5)
  const r = run(d, s, 96)
  expect(readWater(d, r.state).cycled).toBe(true)
  expect(r.state.water.nh3).toBeLessThan(0.25)
  expect(r.state.water.no2).toBeLessThan(0.25)
  expect(r.state.water.no3).toBeGreaterThan(5)
  expect(r.events.some(e => e.type === 'cycle-complete')).toBe(true)
})
it('relaxed tank is cycled from the start', () => {
  const d = makeDesign({ mode: 'relaxed' })
  const r = run(d, createSimState(d, cat, 0, { neon: 6 }), 24)
  expect(r.state.water.nh3).toBeLessThan(0.25)
})
it('tap water without conditioner adds chlorine stress', () => {
  const d = makeDesign({ mode: 'realistic' }); const s = cycledState(d, { neon: 6 })
  const bad = applyAction(d, cat, s, { type: 'water-change', fraction: 0.3, conditioned: false }, s.simTimeMs)
  expect(bad.events.map(e => e.type)).toContain('chlorine-stress')
  const good = applyAction(d, cat, s, { type: 'water-change', fraction: 0.3, conditioned: true }, s.simTimeMs)
  expect(good.state.water.chlorine).toBe(0)
})
it('siphon removes most waste; water change dilutes nitrate', () => { /* siphon: waste giảm >= 70%; thay 30%: no3 giảm ~30% */ })
it('water change has a 3-hour cooldown', () => { /* gọi 2 lần liên tiếp → lần 2 có warning water-change-cooldown, state giữ nguyên */ })
it('labels follow waste and nitrogen', () => { /* waste cao → cloudy rồi dirty rồi foul, mỗi lần đổi nhãn có event tương ứng */ })
it('heater, chiller and fan pull temperature', () => {
  /* env.roomTempC = 33: không thiết bị → tempC > 31 sau 12h; fan → thấp hơn ~2°C; chiller → <= 27.
     env.roomTempC = 20: heater → >= 25. */
})
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/sim test water` → FAIL.
- [ ] **Step 3:** Hiện thực trong `water.ts`. Cá và thức ăn thừa sinh NH3; vi sinh chuyển NH3 → NO2 → NO3 với tốc độ tỉ lệ `bacteria`; vi sinh lớn lên khi có NH3/NO2 và lọc chạy. Tinh chỉnh để bể Thực tế 6 con neon hoàn tất chu trình trong **2–4 ngày** mô phỏng (spec: "vài ngày thật"). Oxy giảm theo nhiệt độ và tải sinh học, tăng nhờ lọc và sủi.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 7: Sự sống — sức khỏe, chết, lớn, sinh sản, tua thời gian vắng mặt

**Files:**
- Modify: `packages/sim/src/life.ts`, `step.ts`
- Test: `packages/sim/test/life.test.ts`, `advance.test.ts`

**Interfaces:**
- Produces:

```ts
export const MAX_AWAY_DAYS = 14
export function advanceTo(design: TankDesign, catalog: Catalog, state: SimState, env: Env, nowMs: number):
  StepResult & { awayMs: number; capped: boolean }
```
- Sức khỏe giảm khi: NH3/NO2 cao, nhiệt độ ngoài `tempC` của loài, đói lâu, clo, oxy thấp. Hồi phục khi nước tốt và no.
- `realistic`: `health <= 0` → `fish-died`, xóa cá. `relaxed`: sức khỏe không xuống dưới 0.3, không bao giờ chết.
- Sinh sản: loài `livebearer`, có ≥ 2 con trưởng thành (`growth >= 1`), nước `clear`, đói trung bình < 0.45 → mỗi ngày mô phỏng có xác suất sinh 1–3 con (`growth = 0.4`). Không vượt giới hạn dựng hình 120 (Task 8).
- Lớn: `growth` tăng tới 1 trong khoảng **3 ngày**, chậm một nửa khi `hungry`.

- [ ] **Step 1: Viết test hỏng**

```ts
it('realistic: fish die in sustained high ammonia; relaxed: they never die', () => { /* bể không lọc, không thay nước 7 ngày */ })
it('livebearers breed in good conditions, deterministically by seed', () => { /* guppy 4, cho ăn mỗi 8h, 10 ngày → có fish-born; chạy lại cùng seed → cùng số cá */ })
it('egg layers do not breed in the tank', () => { /* neon 10, 10 ngày → không có fish-born */ })
it('babies grow up in about 3 days, slower when hungry', () => {})
it('advanceTo caps away time at 14 days', () => {
  const d = makeDesign({ mode: 'relaxed' }); const s = createSimState(d, cat, 0, { neon: 6 })
  const r = advanceTo(d, cat, s, ENV, 30 * 86_400_000)
  expect(r.capped).toBe(true)
  expect(r.state.simTimeMs - s.simTimeMs).toBe(14 * 86_400_000)
  expect(r.state.lastRealMs).toBe(30 * 86_400_000)
})
it('advanceTo handles clock going backwards', () => {
  const s = { ...createSimState(makeDesign(), cat, 0), lastRealMs: 10_000_000 }
  const r = advanceTo(makeDesign(), cat, s, ENV, 5_000)
  expect(r.state.simTimeMs).toBe(s.simTimeMs)
  expect(r.events).toEqual([])
  expect(r.state.lastRealMs).toBe(5_000)
})
it('14-day catch-up for 120 fish finishes under 1.5 s on CI', () => { /* đo performance.now() */ })
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/sim test` → FAIL ở 2 file mới.
- [ ] **Step 3:** Hiện thực. `advanceTo` chạy `step` với `SIM_STEP_SEC`; gộp các event giống nhau liên tiếp (ví dụ nhiều `fish-born` cùng loài trong một giờ thành một event có `count`).
- [ ] **Step 4:** Chạy lại → PASS.

### Task 8: Tương thích loài và sức chứa (A2)

**Files:**
- Create: `packages/sim/src/compat.ts`; Modify: `actions.ts` (gọi `checkAddition` trước khi `add-fish`)
- Test: `packages/sim/test/compat.test.ts`

**Interfaces:**
- Produces:

```ts
export const MAX_RENDERED_CREATURES = 120
// Warning, WarningCode: định nghĩa ở Task 5 (types.ts)
export function tankPh(design: TankDesign, catalog: Catalog): number      // aqua-soil 6.5, sand 7.2, gravel 7.0; mỗi decor raisesKH +0.2, tối đa +0.6
export function stockingCapacity(design: TankDesign, catalog: Catalog, state: SimState): { used: number; max: number; ratio: number }
export function checkAddition(design: TankDesign, catalog: Catalog, state: SimState, speciesId: string, count: number): Warning[]
```
- `block` ở cả hai chế độ: `render-cap` (vượt 120), `species-limit` (vượt `maxPerTank`), và chế độ Thư giãn khi `ratio > 3`.
- `block` chỉ ở Thực tế: `over-capacity` (`ratio > 1`), `cycle-not-ready` (`bacteria < 0.5`).
- Còn lại là `warn` (hoặc `info` cho `school-too-small`). Thông điệp tiếng Việt nằm ở `vi.ts` theo `code`, không nằm trong sim.

- [ ] **Step 1: Viết test hỏng**

```ts
it('warns tiger barb with long-finned fish', () => expect(codes(withStock({ betta: 1 }), 'tiger-barb', 5)).toContain('fin-nipper'))
it('warns predators with shrimp and assassin snail with other snails', () => {})
it('warns when a schooling fish is added below schoolMin', () => expect(codes(withStock({}), 'neon', 2)).toContain('school-too-small'))
it('limits male betta to one', () => expect(blocks(withStock({ betta: 1 }), 'betta', 1)).toContain('species-limit'))
it('realistic blocks adding fish before the cycle is ready', () => {})
it('realistic blocks over capacity; relaxed only warns until 3x', () => {})
it('relaxed mode still blocks above render cap', () => expect(blocks(withStock({ neon: 118 }, 'relaxed', { w: 120, d: 45, h: 45 }), 'neon', 5)).toContain('render-cap'))
it('applyAction refuses add-fish when any warning blocks', () => {})
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/sim test compat` → FAIL.
- [ ] **Step 3:** Hiện thực. `max` sức chứa = thể tích nước (L) × hiệu suất lọc (`bioCapacity`, không lọc = 0.4) chia một hằng số; `used` = tổng `bioload × growth`.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 9: Nội dung đầy đủ cho giai đoạn 1

**Files:**
- Modify: `packages/catalog/src/data/*.ts`
- Test: `packages/catalog/test/catalog.test.ts` (thêm test)

Danh sách **[Claude]** (tên, bố cục, phòng đều tự đặt, không trùng nuoica.com):

- **20 loài** (`id` — tên Việt — tên khoa học):
  `neon` Cá neon — *Paracheirodon innesi*; `rummy-nose` Cá mũi đỏ — *Hemigrammus bleheri*; `harlequin` Cá tam giác — *Trigonostigma heteromorpha*; `zebra-danio` Cá ngựa vằn — *Danio rerio*; `white-cloud` Cá bạch vân — *Tanichthys albonubes*; `guppy` Cá bảy màu — *Poecilia reticulata*; `platy` Cá platy — *Xiphophorus maculatus*; `molly` Cá bình tích — *Poecilia sphenops*; `betta` Cá betta (đực) — *Betta splendens*; `honey-gourami` Cá sặc mật — *Trichogaster chuna*; `angelfish` Cá ông tiên — *Pterophyllum scalare*; `ram` Cá phượng hoàng — *Mikrogeophagus ramirezi*; `panda-cory` Cá chuột panda — *Corydoras panda*; `bristlenose` Cá tì bà — *Ancistrus* sp.; `kuhli` Cá chạch culi — *Pangio kuhlii*; `tiger-barb` Cá tứ vân — *Puntigrus tetrazona*; `cherry-shrimp` Tép đỏ — *Neocaridina davidi*; `amano` Tép Amano — *Caridina multidentata*; `nerite-snail` Ốc nerite — *Neritina natalensis*; `assassin-snail` Ốc sát thủ — *Anentome helena*.
  Người làm điền số liệu (nhiệt độ, pH, kích thước…) từ nguồn uy tín, ghi `sources`, và để `reviewed: null`.
- **Thức ăn (4):** `flake` Cám nổi; `pellet` Viên chìm; `algae-wafer` Viên tảo; `bloodworm` Trùn chỉ đông lạnh.
- **Cây (≥ 12)** đủ các vị trí trồng, gồm ít nhất 2 rêu và 1 cây nổi; **đá và lũa (≥ 8)**, gồm `bang-leaf` Lá bàng khô (`kind: 'leaf'`).
- **10 bố cục:** `ha-long` Vịnh đá Hạ Long; `ruong-bac-thang` Ruộng bậc thang; `iwagumi-ba-da` Iwagumi ba đá; `tham-ha-lan` Thảm cây Hà Lan; `lua-rung-gia` Lũa rừng già; `rung-mua` Rừng mưa nhiệt đới; `dong-cat-trang` Dòng cát trắng; `vuon-reu-nano` Vườn rêu nano; `suoi-nuoc-den` Suối nước đen Amazon; `goc-betta-la-bang` Góc betta lá bàng.
- **6 phòng:** `phong-khach` Phòng khách; `phong-ngu` Phòng ngủ; `goc-lam-viec` Góc làm việc; `quan-ca-phe` Quán cà phê; `ban-cong-nha-pho` Ban công nhà phố; `hien-nha-vuon` Hiên nhà vườn.
- **Thiết bị:** 3 kiểu đèn (thanh LED, đèn kẹp, đèn treo), 5 màu (6500K, 8000K, 4000K, WRGB cho cây, xanh trăng cho đêm), 3 bộ lọc (`lọc treo`, `lọc thùng`, `lọc vi sinh` dạng mút), 3 kiểu kính, 3 tủ, 5 cỡ bể có sẵn (30×20×25, 45×27×30, 60×30×36, 90×45×45, 120×45×45).

- [ ] **Step 1: Viết test hỏng**

```ts
it('phase-1 content counts', () => {
  expect(catalog.species).toHaveLength(20); expect(catalog.layouts).toHaveLength(10); expect(catalog.rooms).toHaveLength(6)
  expect(catalog.plants.length).toBeGreaterThanOrEqual(12); expect(catalog.decor.length).toBeGreaterThanOrEqual(8)
})
it('every species has at least one source', () => catalog.species.forEach(s => expect(s.sources.length).toBeGreaterThan(0)))
it('every layout suggested stock passes checkAddition without blocks in a relaxed tank of its preset size', () => {})
it('catalog module stays under 60 KB gzipped', () => {})   // đo bằng zlib.gzipSync trên bản build esbuild của src/index.ts
```

- [ ] **Step 2:** `pnpm --filter @yellow-aqua/catalog test` → FAIL.
- [ ] **Step 3:** Điền dữ liệu. Bố cục là các `PlacedItem` với x/z chuẩn hóa; mỗi bố cục có ít nhất 6 mục và `suggestedStock` hợp lệ.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 10: Lưu trữ cục bộ và nhiều bể (A6)

**Files:**
- Create: `apps/web/src/storage/db.ts`, `repo.ts`, `memory-repo.ts`
- Test: `apps/web/test/storage.test.ts` (dùng `fake-indexeddb`)

**Interfaces:**
- Produces:

```ts
export interface TankSummary { id: string; name: string; mode: Mode; sizeCm: TankDesign['sizeCm']; updatedAt: number }
export interface JournalEntry extends SimEvent { id?: number; tankId: string }
export interface TankRepo {
  readonly persistent: boolean
  listTanks(): Promise<TankSummary[]>
  getTank(id: string): Promise<TankDesign | undefined>
  saveTank(d: TankDesign): Promise<void>            // chuẩn hóa NFC, trim, cắt name còn 40 ký tự
  deleteTank(id: string): Promise<void>              // xóa cả sim và nhật ký
  getSim(tankId: string): Promise<SimState | undefined>
  saveSim(s: SimState): Promise<void>
  appendJournal(tankId: string, events: SimEvent[]): Promise<void>   // giữ tối đa 200 mục mỗi bể
  listJournal(tankId: string, limit?: number): Promise<JournalEntry[]> // mới nhất trước, mặc định 50
  getSetting<T>(key: string, fallback: T): Promise<T>
  setSetting(key: string, value: unknown): Promise<void>
}
export async function openRepo(): Promise<TankRepo>          // Dexie "yellow-aqua" v1; lỗi → memory repo với persistent=false
export function newTankDesign(catalog: Catalog, opts: { name: string; mode: Mode; layoutId: string | null; presetId: string }, nowMs: number, seed: number): TankDesign
```
Setting keys: `activeTankId`, `quality`, `audio`, `autoMoments`, `theme`.

- [ ] **Step 1: Viết test hỏng** — lưu/đọc lại bể và sim; `deleteTank` xóa sạch; tên `"  Bể  của tôi  "` dạng NFD được lưu thành NFC đã trim; nhật ký cắt ở 200; **`falls back to memory repo`** (giả lập `indexedDB.open` ném lỗi → `persistent === false`, vẫn lưu/đọc được trong phiên); **`drops records that fail schema`** (chèn tay một bản ghi `v: 0` → `getTank` trả `undefined`, không ném lỗi).
- [ ] **Step 2:** `pnpm --filter web test storage` → FAIL.
- [ ] **Step 3:** Hiện thực; kiểm tra bản ghi đọc ra bằng zod (schema `TankDesign`/`SimState` đặt trong `repo.ts`).
- [ ] **Step 4:** Chạy lại → PASS.

### Task 11: Cảnh 3D — bể, nước, ánh sáng, phòng, mức chất lượng (A9)

**Files:**
- Create: `apps/web/src/tank3d/scene.ts`, `quality.ts`, `tank-mesh.ts`, `lighting.ts`, `room.ts`
- Test: `apps/web/test/quality.test.ts`, `apps/web/e2e/scene.spec.ts`

**Interfaces:**
- Produces:

```ts
export type Quality = 'low' | 'medium' | 'high'
export type MomentId = 'feeding-frenzy' | 'glass-curious' | 'shrimp-graze' | 'cory-sift' | 'pleco-night' | 'school-flash'   // khai báo ở đây, Task 13 hiện thực
export function pickInitialQuality(info: { dpr: number; cores: number; memoryGb?: number; mobile: boolean }): Quality
export class WebGLUnavailableError extends Error {}
export interface TankSceneOptions { quality: Quality; reducedMotion: boolean }
export interface TankScene {
  setDesign(design: TankDesign, catalog: Catalog): void
  syncLife(fish: FishIndividual[], food: SimState['food'], water: WaterReading): void   // Task 13 hiện thực phần cá
  setTimeOfDay(t: TimeOfDay): void
  setQuality(q: Quality): void
  setEditMode(on: boolean): void                                                        // Task 16
  playMoment(id: MomentId): boolean                                                     // Task 13
  onTapWater(cb: (x: number, z: number) => void): () => void
  onTapGlass(cb: () => void): () => void
  onItemSelect(cb: (uid: string | null) => void): () => void
  onItemChange(cb: (uid: string, patch: Partial<PlacedItem>) => void): () => void
  capture(): Promise<Blob>                                                              // PNG, ẩn giao diện
  fps(): number
  dispose(): void
}
export function createTankScene(canvas: HTMLCanvasElement, opts: TankSceneOptions): TankScene  // ném WebGLUnavailableError
export function timeOfDayAt(date: Date): TimeOfDay       // 5–10 morning, 10–15 noon, 15–18 afternoon, còn lại night
```
- Mức chất lượng: `low` = dpr 1, không bóng đổ, không caustics, cây instanced 50%; `medium` = dpr ≤ 1.5, caustics, không bóng đổ; `high` = dpr ≤ 2, bóng đổ, hạt lơ lửng.
- Gắn `window.__yellowAqua = { fps: () => scene.fps() }` (chỉ trên trang `/ho`). Query `?quality=` ghi đè lựa chọn.
- Mất context: lắng nghe `webglcontextlost` / `webglcontextrestored`, dựng lại toàn cảnh khi khôi phục.
- `reducedMotion` lấy từ `matchMedia('(prefers-reduced-motion: reduce)')`: tắt parallax, gợn nước chậm lại, khoảnh khắc tự động mặc định tắt.

- [ ] **Step 1: Viết test hỏng**
  - Unit: `pickInitialQuality({dpr:3,cores:8,memoryGb:8,mobile:true})` → `'medium'`; `({dpr:2,cores:4,memoryGb:3,mobile:true})` → `'low'`; desktop 8 nhân → `'high'`; `timeOfDayAt` theo 4 khung giờ.
  - E2E: `/ho` có `canvas`, ảnh chụp vùng bể không đồng một màu (đọc pixel từ screenshot, độ lệch chuẩn > 10); đổi `timeOfDay` sang `night` làm độ sáng trung bình giảm; **`shows fallback when WebGL is unavailable`**: chạy với `--disable-gpu --disable-software-rasterizer` (hoặc stub `getContext` trả null) → thấy chữ `t('webglUnavailable')`, không có lỗi chưa bắt trong console.
- [ ] **Step 2:** `pnpm --filter web test quality && pnpm --filter web e2e scene` → FAIL.
- [ ] **Step 3:** Hiện thực: kính (mép tùy `glassId`), mặt nước có gợn, nền theo `substrate`, tủ theo `cabinetId`, đèn theo `light` (kiểu, màu, độ sáng, bật/tắt), phòng dựng từ khối đơn giản + `palette` + `props`, camera nhìn thẳng có parallax nhẹ khi nghiêng/kéo (tắt khi `reducedMotion`).
- [ ] **Step 4:** Chạy lại cả hai lệnh, và `pnpm --filter web e2e budget` → PASS.

### Task 12: Hình dựng bằng code — cá, cây, đá, lũa

**Files:**
- Create: `apps/web/src/tank3d/procedural/fish.ts`, `plants.ts`, `hardscape.ts`
- Test: `apps/web/test/procedural.test.ts`

**Interfaces:**
- Produces:

```ts
export function buildFishGeometry(model: SpeciesModel, lengthCm: number, lod: 0 | 1 | 2): THREE.BufferGeometry   // có thuộc tính 'swim' cho shader uốn đuôi
export function fishMaterial(model: SpeciesModel): THREE.Material                                                  // một material dùng chung mỗi loài
export function buildPlant(plant: Plant, seed: number, quality: Quality): THREE.Object3D                            // cây cùng loại dùng InstancedMesh
export function buildDecor(decor: Decor, seed: number): THREE.Object3D
```

- [ ] **Step 1: Viết test hỏng** — mỗi `body` tạo geometry hợp lệ (không NaN, có bounding box); số đỉnh: LOD0 ≤ 600, LOD1 ≤ 250, LOD2 ≤ 80; `buildDecor` cùng `seed` cho cùng mảng vị trí đỉnh; `buildPlant` mức `low` có số instance ≤ một nửa mức `high`.
- [ ] **Step 2:** `pnpm --filter web test procedural` → FAIL.
- [ ] **Step 3:** Hiện thực. Thân cá là mặt tròn xoay theo hồ sơ `body`, vây là mặt phẳng uốn; màu và hoa văn vẽ bằng shader từ `colors`/`pattern` (không dùng ảnh texture). Đá: khối đa diện biến dạng bằng noise có seed. Lũa: chuỗi ống phân nhánh. Rêu và thảm cây: instancing.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 13: Hành vi bơi và "khoảnh khắc"

**Files:**
- Create: `apps/web/src/tank3d/life/boids.ts`, `critters.ts`, `moments.ts`; Modify: `scene.ts` (`syncLife`, `playMoment`)
- Test: `apps/web/test/boids.test.ts`, `moments.test.ts`

**Interfaces:**
- Produces:

```ts
export interface Vec3 { x: number; y: number; z: number }
export interface Bounds { min: Vec3; max: Vec3 }
export interface Agent { uid: string; speciesId: string; zone: Zone; pos: Vec3; vel: Vec3; size: number; schooling: boolean; resting: boolean }
export interface SteerParams { maxSpeed: number; maxForce: number; separation: number; alignment: number; cohesion: number; wallMargin: number }
export function zoneBand(zone: Zone, b: Bounds): [number, number]        // top: 70–100% chiều cao, mid: 25–75%, bottom: 0–25%
export function steer(a: Agent, neighbors: Agent[], b: Bounds, p: SteerParams, target?: Vec3): Vec3
// MomentId: khai báo ở Task 11 (tank3d/quality.ts hoặc scene.ts)
export function availableMoments(fish: FishIndividual[], catalog: Catalog, t: TimeOfDay): MomentId[]
```
- Đêm (`night` hoặc đèn tắt): cá tầng giữa/mặt chậm lại và nghỉ (`resting`), cá đáy và tì bà hoạt động nhiều hơn.
- Có thức ăn: cá bơi tới hạt gần nhất cùng tầng; tép và ốc bò trên nền và đá.
- Gõ kính: cá gần kính giật mình tản ra.
- Tự động: nếu setting `autoMoments` bật, mỗi 3–6 phút chọn ngẫu nhiên một khoảnh khắc khả dụng.

- [ ] **Step 1: Viết test hỏng** — tác tử sát tường nhận gia tốc hướng vào trong; tác tử ngoài dải tầng bị kéo về dải; cohesion kéo về tâm đàn; `steer` không trả NaN khi không có hàng xóm hoặc trùng vị trí; `availableMoments` có `cory-sift` chỉ khi có `panda-cory`, có `pleco-night` chỉ khi có `bristlenose` và `t === 'night'`.
- [ ] **Step 2:** `pnpm --filter web test boids moments` → FAIL.
- [ ] **Step 3:** Hiện thực. Dùng lưới không gian để tìm hàng xóm (≤ 120 tác tử). `syncLife` thêm/bớt cá theo `uid`, kích thước theo `growth`, cá sức khỏe thấp bơi chậm và nhạt màu.
- [ ] **Step 4:** Chạy lại → PASS; `pnpm --filter web perf` với bố cục `rung-mua` và 120 cá → ≥ 30 FPS.

### Task 14: Phiên chơi — Web Worker, vòng lặp, báo cáo "khi bạn vắng nhà"

**Files:**
- Create: `apps/web/src/session/protocol.ts`, `sim.worker.ts`, `useTankSession.ts`; `apps/web/src/ui/AwayDialog.tsx`, `StatusHud.tsx`
- Test: `apps/web/test/session.test.ts`

**Interfaces:**
- Consumes: `@yellow-aqua/sim` (`advanceTo`, `applyAction`, `readWater`, `checkAddition`), `TankRepo`.
- Produces:

```ts
export interface TankSession {
  design: TankDesign; sim: SimState; water: WaterReading
  awayReport: { awayMs: number; capped: boolean; events: SimEvent[] } | null
  persistent: boolean
  dispatch(action: Action): Promise<Warning[]>
  preview(speciesId: string, count: number): Warning[]       // tính đồng bộ trên luồng chính, cho UI
  updateDesign(patch: Partial<TankDesign>): void              // lưu sau 500 ms không đổi
  dismissAway(): void
}
export function useTankSession(tankId: string): TankSession | null      // null khi đang tải
```
- Worker: khi mở bể → `advanceTo(now)`; sau đó mỗi 1 giây thực gọi `advanceTo(now)`; gửi state mới về luồng chính; lưu sim tối đa mỗi 5 giây và khi `visibilitychange` sang ẩn.
- `AwayDialog` chỉ hiện khi vắng ≥ 30 phút và có event; nếu `capped` thì ghi "Chỉ tính 14 ngày gần nhất".
- `StatusHud`: giờ, nhiệt độ, mức đói chung, nhãn nước, huy hiệu "Chưa kiểm chứng" khi bể có loài `reviewed: null`, và cảnh báo "Dữ liệu sẽ không được lưu" khi `persistent === false`.

- [ ] **Step 1: Viết test hỏng** (chạy logic worker trực tiếp như một hàm, không cần Worker thật) — mở bể với sim lưu cách đây 10 giờ → `awayReport.awayMs ≈ 10h` và state đã tiến 10h; `dispatch(feed)` trả `[]` và sim có event `fed`; `dispatch(add-fish)` bị chặn trả `Warning` có `severity: 'block'` và state không đổi; nhật ký được ghi qua `appendJournal`.
- [ ] **Step 2:** `pnpm --filter web test session` → FAIL.
- [ ] **Step 3:** Hiện thực; lõi xử lý tách thành hàm thuần `handleMessage(ctx, msg)` để test, `sim.worker.ts` chỉ là lớp vỏ.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 15: Giao diện 1 — thanh công cụ, sinh vật, cho ăn, chăm bể

**Files:**
- Create: `apps/web/src/ui/TankApp.tsx`, `Dock.tsx`, `Drawer.tsx`, `UnverifiedBadge.tsx`, `panels/LifePanel.tsx`, `FeedPanel.tsx`, `CarePanel.tsx`; Modify: `apps/web/src/app/ho/page.tsx` (tải động `TankApp`, `ssr: false`)
- Test: `apps/web/test/panels-1.test.tsx`

**Interfaces:**
- Consumes: `TankSession`, `TankScene`, `t()`.
- `Dock` mục: Cá · Cho ăn · Chăm bể · Thủy cảnh · Tùy chỉnh · Bể của tôi · Khoảnh khắc · Chụp ảnh · Ẩn. Trên màn hình hẹp chỉ hiện biểu tượng + nhãn ngắn, cuộn ngang được.
- `LifePanel`: hai tab "Trong bể" và "Cửa hàng"; lọc theo nhóm và tầng nước; mỗi loài có tên Việt, tên khoa học, cỡ, tầng, số đang nuôi, nút +/−; trước khi thêm gọi `session.preview` và hiện cảnh báo (vàng = warn, đỏ = block kèm nút bị vô hiệu); thanh sức chứa `used/max`.
- `FeedPanel`: chọn thức ăn → chạm mặt nước để rắc (dùng `scene.onTapWater`), hoặc nút "Rắc ngay".
- `CarePanel`: nhãn nước, chất thải; nút "Hút phân"; "Thay nước" với thanh 10–50% và công tắc "Đã khử clo" (mặc định bật); "Đo nước" hiện kết quả bộ test và giải thích ngắn về chu trình nitơ (ở chế độ Thư giãn thêm câu "Bể này đã chạy vi sinh sẵn nên thả cá được ngay", theo spec A7); danh sách nhật ký.

- [ ] **Step 1: Viết test hỏng** (Testing Library, `TankSession` giả) — thêm `tiger-barb` khi có `betta` hiện cảnh báo rỉa vây; khi `preview` trả block thì nút + bị vô hiệu và có lý do; loài `reviewed: null` có nhãn "Chưa kiểm chứng"; "Thay nước" với công tắc khử clo tắt gửi `conditioned: false`; panel đóng bằng phím Esc và trả focus về nút trên Dock.
- [ ] **Step 2:** `pnpm --filter web test panels-1` → FAIL.
- [ ] **Step 3:** Hiện thực. Drawer là `dialog` có nhãn, bẫy focus, cuộn được, chừa `env(safe-area-inset-bottom)`.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 16: Giao diện 2 — thủy cảnh, tùy chỉnh, quản lý bể, chế độ chơi

**Files:**
- Create: `apps/web/src/ui/panels/ScapePanel.tsx`, `CustomizePanel.tsx`, `TanksPanel.tsx`; Create: `apps/web/src/tank3d/interaction.ts`
- Test: `apps/web/test/panels-2.test.tsx`, `apps/web/e2e/scape.spec.ts`

**Interfaces:**
- Consumes: `TankScene.setEditMode/onItemSelect/onItemChange`, `TankSession.updateDesign`, `TankRepo`, `newTankDesign`.
- `ScapePanel`: tab Tiền cảnh / Trung cảnh / Hậu cảnh / Rêu / Đá & lũa / Cây nổi; chạm một mục rồi chạm vào nền để đặt; khi đã chọn một vật: kéo ngang để dời, kéo dọc để đẩy sâu/kéo ra, chụm 2 ngón hoặc cuộn chuột để đổi cỡ (0.5–2), nút Lật, Xóa; "Khôi phục bố cục gốc" (hỏi xác nhận).
- `CustomizePanel`: Bố cục (đổi bố cục hỏi xác nhận vì thay toàn bộ vật), Đèn, Thiết bị, Bể & tủ (cỡ có sẵn hoặc tự nhập 20–150 cm), Phòng & giờ (Tự động theo giờ máy hoặc chọn tay).
- `TanksPanel`: danh sách bể; tạo bể mới (tên, cỡ, bố cục hoặc bể trống, chế độ **Thư giãn** mặc định / **Thực tế** kèm một câu giải thích); đổi tên; xóa (hỏi xác nhận); chuyển bể.
- Lần đầu mở app: tự tạo bể "Bể đầu tiên", chế độ Thư giãn, bố cục `ha-long`, thả sẵn `suggestedStock` (spec A7).

- [ ] **Step 1: Viết test hỏng** — tạo bể Thực tế trống: `LifePanel` chặn thêm cá với lý do chu trình chưa xong; đổi cỡ bể 60 → 30 cm làm sức chứa giảm; xóa bể đang mở chuyển sang bể còn lại; lần đầu mở app có đúng 1 bể Thư giãn với cá. E2E `scape.spec.ts`: vào chế độ thủy cảnh, đặt một cây, kéo nó, tải lại trang → vị trí được giữ.
- [ ] **Step 2:** `pnpm --filter web test panels-2 && pnpm --filter web e2e scape` → FAIL.
- [ ] **Step 3:** Hiện thực. Raycast lên mặt phẳng nền để đổi tọa độ chuột/ngón tay thành x,z chuẩn hóa.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 17: Âm thanh, chụp ảnh, khoảnh khắc, phím tắt, ẩn giao diện

**Files:**
- Create: `apps/web/src/audio/engine.ts`, `music.ts`, `sfx.ts`; `apps/web/src/ui/PhotoDialog.tsx`, `panels/MomentsPanel.tsx`, `panels/AudioWidget.tsx`, `shortcuts.ts`
- Test: `apps/web/test/music.test.ts`, `shortcuts.test.ts`, `apps/web/e2e/photo.spec.ts`

**Interfaces:**
- Produces:

```ts
export type TrackId = 'suoi-sang' | 'dan-tranh-chieu' | 'mua-dem'
export type EffectId = 'drop' | 'splash' | 'bubble' | 'tap' | 'shutter'
export interface AudioEngine {
  start(): Promise<void>                          // chỉ gọi sau thao tác của người dùng
  setTrack(id: TrackId | null): void; setVolume(v: number): void
  setAmbient(on: boolean): void; setEffects(on: boolean): void
  setEquipment(eq: TankDesign['equipment']): void // tiếng lọc, sủi, chiller tổng hợp
  play(e: EffectId): void; suspend(): void; dispose(): void
}
export function createAudioEngine(): AudioEngine
export function phrase(seed: number, bar: number, scale: 'pentatonic-vn' | 'major-pentatonic'): { midi: number; at: number; dur: number }[]
export const SHORTCUTS: Record<string, 'life'|'feed'|'care'|'scape'|'customize'|'tanks'|'moments'|'photo'|'hide'|'music'|'light'>
// c life · f feed · b care · a scape · t customize · y tanks · k moments · p photo · h hide · m music · l light
```
- Nhạc là nhạc sinh tự động bằng Web Audio: `dan-tranh-chieu` dùng âm gảy kiểu đàn tranh trên thang ngũ cung; `mua-dem` là tiếng mưa (noise lọc) + pad nhẹ; `suoi-sang` là tiếng nước chảy + chuông gió. Tự `suspend` khi tab ẩn.
- Chụp ảnh: `scene.capture()` → `PhotoDialog` với Tải ảnh (tên `yellow-aqua-<yyyyMMdd-HHmm>.png`), Chia sẻ (`navigator.share` với file, chỉ hiện khi `navigator.canShare` cho phép), Sao chép (Clipboard API).
- Phím tắt bỏ qua khi đang gõ trong ô nhập.

- [ ] **Step 1: Viết test hỏng** — `phrase` cùng seed trả cùng chuỗi, mọi nốt thuộc thang đã chọn; phím `f` mở FeedPanel nhưng gõ `f` trong ô tên bể thì không; e2e: bấm Chụp ảnh → hộp thoại có ảnh PNG kích thước > 0 và nút Tải ảnh tải về file `.png`; `MomentsPanel` chỉ liệt kê khoảnh khắc khả dụng.
- [ ] **Step 2:** `pnpm --filter web test music shortcuts && pnpm --filter web e2e photo` → FAIL.
- [ ] **Step 3:** Hiện thực.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 18: Nghiệm thu giai đoạn 1

**Files:**
- Create: `apps/web/e2e/phase1.spec.ts`

- [ ] **Step 1: Viết e2e** chạy trên cả project `mobile` và `small` (360×640):
  1. Mở `/ho` lần đầu → có bể Thư giãn với cá, thanh trạng thái hiện giờ, nhiệt độ, nước "Trong".
  2. Thêm 6 `neon` → số cá tăng; cho ăn → nhật ký có "Đã cho ăn".
  3. Tải lại trang → số cá và bể giữ nguyên.
  4. Giả lập vắng 10 giờ (`page.clock`) → hộp thoại "Khi bạn vắng nhà" xuất hiện.
  5. Tạo bể Thực tế trống → thêm cá bị chặn với lý do chu trình nitơ; "Đo nước" hiện kết quả.
  6. Ngắt mạng, tải lại → vẫn chơi được; mở lại mạng.
  7. Ở 360×640: mọi nút trên Dock nằm trong màn hình hoặc cuộn tới được; mọi panel cuộn tới được nút cuối cùng.
  8. Không có lỗi console chưa bắt trong suốt luồng.
- [ ] **Step 2:** `pnpm --filter web build && pnpm --filter web e2e` → sửa tới khi PASS toàn bộ.
- [ ] **Step 3:** `pnpm test && pnpm typecheck && pnpm lint` → PASS.
- [ ] **Step 4:** `pnpm --filter web e2e budget` → ≤ 3 MB; `pnpm --filter web perf` trên máy có GPU → ≥ 30 FPS ở `medium`. Ghi hai con số này vào báo cáo cuối giai đoạn.
- [ ] **Step 5:** Thử tay trên một điện thoại Android tầm trung thật qua `next start` + mạng LAN (hoặc bản Preview trên Vercel nếu chủ dự án đã liên kết). Ghi lại FPS và cảm nhận.
