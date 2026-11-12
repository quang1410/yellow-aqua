# Yellow Aqua — Thiết kế sản phẩm & lộ trình

- Ngày: 2026-11-12
- Trạng thái: **bản nháp, chờ duyệt**
- Tên dự án: **Yellow Aqua** **[Bạn]**.

Ký hiệu trong tài liệu:
- **[Bạn]**: điều bạn đã nói hoặc đã chọn.
- **[Claude]**: lựa chọn của Claude, bạn chưa đồng ý; cứ sửa nếu không hợp.
- **[Quan sát]**: rút ra từ lần quét nuoica.com (trình duyệt + REA) ngày 2026-11-12.

---

## 1. Ý định và lý do

**[Bạn]** Làm một sản phẩm "cải tiến hơn, phục vụ nhiều hơn" nuoica.com, và hỗ trợ cộng đồng thủy sinh tại Việt Nam.

**[Quan sát]** nuoica.com cho thấy người Việt thích một hồ cá 3D thư giãn trên trình duyệt. Nhưng nó là đồ chơi một người chơi:
- chỉ một bể, lưu trong một trình duyệt, không tài khoản, không đồng bộ;
- không chia sẻ được bể (chỉ chia sẻ ảnh);
- không nối với bể cá thật ngoài đời;
- không có nội dung kiến thức, không có cộng đồng;
- chỉ tiếng Việt, không cài đặt được (không PWA), tải khoảng 9 MB.

**[Claude]** Yellow Aqua có ba vai trò, theo thứ tự ưu tiên:
1. **Hồ ảo** để thư giãn và *học* nuôi cá trước khi tốn tiền mua bể thật.
2. **Sổ tay cho bể thật**: ghi nhật ký, thông số nước, nhắc việc, tính chi phí bằng VND.
3. **Ngôi nhà chung** cho cộng đồng: khoe bể, viết blog, hỏi đáp, thi bố cục, tìm cửa hàng, sự kiện.

Ba nhóm người dùng **[Claude]**:
- **Người mới**: muốn thử trước, sợ cá chết, cần lộ trình rõ ràng.
- **Người đang nuôi**: cần công cụ theo dõi bể và chỗ hỏi khi cá bệnh.
- **Người chơi lâu năm, cửa hàng, trại cá**: muốn khoe tác phẩm, dạy lại, được tìm thấy.

## 2. Mục tiêu, ngoài phạm vi, và "thất bại nếu"

### Mục tiêu **[Claude]**
- G1. Hồ ảo đẹp và mượt ngang nuoica.com, nhưng **dạy được nhiều hơn**: chu trình nitơ, tương thích loài, khí hậu và nước máy Việt Nam.
- G2. Chia sẻ một bể ảo bằng **một đường link**, không cần tài khoản, gửi được qua Zalo và Facebook.
- G3. Theo dõi một bể thật trên điện thoại, kể cả khi không có mạng.
- G4. Bách khoa thủy sinh tiếng Việt đáng tin, dùng chung dữ liệu với hồ ảo.
- G5. Cộng đồng có kiểm duyệt: thư viện bể, hỏi đáp, cuộc thi, blog cá nhân.
- G6. Danh bạ cửa hàng, trại cá, sự kiện theo tỉnh thành.

### Ngoài phạm vi bản đầu **[Claude]**
- Mua bán có thanh toán, ship cá sống (rủi ro lừa đảo và pháp lý).
- Livestream, chat thời gian thực, nhiều người cùng chỉnh một bể.
- App trên App Store / Google Play (dùng PWA trước).
- Giao diện tiếng Anh (chỉ chuẩn bị sẵn để dịch sau).
- Thông báo qua Zalo OA (cần đăng ký và tốn phí; dùng web push trước).

