# 13 - Đặc tả hệ màu Public Website Đông Tây y kết hợp

Trạng thái: **tài liệu nghiên cứu + đặc tả thực thi**.

Phạm vi: hệ màu, phong cách thị giác, hero trang chủ, navbar, section public, trạng thái nội dung, token màu CSS và checklist nghiệm thu giao diện public website.

Không nằm trong phạm vi tài liệu này: schema database, Supabase Auth/Postgres/Storage, Admin CRUD, nội dung y khoa chi tiết, SEO kỹ thuật, migration dữ liệu.

## 1. Mục tiêu

Website cần truyền tải đồng thời 2 lớp nhận diện:

1. **Tây y**: sạch, tin cậy, chuyên môn, có cơ sở khoa học, dễ đọc.
2. **Đông y/thảo dược**: cân bằng, ấm, gần gũi, có cảm giác chăm sóc dài hạn và phòng ngừa.

Vấn đề của các hướng màu trước:

- Nếu dùng quá nhiều xanh navy/blue, giao diện dễ thành "bệnh viện lạnh", thiếu tinh thần Đông y.
- Nếu dùng quá nhiều vàng/nâu/kem, giao diện dễ thành "spa/luxury/trà thảo mộc", yếu tín hiệu y khoa.
- Nếu phủ màu quá mạnh lên ảnh hero, ảnh mất thật và làm người dùng có cảm giác bị tô màu.
- Nếu để chữ trực tiếp trên ảnh, độ đọc phụ thuộc từng ảnh và không ổn định.

Mục tiêu nâng cấp:

- Giữ navy làm màu chuyên môn chính.
- Thêm xanh thảo mộc/sage để đại diện Đông y.
- Dùng vàng thảo mộc rất tiết chế cho điểm nhấn nhỏ.
- Giữ nền tổng thể sáng, sạch, không nặng màu.
- Mọi text quan trọng phải đạt contrast tốt theo WCAG.

## 2. Nguồn tham khảo

### 2.1. Healthcare design systems

- NHS Design System dùng `NHS Blue` làm màu nhận diện chính và có bảng màu hỗ trợ gồm green, aqua-green, yellow, warm yellow, grey. NHS cũng nhấn mạnh không được override màu core vì ảnh hưởng nhận diện và accessibility.  
  Nguồn: https://service-manual.nhs.uk/design-system/styles/colour

- Cleveland Clinic dùng blue làm màu chính và green làm nhóm màu y khoa/khoa học. Cách phối này củng cố mô hình "blue = trust/medical, green = health/science".  
  Nguồn: https://my.clevelandclinic.org/onbrand/guidelines/design/choosing-a-logo

### 2.2. Accessibility

- WCAG yêu cầu text thường đạt tối thiểu `4.5:1`, text lớn đạt tối thiểu `3:1`. Khi chữ nằm trên ảnh, cần xét vùng ảnh ngay phía sau chữ, không chỉ xét màu text với một màu nền giả định.  
  Nguồn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast

### 2.3. Đông y và màu thảo mộc

Về mặt cảm nhận thị giác, Đông y không nên được biểu diễn bằng đỏ/vàng quá mạnh trên website y khoa hiện đại. Các màu hợp hơn:

- Sage/herbal green: thảo dược, cân bằng, chăm sóc.
- Warm ivory: giấy, phòng khám ấm, tránh cảm giác sterile quá mức.
- Herbal gold: truyền thống, kinh nghiệm, điểm nhấn. Chỉ dùng ít.
- Dark ink/navy: kiến thức, chuyên môn, tin cậy.

## 3. Chiến lược màu đề xuất

### 3.1. Nguyên tắc tổng thể

```text
Tây y tạo nền tin cậy.
Đông y tạo độ ấm và bản sắc.
Không để Đông y lấn át tín hiệu y khoa.
Không để Tây y làm giao diện quá lạnh.
```

Phân bổ màu nên theo tỷ lệ:

```text
60% nền sáng: trắng, ivory, sage rất nhạt
25% màu chuyên môn: navy, medical blue
10% màu thảo mộc: jade, sage
5% màu nhấn truyền thống: herbal gold
```

