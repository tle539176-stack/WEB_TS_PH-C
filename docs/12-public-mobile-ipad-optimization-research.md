# 12 - Nghiên cứu và đặc tả tối ưu Mobile/iPad cho Public Website

Trạng thái: **tài liệu nghiên cứu + đặc tả thực thi**.

Phạm vi: public website, ưu tiên trang chủ `/`, sau đó là `/notes`, `/notes/:slug`, `/books`, `/books/:slug`, `/about`, navbar, footer và video strip.

Không nằm trong phạm vi tài liệu này: Admin UI, schema database, hệ thống đăng nhập, migration Supabase, checkout/bán hàng.

## 1. Bối cảnh

Nguồn truy cập chính của website dự kiến đến từ Facebook, đặc biệt là người dùng mở link bằng điện thoại. Vì vậy trải nghiệm chính không còn là desktop trước rồi co lại, mà cần được kiểm soát theo thứ tự:

```text
Điện thoại dọc
-> iPhone/Android màn hình lớn
-> iPad dọc
-> iPad ngang
-> desktop
```

Mục tiêu không phải là làm mọi thứ nhỏ lại trên mobile. Với web của bác sĩ Phúc, cảm giác nhận diện và độ tin cậy đến từ hero đầu trang, nên hero cần giữ cảm giác mạnh như desktop.

Yêu cầu riêng của chủ dự án:

```text
Hero image và chữ trong hero phải giữ kích cỡ như desktop.
Không thu nhỏ chữ hero trên điện thoại/iPad.
Không phủ màu lên mặt/nhân vật trong ảnh.
Nếu cần lớp màu để đọc chữ, màu chỉ được nằm ở khu vực chữ.
```

## 2. Kết luận nghiên cứu

### 2.1. Chiến lược đúng cho dự án này

Không dùng chiến lược responsive phổ thông kiểu:

```text
desktop hero 64px
tablet hero 48px
mobile hero 34px
```

Vì yêu cầu nhận diện là giữ hero desktop size, chiến lược đúng là:

```text
Giữ kích cỡ hero.
Giữ kích cỡ chữ hero.
Chỉ thay đổi crop ảnh, vùng phủ màu, khoảng padding và thứ tự layout bên dưới.
```

Nói cách khác, mobile sẽ nhìn hero như một "cửa sổ crop" của bản desktop, không phải một bản hero bị scale nhỏ.

### 2.2. Vấn đề hiện tại cần chú ý

Audit code hiện tại cho thấy:

1. `Navbar.tsx` chuyển sang desktop menu từ breakpoint `md`. Trên iPad dọc 768px, menu desktop có nhiều item và nút liên hệ dễ bị chật.
2. `Home.tsx` hero đã có `text-[38px] md:text-[58px] lg:text-[64px]`. Điều này chưa đúng với yêu cầu "giữ kích cỡ như desktop" trên mobile.
3. Lớp màu hero từng có nguy cơ phủ toàn ảnh. Quy tắc mới phải bắt buộc lớp màu chỉ nằm ở vùng chữ.
4. Các layout chính của homepage tương đối ổn vì phần nhiều đã dùng `lg:` cho 2 cột, nhưng cần kiểm tra iPad portrait vì đây là vùng dễ bị "nửa mobile, nửa desktop".
5. `FacebookVideoStrip.tsx` là dạng horizontal scroll. Trên mobile phù hợp, nhưng cần có affordance rõ ràng để người dùng biết có thể kéo ngang.
6. Một số trang public cũ như `/notes`, `/books`, `/about` còn dùng nhiều style landing/catalog cũ như `rounded-*`, `font-serif`, màu `neutral-*`. Do global CSS đang ép public text về xanh/trắng và border-radius về 0, các class này không còn phản ánh đúng giao diện thực tế. Khi tối ưu mobile, không được dựa vào `rounded-*` để tạo cảm giác mềm.

## 3. Breakpoint chuẩn

Dùng Tailwind breakpoint hiện có, nhưng đổi tư duy sử dụng:

```text
base: điện thoại 360-430px
sm: không dùng làm breakpoint layout chính, chỉ dùng tinh chỉnh nhỏ
md: iPad dọc 768px, vẫn coi là touch-first
lg: 1024px, bắt đầu cho layout desktop/tablet ngang
xl: desktop rộng
```

Quy tắc:

- Dưới `lg`: ưu tiên layout một cột, touch target lớn, không ép nhiều thông tin cạnh nhau.
- Từ `lg`: mới dùng navigation desktop và các grid 2 cột phức tạp.
- Không dùng `md:` để bật desktop nav.
- Không dùng `md:` để tạo layout chật nếu nội dung có tiêu đề dài tiếng Việt.

## 4. Đặc tả Hero Desktop-Locked

### 4.1. Mục tiêu

Hero trên điện thoại/iPad phải giữ:

```text
Chiều cao cảm giác như desktop.
Chữ H1 cùng kích cỡ desktop.
Ảnh nhân vật cùng độ lớn/crop như desktop.
Mặt bác sĩ không bị phủ màu.
Màu chỉ nằm sau vùng chữ.
Không có text overlap với mặt.
```

### 4.2. Thông số đề xuất

Áp dụng cho `src/pages/Home.tsx`.

```tsx
<motion.div
  className="relative min-h-[600px] overflow-hidden bg-[#0A3151] shadow-[0_22px_60px_-35px_rgba(10,49,81,0.9)]"
>
  <img
    className="absolute inset-0 h-full w-full object-cover object-[66%_center] saturate-[0.96] contrast-[1.02]"
  />

  <div className="absolute inset-y-0 left-0 w-[min(700px,78%)] bg-[linear-gradient(90deg,rgba(10,49,81,0.72)_0%,rgba(10,49,81,0.52)_58%,rgba(10,49,81,0)_100%)]" />

  <div className="relative z-10 flex min-h-[600px] items-center px-6 py-14 md:px-12 lg:px-16">
    <div className="public-on-blue max-w-[min(650px,calc(100vw-48px))]">
      <h1 className="max-w-[min(620px,calc(100vw-48px))] text-[64px] font-bold leading-[1.03]">
        TS. ĐẶNG HỮU PHÚC
      </h1>
    </div>
  </div>
</motion.div>
```

Điểm quan trọng:

- Không dùng `text-[38px] md:text-[58px] lg:text-[64px]` cho hero nếu yêu cầu là giữ desktop size.
- Không dùng `opacity-*` trên ảnh hero vì sẽ làm mặt nhân vật bị tối.
- Không dùng gradient toàn màn hình như `absolute inset-0`.
- Lớp màu phải có width giới hạn, ví dụ `w-[min(700px,78%)]`.
- Nếu ảnh thay đổi trong Admin, người thực thi phải chỉnh `object-position` để mặt nằm ngoài vùng màu.

### 4.3. Mobile hero không được làm gì

Không được:

- Thu nhỏ H1 hero xuống 34-40px.
- Phủ lớp xanh lên toàn ảnh.
- Dùng blur ảnh nền.
- Đặt text lên chính giữa mặt/khẩu trang.
- Dùng `text-[vw]` để scale chữ theo viewport.
- Dùng negative letter spacing.
- Cắt ảnh theo kiểu làm mất mắt/khuôn mặt.

### 4.4. Cách xử lý khi text quá rộng trên điện thoại nhỏ

Vẫn giữ font desktop, nhưng cho phép xuống dòng tự nhiên.

Chấp nhận:

```text
TS. ĐẶNG
HỮU PHÚC
```

Không chấp nhận:

```text
TS. ĐẶNG HỮU PHÚC
```

nếu dòng này bị tràn ngang hoặc phải giảm font.

Nếu viewport 360px làm H1 quá cao, xử lý bằng:

- tăng hero height, không giảm font;
- giảm số dòng subtitle;
- đưa chips xuống thấp hơn hoặc ẩn chips sau hero nếu thật sự cần.

## 5. Navbar Mobile/iPad

### 5.1. Vấn đề

`Navbar.tsx` hiện đang dùng:

```tsx
<div className="hidden md:flex ...">desktop nav</div>
<div className="md:hidden">mobile nav</div>
```

Trên iPad dọc 768px, desktop nav xuất hiện quá sớm. Với nhiều menu item tiếng Việt, nguy cơ là:

- menu bị chật;
- nút liên hệ chen vào logo;
- người dùng iPad phải bấm item nhỏ hơn touch target lý tưởng.

### 5.2. Quy tắc mới

Desktop nav chỉ bật từ `lg`.

```tsx
<div className="hidden lg:flex items-center gap-8">
  ...
</div>

<div className="lg:hidden">
  ...
</div>
```

Touch target tối thiểu:

```text
Menu button: 44x44px
Sheet item: min-height 48px
CTA trong sheet: min-height 48px
```

