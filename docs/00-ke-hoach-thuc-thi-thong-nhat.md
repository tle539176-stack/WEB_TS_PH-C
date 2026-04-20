# 00 - Kế hoạch thực thi thống nhất

## 1. Trạng thái tài liệu

Đây là tài liệu nguồn sự thật duy nhất để thực thi nâng cấp dự án.

Khi giao việc cho AI agent hoặc khi tự triển khai, chỉ dùng tài liệu này làm chuẩn. Các tài liệu `01` và `02` hiện chỉ còn là tài liệu tham khảo lịch sử, không được thực thi riêng lẻ.

Phase nâng cấp upload ảnh trực tiếp, Media Library, logo/hero/settings media được chi tiết hóa trong `docs/04-admin-media-upload-va-media-library.md`. Khi thực thi phần Media, dùng `00` làm chuẩn kiến trúc và dùng `04` làm checklist triển khai chi tiết.

Lý do cần thống nhất:

- Tài liệu `01` đi theo hướng Firebase Auth + Firestore, chỉ phù hợp giai đoạn chuyển tiếp.
- Tài liệu `02` mới dựng nền Supabase/Postgres, nhưng chưa bao phủ toàn bộ migration.
- Mục tiêu hiện tại là chuyển hẳn sang Supabase cho Auth, Database và Storage.

## 2. Mục tiêu cuối cùng

Sau khi hoàn thành, dự án phải đạt trạng thái sau:

- Public website không còn dùng `mockData` cho sản phẩm, sách và bài ghi chú.
- Admin không còn dùng Firebase Auth hoặc Cloud Firestore.
- Admin đăng nhập bằng email/password qua Supabase Auth.
- Không có đăng ký Admin công khai trên website.
- Quyền Admin nằm trong Supabase `app_metadata.role = 'admin'`.
- Dữ liệu chính lưu trong Supabase Postgres.
- Ảnh lưu trong Supabase Storage; Postgres chỉ lưu metadata ảnh.
- Mỗi sản phẩm có tối đa 5 ảnh.
- Mỗi sách có tối đa 5 ảnh.
- Public site chỉ đọc nội dung `published`.
- Admin đọc/ghi được nội dung nhờ RLS policy.
- Docker build và chạy được như hiện tại.

## 3. Kiến trúc chốt

```text
Frontend: React + Vite
Admin UI: custom Admin trong app hiện tại
Auth: Supabase Auth email/password
Database: Supabase Postgres
Storage: Supabase Storage
Authorization: Postgres Row Level Security
Deploy local: Docker + nginx
```

Không dùng làm kiến trúc chính:

```text
Firebase Auth
Cloud Firestore
Google login cho Admin
Password hardcode trong source code
Admin email hardcode trong frontend
Service role key trong frontend
```

## 4. Hiện trạng repo đã kiểm tra ngày 2026-04-19

Repo đúng:

```text
C:\Users\tle53\Desktop\Web bac si
```

Đây là dự án Vite + React + TypeScript, không phải Next.js App Router.

Đã có nền Supabase:

- `@supabase/supabase-js` đã có trong `package.json`.
- `src/lib/supabase.ts` đã có client Supabase.
- `src/types/database.ts` đã có type database.
- `supabase/migrations/001_initial_schema.sql` đã có schema chính.
- `.env.example` đã có `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
- `src/services/contentService.ts` đã có service dữ liệu nội dung.
- `src/services/mediaService.ts` đã có service ảnh.
- `src/services/settingsService.ts` đã có service settings.
- `src/services/auditLogService.ts` đã có service audit log.
- `scripts/admin/create-supabase-admin.ts` đã có script tạo Admin Supabase.
- `scripts/admin/set-supabase-admin-role.ts` đã có script gán role Admin.
- `scripts/admin/remove-supabase-admin-role.ts` đã có script gỡ role Admin.

Đã chuyển một phần đúng hướng:

- `src/firebase.ts` không còn tồn tại.
- `firebase-applet-config.json` không còn tồn tại.
- `src/data/mockData.ts` không còn tồn tại.
- `rg -n "firebase|firestore|mockData" src` không có kết quả.
- `src/pages/ProductDetail.tsx` đã dùng `getProductBySlug`.
- `src/pages/ProductDetail.tsx` đã dùng `DOMPurify` để sanitize HTML.
- Docker đã có build args cho `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

Đã hoàn tất ở nền code:

- `npm run lint` pass thật.
- `npm run build` pass thật.
- `src/types/database.ts` đã tương thích với `createClient<Database>`.
- Script Admin Supabase compile.
- `firebase-admin` và script Firebase Admin cũ đã được gỡ.
- Admin Settings đã có cấu hình tên web, logo text, tagline, footer text, SEO title, SEO description và medical disclaimer.

Chưa thể nghiệm thu live nếu chưa có Supabase env thật:

- Đăng nhập `/admin` bằng tài khoản Supabase thật.
- CRUD dữ liệu thật trên Supabase.
- Upload ảnh thật lên Supabase Storage.

Tài liệu thực thi theo hiện trạng mới nhất:

```text
docs/03-ai-execution-handoff-current-fixes.md
```

## 5. Tài khoản Admin nằm ở đâu

Tài khoản Admin mới phải nằm trong:

```text
Supabase Dashboard > Authentication > Users
```

Admin đăng nhập tại `/admin` bằng:

```text
Email
Password
```

Điều kiện để vào được Admin:

```json
{
  "app_metadata": {
    "role": "admin"
  }
}
```

Không kiểm tra quyền Admin bằng:

- Email hardcode.
- Password trong `.env` frontend.
- Document trong Firestore.
- Google account.

## 6. Biến môi trường bắt buộc

Tạo `.env.local` để chạy frontend:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Tạo `.env` hoặc export biến môi trường khi chạy script Admin nội bộ:

```env
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Nguyên tắc bảo mật:

- `VITE_SUPABASE_URL` được phép expose ra browser.
- `VITE_SUPABASE_ANON_KEY` được phép expose ra browser vì RLS bảo vệ dữ liệu.
- `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không được import vào frontend.
- Không commit `.env.local`, `.env`, service key hoặc password thật.

## 7. Thứ tự thực thi một lượt

### Bước 1: Chuẩn hóa schema Supabase

Cập nhật migration Supabase để đảm bảo có đầy đủ:

- Extension cần thiết cho `gen_random_uuid()` nếu chưa có.
- Enum `content_status`.
- Bảng `categories`.
- Bảng `products`.
- Bảng `product_images`.
- Bảng `books`.
- Bảng `book_images`.
- Bảng `notes`.
- Bảng `settings`.
- Bảng `audit_logs`.
- Trigger tự cập nhật `updated_at`.
- RLS enabled cho tất cả bảng public.
- Helper SQL `is_admin()` để tránh lặp điều kiện role.
- Policy public read cho row `published`.
- Policy Admin write dựa trên `app_metadata.role = 'admin'`.

Cần bổ sung thêm vào migration hiện tại:

- Giới hạn tối đa 5 ảnh cho mỗi product.
- Giới hạn tối đa 5 ảnh cho mỗi book.
- Unique partial index để mỗi product chỉ có tối đa 1 ảnh primary.
- Unique partial index để mỗi book chỉ có tối đa 1 ảnh primary.
- Storage bucket và policy cho ảnh.

### Bước 2: Tạo Supabase Storage

Tạo bucket:

```text
site-media
```

Cấu trúc path đề xuất:

```text
products/{productId}/01.webp
products/{productId}/02.webp
books/{bookId}/01.webp
books/{bookId}/02.webp
notes/{noteId}/cover.webp
settings/home/hero.webp
```

Policy tối thiểu:

- Public được đọc file trong bucket nếu ảnh dùng cho nội dung public.
- Chỉ Admin được upload/update/delete.
- Admin được xác định bằng `app_metadata.role = 'admin'`.

Giai đoạn đầu có thể dùng bucket public để đơn giản hóa render ảnh. Nếu sau này cần bảo mật file riêng tư thì chuyển sang signed URL.

### Bước 3: Tạo script Admin Supabase

Cần thêm script nội bộ:

```text
scripts/admin/create-supabase-admin.ts
scripts/admin/set-supabase-admin-role.ts
scripts/admin/remove-supabase-admin-role.ts
```

Yêu cầu:

- Dùng `SUPABASE_SERVICE_ROLE_KEY`.
- Chạy bằng `npx tsx`.
- Không import các script này vào frontend.
- Không lưu password thật trong repo.

Lệnh mẫu tạo Admin:

```powershell
$env:VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx tsx scripts/admin/create-supabase-admin.ts admin@example.com "MatKhauManh"
```

Lệnh mẫu set role Admin cho user đã tồn tại:

```powershell
$env:VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx tsx scripts/admin/set-supabase-admin-role.ts admin@example.com
```

Sau khi set role, Admin cần đăng xuất và đăng nhập lại để token mới có metadata.

### Bước 4: Đổi Admin Auth sang Supabase

