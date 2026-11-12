# Kanban

Nguồn: [lộ trình](2026-11-12-roadmap-giai-doan-0-7.md) và kế hoạch giai đoạn 0–1.
Mỗi thẻ ship kèm test và đi qua 6 bước BA → Dev → Review → QC → PO → chờ OK (CLAUDE.md,
mục "Quy trình làm việc"). Chi tiết từng thẻ ở `tickets/K-xx.md` (mẫu: `tickets/_TEMPLATE.md`).
Bốc thẻ từ trên xuống trong cột **Cần làm**; thẻ có `chờ:` thì bỏ qua cho tới khi điều kiện
được gỡ.

Ưu tiên: **P0** chặn người dùng / lỗi chuẩn · **P1** sprint hiện tại · **P2** khi còn sức.
Cỡ: S ≤ 2 ngày · M 3–5 ngày · L > 1 tuần.

Ghi chú: K-01 → K-05 được code trước khi repo chuyển sang quy trình 6 bước (12/11/2026), nên
đã qua Review và QC (12/11/2026) và đang chờ PO nghiệm thu + OK của chủ dự án. Chưa có commit nào ngoài README.

## Đang làm

| ID | Việc | Ưu tiên | Cỡ | Bước hiện tại | Nguồn |
|---|---|---|---|---|---|
| K-01 | Nền móng: Next.js 16, PWA offline (service worker viết tay), e2e Playwright, kiểm tra ngân sách 3 MB + script đo FPS | P0 | S | Chờ OK | Plan Task 1–4 |
| K-02 | Tổ chức lại repo theo chuẩn trading-journal: `frontend/` + npm, features/, test cạnh code, CLAUDE.md, agents, skills, roadmap/kanban, Makefile, Vercel Services | P0 | S | Chờ OK | Yêu cầu chủ dự án 12/11 |
| K-03 | Engine: đói, cho ăn, tất định, không sửa state đầu vào | P0 | S | Chờ OK | Plan Task 5 |
| K-04 | Engine: nước — chu trình nitơ, clo, hút phân, thay nước (chờ 4 giờ), nhiệt độ, oxy, nhãn nước | P0 | M | Chờ OK | Plan Task 6 |
| K-05 | Engine: sức khỏe, chết (chế độ Thực tế), lớn, cá đẻ con sinh sản, tua thời gian vắng mặt (tối đa 10 ngày) | P0 | M | Chờ OK | Plan Task 7 |

## Cần làm (giai đoạn 1)

| ID | Việc | Ưu tiên | Cỡ | Nguồn | Xong khi |
|---|---|---|---|---|---|
| K-06 | Hệ thống giao diện theo chuẩn trading-journal: Tailwind v4 + shadcn/ui (new-york, lucide), `theme.css` + `bridge.css` + `index.css`, font Inter + JetBrains Mono, `data-theme` đặt trước khi vẽ, i18n i18next `{ vi, en }` một ngoặc, `styleguard.test.ts` | P0 | M | Yêu cầu chủ dự án 12/11 | styleguard xanh; shell + offline + budget e2e vẫn xanh |
| K-07 | Tương thích loài và sức chứa (A2) — gồm chặn `add-fish` ở 120 sinh vật (finding review K-03) | P1 | S | Plan Task 8 | test compat xanh |
| K-08 | Nội dung giai đoạn 1: 20 loài, ≥ 12 cây, ≥ 8 đá/lũa, 10 bố cục, 6 phòng, thiết bị | P1 | M | Plan Task 9 | `validateCatalog` = [] |
| K-09 | Lưu trữ cục bộ (Dexie) và nhiều bể (A6) | P1 | S | Plan Task 10 | test storage xanh, kể cả fallback bộ nhớ tạm |
| K-10 | Cảnh 3D: bể, nước, ánh sáng, phòng, mức chất lượng, fallback khi không có WebGL | P1 | M | Plan Task 11 | e2e scene + budget xanh |
| K-11 | Hình dựng bằng code: cá, cây, đá, lũa | P1 | M | Plan Task 12 | test procedural xanh |
| K-12 | Hành vi bơi và khoảnh khắc | P1 | M | Plan Task 13 | `make perf` ≥ 30 FPS với 120 cá |
| K-13 | Phiên chơi: Web Worker, vòng lặp, báo cáo "khi bạn vắng nhà" | P1 | S | Plan Task 14 | test session xanh |
| K-14 | Giao diện 1: thanh công cụ, sinh vật, cho ăn, chăm bể | P1 | M | Plan Task 15 | test panels-1 xanh |
| K-15 | Giao diện 2: thủy cảnh, tùy chỉnh, quản lý bể, chế độ chơi | P1 | M | Plan Task 16 | test panels-2 + e2e scape xanh |
| K-16 | Âm thanh tổng hợp, chụp ảnh, khoảnh khắc, phím tắt, ẩn giao diện | P1 | S | Plan Task 17 | test music/shortcuts + e2e photo xanh |
| K-17 | Nghiệm thu giai đoạn 1 (360×640, offline, vắng 10 giờ, bể Thực tế) | P0 | S | Plan Task 18 | e2e phase1 xanh, ≤ 3 MB, ≥ 30 FPS |

## Backlog

| ID | Việc | Ưu tiên | Cỡ | Nguồn |
|---|---|---|---|---|
| K-20 | Dọn engine sau review: đưa magic number ở `water.ts`/`life.ts`/`state.ts` vào `constants.ts`; gộp đoạn clamp và thang ngưỡng lặp (`hungerLabel`/`labelOf`); test độ nhạy cho hằng số chu trình nitơ (NH3 đỉnh 0,61 sát ngưỡng 0,5); test hiệu năng dùng đồng hồ thật dễ chập chờn trên CI | P2 | M | Review K-02..K-05 |
| K-21 | Đo lại ngân sách 3 MB và FPS với hồ 3D thật (hiện đo trang tạm 225 KB, đồng hồ FPS chưa có) | P1 | S | QC K-01 (gộp vào K-17) |
| K-18 | Cập nhật các đường dẫn file bên trong plan theo cấu trúc mới (spec đã chuyển vào `docs/superpowers/specs/`, plan đã có ghi chú đầu trang) | P2 | S | K-02 |
| K-19 | `backend/` Go + Docker Compose + `make test`/`lint` theo chuẩn trading-journal | P2 | M | Giai đoạn 2 |

## Chờ chủ dự án

| ID | Việc | Ghi chú |
|---|---|---|
| D1–D5 | Quyết định trong [lộ trình](2026-11-12-roadmap-giai-doan-0-7.md) | Đang chạy theo mặc định |
| OK | Duyệt K-01 → K-05 | Review + QC đã xong; chờ PO |
| Q1 | id catalog trộn slug tiếng Việt (`da-nui-xam`, `phong-khach`, `loc-thung`) với id loài tiếng Anh — quy tắc 9 coi id là định danh code | Giữ nguyên hay đổi toàn bộ sang tiếng Anh? |

## Xong

| ID | Việc | Ngày | Commit | Ghi chú |
|---|---|---|---|---|
| — | README + remote GitHub | 12/11/2026 | b1bba44 | Theo yêu cầu chủ dự án |