Trên điện thoại nhỏ, logo text cần tránh làm rộng navbar quá mức:

```tsx
<span className="max-w-[210px] truncate text-lg font-bold tracking-tight text-white">
  {siteNameDisplay}
</span>
```

## 6. Homepage Mobile/iPad

### 6.1. Thứ tự nội dung

Trên mobile, thứ tự vẫn giữ như desktop:

```text
Hero
Bộ ghi chú
Sách
Video
Footer
```

Không đưa video lên quá sớm vì người dùng từ Facebook cần trước hết xác nhận danh tính và tìm bài đọc đầy đủ.

### 6.2. Bộ ghi chú

Hiện tại:

```tsx
<div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
```

Đây là hướng đúng: dưới `lg` nên stack một cột.

Quy tắc thực thi:

- Lead note đứng trước.
- Secondary notes đứng sau.
- Không ép equal height dưới `lg`.
- Ảnh lead note trên mobile nên có `min-h-[260px]` hoặc aspect ratio rõ, tránh ảnh quá thấp.
- Tiêu đề note trên mobile tối đa 2-3 dòng; excerpt tối đa 2 dòng nếu quá dài.

Đề xuất nếu cần tinh chỉnh:

```tsx
<article className="grid h-full overflow-hidden border border-[#0A3151]/15 bg-white md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-[0.9fr_1.1fr]">
```

Nếu iPad dọc thấy chật, đổi split lead card từ `md:` sang `lg:`:

```tsx
<article className="grid h-full overflow-hidden border border-[#0A3151]/15 bg-white lg:grid-cols-[0.9fr_1.1fr]">
```

### 6.3. Sách

Homepage books hiện dùng:

```tsx
grid gap-8 sm:grid-cols-2 lg:grid-cols-4
```

Trên điện thoại nhỏ, một cột là dễ đọc. Trên điện thoại lớn có thể cân nhắc 2 cột, nhưng chỉ khi cover không nhỏ hơn 150px.

Quy tắc:

- Dưới 390px: 1 cột.
- Từ 430px đến iPad dọc: 2 cột nếu cover vẫn đọc được.
- Từ `lg`: 4 cột.

Nếu muốn kiểm soát tốt hơn, dùng:

```tsx
<div className="mt-10 grid grid-cols-1 gap-8 min-[430px]:grid-cols-2 lg:grid-cols-4 lg:gap-10">
```

### 6.4. Video Facebook

Video strip là khu vực hợp với mobile vì người dùng quen kéo ngang. Tuy nhiên nếu scrollbar bị ẩn hoàn toàn, cần có dấu hiệu còn nội dung bên phải.

Quy tắc:

- Card video trên mobile nên rộng khoảng 58-72vw.
- Luôn để card kế tiếp lộ một phần ở mép phải.
- Không hiện icon play nếu chủ dự án đã yêu cầu bỏ.
- Không hiện mô tả dưới video nếu đã yêu cầu chỉ giữ thumbnail/title.
- Nếu ẩn scrollbar, thêm padding cuối để scroll không bị cụt.

Đề xuất class:

```tsx
<article className="min-w-[62vw] max-w-[260px] snap-start sm:min-w-[230px] lg:min-w-[230px]">
```

Nếu muốn giữ nhiều video cùng lúc như desktop, giữ width hiện tại `190px`, nhưng trên mobile sẽ hơi nhỏ.

## 7. Trang Notes

### 7.1. Danh sách ghi chú `/notes`

Hiện tại trang này đã stack tốt ở mobile, nhưng còn vài điểm cần chuẩn hóa:

- Header đang dùng `flex flex-col md:flex-row`; iPad dọc có thể chia 2 cột sớm. Nếu text/search bị chật, đổi `md:flex-row` thành `lg:flex-row`.
- Note item đang dùng image/text split từ `md:grid-cols-5`. Với iPad dọc có thể ổn, với mobile không vấn đề. Nếu tiêu đề dài, đổi split lên `lg`.
- Sidebar chuyên mục đang nằm dưới list khi dưới `lg`, đúng.

Đề xuất:

```tsx
<div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-12 lg:mb-16">
```

và:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
```

### 7.2. Chi tiết ghi chú `/notes/:slug`

Vấn đề cần kiểm tra trên mobile:

- H1 `text-4xl md:text-6xl` có thể quá lớn ở iPad nếu tiêu đề dài.
- Meta bar có nhiều item và button chia sẻ `ml-auto`, trên mobile dễ tạo khoảng hở khó nhìn.
- Cover image `aspect-[21/9]` có thể quá thấp trên mobile.
- Nội dung `prose-lg` có thể làm line length tốt, nhưng cần đảm bảo font body 16-18px.

Đề xuất:

```tsx
<h1 className="text-[34px] leading-tight md:text-[48px] lg:text-[56px] ...">
```

và cover:

```tsx
<div className="overflow-hidden aspect-[4/3] md:aspect-[21/9] ...">
```

## 8. Trang Books

### 8.1. Danh sách sách `/books`

Vấn đề trên mobile:

- Featured card ở header có thể chiếm nhiều không gian nếu xuất hiện ngay trên điện thoại.
- Filter box hiện có `md:grid-cols-[1fr_auto]`, ổn nhưng nếu select chật trên iPad thì giữ stack đến `lg`.
- Catalog grid `md:grid-cols-2` hợp với iPad, nhưng điện thoại nên 1 cột.

Quy tắc:

- Phone: search/filter full width, card 1 cột.
- iPad dọc: card 2 cột.
- iPad ngang/desktop: 3 cột.
- Featured book có thể giữ, nhưng phải nằm sau search trên mobile nếu gây nặng đầu trang.

### 8.2. Chi tiết sách `/books/:slug`

Hiện tại split 2 cột từ `lg`, đúng. Cần kiểm tra:

- Button mua trên mobile phải full width nếu không đủ chỗ.
- Price và CTA không nên nằm cùng hàng ở 360px.

Đề xuất:

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
  ...
</div>
```

## 9. Trang About

Hiện tại About đã chuyển 2 cột từ `lg`, đúng cho mobile/iPad. Cần chỉnh theo public design system:

- Không dựa vào `rounded-*` vì global CSS đang reset radius.
- H1 `md:text-6xl` trên iPad dọc có thể quá lớn nếu title dài. Dùng `lg:text-6xl` nếu cần.
- Ảnh profile nên giới hạn `max-w-[360px] mx-auto` trên mobile để không chiếm toàn màn hình.

Đề xuất:

```tsx
<div className="overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xl aspect-[3/4] max-w-[360px] mx-auto lg:max-w-none">
```

## 10. Quy tắc hình ảnh trên mobile

Hero:

- Không scale nhỏ ảnh.
- Dùng `object-cover`.
- Dùng `object-position` để giữ mặt đúng vùng.
- Lớp màu chỉ ở vùng chữ.

Card/list:

- Luôn có aspect ratio cố định.
- Không để ảnh tự quyết chiều cao theo nội dung.
- Không dùng ảnh quá thấp ở mobile, vì thumbnail y tế cần đủ ngữ cảnh.

Kích thước ảnh khuyến nghị:

```text
Hero: 1920x1080 hoặc lớn hơn, mặt không nằm sát mép trái.
Note cover: 1200x800.
Book cover: 800x1200.
Video thumbnail: 720x1280 nếu là reels dọc.
```

## 11. Quy tắc chữ và spacing

Hero là ngoại lệ: giữ kích thước desktop.

Các phần còn lại tối ưu mobile:

```text
Section H2 mobile: 28-34px
Card title mobile: 15-22px tùy density
Body mobile: 15-17px
Line-height body: 1.55-1.75
Small label: 11-12px
Section padding mobile: 48-56px
Section padding tablet: 56-64px
Touch target: tối thiểu 44px
```

Không dùng:

- font scale theo viewport width;
- letter spacing âm;
- đoạn văn quá rộng trên iPad;
- text dài trong button một dòng nếu có thể xuống dòng;
- hover-only interaction trên mobile.

## 12. Thứ tự thực thi đề xuất

### Phase 1 - Chặn lỗi mobile/iPad rõ nhất

1. Đổi Navbar desktop breakpoint từ `md` sang `lg`.
2. Lock hero theo desktop size: `min-h-[600px]`, H1 `text-[64px]` ở mọi breakpoint.
3. Giới hạn overlay hero vào vùng chữ, không `inset-0`.
4. Kiểm tra không có horizontal scroll toàn trang ngoài video strip.

### Phase 2 - Tối ưu homepage content

1. Kiểm tra `Bộ ghi chú` ở 390px, 430px, 768px.
2. Nếu lead note split quá sớm ở iPad dọc, đổi `md:grid-cols` thành `lg:grid-cols`.
3. Chỉnh books grid sang `min-[430px]:grid-cols-2`.
4. Chỉnh video card width nếu card quá nhỏ trên phone.

