# VNBUSARCHIVE-Compatible HoyuShot Plugin

Plugin trắc sắc học và chuẩn hóa màu sắc theo quy chuẩn **VNBUSARCHIVE** dành cho ứng dụng **HoyuShot Camera**.

Áp dụng quy tắc cân bằng trắng bề mặt xám trung tính, giới hạn dải bão hòa màu an toàn và nén dải màu mềm (soft-knee gamut compression) chống bệt chi tiết highlight.

---

## Các tính năng chính

### 1. Khử ám màu trên bề mặt trung tính (Neutral Gray Surface Tint Balancer)
Phân tích các mẫu bề mặt trung tính ($35 \le Y \le 230$, độ bão hòa thấp) để tự động phát hiện và triệt tiêu 4 loại ám màu thường gặp:
- **Ám vàng / Nóng màu**: Phát hiện khi $R - B > 22$ và $G - B > 10$. Tự động giảm kênh Đỏ (Red) và bù đắp kênh Lam (Blue).
- **Ám xanh / Lạnh màu**: Phát hiện khi $B - R > 20$. Tự động bù kênh Đỏ và giảm bớt ám xanh dương từ bầu trời hoặc vùng bóng râm.
- **Ám tím / Hồng (Magenta)**: Phát hiện khi $R - G > 18$ và $B - R > 12$. Tăng cường kênh Lục (Green) để khử hiện tượng lệch màu tím hồng trên cảm biến.
- **Ám xanh lá**: Phát hiện khi $G - R > 18$ và $G - B > 12$. Cân đối lại kênh Đỏ và Lam khi bị phản xạ sắc xanh từ cây cối xung quanh.

### 2. Khóa dải bão hòa màu ($10\% \le avgSat \le 52\%$)
- Chống hiện tượng rực màu nhân tạo (quá bão hòa) bằng cách nén độ bão hòa khi $avgSat > 52\%$.
- Phục hồi độ tươi tự nhiên khi cảnh chụp bị nhợt nhạt hoặc rửa trôi màu do sương mù, khói bụi khi $avgSat < 10\%$.

### 3. Chống bệt màu Highlight (Gamut Highlight Compression)
- Bảo toàn chi tiết thân xe, bề mặt kim loại sơn bóng và các vùng highlight phản xạ ánh sáng mạnh khi có kênh màu vượt quá $4\%$ số điểm ảnh chạm ngưỡng 255.

---

## Hướng dẫn cài đặt trên HoyuShot

1. Mở ứng dụng **HoyuShot** trên thiết bị của bạn.
2. Nhấn vào biểu tượng **Cài đặt (bánh răng)** > Chọn **Advanced Settings**.
3. Cuộn xuống mục **`04 // PLUGINS & EXTENSIONS`**.
4. Nhấn **`+ INSTALL PLUGIN`**.
5. Dán đường dẫn kho lưu trữ (Git URL):
   ```
   https://github.com/hoyuuna/VNBUSARCHIVE-Compatible-HoyuShot-Plugin.git
   ```
6. Nhấn **`CLONE & INSTALL`**.
7. Nhấn nút **`SETTINGS`** trên thẻ plugin để tùy chỉnh các tính năng khử ám màu, khóa độ bão hòa hoặc bù trừ phơi sáng EV!
