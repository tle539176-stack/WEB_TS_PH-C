# 11 - Đặc tả nâng cấp Trang chủ: Doctor Content Hub

Trạng thái: **tài liệu đặc tả để chốt phương án trước khi thực thi**.

Phạm vi: trang chủ public `/`.

Không nằm trong phạm vi tài liệu này: trang Admin, trang giới thiệu chi tiết, trang chi tiết bài viết, trang chi tiết sách, checkout/bán hàng.

## 1. Bối cảnh

Nguồn traffic chính của website là từ Facebook Reel/Post. Người dùng đã có một mức tò mò và tin ban đầu sau khi xem nội dung của bác sĩ Phúc, nhưng khi bấm vào link họ vẫn cần kiểm chứng nhanh:

```text
Facebook Reel/Post
→ Tò mò
→ Bấm vào bio/link
→ Landing trang chủ

Tâm lý khi vào trang:
- Người này có thật không?
- Có nên tin không?
- Có phần đọc đầy đủ cho video vừa xem không?
- Có hệ thống nội dung nghiêm túc không?
```

Vì vậy trang chủ không được đi theo kiểu landing page thương mại. Trang chủ cần giống một **hồ sơ ngắn + thư viện nội dung cá nhân của bác sĩ**.

## 2. Mục tiêu chính

Trang chủ mới cần làm 4 việc theo đúng thứ tự ưu tiên:

1. Xác nhận danh tính bác sĩ Phúc ngay đầu trang.
2. Dẫn người dùng vào bộ ghi chú/bài nghiên cứu đang được nhắc đến từ Facebook.
3. Dùng sách như một bằng chứng chuyên môn và hệ thống kiến thức.
4. Đặt video Facebook ở cuối để làm bằng chứng hoạt động thật và điểm xem thêm.

Trang chủ không cần kể quá sâu về tiểu sử bác sĩ, vì trang `Giới thiệu` đã phụ trách phần đó.

## 3. Nguyên tắc thiết kế

### 3.1. Cảm giác cần đạt

```text
Bác sĩ thật
Nội dung có hệ thống
Đọc rõ ràng
Không quảng cáo quá mức
Không thương mại hóa sớm
```

### 3.2. Cảm giác cần tránh

```text
Web bán hàng
Landing page quảng cáo
Hero quá lớn
Ảnh bị phủ màu/gradient
Nhiều font chữ
Nhiều màu chữ
Nhiều câu sáo rỗng về uy tín/trách nhiệm
```

### 3.3. Màu sắc

Toàn bộ public website chỉ dùng 2 màu chữ:

```text
Xanh thương hiệu: #0A3151
Trắng: #FFFFFF
```

Quy tắc:

- Chữ trên nền trắng: xanh `#0A3151`.
- Chữ trên nền xanh: trắng.
- Không dùng chữ đen, xám, vàng, xanh lá, đỏ, tím ở public website.
- Admin có thể giữ màu trạng thái riêng vì đó là công cụ quản trị.

### 3.4. Font chữ

Dùng **một font duy nhất** cho toàn bộ public website.

Đề xuất: `Geist`.

Lý do:

- Sans-serif sạch, dễ đọc trên màn hình.
- Đồng bộ giữa tiêu đề, đoạn văn, menu và nút.
- Giảm cảm giác tạp chí/thương mại do phối nhiều font.
- Phù hợp với web y khoa/chuyên môn hơn font serif trang trí.

Quy tắc font:

```text
H1 desktop: 42-48px
H1 mobile: 32-36px
H2 desktop: 28-34px
Card title: 18-22px
Body: 16-17px
Small label: 12-13px
Line-height body: 1.55-1.7
```

Không dùng chữ quá mỏng. Trọng lượng nên xoay quanh `400`, `500`, `600`, `700`.

### 3.5. Hình ảnh

Hero phải dùng ảnh thật của bác sĩ Phúc nếu có.

Quy tắc:

- Không phủ gradient/lớp màu lên ảnh.
- Không blur ảnh.
- Không dùng ảnh stock bác sĩ chung chung nếu đã có ảnh thật.
- Nếu chưa có ảnh thật, dùng ảnh placeholder tạm nhưng Admin cần có chỗ thay ảnh Hero.
- Ảnh phải đủ sáng, rõ mặt, không cắt mất phần quan trọng.

## 4. Bố cục trang chủ được chốt

```text
1. Hero: Danh tính bác sĩ
2. Bộ ghi chú / bài nghiên cứu
3. Sách và tài liệu đã xuất bản
4. Video Facebook
5. Footer liên hệ
```

