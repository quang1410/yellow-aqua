# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Sản phẩm

Yellow Aqua: hồ thủy sinh 3D trên web (PWA) để thư giãn và học nuôi cá, kèm sổ tay cho bể thật
và cộng đồng thủy sinh Việt Nam. Thiết kế sản phẩm nằm ở
`docs/superpowers/specs/2026-11-12-yellow-aqua-design.md`, kế hoạch triển khai ở
`docs/superpowers/plans/`. Đọc cả hai trước khi code.

## Stack

- Frontend: Next.js 16 (App Router) + React 19 + TypeScript, Three.js, Dexie (IndexedDB), zod,
  Vitest, Playwright. Thư mục `frontend/`. Cài bằng **npm**, Node ghim ở `.nvmrc`.
- Backend: Go, chạy dạng Vercel Functions (region `sin1`), Postgres. Thư mục `backend/`,
  **bắt đầu từ giai đoạn 2** (giai đoạn 0–1 chỉ có frontend, mọi dữ liệu lưu trên máy).
- Deploy: Vercel Services (`vercel.json` ở gốc).
- Không dùng monorepo/pnpm workspace, không dùng react-three-fiber.

## Quy tắc bất di bất dịch

1. **`features/tank/engine` là module thuần** — cấm import React, Three.js, DOM, Dexie,
   `next/*`. Mọi hàm nhận state cũ, trả state mới; không sửa đầu vào. Test chạy trong Node.
2. **Mô phỏng tất định.** Mọi số ngẫu nhiên đi qua `state.rng` (mulberry32). Cùng seed + cùng
   chuỗi thao tác ⇒ cùng kết quả. Cấm `Math.random()` trong engine.
3. **Không sao chép nuoica.com.** Không dùng file, hình, âm thanh, tên bố cục, tên phòng hay
   **hằng số mô phỏng** của họ. Hằng số của mình nằm ở `engine/constants.ts`.
4. **Dữ liệu chăm sóc chưa duyệt phải gắn nhãn "Chưa kiểm chứng".** Loài/cây có
   `reviewed: null` thì mọi chỗ hiển thị thông tin chăm sóc phải hiện nhãn đó.
5. **Một nguồn dữ liệu loài**: `features/catalog`. Hồ ảo, bách khoa, cảnh báo tương thích
   đều đọc từ đây. Dữ liệu phải qua `validateCatalog` (test bắt buộc).
6. **Ngân sách hiệu năng**: lần tải đầu `/ho` ≤ 3 000 000 byte; ≥ 30 FPS ở chất lượng `medium`
   với CPU chậm 4 lần; tối đa 120 sinh vật được dựng hình trong một bể.
7. **Offline trước**: hồ ảo và dữ liệu loài phải chạy được khi mất mạng sau lần tải đầu
   (service worker viết tay `frontend/public/sw.js`).
8. **Chuỗi người dùng nhập được chuẩn hóa Unicode NFC** trước khi lưu.
9. **Code tiếng Anh, comment tiếng Việt.** Mọi định danh trong code — tên biến, hàm, kiểu,
   file, key JSON, route, message log/error, chuỗi test — viết bằng tiếng Anh. Comment và
   tài liệu (`docs/`, CLAUDE.md) viết bằng tiếng Việt.

   Ngoại lệ: **dữ liệu hiển thị cho người dùng** là tiếng Việt — tên loài, tên bố cục, text
   trên UI. Đó là dữ liệu, không phải định danh code.

## Theme

`docs/design/theme.css` do chủ sản phẩm cấp, là nguồn sự thật, **không sửa**. Component chỉ dùng
biến ngữ nghĩa (`--surface-*`, `--text-*`, `--border-*`, `--status-*`, `--primary`), không hardcode hex.
Dark mode qua `[data-theme="dark"]`. Theme tắt hết `shadow-*` — phân tầng bằng border và bậc surface.
Chữ lỗi dùng `text-loss`, chữ cảnh báo dùng `text-warn`.

Ngoại lệ có chủ đích: **màu trong cảnh 3D** (nước, cá, cây, đá, ánh đèn) là dữ liệu của
`features/catalog` và `features/tank/scene`, không phải màu giao diện, nên được ghi hex.

(Giao diện đang chuyển sang Tailwind v4 + shadcn/ui theo thẻ K-06; trước khi xong thẻ đó,
`frontend/src/styles/tokens.css` là bộ biến tạm.)

## i18n

Mọi chuỗi hiển thị nằm ở `frontend/src/i18n/`, tiếng Việt là chính.

**Nội suy dùng MỘT ngoặc: `{n}`, không phải `{{n}}`.** Test nào chạm chuỗi có tham số phải
assert kết quả đã nội suy, không chỉ assert khoá.

