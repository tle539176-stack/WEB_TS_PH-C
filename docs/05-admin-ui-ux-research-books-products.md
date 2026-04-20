# 05 - Nghiên cứu UI/UX Admin, Thư viện Sách và Sản phẩm

Trạng thái: tài liệu nghiên cứu và định hướng triển khai phase UI/UX.

Ngày nghiên cứu: 2026-04-20.

Repo áp dụng:

```text
C:\Users\ADMIN\Desktop\Bác sĩ Phúc\WEB_TS_PH-C
```

## 1. Mục tiêu

Nâng cấp trải nghiệm nhập liệu trong `/admin` để người quản trị đi theo một dòng chảy rõ ràng:

```text
Chọn loại nội dung -> nhập thông tin cốt lõi -> thêm ảnh -> kiểm tra chất lượng -> xem trước -> xuất bản
```

Đồng thời thiết kế lại phần public:

- `Thư viện Sách`: dễ tìm sách, dễ hiểu nội dung sách, dễ đi tới trang chi tiết.
- `Sản phẩm`: dễ lọc theo nhu cầu sức khỏe, dễ so sánh, giảm rủi ro hiểu nhầm khuyến nghị y khoa.

## 2. Nguồn nghiên cứu

Các nguồn được dùng để rút pattern, không sao chép giao diện:

- Baymard Institute - Product Lists & Filtering UX: https://baymard.com/research/ecommerce-product-lists
- Baymard Institute - Ecommerce Filter UI: https://baymard.com/learn/ecommerce-filter-ui
- Shopify Help - Products: https://help.shopify.com/en/manual/products
- Shopify Help - Variants: https://help.shopify.com/manual/products/variants/
- GOV.UK Design System - Task list: https://design-system.service.gov.uk/components/task-list/
- GOV.UK Design System - Text input: https://design-system.service.gov.uk/components/text-input/
- GOV.UK Design System - Error message: https://design-system.service.gov.uk/components/error-message/
- Material Web - Progress indicators: https://material-web.dev/components/progress/
- Mayo Clinic Press homepage: https://mcpress.mayoclinic.org/
- Mayo Clinic Press product detail examples: https://mcpress.mayoclinic.org/product/the-nurses-of-mayo-clinic/
- Mayo Clinic Store - Vitamins & Supplements: https://store.mayoclinic.com/health/vitamins-supplements.html
- iHerb homepage/catalog ecosystem: https://www.iherb.com/
- Thorne health/supplement positioning: https://www.thorne.com/

## 3. Điều rút ra từ nghiên cứu

### 3.1. Catalog public phải có search, filter, sort rõ ràng

Baymard nhấn mạnh product list và filtering là phần quyết định việc người dùng có tìm được sản phẩm phù hợp hay không. Với website này, `Sách` và `Sản phẩm` hiện đang thiên về grid đơn giản, chưa đủ công cụ tìm kiếm theo ý định.

Áp dụng:

- Luôn có search ở đầu trang.
- Có filter theo nhóm nhu cầu, không chỉ theo tên.
- Có sort: mới nhất, phổ biến, giá, năm xuất bản.
- Filter đang áp dụng phải hiện thành chip có thể xóa nhanh.
- Empty state phải gợi ý hành động tiếp theo.

### 3.2. Admin nhập liệu nên giống task flow, không phải một form dài

GOV.UK Task list dùng trạng thái theo từng phần để người dùng biết phần nào xong, phần nào còn thiếu. Đây là pattern phù hợp với admin hiện tại vì product/book/note có nhiều trường nhưng không phải trường nào cũng cần nhập ngay.

Áp dụng:

```text
1. Thông tin chính
2. Phân loại
3. Nội dung mô tả
4. Ảnh và media
5. SEO và kiểm tra chất lượng
6. Xem trước và xuất bản
```

Mỗi phần có trạng thái:

- `Hoàn tất`
- `Cần bổ sung`
- `Có cảnh báo`
- `Lỗi cần sửa`

### 3.3. Form cần hint ngắn, lỗi cụ thể, không dùng thông báo chung chung

GOV.UK Text Input và Error Message khuyến nghị hint ngắn, lỗi cụ thể và bám sát label. Admin hiện nên tránh các lỗi kiểu `Lỗi`, `Không hợp lệ`, `Thiếu thông tin`.