### Thất bại nếu (dù chạy được) **[Claude]**
- Sao chép hình ảnh, tên gọi, bố cục, âm thanh hay thương hiệu của nuoica.com.
- Lời khuyên chăm sóc **sai** khiến cá thật của người dùng chết.
- Chậm hoặc giật trên điện thoại Android tầm trung với mạng 4G.
- Cộng đồng bị spam, lừa đảo, hoặc toxic vì thiếu kiểm duyệt.
- Dùng chiêu ép người dùng (khóa tính năng ép quay lại, đếm ngược giả, quảng cáo che màn hình).
- Bán hoặc lộ dữ liệu cá nhân.

## 3. Ràng buộc

- **Di động trước** **[Claude]**: máy mục tiêu là Android tầm trung (khoảng 4 GB RAM) trên 4G.
  - Lần tải đầu của hồ ảo ≤ 3 MB trước khi xem được bể; tải thêm dần sau.
  - ≥ 30 khung hình/giây ở mức chất lượng "Vừa" trên máy mục tiêu.
  - Cách đo **[Claude]**: kiểm tra tự động chạy Chrome giả lập điện thoại với CPU chậm 4 lần và mạng "4G chậm"; trước mỗi lần phát hành, thử thêm trên một máy Android tầm trung thật (máy của bạn hoặc người quen).
- **Tiếng Việt trước**: font hiển thị đủ dấu (ví dụ Be Vietnam Pro), tên loài có cả tên miền Bắc, miền Nam và tên khoa học.
- **Chạy khi mất mạng**: hồ ảo và sổ tay bể thật hoạt động offline (PWA).
- **Tài sản gốc**: mọi mô hình 3D, ảnh, âm thanh phải tự làm, mua bản quyền, hoặc giấy phép mở (CC0 / CC-BY). Không dùng lại file của nuoica.com.
- **Nội dung chăm sóc phải được duyệt** bởi người nuôi có kinh nghiệm trước khi công khai.
- **Pháp lý (cần người hiểu luật kiểm tra trước giai đoạn cộng đồng)** **[Claude]**:
  - Nghị định 147/2024/NĐ-CP: theo hiểu biết của Claude, mạng xã hội phục vụ người dùng Việt Nam phải xác thực tài khoản bằng số điện thoại Việt Nam. Điều này ảnh hưởng trực tiếp cách đăng nhập.
  - Luật Bảo vệ dữ liệu cá nhân (hiệu lực 2026-01-01) và Nghị định 13/2023/NĐ-CP: cần chính sách quyền riêng tư, đồng ý rõ ràng, cho xóa tài khoản.
  - Claude không phải luật sư; các điểm trên phải được xác minh lại.
- **Chi phí** **[Claude, giả định]**: bắt đầu bằng gói miễn phí của các dịch vụ; chỉ trả tiền khi có người dùng thật.
  - Lưu ý: gói Hobby (miễn phí) của Vercel chỉ dành cho dự án **phi thương mại**. Nếu Yellow Aqua kiếm tiền (quảng cáo, thu phí cửa hàng), cần gói Pro trả phí.
  - SMS gửi mã OTP tốn phí theo từng tin.

## 4. Cách làm (công nghệ)

**[Bạn]** Frontend Next.js, backend Go, deploy trên Vercel. Các chi tiết còn lại là **[Claude]**.