Không đặt sản phẩm ở trang chủ trong phase này. Nếu cần sản phẩm sau này, chỉ nên đặt ở trang riêng hoặc rất thấp với ngôn ngữ trung tính.

## 5. Section 1 - Hero: Danh tính bác sĩ

### Mục tiêu

Trong 5 giây đầu, người dùng phải biết:

```text
Đây là TS. Đặng Hữu Phúc.
Website này gom lại nội dung sức khỏe bác sĩ đang chia sẻ.
Tôi có thể đọc bộ ghi chú ngay.
```

### Bố cục desktop

```text
┌───────────────────────────────────────────────┬──────────────────────────┐
│ TS. Đặng Hữu Phúc                             │                          │
│ Bộ ghi chú sức khỏe được hệ thống từ các      │        Ảnh thật          │
│ chủ đề bác sĩ đang chia sẻ trên Facebook.     │       bác sĩ Phúc        │
│                                               │                          │
│ [Đọc bộ ghi chú] [Xem sách]                   │                          │
│                                               │                          │
│ Tiến sĩ Y khoa | Tác giả sách | Có nguồn      │                          │
└───────────────────────────────────────────────┴──────────────────────────┘
```

### Bố cục mobile

```text
Ảnh thật bác sĩ

TS. Đặng Hữu Phúc
Bộ ghi chú sức khỏe được hệ thống từ các chủ đề bác sĩ đang chia sẻ trên Facebook.

[Đọc bộ ghi chú]
[Xem sách]

Tiến sĩ Y khoa
Tác giả sách / tài liệu sức khỏe
Nội dung có nguồn tham khảo
```

### Nội dung đề xuất

H1:

```text
TS. Đặng Hữu Phúc
```

Mô tả:

```text
Bộ ghi chú sức khỏe được hệ thống từ các chủ đề bác sĩ đang chia sẻ trên Facebook.
```

CTA chính:

```text
Đọc bộ ghi chú
```

CTA phụ:

```text
Xem sách
```

Badge/credential ngắn:

```text
Tiến sĩ Y khoa
Tác giả sách
Bài viết có nguồn tham khảo
```

### Không dùng trong Hero

Không dùng các câu như:

```text
Uy tín, tận tâm, trách nhiệm.
Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
Kiến thức chính thống, dễ hiểu và có trách nhiệm.
```

Lý do: đây là các câu tự khẳng định. Uy tín nên được tạo bằng bằng chứng: ảnh thật, học vị, sách, bộ ghi chú, nguồn tham khảo, ngày cập nhật.

## 6. Section 2 - Bộ ghi chú / bài nghiên cứu

### Mục tiêu

Đây là section quan trọng nhất sau Hero.

Người dùng từ Facebook qua thường muốn đọc phần đầy đủ của một chủ đề. Section này phải trả lời ngay:

```text
Video nói ngắn, còn bản đầy đủ nằm ở đây.
```

### Tên section

Ưu tiên:

```text
Bộ Ghi Chú Chống Lão Hóa
```

Nếu về sau có nhiều bộ khác:

```text
Bộ Ghi Chú Sức Khỏe
```

hoặc:

```text
Các Bộ Ghi Chú Từ Video Facebook
```

### Bố cục desktop đề xuất

```text
┌──────────────────────────────────────────────────────────────┐
│ Bộ Ghi Chú Chống Lão Hóa                                     │
│ Các bài viết được hệ thống lại từ những chủ đề bác sĩ Phúc   │
│ đang chia sẻ trên Facebook.                                  │
├──────────────────────────────┬───────────────────────────────┤
│ Bài nổi bật lớn              │ Danh sách 3-4 bài nhỏ          │
│ - ảnh hoặc thumbnail         │ - tiêu đề                      │
│ - tiêu đề                    │ - nhóm chủ đề                  │
│ - tóm tắt                    │ - ngày cập nhật                │
│ - ngày cập nhật              │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### Bố cục mobile

```text
Bộ Ghi Chú Chống Lão Hóa
Mô tả 1-2 dòng

[Bài nổi bật]
[Bài nhỏ 1]
[Bài nhỏ 2]
[Bài nhỏ 3]