### Phase 3 - Tối ưu trang đọc

1. `/notes`: đổi header/list split lên `lg` nếu iPad dọc chật.
2. `/notes/:slug`: chỉnh cover mobile từ `21/9` sang `4/3`, meta bar stack gọn.
3. `/books`: kiểm tra search/filter và featured card.
4. `/books/:slug`: CTA mua full width trên phone.

### Phase 4 - QA hình ảnh và nội dung thật

1. Thay hero bằng ảnh thật đang dùng trong Admin.
2. Test các note/book có tiêu đề dài tiếng Việt.
3. Test ảnh thiếu/mất thumbnail.
4. Test dữ liệu rỗng.

## 13. Ma trận nghiệm thu viewport

Bắt buộc kiểm tra:

```text
360x800   Android nhỏ
390x844   iPhone phổ biến
414x896   iPhone Plus/Pro Max cũ
430x932   iPhone Pro Max mới
768x1024  iPad dọc
820x1180  iPad Air dọc
1024x768  iPad ngang
1366x768  laptop
1440x900  desktop
```

Điều kiện pass cho hero:

- H1 hero giữ cùng font size với desktop.
- Mặt bác sĩ không bị lớp màu phủ.
- Text không tràn ngang viewport.
- Không có vùng chữ nằm đè lên mắt/mặt.
- Subtitle đọc được.
- Chips không chèn vào mặt hoặc tràn khỏi vùng chữ.

Điều kiện pass toàn site:

- Không có horizontal scroll toàn trang.
- Navbar không bị chật trên iPad dọc.
- Sheet mobile mở/đóng được.
- Button/link có vùng bấm tối thiểu 44px.
- Card không bị lệch ảnh/chữ.
- Video strip kéo ngang được bằng touch.
- Nội dung bài viết đọc thoải mái, không quá nhỏ.

## 14. Lệnh kiểm tra

Build và chạy:

```powershell
docker compose up -d --build
```

Smoke test HTTP:

```powershell
Invoke-WebRequest -Uri http://localhost:3001 -UseBasicParsing
```

Kiểm tra text/lớp responsive nhanh:

```powershell
rg -n "md:flex|md:grid|md:text|lg:flex|lg:grid|text-\[64px\]|inset-0" src/pages src/components
```

Checklist thủ công sau build:

```text
1. Mở Chrome DevTools.
2. Chọn từng viewport trong ma trận.
3. Hard refresh.
4. Chụp screenshot hero, notes section, books section, video strip.
5. Kiểm tra không có scroll ngang ngoài video strip.
6. Kiểm tra menu mobile ở 768px vẫn là hamburger.
7. Kiểm tra hero ở 390px vẫn giữ chữ size desktop.
```

Nếu bổ sung Playwright sau này, nên tạo screenshot test cho:

```text
/
/notes
/notes/:slug demo hoặc bài thật
/books
/books/:slug demo hoặc sách thật
/about
```

## 15. Prompt giao AI thực thi

```text
Thực thi tối ưu mobile/iPad public website theo `docs/12-public-mobile-ipad-optimization-research.md`: ưu tiên mobile phone và iPad; đổi Navbar desktop breakpoint từ md sang lg; lock hero trang chủ giữ desktop size trên mọi viewport gồm min-height 600px, H1 64px, ảnh object-cover không opacity, overlay màu chỉ giới hạn vùng chữ và không phủ mặt bác sĩ; kiểm tra homepage notes/books/video dưới 430px và iPad dọc; không đổi schema DB; không sửa Admin; chạy Docker build và smoke test http://localhost:3001; báo cáo file đã sửa và viewport đã kiểm tra.
```

## 16. Ghi chú xung đột với tài liệu cũ

`docs/11-public-homepage-doctor-content-hub-spec.md` từng ghi không dùng gradient/lớp phủ ảnh hero. Với yêu cầu mới, quy tắc được cập nhật như sau:

```text
Không dùng gradient/lớp phủ toàn ảnh.
Được dùng lớp màu cục bộ sau vùng chữ nếu cần tương phản.
Lớp màu không được phủ lên mặt/nhân vật chính.
```

Khi có xung đột giữa tài liệu `11` và tài liệu `12` về mobile/iPad hoặc hero, ưu tiên tài liệu `12`.