| Phần | Lựa chọn | Ai chọn | Ghi chú |
|---|---|---|---|
| Frontend | Next.js (App Router), TypeScript | [Bạn] | Bách khoa, blog, thư viện bể render phía server để Google tìm thấy; hồ ảo và sổ tay là trang chỉ chạy trong trình duyệt |
| PWA, offline | Service worker (ví dụ Serwist) lưu sẵn trang hồ ảo, sổ tay và dữ liệu loài | [Claude] | Next.js không tự chạy offline, phải cấu hình riêng |
| 3D | Three.js trong client component, tải động (`ssr: false`), không dùng react-three-fiber | [Claude] | Không render 3D trên server; tránh React làm giật cảnh |
| Mô phỏng | Package TypeScript thuần, không đụng DOM | [Claude] | Kiểm thử được, chạy được trong Web Worker |
| Lưu cục bộ | IndexedDB (qua Dexie) | [Claude] | Bể, nhật ký, ảnh vẫn còn khi offline |
| Backend | Go, chạy dạng Vercel Functions (runtime Go), region Singapore `sin1` | [Bạn] Go + Vercel; [Claude] region | Mỗi API là một hàm serverless: không giữ kết nối lâu, không WebSocket; việc định kỳ (nhắc việc, tổng kết cuộc thi) dùng Vercel Cron |
| Cơ sở dữ liệu | Postgres (Neon qua Vercel Marketplace), Go dùng driver pgx | [Claude] | Vercel không tự chạy database; cần connection pooling vì hàm serverless mở kết nối liên tục |
| Đăng nhập | Go tự làm OTP qua SMS (nhà cung cấp SMS Việt Nam) + JWT; liên kết thêm Google | [Claude] | Đáp ứng xác thực số điện thoại; mỗi tin SMS tốn phí |
| Ảnh | Vercel Blob; ảnh được nén và giảm cỡ trên máy trước khi tải lên | [Claude] | Ảnh bể, ảnh blog, ảnh nhật ký |
| Bản đồ | Leaflet + OpenStreetMap | [Claude] | Miễn phí, không cần khóa API |
| Thống kê | Umami hoặc Plausible, không tracker quảng cáo | [Claude] | Phù hợp mục "thất bại nếu" |
| Kiểm thử | Vitest (mô phỏng, frontend); `go test` (backend); Playwright (luồng người dùng trên khung điện thoại) | [Claude] | Mô phỏng phải tất định để test được |

Nguyên tắc **[Claude]**:
- **Offline trước, đồng bộ sau**: mọi thứ lưu máy trước; khi đăng nhập thì đồng bộ lên server.
- **Một nguồn dữ liệu loài**: hồ ảo, bách khoa, công cụ tương thích đọc chung một bộ dữ liệu.
- **Mô phỏng tất định**: cùng trạng thái + cùng hạt giống ngẫu nhiên → cùng kết quả. Nhờ vậy link chia sẻ mở ra giống hệt và test được.

## 5. Tính năng theo phân hệ

### A. Hồ ảo

**A0. Ngang bằng nuoica.com** — có đủ các nhóm tính năng sau, nhưng **nội dung và hình ảnh tự làm**:
bố cục mẫu, thả và bớt cá/tép/ốc, kéo thả cây/đá/lũa, cho ăn nhiều loại thức ăn, độ đói, độ bẩn của nước, hút phân, thay nước, nhật ký "khi bạn vắng nhà", đèn (loại, màu, độ sáng, bật/tắt), thiết bị (lọc, sưởi, làm lạnh, CO2, sủi khí), kiểu kính và tủ, phòng và giờ trong ngày, nhạc nền và âm thanh, các "khoảnh khắc" hành vi cá, chụp ảnh, phím tắt, ẩn giao diện.

Số lượng nội dung ở bản đầu **[Claude]**: 10 bố cục, 20 loài, 6 phòng. Thêm dần sau, không cần đuổi kịp con số 30 bố cục / 43 loài / 18 phòng ngay.