Áp dụng:

- Label nói rõ câu hỏi: `Tên sản phẩm hiển thị trên website`.
- Hint một câu ngắn: `Nên dưới 70 ký tự để đẹp trên thẻ sản phẩm`.
- Error cụ thể: `Nhập tên sản phẩm trước khi lưu nháp`.
- Với mô tả dài, dùng checklist thay vì nhồi hint dài dưới field.

### 3.4. Shopify Admin gợi ý mô hình nhập liệu tối thiểu trước, chi tiết sau

Shopify product admin cho phép sản phẩm bắt đầu với dữ liệu tối thiểu rồi mở rộng sang media, mô tả, variant, tag, collection, inventory. Với dự án này, không nên bắt người nhập hoàn chỉnh mọi trường trước khi lưu.

Áp dụng:

- Cho phép `Lưu nháp` ngay sau khi có title/name.
- Sau khi có bản nháp, mở media gallery, SEO, preview.
- Tách trường nâng cao ra khỏi flow chính.
- Tạo quick actions: `Lưu nháp`, `Xem trước`, `Xuất bản`.

### 3.5. Ngành y tế/sức khỏe cần ngôn ngữ thận trọng

Mayo Clinic Press, Mayo Clinic Store và Thorne đều đặt nặng yếu tố chuyên môn, an toàn, nghiên cứu, tác giả/chuyên gia, nguồn gốc hoặc bối cảnh y khoa. Với sản phẩm khuyên dùng, UX không nên tạo cảm giác bán hàng quá mạnh hoặc đưa ra claim điều trị bệnh.

Áp dụng:

- Product detail cần block `Lưu ý y khoa`.
- Admin product cần trường `Cảnh báo`, `Không dùng cho`, `Nên hỏi bác sĩ khi`.
- Card sản phẩm ưu tiên `tác dụng hỗ trợ` thay vì claim điều trị.
- Sách cần metadata: tác giả, năm, nhà xuất bản, số trang, chủ đề.

## 4. Hiện trạng cần cải thiện trong repo

### 4.1. Admin

Vấn đề chính:

- Admin đang gom nhiều nghiệp vụ vào một màn hình lớn.
- Form tạo/sửa sách và sản phẩm chưa có dòng chảy từng bước.
- Media gallery chỉ thuận sau khi người dùng đã hiểu cơ chế tạo bản ghi.
- Chưa có preview public rõ ràng trước khi publish.
- Chưa có quality checklist mạnh cho sách/sản phẩm như đã có một phần ở settings/notes.

Mục tiêu:

- Biến mỗi content type thành một workspace có list, filter, editor, preview.
- Người dùng luôn biết đang ở bước nào và còn thiếu gì để publish.
- Giảm số trường hiển thị ban đầu.

### 4.2. Thư viện Sách public

Vấn đề chính:

- Chưa có search/filter.
- Chưa có nhóm chủ đề nổi bật.
- Card sách chưa đủ thông tin để quyết định: format, năm, chủ đề, số trang, độ mới.
- Detail page chưa có phần `Bạn sẽ học được gì`, `Phù hợp với ai`, `Sách liên quan`.

Mục tiêu:

- Tạo trải nghiệm giống một thư viện health books có phân loại rõ ràng.
- Người dùng tìm theo chủ đề sức khỏe, không chỉ đọc grid.

### 4.3. Sản phẩm public

Vấn đề chính:

- Filter button hiện chưa có hệ thống filter thực tế.
- Product card thiếu health goal, brand, cảnh báo hoặc thông tin phân biệt.
- Detail page chưa đủ cấu trúc cho sản phẩm sức khỏe: thành phần, cách dùng, lưu ý, đối tượng không nên dùng.

Mục tiêu:

- Tạo catalog sản phẩm khuyên dùng có tính tư vấn, không thuần shopping.
- Tăng niềm tin bằng thông tin rõ ràng, nhất quán, có disclaimer.

## 5. Nguyên tắc thiết kế phase UI/UX

### 5.1. Admin là công cụ làm việc, không phải landing page

Admin cần ưu tiên:

- Tốc độ nhập liệu.
- Dễ sửa nháp.
- Dễ biết trạng thái.
- Dễ preview.
- Ít trang trí.

Không dùng hero, không dùng card lồng card, không dùng layout marketing trong admin.

### 5.2. Một màn hình list, một màn hình editor

Mỗi nghiệp vụ nên có:

- List view: tìm kiếm, lọc, trạng thái, thao tác nhanh.
- Editor view: form theo bước, media, preview, publish.

Không nên mở tất cả create/edit form ngay trong list nếu form dài.

### 5.3. Field ít trước, field nâng cao sau

Step đầu chỉ gồm trường cần để tạo bản ghi:

Sản phẩm:

- Tên sản phẩm
- Giá
- Trạng thái
- Mô tả ngắn

Sách:

- Tên sách
- Tác giả
- Giá
- Trạng thái
- Mô tả ngắn

Sau khi lưu nháp mới mở:

- Media
- SEO
- Nội dung dài
- Thông tin nâng cao

### 5.4. Luôn có preview và checklist trước khi publish

Trước khi xuất bản, hiển thị:

- Thiếu ảnh bìa hay chưa.
- Mô tả quá ngắn hay chưa.
- SEO title/description có đủ chưa.
- Có warning/disclaimer chưa.
- Có category/chủ đề chưa.
- Public URL sau khi publish là gì.

### 5.5. Public catalog phải hỗ trợ quyết định nhanh

Card sách/sản phẩm cần trả lời nhanh:

- Đây là gì?
- Phù hợp với ai?
- Có gì khác biệt?
- Giá bao nhiêu?
- Xem chi tiết ở đâu?

## 6. Pattern đề xuất cho Admin

### 6.1. Admin dashboard

Thêm các khối:

- `Việc cần làm`: draft chưa có ảnh, bài/sản phẩm chưa publish, nội dung thiếu SEO.
- `Tạo nhanh`: Sách mới, Sản phẩm mới, Ghi chú mới, Danh mục mới.
- `Vừa cập nhật`: item mới sửa gần đây, có link vào editor.
- `Nội dung public`: số lượng published books/products/notes.

### 6.2. Content list

Dùng bảng hoặc dense list:

Columns cho Sản phẩm:

- Ảnh
- Tên
- Brand
- Giá
- Trạng thái
- Ảnh
- Cập nhật
- Hành động

Columns cho Sách:

- Bìa
- Tên sách
- Tác giả
- Năm
- Giá
- Trạng thái
- Cập nhật
- Hành động

Toolbar:

- Search.
- Filter trạng thái.
- Filter category.
- Sort.
- Button `Tạo mới`.

Row actions:

- Sửa.
- Xem trước.
- Nhân bản.
- Archive.
- Xóa.

### 6.3. Editor shell

Layout desktop:

```text
[Step list bên trái] [Form nội dung chính] [Preview/checklist bên phải]
```

Layout mobile:

```text
[Stepper ngang] [Form] [Sticky actions]
```

Sticky action bar:

- `Lưu nháp`
- `Xem trước`
- `Xuất bản`

### 6.4. Media manager

Áp dụng chung cho books/products:

- Upload dropzone rõ ràng.
- Thumbnail 5 ảnh tối đa.
- Badge `Bìa`.
- Drag/reorder hoặc nút lên/xuống.
- Alt text edit inline.
- Warning nếu ít hơn 3 ảnh với sản phẩm.
- Chọn từ thư viện.

### 6.5. Preview panel

Preview nên có 2 mode:

- `Card`: xem item trong grid.
- `Detail`: xem phần hero/detail tóm tắt.

Không cần render full website trong phase đầu; có thể dùng component preview nội bộ.

## 7. Pattern đề xuất cho Thư viện Sách

### 7.1. Header

Nội dung:

- H1: `Thư viện Sách`
- Subcopy ngắn về sách y khoa dễ hiểu.
- Search input lớn.
- Topic chips: `Chống lão hóa`, `Tim mạch`, `Dinh dưỡng`, `Sức khỏe phụ nữ`, `Tiểu đường`, `Sách mới`.

### 7.2. Filter

Filters:

- Chủ đề.
- Năm xuất bản.
- Tác giả.
- Định dạng: sách giấy, ebook, bundle.
- Giá.
- Trạng thái: mới, nổi bật.