## Testing (bắt buộc)

Mỗi feature ship kèm test trong cùng lần thay đổi, không dời sang phase sau. Test đặt cạnh code
(`*.test.ts(x)`); helper dùng chung ở `frontend/src/test/`; e2e ở `frontend/e2e/*.spec.ts`.
Trước khi báo "xong" phải chạy test thật và báo kết quả thật. Sửa bug thì thêm regression test
fail trên code cũ, pass trên code mới.

Chạy: `make test-fe` (typecheck + unit test + build) · `make e2e` · `make perf` (cần GPU).

## Roadmap

Giai đoạn 0 nền móng → 1 hồ ảo → 2 chia sẻ (bắt đầu backend Go) → 3 bách khoa → 4 sổ tay bể
thật → 5 tài khoản & cộng đồng (blog cá nhân) → 6 bản đồ & sự kiện. Lộ trình ở
`docs/roadmap/2026-11-12-roadmap-giai-doan-0-7.md`, việc hằng ngày theo `docs/roadmap/kanban.md`.

## Quy trình làm việc (bắt buộc)

Chủ dự án duyệt từng bước; Claude không tự chuyển sang ticket mới khi chưa được OK.

### Đầu phiên — khi được hỏi "đang làm tới đâu / định hướng thế nào"

Đọc `docs/roadmap/kanban.md`, `git status`, `git log` gần nhất và các ticket đang dở trong
`docs/roadmap/tickets/`, rồi báo cáo ngắn:

1. Đã xong gì (kể từ lần báo trước), commit nào.
2. Đang dở gì, đang ở bước nào của quy trình dưới đây.
3. Đề xuất ticket tiếp theo (lấy từ trên xuống trong cột **Cần làm**) và lý do.
4. Việc đang chờ chủ dự án (cột **Chờ chủ dự án**, quyết định D1–D4 trong lộ trình).

Rồi **dừng, chờ OK**. Không code trước khi được duyệt.

### Mỗi ticket đi qua 6 bước, theo thứ tự

Tên ở cột "Ai" là tên file trong `.claude/agents/` (vd `product-manager` →
`.claude/agents/product-manager.md`). Gọi bằng Agent tool với agent có `name:` trong file đó;
nếu phiên chưa nạp agent thì dùng `general-purpose` và bảo nó đọc file persona trước khi làm.
BA, QC và PO chỉ đọc và chạy test, không sửa code.

| # | Bước | Ai | Đầu ra |
|---|---|---|---|
| 1 | **BA check** | `product-manager` + `design-ux-architect` (ticket có UI thêm `design-ui-designer`) | `docs/roadmap/tickets/K-xx.md`: bối cảnh, phạm vi / ngoài phạm vi, tiêu chí nghiệm thu đo được, edge case, quy tắc CLAUDE.md bị chạm. Chỗ mơ hồ thì hỏi chủ dự án, không tự đoán |
| 2 | **Dev** | Claude | Code theo TDD: test fail trước, rồi sửa. Chạy test thật (mục Testing) |
| 3 | **Review** | skill `code-review` (so với nhánh `main`, spec là file ticket) | Sửa hết finding đúng; finding bỏ qua phải ghi lý do vào ticket |
| 4 | **QC/QA** | `testing-reality-checker` + `testing-evidence-collector`; thêm `testing-accessibility-auditor` (UI), `testing-performance-benchmarker` (3D/bundle), `testing-api-tester` (API, từ giai đoạn 2) khi liên quan | Đối chiếu từng tiêu chí nghiệm thu với bằng chứng (output test, file:dòng). Fail thì quay lại bước 2 |
| 5 | **PO nghiệm thu** | `product-manager` | Kết luận đạt / chưa đạt theo tiêu chí ở bước 1, ghi vào ticket |
| 6 | **Báo cáo + lên plan tiếp** | Claude | Báo chủ dự án: làm gì, kết quả test, kết quả review/QC/PO, rủi ro còn lại; đề xuất ticket kế tiếp. **Dừng, chờ OK** |

### Khi chủ dự án OK

- Commit ticket đó (một ticket một commit, message tiếng Việt kiểu Conventional Commits,
  vd `feat(engine): chu trình nitơ (K-04)`). Push / mở PR chỉ khi được yêu cầu.
- Kanban: chuyển thẻ sang cột **Xong**, ghi ngày, commit hash, ghi chú ngắn.
- Ticket file: đánh dấu `Trạng thái: Xong`.
- Thẻ mới phát sinh trong lúc làm (finding chưa sửa, ý tưởng) → thêm vào **Cần làm** hoặc
  **Backlog** kèm mức ưu tiên, không âm thầm làm luôn.