### 3.2. Palette chuẩn

| Token | Hex | Vai trò | Cách dùng |
|---|---:|---|---|
| `--public-navy` | `#0A3151` | Màu thương hiệu chính, Tây y/chuyên môn | Navbar, footer, heading chính, CTA chính, text trên nền sáng |
| `--public-medical-blue` | `#005EB8` | Blue y khoa phụ | Link, active state, trạng thái thông tin, icon phụ nếu cần |
| `--public-herbal-jade` | `#2F6F5E` | Đông y/thảo dược | Badge chủ đề, icon nhỏ, section nhấn nhẹ, trạng thái tích cực |
| `--public-soft-sage` | `#C9E2D0` | Thảo mộc mềm | Kicker hero, nền tag, divider mềm, icon nền sáng |
| `--public-warm-ivory` | `#F7F4EC` | Nền ấm | Section nền xen kẽ, card nền nhẹ, quote block |
| `--public-herbal-gold` | `#D7B56D` | Truyền thống/điểm nhấn | Gạch nhấn, icon nhỏ, hover accent, không dùng nhiều cho body text |
| `--public-ink` | `#1F2A2E` | Text chính trung tính | Body text dài trên nền trắng/ivory |
| `--public-muted` | `#4F5F64` | Text phụ | Mô tả, meta, caption |
| `--public-border` | `#DDE7E2` | Border nhẹ | Divider, card border, input border |
| `--public-white` | `#FFFFFF` | Nền/trên navy | Text trên nền navy/scrim, button đảo màu |

### 3.3. Contrast tham khảo

Các cặp màu nên ưu tiên:

| Foreground | Background | Contrast xấp xỉ | Nhận xét |
|---|---|---:|---|
| `#0A3151` | `#FFFFFF` | `13.37:1` | Rất tốt cho heading/body |
| `#C9E2D0` | `#0A3151` | `9.72:1` | Rất tốt cho kicker trên navy |
| `#D7B56D` | `#0A3151` | `6.82:1` | Tốt, nhưng cảm giác luxury hơn sage |
| `#F7F4EC` | `#0A3151` | `12.16:1` | Rất tốt cho text sáng trên navy |
| `#2F6F5E` | `#FFFFFF` | `5.91:1` | Đủ tốt cho text thường |
| `#7A4E2A` | `#FFFFFF` | `7.12:1` | Dùng rất ít nếu cần màu dược liệu/nâu |
| `#1F2A2E` | `#F7F4EC` | `12.88:1` | Rất tốt cho body trên ivory |

## 4. Quy tắc sử dụng màu theo khu vực

### 4.1. Navbar

Hiện trạng tốt:

```text
Nền: #0A3151
Text: #FFFFFF
Button liên hệ: nền trắng, text navy
```

Quy tắc:

- Navbar phải cố định chiều cao, không co lại khi scroll.
- Không đổi màu navbar theo scroll.
- Không dùng gradient trên navbar.
- Active nav item dùng underline trắng hoặc sage rất nhạt, không dùng vàng mạnh.
- Logo text giữ trắng để độ nhận diện cao.

Khuyến nghị token:

```css
background: var(--public-navy);
color: var(--public-white);
border-bottom: 1px solid rgba(255, 255, 255, 0.10);
```

### 4.2. Hero trang chủ

Mục tiêu hero:

- Ảnh vẫn là trọng tâm.
- Chữ đọc rõ trên nhiều ảnh khác nhau.
- Không có "ô trắng" hoặc "mảng xanh đặc" thô.
- Lớp phủ phải chạy toàn chiều cao ảnh từ trái sang phải và fade dần.

Quy tắc hero:

- Dùng navy scrim mờ, không dùng block/card sau chữ.
- Text chính dùng trắng.
- Kicker có thể dùng `soft sage` hoặc `herbal gold` tùy định vị.
- Với định vị Đông Tây y kết hợp, ưu tiên `soft sage`.
- Scrim không nên vượt quá `0.50` opacity ở điểm đậm nhất nếu ảnh đã tối.
- Nếu ảnh rất sáng, có thể tăng điểm đầu lên `0.56`, nhưng phải kiểm tra lại ảnh.

