# Documentation Index

## Tài liệu nguồn sự thật

Từ thời điểm này, tài liệu thực thi chính của dự án là:

1. [00 - Kế hoạch thực thi thống nhất](00-ke-hoach-thuc-thi-thong-nhat.md)
2. [03 - Handoff hiện tại cho AI thực thi](03-ai-execution-handoff-current-fixes.md)
3. [04 - Nâng cấp Admin Media Upload và Media Library](04-admin-media-upload-va-media-library.md)
4. [05 - Nghiên cứu UI/UX Admin, Thư viện Sách và Sản phẩm](05-admin-ui-ux-research-books-products.md)
5. [06 - Spec triển khai UI/UX Admin, Thư viện Sách và Sản phẩm](06-admin-ui-ux-implementation-spec.md)
6. [07 - Kế hoạch thực thi Admin Listing Editor kiểu Shopee/TikTok](07-admin-shopee-tiktok-style-editor-execution-plan.md)
7. [08 - Audit UX Admin và Roadmap thực thi tổng thể](08-admin-ux-audit-roadmap.md)
8. [09 - Kế hoạch thực thi nâng cấp cấu trúc dữ liệu CMS y tế](09-medical-cms-data-architecture-execution-plan.md)
9. [10 - Đặc tả nâng cấp UI/UX Admin Products](10-admin-products-ux-focus-mode-spec.md)
10. [11 - Đặc tả nâng cấp Trang chủ Doctor Content Hub](11-public-homepage-doctor-content-hub-spec.md)

Khi giao việc cho AI hoặc triển khai nâng cấp, dùng `00` làm chuẩn kiến trúc, dùng `03` làm chỉ đạo thực thi theo hiện trạng code mới nhất, và dùng `04` cho phase nâng cấp upload ảnh/Media Library. Mục tiêu cuối cùng là:

```text
Supabase Auth + Supabase Postgres + Supabase Storage + custom Admin UI
```

Với phase cải thiện trải nghiệm nhập liệu Admin và redesign public catalog Books/Products, dùng `05` làm tài liệu nghiên cứu và `06` làm spec triển khai nền. Với phase nâng cấp editor theo kiểu Shopee/TikTok gồm preview đúng ngoài web, upload ảnh compact hàng loạt, staged media, và `Lưu nháp`/`Đăng lên web`, dùng `07` làm tài liệu thực thi chính. Với phase nâng cấp tổng thể toàn bộ `/admin` sau khi audit hiện trạng mới nhất, dùng `08` làm tài liệu điều phối chính. Với phase chuẩn hóa cấu trúc dữ liệu y tế/khoa học gồm reviewer, nguồn tham khảo có cấu trúc, review history, revision và JSON-LD, dùng `09` làm tài liệu thực thi chính. Với phase nâng cấp riêng UX module Admin Products theo hướng editor focus mode, dùng `10` làm tài liệu đặc tả để chốt phương án. Với phase redesign public trang chủ thành hồ sơ bác sĩ + bộ ghi chú + sách + video Facebook, dùng `11` làm tài liệu đặc tả để chốt bố cục trước khi code.

## Trạng thái các tài liệu cũ

4. [01 - Admin Auth Email/Password + Custom Claims](01-admin-auth-email-password-custom-claims.md)

Trạng thái: tài liệu tham khảo lịch sử. Không thực thi nếu dự án đã chọn Supabase. Tài liệu này chỉ dùng khi muốn giữ Firebase Auth/Firestore trong giai đoạn chuyển tiếp.

5. [02 - Admin Data Architecture Postgres/Supabase](02-admin-data-architecture-postgres-supabase.md)

Trạng thái: tài liệu tham khảo kiến trúc. Không thực thi riêng lẻ vì chưa bao phủ toàn bộ migration khỏi Firebase/mockData. Nội dung triển khai đầy đủ đã được gom vào tài liệu `00`.

## Quy ước đặt tên

Tài liệu trong `docs/` dùng định dạng:

```text
NN-nhom-chu-de-ten-tai-lieu.md
```

Trong đó:

- `NN`: số thứ tự 2 chữ số, ví dụ `00`, `01`, `02`.
- `nhom-chu-de`: nhóm nghiệp vụ hoặc kỹ thuật.
- `ten-tai-lieu`: tên ngắn, viết thường, ngăn cách bằng dấu gạch ngang.

Quy ước hiện tại:

- `00-*`: tài liệu thực thi chính.
- `01-79`: tài liệu triển khai hoặc tham khảo đang còn giá trị.
- `80-89`: checklist vận hành/deploy nếu cần sau này.
- `90-99`: tài liệu lưu trữ/lịch sử nếu cần tách riêng sau này.

## Quy tắc cập nhật tài liệu

- Nếu code thay đổi mục tiêu kiến trúc, cập nhật `00` trước.
- Không tạo phase mới làm trái với `00`.
- Không để prompt cũ yêu cầu quay lại Firebase nếu dự án đã chọn Supabase.
- Mọi tài liệu mới phải ghi rõ: thực thi chính, tham khảo, hay lưu trữ.

## Prompt ngắn để giao AI

```text
Làm đúng repo `C:\Users\tle53\Desktop\Web bac si` theo `docs/03-ai-execution-handoff-current-fixes.md` và `docs/00-ke-hoach-thuc-thi-thong-nhat.md`: sửa lỗi TypeScript Supabase để `npm run lint` pass thật, sửa scripts Admin Supabase, xử lý null trong services, gỡ Firebase admin script/dependency còn sót nếu không dùng, không tạo lại Firebase/mockData trong `src`, chạy lint/build/rg/Docker nếu Docker Desktop chạy, rồi báo cáo file đã sửa, kết quả lệnh và cách tài khoản Admin nằm trong Supabase.
```