Sort:

- Mới nhất.
- Tên A-Z.
- Giá thấp đến cao.
- Năm mới nhất.

### 7.3. Book card

Card cần có:

- Cover.
- Tên sách.
- Subtitle nếu có.
- Tác giả.
- Topic chips.
- Năm.
- Giá.
- CTA `Chi tiết`.

Nếu là sách nổi bật:

- Badge `Mới`.
- Badge `Bác sĩ khuyên đọc`.

### 7.4. Book detail

Thông tin chính:

- Cover lớn.
- Tên sách, subtitle, tác giả.
- Giá và CTA.
- Metadata: năm, số trang, nhà xuất bản, ISBN nếu có.

Các section:

- Mô tả.
- Bạn sẽ học được gì.
- Phù hợp với ai.
- Mục lục hoặc nội dung nổi bật.
- Về tác giả.
- Sách liên quan.
- Ghi chú/bài viết liên quan.

## 8. Pattern đề xuất cho Sản phẩm

### 8.1. Header

Nội dung:

- H1: `Sản phẩm khuyên dùng`
- Subcopy rõ ràng: đây là danh sách tham khảo, không thay thế tư vấn y tế.
- Search input.
- Health goal chips: `Tim mạch`, `Xương khớp`, `Dinh dưỡng`, `Da`, `Giấc ngủ`, `Tiêu hóa`.

### 8.2. Filter

Filters:

- Nhu cầu sức khỏe.
- Loại sản phẩm.
- Brand.
- Giá.
- Đối tượng: người lớn, phụ nữ, người cao tuổi.
- Badge: mới, phổ biến, cần lưu ý.

Sort:

- Mới nhất.
- Giá thấp đến cao.
- Giá cao đến thấp.
- Tên A-Z.

### 8.3. Product card

Card cần có:

- Ảnh sản phẩm rõ, nền sạch.
- Brand.
- Tên sản phẩm.
- Mô tả một dòng.
- Health goal chip.
- Giá.
- CTA `Xem chi tiết`.
- CTA phụ `Mua ngay` nếu có link mua.

Không nên dùng hover mới hiện hành động trên desktop làm cách duy nhất; mobile không có hover.

### 8.4. Product detail

Thông tin chính:

- Gallery ảnh.
- Brand, tên, giá.
- Mô tả ngắn.
- CTA.

Các section:

- Vì sao được khuyên dùng.
- Thành phần chính.
- Cách dùng.
- Lưu ý và đối tượng không nên dùng.
- Câu hỏi thường gặp.
- Bài viết liên quan.
- Disclaimer y khoa.

## 9. Dữ liệu có thể cần bổ sung sau phase UI

Không bắt buộc cho phase UI đầu, nhưng nên chuẩn bị:

Books:

- `format`
- `isbn`
- `pages`
- `publisher`
- `topics`
- `buy_url`
- `featured`
- `sample_url`

Products:

- `brand`
- `health_goals`
- `product_type`
- `ingredients`
- `usage`
- `warnings`
- `contraindications`
- `buy_url`
- `featured`

Chú ý: DB hiện đã có một số trường như `brand`, `usage`, `warnings`, `publisher`, `pages`, nhưng form admin chưa tổ chức chúng thành flow dễ nhập.

## 10. Chỉ số nghiệm thu UX

Admin:

- Tạo nháp sản phẩm/sách trong tối đa 2 phút.
- Sau khi lưu nháp, có thể upload ảnh ngay.
- Trước publish có checklist thiếu/sai.
- Có preview card/detail trước publish.
- Không mất dữ liệu khi chuyển bước.

Public:

- `/books` có search/filter/sort.
- `/products` có search/filter/sort thật.
- Filter đã chọn hiển thị rõ.
- Card không phụ thuộc hover để mở detail.
- Detail pages hiển thị đủ metadata và disclaimer.

## 11. Rủi ro cần tránh

- Không biến public catalog thành marketplace quá nặng.
- Không đưa claim y khoa mạnh vào product card.
- Không bắt admin nhập quá nhiều trường trước khi lưu nháp.
- Không xóa workflow Supabase/Auth/Storage hiện tại.
- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend.