Spec khuyến nghị:

```css
.public-hero-scrim {
  background: linear-gradient(
    90deg,
    rgba(10, 49, 81, 0.46) 0%,
    rgba(10, 49, 81, 0.32) 32%,
    rgba(10, 49, 81, 0.16) 56%,
    rgba(10, 49, 81, 0.06) 76%,
    rgba(10, 49, 81, 0) 100%
  );
  backdrop-filter: blur(4px);
}
```

Màu chữ hero khuyến nghị:

```css
.public-hero-title {
  color: #FFFFFF;
}

.public-hero-kicker {
  color: #C9E2D0;
}

.public-hero-quote {
  color: rgba(255, 255, 255, 0.90);
}
```

Nếu muốn giữ cảm giác truyền thống mạnh hơn, có thể dùng:

```css
.public-hero-kicker {
  color: #D7B56D;
}
```

Nhưng với hướng Đông Tây y cân bằng, `#C9E2D0` là phương án nên chốt.

### 4.3. Section nền sáng

Các section như "Bộ ghi chú chống lão hóa", danh sách bài viết, sách, sản phẩm nên dùng nền sáng:

```text
Nền chính: #FFFFFF
Nền xen kẽ: #F7F4EC hoặc #EEF5F1
Heading: #0A3151
Body: #1F2A2E hoặc #4F5F64
Border: #DDE7E2
```

Quy tắc:

- Không dùng nền beige/ivory quá nhiều liên tiếp.
- Không dùng quá nhiều biến thể xanh khiến web thành một màu.
- Section y khoa nghiêm túc dùng trắng.
- Section mang tính thảo dược/giới thiệu/phòng ngừa có thể dùng ivory hoặc sage rất nhạt.

### 4.4. Cards và danh sách nội dung

Card nội dung nên yên tĩnh, đọc nhanh:

```text
Card background: #FFFFFF
Card border: #DDE7E2
Title: #0A3151 hoặc #1F2A2E
Meta/category: #2F6F5E
Hover accent: #D7B56D hoặc #2F6F5E
```

Không nên:

- Dùng shadow quá mạnh.
- Dùng gradient trong card.
- Dùng nền xanh đậm cho card lặp lại nhiều lần.
- Dùng vàng cho toàn bộ title.

### 4.5. CTA

CTA chính:

```text
Nền: #0A3151
Text: #FFFFFF
Hover: #082943 hoặc #123E62
```

CTA phụ:

```text
Nền: #F7F4EC
Text: #0A3151
Border: #DDE7E2
```

CTA thảo mộc:

```text
Nền: #2F6F5E
Text: #FFFFFF
Hover: #285F51
```

Chỉ dùng CTA thảo mộc khi hành động liên quan đến nội dung phòng ngừa, thói quen, dinh dưỡng, thảo dược hoặc tài liệu Đông y.

## 5. Token CSS đề xuất

Nên gom màu vào CSS variables để tránh rải hex khắp code:

```css
.public-site {
  --public-navy: #0A3151;
  --public-medical-blue: #005EB8;
  --public-herbal-jade: #2F6F5E;
  --public-soft-sage: #C9E2D0;
  --public-warm-ivory: #F7F4EC;
  --public-herbal-gold: #D7B56D;
  --public-ink: #1F2A2E;
  --public-muted: #4F5F64;
  --public-border: #DDE7E2;
  --public-white: #FFFFFF;
}
```

Sau khi có token, các class public nên đọc từ biến:

```css
.public-section-title {
  color: var(--public-navy);
}

.public-body {
  color: var(--public-ink);
}

.public-muted-text {
  color: var(--public-muted);
}
```

## 6. Lộ trình triển khai

### Phase 1 - Chốt hero và navbar

1. Navbar cố định chiều cao, không đổi padding khi scroll.
2. Hero dùng navy scrim mờ, chữ trắng.
3. Kicker hero đổi sang `#C9E2D0` nếu chốt hướng Đông Tây y rõ hơn.
4. Test desktop, iPad dọc, điện thoại dọc.

File liên quan:

```text
src/components/layout/Navbar.tsx
src/pages/Home.tsx
src/index.css
```