**Cải tiến so với nuoica.com:**
- **A1. Chu trình nitơ.** Bể mới chưa có vi sinh: amoniac → nitrit → nitrat. Thả cá quá sớm thì cá bị sốc. Có bộ test nước giả lập để người chơi tự đo. Thời gian được tăng tốc (vài ngày thật thay vì vài tuần).
- **A2. Kiểm tra tương thích.** Cảnh báo trước khi thả: nhiệt độ và pH không hợp, cá rỉa vây (ví dụ cá tứ vân với cá betta), cá ăn tép, ốc sát thủ ăn ốc khác, bể quá tải so với thể tích.
- **A3. Khí hậu Việt Nam.** Chọn thành phố → nhiệt độ phòng thay đổi theo mùa (mùa nóng miền Nam nước có thể lên 30–32°C). Cá chịu nóng kém sẽ yếu đi; dạy dùng quạt, chiller, chọn loài hợp khí hậu.
- **A4. Mất điện.** Sự kiện cúp điện: lọc và sủi ngừng, oxy giảm. Dạy chuẩn bị máy sủi chạy pin.
- **A5. Nước máy.** Thay nước bằng nước máy chưa khử clo làm cá stress; dạy dùng thuốc khử clo hoặc phơi nước.
- **A6. Nhiều bể.** Tạo nhiều bể với kích thước tính bằng cm, có sẵn các cỡ phổ biến ở Việt Nam (nano 30 cm, 60×30×36, 90, 120).
- **A7. Hai chế độ chơi.**
  - *Thư giãn*: cá không chết, chỉ nhắc nhẹ. Cho người chỉ muốn ngắm.
  - *Thực tế*: cá có thể bệnh và chết, dùng để học trước khi nuôi thật.
  - Bỏ giới hạn "20 con mỗi ngày ghé thăm" của nuoica.com. Thay bằng giới hạn hợp lý theo thể tích bể và chu trình nitơ (chỉ ở chế độ Thực tế).
  - **[Claude]** Người mới bắt đầu ở chế độ *Thư giãn* với một **bể đã chạy vi sinh sẵn**, nên thả cá được ngay trong lần ghé đầu. Chu trình nitơ chỉ chặn việc thả cá ở chế độ *Thực tế*, khi người chơi tự tạo bể trống. Chế độ Thư giãn vẫn hiển thị chỉ số nước và có bài học ngắn "vì sao bể này thả cá được ngay".
- **A8. Bộ "Cá Việt".** Bố cục suối miền núi Việt Nam với loài bản địa, cùng các dòng betta và bảy màu được lai tạo tại Việt Nam. Danh sách loài phải được chuyên gia duyệt.
- **A9. Mức chất lượng.** Thấp / Vừa / Cao, tự chọn theo máy; có "chế độ nhẹ" cho máy yếu.

### B. Chia sẻ không cần tài khoản

- **B1. Link chia sẻ.** Toàn bộ thiết kế bể được nén vào phần `#` của đường link, không cần server. Mở link → xem bể ở chế độ chỉ xem, có nút "Sao chép bể này về máy".
  - **[Claude]** Phần sau `#` không bao giờ tới server, nên Zalo và Facebook chỉ hiện ảnh xem trước chung, và link dài trông như bị lỗi trong khung chat. Vì vậy giai đoạn 2 thêm một **dịch vụ link ngắn nhỏ** (một hàm Go trên Vercel, lưu vào Postgres): lưu thiết kế bể, trả về link ngắn có ảnh xem trước riêng của bể đó. Link `#` dài vẫn giữ làm phương án dự phòng khi offline.
- **B2. Thẻ chia sẻ.** Ảnh dọc có mã QR, kích thước bể, danh sách loài, ước tính chi phí bằng VND.
- **B3. Video ngắn.** Quay đoạn 10 giây dạng dọc 9:16 ngay trong trình duyệt để đăng TikTok, Reels, Zalo.
- **B4. Nút chia sẻ** Zalo, Facebook, Messenger, sao chép link.
- **B5. Nhúng.** Đoạn mã iframe để blog hoặc cửa hàng nhúng bể vào trang của họ.

### C. Sổ tay bể thật