Trong `src/pages/Admin.tsx`, thay Firebase Auth bằng Supabase Auth:

- Dùng `supabase.auth.signInWithPassword()` để đăng nhập.
- Dùng `supabase.auth.signOut()` để đăng xuất.
- Dùng `supabase.auth.getSession()` hoặc `onAuthStateChange()` để giữ session.
- Kiểm tra `session.user.app_metadata.role === 'admin'`.
- Nếu không phải Admin thì chặn vào CMS.
- Không có nút đăng ký.
- Có nút quên mật khẩu nếu Supabase SMTP đã cấu hình.

Login UI phải có:

```text
Email
Mật khẩu
Đăng nhập
Quên mật khẩu
Thông báo lỗi generic
Loading state
```

Thông báo lỗi không được nói rõ email có tồn tại hay không.

### Bước 5: Tạo service layer Supabase

Không gọi Supabase rải rác trực tiếp trong nhiều component lớn. Tạo lớp service để dễ kiểm soát:

```text
src/services/adminAuthService.ts
src/services/contentService.ts
src/services/mediaService.ts
src/services/settingsService.ts
src/services/auditLogService.ts
```

Service cần bao phủ:

- Auth Admin.
- CRUD categories.
- CRUD products.
- CRUD product images.
- CRUD books.
- CRUD book images.
- CRUD notes.
- CRUD settings.
- Ghi audit logs.
- Upload/delete ảnh Storage.

### Bước 6: Chuyển Admin CRUD khỏi Firestore

Admin phải đọc/ghi Supabase cho các module:

- Dashboard.
- Products.
- Product images.
- Books.
- Book images.
- Notes.
- Categories.
- Settings.
- Audit logs.

Yêu cầu khi chuyển:

- Giữ UI hiện tại nếu có thể, ưu tiên thay data layer trước.
- Không refactor giao diện quá lớn trong cùng lượt nếu không cần.
- Mọi thao tác create/update/delete phải xử lý loading/error rõ ràng.
- Khi publish content, set `status = 'published'` và `published_at` nếu chưa có.
- Khi update/delete, ghi audit log.

### Bước 7: Thêm quản lý nhiều ảnh

Products Admin:

- Upload tối đa 5 ảnh/product.
- Hiển thị gallery ảnh.
- Chọn ảnh primary.
- Sắp xếp ảnh bằng `sort_order`.
- Nhập `alt` cho từng ảnh.
- Xóa ảnh khỏi Storage và xóa row metadata.

Books Admin:

- Upload tối đa 5 ảnh/book.
- Hỗ trợ ảnh bìa trước, bìa sau, mục lục hoặc ảnh review.
- Chọn ảnh primary.
- Sắp xếp ảnh bằng `sort_order`.
- Nhập `alt` cho từng ảnh.

Database phải là lớp bảo vệ cuối cùng, không chỉ validate ở UI.

### Bước 8: Chuyển public site khỏi `mockData`

Các trang public phải đọc Supabase:

- `Home.tsx`: đọc settings, notes/books nổi bật nếu có.
- `Products.tsx`: đọc products `status = published` kèm ảnh primary.
- `ProductDetail.tsx`: đọc product theo `slug` kèm `product_images`.
- `Books.tsx`: đọc books `status = published` kèm ảnh primary.
- `BookDetail.tsx`: đọc book theo `slug` kèm `book_images`.
- `Notes.tsx`: đọc notes `status = published`.
- `NoteDetail.tsx`: đọc note theo `slug`.
- `Footer.tsx`: đọc settings từ Supabase.

Mỗi trang cần có:

- Loading state.
- Empty state.
- Error state.
- Không render draft/in_review/archived cho public.

### Bước 9: Seed/migrate dữ liệu cũ

Tạo script seed dữ liệu mẫu sang Supabase:

```text
scripts/seed/seed-supabase-sample-data.ts
```

Yêu cầu:

- Insert categories trước.
- Insert products/books/notes sau.
- Nếu ảnh hiện tại là URL ngoài, lưu vào `url`, để `storage_path = null`.
- Nếu có file ảnh local, upload vào Storage rồi lưu metadata.
- Chạy được nhiều lần ở mức an toàn, tránh tạo trùng slug.

Lệnh mẫu:

```powershell
$env:VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx tsx scripts/seed/seed-supabase-sample-data.ts
```

### Bước 10: Gỡ Firebase khỏi runtime

Sau khi Admin và public site đã dùng Supabase:

- Xóa import Firebase trong `src`.
- Không còn dùng `src/firebase.ts`.
- Không còn dùng `firebase/firestore`.
- Không còn dùng `firebase/auth`.
- Không còn đọc `firebase-applet-config.json` trong app runtime.
- `firestore.rules` và `firebase-blueprint.json` đã được xóa khỏi repo để tránh nhầm lẫn với hướng Supabase hiện tại.

Kiểm tra bằng:

```powershell
rg -n "firebase|firestore|mockData" src
```

Kỳ vọng cuối:

- Không còn Firebase trong `src`.
- Không còn `mockData` trong public pages.
- Nếu còn `mockData`, chỉ được dùng trong seed script hoặc tài liệu.

### Bước 11: Cập nhật Docker/env

Docker build hiện là static Vite build. Với biến `VITE_`, giá trị được đóng vào bundle tại build time.

Cần cập nhật Docker để truyền đủ build args/env:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` không được đưa vào Docker frontend image.

### Bước 12: Kiểm thử bắt buộc

Chạy kiểm tra kỹ thuật:

```powershell
npm run lint
npm run build
docker compose up -d --build
Invoke-WebRequest -UseBasicParsing http://localhost:3001
```

Kiểm tra tìm kiếm phụ thuộc cũ:

```powershell
rg -n "firebase|firestore|mockData" src
```

Kiểm thử nghiệp vụ:

- Truy cập `/admin` khi chưa login: bị yêu cầu đăng nhập.
- Login bằng user không có `role = admin`: bị chặn.
- Login bằng user Admin: vào được dashboard.
- Tạo product mới: lưu vào Supabase.
- Upload 5 ảnh product: thành công.
- Upload ảnh thứ 6: bị chặn.
- Chọn primary image: public list dùng đúng ảnh primary.
- Tạo book mới: lưu vào Supabase.
- Upload 5 ảnh book: thành công.
- Tạo note `draft`: public không thấy.
- Đổi note sang `published`: public thấy.
- Sửa settings: Home/Footer cập nhật.
- Refresh trang public: dữ liệu vẫn còn.
- Docker chạy được ở `http://localhost:3001`.

## 8. Điều kiện hoàn thành

Chỉ xem là hoàn thành khi đạt đủ:

- `/admin` đăng nhập được bằng email/password Supabase.
- User Admin có `app_metadata.role = 'admin'`.
- Admin CRUD không còn dùng Firestore.
- Public site không còn phụ thuộc `mockData` cho nội dung chính.
- Products/books có nhiều ảnh qua Supabase Storage.
- RLS bật và chặn đúng quyền.
- Không có service role key trong frontend bundle.
- `npm run lint` pass.
- `npm run build` pass.
- Docker build/run pass.
- Tài liệu được cập nhật theo trạng thái thật sau khi code xong.

## 9. Những việc không làm trong lượt này

Để tránh vỡ phạm vi, không làm các việc sau trừ khi có yêu cầu riêng:

- Không làm hệ thống thanh toán/order.
- Không làm inventory/phân kho.
- Không làm nhiều role phức tạp như editor/reviewer nếu chưa cần.
- Không dựng backend Express riêng nếu Supabase RLS đã đủ.
- Không thiết kế lại toàn bộ giao diện public nếu UI hiện tại đang ổn.
- Không thêm đăng ký public cho Admin.

## 10. Câu lệnh giao việc cho AI thực thi một lượt

Dùng prompt này khi muốn AI agent thực thi toàn bộ nâng cấp:

```text
Thực thi toàn bộ nâng cấp theo `docs/00-ke-hoach-thuc-thi-thong-nhat.md`: thống nhất dự án sang Supabase Auth + Postgres + Storage, bỏ Firebase/Firestore khỏi runtime, cho `/admin` đăng nhập bằng email/password Supabase, kiểm tra quyền bằng `session.user.app_metadata.role === 'admin'`, tạo script tạo/set/remove Admin bằng service role, chuyển Admin CRUD products/books/notes/categories/settings/audit_logs sang Supabase, hỗ trợ tối đa 5 ảnh cho mỗi product/book qua Supabase Storage, chuyển public pages khỏi `mockData` sang dữ liệu `published` từ Supabase, cập nhật env/Docker/docs, rồi chạy `npm run lint`, `npm run build`, `docker compose up -d --build` và báo cáo cách đăng nhập Admin + file đã sửa + rủi ro còn lại. Nếu thiếu Supabase env thật thì vẫn tạo đầy đủ code/script và ghi rõ bước nào cần key thật; không quay lại Firebase, không hardcode password, không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend.
```
