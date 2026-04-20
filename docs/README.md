# Documentation Index

## Tài liệu nguồn sự thật

Từ thời điểm này, tài liệu thực thi chính của dự án là:

1. [00 - Kế hoạch thực thi thống nhất](00-ke-hoach-thuc-thi-thong-nhat.md)
2. [03 - Handoff hiện tại cho AI thực thi](03-ai-execution-handoff-current-fixes.md)
3. [04 - Nâng cấp Admin Media Upload và Media Library](04-admin-media-upload-va-media-library.md)

Khi giao việc cho AI hoặc triển khai nâng cấp, dùng `00` làm chuẩn kiến trúc, dùng `03` làm chỉ đạo thực thi theo hiện trạng code mới nhất, và dùng `04` cho phase nâng cấp upload ảnh/Media Library. Mục tiêu cuối cùng là:

```text
Supabase Auth + Supabase Postgres + Supabase Storage + custom Admin UI
```

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