- **C1. Hồ sơ bể:** kích thước, lọc, đèn, nền, CO2, ngày setup, ảnh.
- **C2. Nhật ký:** thay nước, vệ sinh lọc, bón phân, tỉa cây, thêm cá, cá chết, kèm ảnh theo thời gian.
- **C3. Thông số nước:** pH, KH, GH, NH3, NO2, NO3, nhiệt độ, TDS. Có biểu đồ và cảnh báo khi vượt ngưỡng của các loài đang nuôi.
- **C4. Nhắc việc:** thông báo web push; xuất lịch dạng `.ics` cho Google Calendar.
- **C5. Máy tính nhanh:**
  - thể tích nước thực (trừ nền và đá);
  - liều khử clo, liều phân nước;
  - tiền điện mỗi tháng của đèn, lọc, chiller theo **giá điện bậc thang** (người dùng nhập giá, có giá mẫu);
  - danh sách mua sắm và tổng chi phí bằng VND.
- **C6. Thử trước trên hồ ảo:** dựng bản ảo của bể thật để thử bố cục mới trước khi làm thật.

### D. Bách khoa thủy sinh tiếng Việt

- **D1. Trang loài cá, tép, ốc:** tên Việt (nhiều tên địa phương), tên khoa học, kích thước, nhiệt độ, pH, tầng nước, tính cách, độ khó, khả năng sinh sản, giá tham khảo (khoảng giá + ngày cập nhật), ảnh.
- **D2. Trang cây, rêu, đá, lũa:** ánh sáng, CO2, tốc độ mọc, vị trí trồng; đá có làm tăng độ cứng nước không.
- **D3. Bệnh thường gặp:** đốm trắng, nấm, thối vây… Triệu chứng, cách xử lý, và câu nhắc "nếu không chắc, hãy hỏi người có kinh nghiệm".
- **D4. Lộ trình người mới:** "30 ngày set bể đầu tiên", từng bước, nối với hồ ảo để tập trước.
- **D5. Từ điển thuật ngữ:** cycle, Walstad, Iwagumi, sủi CO2, KH…
- **D6. Đóng góp và duyệt:** người dùng đề xuất sửa; người kiểm duyệt duyệt trước khi hiện.

### E. Cộng đồng (cần tài khoản)

- **E1. Tài khoản:** OTP số điện thoại Việt Nam; liên kết thêm Google, Facebook. Đăng nhập chỉ cần cho tính năng cộng đồng; hồ ảo và sổ tay vẫn dùng được khi chưa đăng nhập.
- **E2. Trang cá nhân:** bể ảo, bể thật, huy hiệu (chăm bể đều, bố cục được yêu thích…).
- **E3. Thư viện bể:** lọc theo phong cách, kích thước, tỉnh thành; thích, lưu, bình luận, "sao chép bố cục".
- **E4. Hỏi đáp:** đăng câu hỏi kèm ảnh, gắn thẻ loài và triệu chứng, chọn câu trả lời đúng; huy hiệu "người có kinh nghiệm".
- **E5. Cuộc thi hằng tháng:** thi bố cục hồ ảo theo chủ đề; mỗi tài khoản đã xác thực một phiếu. Thi ảnh bể thật để sau.
- **E6. Kiểm duyệt:** báo cáo, hàng chờ cho người kiểm duyệt, lọc từ khóa, giới hạn tần suất đăng, khóa tài khoản; nội quy bằng tiếng Việt.
- **E7. Thông báo trong app:** có người thích, trả lời, kết quả thi.
- **E8. Blog cá nhân** **[Bạn yêu cầu]**: mỗi người có trang blog riêng tại `/u/<tên>/blog`.
  - Soạn bài trên điện thoại: chữ có định dạng, nhiều ảnh, lưu nháp (cả khi offline), hẹn giờ đăng.
  - Gắn vào bài: bể ảo (hiện thành khung xem 3D ngay trong bài), bể thật, trang loài trong bách khoa.
  - **Chuỗi bài "Nhật ký setup bể"**: biến nhật ký bể thật (C2) thành loạt bài công khai theo thời gian, chọn mục nào được hiện.
  - Theo dõi tác giả, bình luận, thả tim, lưu bài; thẻ chủ đề (Iwagumi, nuôi tép, betta, bệnh cá…).
  - Bài viết render phía server, có ảnh xem trước khi chia sẻ lên Zalo/Facebook, Google tìm thấy được.
  - Cùng luật kiểm duyệt với E6; bài của tài khoản mới cần duyệt trước khi hiện công khai.