### Phase 2 - Chuẩn hóa token màu

1. Thêm token trong `.public-site`.
2. Thay các hex public lặp lại bằng biến CSS.
3. Giữ Admin UI độc lập, không để token public ảnh hưởng admin.
4. Không refactor layout ngoài phạm vi màu.

File liên quan:

```text
src/index.css
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/pages/Home.tsx
src/pages/Notes.tsx
src/pages/Books.tsx
src/pages/Products.tsx
src/pages/About.tsx
```

### Phase 3 - Áp dụng cho toàn public website

1. `/notes`: category/meta dùng jade, title navy/ink.
2. `/books`: catalog dùng ivory/sage rất nhẹ cho vùng nền phụ.
3. `/products`: giữ tín hiệu y khoa, không làm quá thương mại.
4. `/about`: có thể dùng ivory/sage để thể hiện con người và phương pháp kết hợp.
5. Footer giữ navy, thêm border/heading sage nếu cần.

### Phase 4 - QA màu và accessibility

1. Kiểm tra contrast bằng công cụ browser hoặc script.
2. Kiểm tra ảnh hero sáng/tối khác nhau.
3. Kiểm tra desktop 1440/1920.
4. Kiểm tra iPad dọc 768x1024.
5. Kiểm tra mobile 390x844 và 430x932.
6. Không để text quan trọng nằm trên vùng ảnh quá sáng nếu không có scrim.

## 7. Checklist nghiệm thu

### Hero

- [ ] Ảnh hero vẫn nhìn thật, không bị phủ màu quá nặng.
- [ ] Chữ hero đọc rõ trên ảnh sáng.
- [ ] Scrim fade dần, không giống một khung/card đặt lên ảnh.
- [ ] Kicker thể hiện được tinh thần Đông Tây y.
- [ ] Tên bác sĩ là điểm nhìn chính.
- [ ] Quote đọc được nhưng không tranh vai với tên.

### Navbar

- [ ] Navbar fixed top.
- [ ] Navbar không co/giãn khi scroll.
- [ ] Logo, nav item và nút liên hệ không nhảy vị trí.
- [ ] Mobile menu icon giữ vị trí ổn định.

### Toàn site

- [ ] Không có section nào bị một màu xanh/navy quá nặng.
- [ ] Ivory/sage chỉ dùng để làm mềm, không làm web thành màu kem.
- [ ] Gold chỉ dùng như điểm nhấn nhỏ.
- [ ] Text body không dùng màu quá nhạt.
- [ ] Link/CTA có hover rõ.
- [ ] Public và Admin không bị trộn style.

## 8. Prompt thực thi ngắn

```text
Thực thi nâng cấp hệ màu public website theo `docs/13-public-brand-color-east-west-medicine-visual-system.md`: chuẩn hóa palette Đông Tây y kết hợp với navy y khoa, sage/jade thảo mộc, ivory ấm và gold tiết chế; giữ Admin không đổi; cố định navbar không co khi scroll; hero dùng navy scrim mờ fade trái sang phải, chữ trắng, kicker ưu tiên soft sage; gom màu public thành CSS variables trong `.public-site`; áp dụng dần cho Home/Navbar/Footer và các trang public; chạy `npm run build`, `docker compose up -d --build --force-recreate`, kiểm tra desktop/mobile bằng Playwright và báo cáo file đã sửa.
```

## 9. Quyết định khuyến nghị

Chốt palette:

```text
Primary: #0A3151
Secondary herbal: #2F6F5E
Hero kicker: #C9E2D0
Warm background: #F7F4EC
Traditional accent: #D7B56D
Body text: #1F2A2E
Muted text: #4F5F64
Border: #DDE7E2
```

Chốt hero:

```text
Nền phủ: navy mờ fade trái sang phải.
Tên: trắng.
Kicker: sage nhạt #C9E2D0.
Quote: trắng 90%.
```

Lý do: bộ màu này giữ được độ tin cậy của Tây y, thêm tinh thần thảo mộc/Đông y một cách hiện đại, không biến website thành spa/luxury, và vẫn dễ đọc theo chuẩn accessibility.
