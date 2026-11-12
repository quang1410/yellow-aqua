# Lộ trình Yellow Aqua — giai đoạn 0 đến 7

Nguồn: spec `docs/superpowers/specs/2026-11-12-yellow-aqua-design.md` (mục 7) và kế hoạch
`docs/superpowers/plans/2026-11-12-yellow-aqua-phase-0-1.md`. Việc hằng ngày theo
[kanban](kanban.md).

## Các giai đoạn

| GĐ | Nội dung | Cỡ | Xong khi |
|---|---|---|---|
| 0 | Nền móng: dự án, PWA offline, hệ thống giao diện, dữ liệu loài mẫu, kiểm tra hiệu năng | S | Trang cài được, chạy offline, test chạy được |
| 1 | Hồ ảo: mô phỏng (đói, nitơ, clo, nhiệt độ, sinh sản), tương thích loài, nhiều bể, 2 chế độ, 10 bố cục, 20 loài, 6 phòng | L | Đạt ngân sách hiệu năng trên máy mục tiêu; nuôi được một bể qua chu trình nitơ |
| 2 | Chia sẻ: link bể, thẻ chia sẻ, video 9:16, link ngắn (backend Go đầu tiên) | S | Mở link trên máy khác thấy đúng bể; dán vào Zalo hiện ảnh của bể |
| 3 | Bách khoa tiếng Việt + khí hậu VN, mất điện, bộ Cá Việt | M | Mọi loài có trang đã được duyệt |
| 4 | Sổ tay bể thật (lưu trên máy) | M | Ghi nhật ký và nhận nhắc việc khi offline |
| 5 | Tài khoản, cộng đồng, blog cá nhân, đồng bộ | L | Đã qua kiểm tra pháp lý; có người kiểm duyệt |
| 6 | Bản đồ cửa hàng/trại cá, lịch sự kiện | M | Có danh bạ Hà Nội và TP.HCM |
| 7 | Sau này: trao đổi cây tỉa, Zalo OA, tiếng Anh, app cửa hàng | — | Quyết định lại sau giai đoạn 6 |

## Quyết định chờ chủ dự án

Đang chạy theo mặc định trong ngoặc; đổi thì kế hoạch đổi theo (spec mục 11).

- **D1. Hình 3D, ảnh, âm thanh do ai làm, có ngân sách không?** (Claude dựng low-poly bằng code; âm thanh tổng hợp bằng Web Audio)
- **D2. Ai duyệt dữ liệu chăm sóc cá; giai đoạn 1 có chờ duyệt không?** (Không chờ; gắn nhãn "Chưa kiểm chứng")
- **D3. Dự án cá nhân, kinh doanh hay cộng đồng?** (Cá nhân, phi thương mại — hợp gói Vercel Hobby)
- **D4. Ai làm, có hạn chót không?** (Chủ dự án + Claude, không hạn chót)
- **D5. Theme riêng cho Yellow Aqua?** (Đang dùng nguyên `theme.css` của trading-journal làm nguồn sự thật)