### F. Bản đồ và sự kiện

- **F1. Danh bạ:** cửa hàng, trại cá, trại cây theo tỉnh thành, trên bản đồ; giờ mở cửa, số Zalo/điện thoại, đánh giá. Chủ cửa hàng có thể "nhận" trang của mình.
- **F2. Lịch sự kiện:** gặp mặt, hội chợ cá cảnh, cuộc thi.
- **F3. (Sau này) Góc trao đổi cây tỉa:** ít rủi ro hơn mua bán cá sống; xem xét sau giai đoạn 6.

### G. Nền tảng chung

- PWA cài được, chạy offline, tự cập nhật.
- Chuẩn bị đa ngôn ngữ (tiếng Việt là chính).
- Truy cập: phím tắt, giảm chuyển động, nhãn cho trình đọc màn hình, chế độ tối.
- Ngân sách hiệu năng được kiểm tra tự động (kích thước tải, FPS).

## 6. Mô hình mô phỏng

**[Quan sát]** nuoica.com dùng một vòng mô phỏng theo bước thời gian, và tua nhanh phần thời gian người dùng vắng mặt (tối đa 14 ngày, bước 10 phút). Đây là cách làm phổ biến của thể loại này.

**[Claude]** Yellow Aqua tự xây mô hình riêng, **không chép hằng số** của nuoica.com:
- Biến trạng thái mỗi bể: độ đói từng loài, chất thải, NH3, NO2, NO3, quần thể vi sinh, oxy, nhiệt độ, clo, tảo.
- Nhu cầu từng loài lấy từ bộ dữ liệu loài chung (mục D).
- Chạy theo bước thời gian cố định; tua nhanh khi người dùng quay lại, có giới hạn số ngày.
- Ngẫu nhiên có hạt giống (seed) để tái tạo được.
- Chế độ Thư giãn và Thực tế dùng chung mô hình, chỉ khác ngưỡng và hậu quả.
- Hằng số được tinh chỉnh cùng người nuôi có kinh nghiệm để hành vi "giống thật vừa đủ", không cần chính xác khoa học.

## 7. Lộ trình

Mỗi giai đoạn tự dùng được, không phải chờ giai đoạn sau. Kích thước là tương đối: S (nhỏ), M (vừa), L (lớn). Thứ tự là **[Claude]**.

| GĐ | Nội dung | Cỡ | Xong khi |
|---|---|---|---|
| 0 | Nền móng: dự án, PWA, hệ thống giao diện, dữ liệu loài mẫu, kiểm tra hiệu năng tự động | S | Trang trống cài được, chạy offline, test chạy được |
| 1 | Hồ ảo bản đầu: A0, A1, A2, A5, A6, A7, A9; 10 bố cục, 20 loài, 6 phòng | L | Đạt ngân sách hiệu năng trên máy mục tiêu; nuôi một bể qua chu trình nitơ được |
| 2 | Chia sẻ: B1–B5, kèm dịch vụ link ngắn | S | Mở link trên máy khác thấy đúng bể đó; dán link vào Zalo hiện ảnh của chính bể đó |
| 3 | Bách khoa: D1–D5 cho mọi loài trong hồ ảo; A3, A4, A8 | M | Mọi loài có trang đã được duyệt |
| 4 | Sổ tay bể thật: C1–C6, chỉ lưu trên máy | M | Ghi nhật ký và nhận nhắc việc khi offline |
| 5 | Tài khoản và cộng đồng: E1–E8 (gồm blog cá nhân), đồng bộ dữ liệu, D6 | L | Đã qua kiểm tra pháp lý; có người kiểm duyệt; thư viện, blog, hỏi đáp, cuộc thi đầu tiên chạy |
| 6 | Bản đồ và sự kiện: F1, F2 | M | Có danh bạ ở ít nhất Hà Nội và TP.HCM |
| 7 | Sau này: F3, Zalo OA, tiếng Anh, bọc thành app cửa hàng | — | Quyết định lại sau giai đoạn 6 |