[Xem toàn bộ ghi chú]
```

### Thông tin cần hiển thị trên mỗi bài

```text
Nhóm chủ đề
Tiêu đề
Tóm tắt 1-2 dòng
Ngày cập nhật hoặc ngày đăng
```

Nếu hệ thống có nguồn tham khảo, có thể thêm nhãn:

```text
Có nguồn tham khảo
```

### Nhóm chủ đề gợi ý

```text
Chống lão hóa
Dinh dưỡng
Thực phẩm bổ sung
Giấc ngủ
Vận động
Da và chống nắng
Tầm soát sức khỏe
```

### CTA

```text
Xem toàn bộ ghi chú
```

## 7. Section 3 - Sách và tài liệu đã xuất bản

### Mục tiêu

Sách không được xem như sản phẩm thương mại ở trang chủ. Sách là bằng chứng rằng bác sĩ có khả năng hệ thống hóa kiến thức.

Người dùng cần cảm nhận:

```text
Người này không chỉ nói trên video.
Người này có sách/tài liệu được trình bày có hệ thống.
```

### Tên section

Ưu tiên:

```text
Sách và tài liệu đã xuất bản
```

Hoặc:

```text
Tủ sách của TS. Đặng Hữu Phúc
```

Không dùng:

```text
Sản phẩm nổi bật
Mua ngay
Ưu đãi
Khuyến mãi
```

### Bố cục desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Sách và tài liệu đã xuất bản                                 │
│ Các nội dung đọc sâu hơn, được trình bày thành hệ thống.     │
├──────────────┬───────────────────────────────────────────────┤
│ Bìa sách     │ Tên sách                                      │
│              │ Mô tả ngắn                                    │
│              │ [Đọc thêm]                                    │
└──────────────┴───────────────────────────────────────────────┘
```

Nếu có nhiều sách, dùng grid 2-3 item. Không cần carousel ở phase đầu.

### Thông tin hiển thị

```text
Ảnh bìa sách
Tên sách
Mô tả ngắn
Nút Đọc thêm
```

Không hiển thị giá ở trang chủ trong phase này. Nếu cần giá, để ở trang chi tiết sách.

## 8. Section 4 - Video Facebook

### Mục tiêu

Video đặt cuối trang để:

- Chứng minh bác sĩ đang hoạt động thật trên Facebook.
- Cho người dùng xem thêm nếu họ muốn.
- Không làm lấn át bộ ghi chú, vì khách đã đến từ video.

### Tên section

```text
Video mới từ Facebook
```

hoặc:

```text
Các video gần đây của TS. Đặng Hữu Phúc
```

### Bố cục

Dùng dạng video dọc 9:16.

Desktop:

```text
[Video 1] [Video 2] [Video 3] [Video 4]
```

Mobile:

```text
scroll ngang từng video
```

### Thông tin hiển thị

```text
Thumbnail video
Nút play
Tiêu đề video
```

Mô tả video có thể ẩn hoặc chỉ hiển thị 1 dòng để tránh rối.

## 9. Footer

Footer giữ đơn giản:

```text
Tên bác sĩ / logo
Mô tả ngắn
Liên kết: Ghi chú, Sách, Giới thiệu, Video
Thông tin liên hệ
Disclaimer y khoa
```

Footer nền xanh, chữ trắng.

## 10. Navigation

Menu public nên gọn:

```text
Trang chủ
Ghi chú
Sách
Video
Giới thiệu
Liên hệ
```

Nếu chưa có trang Video riêng, menu `Video` có thể scroll xuống section video trên trang chủ.

Không ưu tiên `Sản phẩm` ở menu chính của phase này.

## 11. Quy tắc nội dung

### 11.1. Cách tạo uy tín

Uy tín không nên được nói bằng khẩu hiệu. Uy tín cần được chứng minh bằng các yếu tố sau:

```text
Ảnh thật
Tên và học vị rõ
Sách/tài liệu rõ
Bài viết có ngày cập nhật
Bài viết có nguồn tham khảo
Link Facebook chính thức
Thông tin liên hệ
Disclaimer y khoa
```

### 11.2. Cách viết câu chữ

Nên viết:

```text
Bộ ghi chú sức khỏe được hệ thống từ các chủ đề bác sĩ đang chia sẻ trên Facebook.
```

Không nên viết:

```text
Chia sẻ kiến thức sức khỏe rõ ràng, dễ hiểu và có trách nhiệm.
```

Lý do: câu thứ hai là tự nhận xét. Câu thứ nhất mô tả đúng việc website đang làm.

### 11.3. Độ dài chữ

Mỗi section chỉ nên có:

- 1 tiêu đề chính.
- 1 mô tả ngắn tối đa 2 dòng.
- Card nội dung tối đa 2-3 dòng mô tả.

Không đưa đoạn văn dài ra trang chủ.

## 12. Data cần chuẩn bị trong Admin

Để trang chủ mới đẹp và đáng tin, Admin cần nhập đủ:

```text
1. Ảnh Hero thật của bác sĩ Phúc
2. Tên website: TS. Đặng Hữu Phúc hoặc Tiến sĩ Đặng Hữu Phúc
3. Tagline ngắn
4. Các bài ghi chú đã xuất bản
5. Cover image cho bài nổi bật nếu có
6. Danh mục ghi chú
7. Sách có ảnh bìa
8. Link Facebook chính thức
9. Video Facebook public, có thumbnail dọc
10. Disclaimer y khoa
```

Nếu thiếu dữ liệu, giao diện vẫn phải sạch, không hiện placeholder hỏng.

## 13. Tiêu chí nghiệm thu

Trang chủ được xem là đạt nếu:

```text
1. Người dùng thấy tên bác sĩ và ảnh thật ngay đầu trang.
2. Hero không cao quá 70% màn hình desktop.
3. Không có lớp phủ màu lên ảnh hero.
4. Chữ public chỉ có xanh hoặc trắng.
5. Website dùng một font chính duy nhất.
6. Section thứ hai là bộ ghi chú/bài nghiên cứu.
7. Sách nằm trước video.
8. Video nằm cuối trang, không lấn át nội dung đọc.
9. Không có section sản phẩm bán hàng trên trang chủ.
10. Mobile đọc được rõ, không bị text quá nhỏ hoặc card quá rối.
11. Docker build pass.
12. `http://localhost:3001/` trả HTTP 200 sau khi cập nhật.
```

## 14. Hướng triển khai kỹ thuật

### 14.1. File dự kiến sửa

```text
src/pages/Home.tsx
src/components/home/FacebookVideoStrip.tsx
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/index.css
src/App.tsx
```

### 14.2. Việc cần làm

1. Gỡ font serif khỏi public website.
2. Dùng Geist làm font duy nhất.
3. Redesign `Home.tsx` theo 4 section chính.
4. Bỏ section sản phẩm khỏi trang chủ.
5. Đổi sách thành section uy tín/tài liệu, không hiển thị giá ở trang chủ.
6. Đưa video Facebook xuống cuối.
7. Giữ rule ép màu public chỉ xanh/trắng.
8. Build Docker và chạy lại container trên `localhost:3001`.

### 14.3. Không làm trong phase này

```text
Không đổi database schema nếu không cần.
Không làm trang bán hàng mới.
Không đổi Admin lớn.
Không thêm hiệu ứng phức tạp.
Không thêm màu thương hiệu mới.
Không thêm nhiều font.
```

## 15. Nguồn nghiên cứu dùng cho quyết định

- Stanford Web Credibility Guidelines: website đáng tin cần dễ kiểm chứng, có người thật/tổ chức thật, chuyên môn rõ, liên hệ rõ, thiết kế phù hợp mục đích và hạn chế nội dung quảng cáo.  
  https://credibility.stanford.edu/guidelines/index.html

- MedlinePlus - Evaluating Health Information: người đọc nên kiểm tra ai vận hành site, mục đích site, nguồn thông tin, quy trình review, ngày cập nhật và liên hệ.  
  https://medlineplus.gov/evaluatinghealthinformation.html

- NCCIH/NIH - Finding Health Information Online: nội dung sức khỏe cần rõ nguồn, độ chính xác, chuyên gia review, tính cập nhật, đơn vị vận hành và khả năng liên hệ.  
  https://www.nccih.nih.gov/health/know-science/finding-and-evaluating-online-resources/finding-health-information-online/introduction

- U.S. Web Design System - Typography: chữ cần rõ, nhất quán, dễ đọc; line length và line height ảnh hưởng trực tiếp đến khả năng đọc.  
  https://designsystem.digital.gov/components/typography/

- Yale Usability - Page Layout and Content Organization: người dùng scan web theo điểm vào rõ ràng; thông tin quan trọng nên đặt ở đầu, dùng heading rõ và khoảng trắng hợp lý.  
  https://usability.yale.edu/ux/plan/establish-structure-findability/page-layout-and-content-organization

## 16. Prompt thực thi khi đã chốt

```text
Thực thi nâng cấp trang chủ theo `docs/11-public-homepage-doctor-content-hub-spec.md`: redesign `/` thành Doctor Content Hub gồm Hero danh tính bác sĩ, Bộ Ghi Chú/Bài nghiên cứu, Sách và tài liệu đã xuất bản, Video Facebook cuối trang, Footer; dùng một font Geist cho toàn public website; chữ public chỉ xanh #0A3151 hoặc trắng; không gradient/lớp phủ ảnh hero; không section sản phẩm thương mại trên trang chủ; không đổi schema DB nếu không cần; build Docker và chạy lại trên http://localhost:3001/ để nghiệm thu.
```