## Prompt phase 04 - Admin Media

```text
Thực thi phase Admin Media theo `docs/04-admin-media-upload-va-media-library.md`: tạo/apply migration media_assets bằng `npx supabase migration up`, Supabase Storage upload trực tiếp cho sản phẩm/sách/bài viết/logo/hero/settings, MediaGallery/MediaUploader, bỏ URL ảnh khỏi luồng chính, giữ URL nâng cao, xóa Storage object an toàn nếu không còn được tham chiếu, chạy lint/build/Docker và nghiệm thu upload thật trong `/admin`.
```

## Prompt phase 05 - Admin UI/UX Books/Products

```text
Thực thi phase UI/UX theo `docs/05-admin-ui-ux-research-books-products.md` và `docs/06-admin-ui-ux-implementation-spec.md`: nâng cấp Admin Books/Products thành workflow List -> Draft -> Guided editor -> Media -> Checklist -> Preview -> Publish; redesign `/books`, `/books/:slug`, `/products`, `/products/:slug` thành catalog có search/filter/sort/card/detail dễ dùng; ưu tiên dùng field DB hiện có, không đổi kiến trúc Supabase, không dùng Firebase/mockData, chạy build Docker và smoke test create/update/publish/delete.
```

## Prompt phase 07 - Listing editor kiểu Shopee/TikTok

```text
Thực thi phase 07 theo `docs/07-admin-shopee-tiktok-style-editor-execution-plan.md`: Product/Book Admin editor dùng layout kiểu seller center với tabs + form chính + preview sticky; preview dùng chung component với public `/products` và `/books`; ảnh dùng CompactMediaManager upload nhiều ảnh, thumbnail nhỏ, overlay sửa/xóa/đặt ảnh chính, sắp xếp; bỏ dropdown Trạng thái khỏi editor; chỉ dùng `Lưu nháp` và `Đăng lên web`; cho phép upload ảnh ngay trong form mới bằng staged media, không bắt user tạo nháp trước; có checklist chất lượng và cảnh báo claim y tế trước khi publish; giữ Supabase Auth + Postgres + Storage, không Firebase/mockData, chạy Docker build, `tsc --noEmit`, smoke test `/admin`, `/products`, `/books`, `/env-config.js`.
```

## Prompt phase 08 - Audit UX Admin tổng thể

```text
Thực thi phase 08 theo `docs/08-admin-ux-audit-roadmap.md`: biến `/admin` thành Content Operations Workspace; refactor `src/pages/Admin.tsx` chỉ giữ auth gate/sidebar/layout/route; tách Overview, Settings, Categories, Books, Products, Notes thành module riêng; chuẩn hóa toast, confirm dialog, inline error, unsaved changes guard; nâng Dashboard thành work queue; nâng Notes thành CMS editor y tế có staged cover upload, sources, review checklist, preview public, `Lưu nháp`/`Gửi duyệt`/`Đăng lên web`; bổ sung accessibility cho media manager như reorder không cần drag và dialog focus management; giữ Supabase Auth/Postgres/Storage, không Firebase/mockData/service-role trong frontend; chạy build Docker và smoke test Admin.
```

## Prompt phase 09 - Cấu trúc dữ liệu CMS y tế

```text
Thực thi phase 09 theo `docs/09-medical-cms-data-architecture-execution-plan.md`: tạo migration additive cho `people`, `note_sources`, `content_reviews`, `content_revisions`, `content_media`; mở rộng `notes` và `categories`; giữ tương thích `notes.sources`, `product_images`, `book_images`; cập nhật TypeScript types, service layer, Admin Notes/People/Categories, publish checklist y tế, public `NoteDetail` và JSON-LD `MedicalWebPage`; giữ Supabase Auth/Postgres/Storage, không Firebase/mockData/service-role trong frontend; chạy migration local, `tsc --noEmit`, Docker build và smoke test `/admin`, `/notes`, `/notes/:slug`.
```

## Prompt phase 10 - UX Admin Products focus mode

```text
Thực thi phase đầu theo `docs/10-admin-products-ux-focus-mode-spec.md`: nâng module `Danh mục Sản phẩm` trong `/admin` sang Editor Focus Mode; khi click `Thêm sản phẩm` hoặc edit sản phẩm thì ẩn stat cards, search/filter/sort và bảng danh sách, chỉ giữ editor rộng rãi với breadcrumb, form, media, preview, checklist và action bar; `Lưu nháp` khi tạo mới giữ user trong editor và chuyển sang edit mode, publish thành công quay lại list; thêm guard cơ bản khi rời form có thay đổi; không đổi schema DB, không sửa public `/products`; chạy `tsc --noEmit`, Docker build và smoke test `/admin`.
```

## Prompt phase 11 - Public Homepage Doctor Content Hub

```text
Thực thi nâng cấp trang chủ theo `docs/11-public-homepage-doctor-content-hub-spec.md`: redesign `/` thành Doctor Content Hub gồm Hero danh tính bác sĩ, Bộ Ghi Chú/Bài nghiên cứu, Sách và tài liệu đã xuất bản, Video Facebook cuối trang, Footer; dùng một font Geist cho toàn public website; chữ public chỉ xanh #0A3151 hoặc trắng; không gradient/lớp phủ ảnh hero; không section sản phẩm thương mại trên trang chủ; không đổi schema DB nếu không cần; build Docker và chạy lại trên http://localhost:3001/ để nghiệm thu.
```