Sau khi bạn duyệt tài liệu này, bước tiếp theo là **kế hoạch chi tiết từng việc cho giai đoạn 0 và 1**. Kế hoạch đó dừng mỗi việc ở "test chạy qua", không có bước commit.

## 8. Thế nào là thành công

Ngưỡng kỹ thuật **[Claude]**: như mục 3 (≤ 3 MB, ≥ 30 FPS, chạy offline).

Chỉ số sản phẩm cần theo dõi **[Claude]**; **con số mục tiêu là của bạn đặt**:
- Tỷ lệ người quay lại sau 7 ngày.
- Số link chia sẻ được mở bởi người khác.
- Số bể thật được ghi nhật ký đều mỗi tuần.
- Số câu hỏi được trả lời trong 24 giờ.

## 9. Nội dung và tài sản

- **Mô hình 3D, ảnh, âm thanh:** đây là phần tốn công nhất của giai đoạn 1. Cần quyết định ai làm (xem mục 11).
- **Dữ liệu loài:** viết lại bằng tiếng Việt từ nhiều nguồn và kinh nghiệm thực tế. Mỗi nguồn dùng phải kiểm tra giấy phép (một số cơ sở dữ liệu cá chỉ cho phép dùng phi thương mại).
- **Giá tham khảo:** luôn là khoảng giá, có ngày cập nhật; về sau cho cộng đồng góp.

## 10. Để người làm tự quyết

- Cấu trúc mã nguồn, tên file, phiên bản thư viện cụ thể.
- Phong cách thiết kế chi tiết trong khuôn khổ "thư giãn, gần thiên nhiên, khác nuoica.com".
- Giá trị cụ thể của các hằng số mô phỏng.
- Cách nén dữ liệu bể vào link.
- Chọn Umami hay Plausible.

## 11. Câu hỏi còn mở

Người đọc kiểm tra tài liệu nêu 4 câu chỉ bạn trả lời được. Trong lúc chờ, kế hoạch dùng **mặc định của Claude** dưới đây; đổi mặc định nào thì kế hoạch đổi theo.

| # | Câu hỏi | Mặc định đang dùng | Nếu đổi thì ảnh hưởng gì |
|---|---|---|---|
| 1 | Ai làm mô hình 3D, ảnh, âm thanh; có ngân sách không? | Claude dựng hình low-poly bằng code; âm thanh CC0 miễn phí | Mua gói asset hoặc thuê họa sĩ: đẹp hơn nhưng tốn tiền, nặng hơn, giai đoạn 1 lâu hơn |
| 2 | Ai duyệt dữ liệu chăm sóc cá; giai đoạn 1 có chờ duyệt không? | Không chờ; dữ liệu chưa duyệt được ghi rõ "chưa kiểm chứng" | Có người duyệt: thêm quy trình duyệt từ giai đoạn 0, chỉ hiện dữ liệu đã duyệt |
| 3 | Dự án cá nhân, kinh doanh hay cộng đồng phi lợi nhuận? | Cá nhân, phi thương mại | Kinh doanh: chỉ được dùng dữ liệu và hình có giấy phép thương mại, cần gói Vercel Pro, cần pháp nhân lo phần pháp lý |
| 4 | Ai làm, có hạn chót không? | Bạn + Claude, không hạn chót | Có hạn chót: cắt bớt A0 cho bản đầu; có nhóm: chia việc theo mảng |

Các điểm người đọc nêu đã được Claude tự quyết và ghi vào tài liệu: chế độ bắt đầu và chu trình nitơ (A7), cách đo hiệu năng (mục 3), ảnh xem trước của link chia sẻ (B1).
