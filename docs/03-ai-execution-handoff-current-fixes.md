# 03 - Handoff hiện tại cho AI thực thi

## 1. Vai trò

Codex là người chỉ đạo và kiểm tra:

- Kiểm tra repo thật.
- Xác nhận hướng kiến trúc đã thống nhất.
- Viết tài liệu và prompt giao việc.
- Nghiệm thu bằng lệnh kiểm tra cụ thể.

AI thực thi là người sửa code:

- Chỉ làm theo tài liệu này và `docs/00-ke-hoach-thuc-thi-thong-nhat.md`.
- Không tự đổi hướng kiến trúc.
- Không bỏ qua lỗi kiểm tra.
- Không chuyển sang repo/path khác.

## 2. Repo đúng

Chỉ làm trong repo:

```text
C:\Users\tle53\Desktop\Web bac si
```

Repo này là:

```text
Vite + React + TypeScript
```

Không phải Next.js App Router.

Nếu thấy các file `.next`, `src/app`, `app-path-routes-manifest.json`, hoặc cấu trúc Next.js thì đang ở sai repo.

## 3. Hướng kiến trúc đã chốt

Mục tiêu cuối cùng:

```text
Supabase Auth + Supabase Postgres + Supabase Storage + custom Admin UI
```

Không quay lại:

```text
Firebase Auth
Cloud Firestore
Google login cho Admin
mockData cho public data runtime
Hardcode email/password Admin trong source
SUPABASE_SERVICE_ROLE_KEY trong frontend
```

## 4. Hiện trạng đã kiểm tra

Ngày kiểm tra: 2026-04-19.

Đã có:

- `src/lib/supabase.ts`
- `src/types/database.ts`
- `src/pages/Admin.tsx`
- `src/pages/ProductDetail.tsx`
- `src/services/contentService.ts`
- `src/services/mediaService.ts`
- `src/services/settingsService.ts`
- `src/services/auditLogService.ts`
- `scripts/admin/create-supabase-admin.ts`
- `scripts/admin/set-supabase-admin-role.ts`
- `scripts/admin/remove-supabase-admin-role.ts`
- `Dockerfile`
- `docker-compose.yml`
- `vite.config.ts`

Đã không còn trong `src`:

- `src/firebase.ts`
- `src/data/mockData.ts`
- import `firebase`
- import `firestore`
- import `mockData`

Đã chuyển một phần đúng hướng:

- `ProductDetail.tsx` đã dùng `getProductBySlug`.
- `ProductDetail.tsx` đã dùng `DOMPurify` cho nội dung HTML.
- Docker đã có build args cho `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
- `package.json` không còn dependency runtime `firebase`.

Đã hoàn tất trong lượt tiếp quản:

- `npm run lint` pass thật.
- `npm run build` pass thật.
- `src/types/database.ts` đã dùng `createClient<Database>` với type object chặt hơn, không dùng index signature rộng.
- Các lỗi Supabase `never` khi `.insert`, `.update`, `.upsert` đã được xử lý.
- Script Supabase Admin compile.
- `firebase-admin` đã được gỡ khỏi `devDependencies`.
- Script Firebase cũ `scripts/admin/set-admin-claim.ts` và `scripts/admin/remove-admin-claim.ts` đã được gỡ.
- `.env` đã bỏ Gemini/AI Studio và chỉ giữ mẫu Supabase env.
- Admin Settings đã có cấu hình tên web, logo text, tagline, footer text, SEO title, SEO description và medical disclaimer.

Chưa thể nghiệm thu live nếu thiếu Supabase key thật:

- Đăng nhập `/admin` bằng tài khoản Supabase thật.
- CRUD dữ liệu thật trên Supabase.
- Upload ảnh thật lên Supabase Storage.

## 5. Lỗi bắt buộc phải sửa trước

Chạy:

```powershell
npm run lint
```

Hiện đang fail với nhóm lỗi chính:

```text
Property 'email' does not exist on type 'never'
No overload matches this call
Argument ... is not assignable to parameter of type 'never'
'data' is possibly 'null'
'existing' is possibly 'null'
```

Nguyên nhân chính cần xử lý:

- `src/types/database.ts` thiếu cấu trúc type Supabase đầy đủ.
- Mỗi table trong `Database.public.Tables` cần có `Row`, `Insert`, `Update`, `Relationships`.
- `Database.public` cần có `Tables`, `Views`, `Functions`, `Enums`, `CompositeTypes` nếu dùng theo type mới.
- Không được dùng `as any` rộng để che lỗi.
- Không được báo lint pass nếu `tsc --noEmit` trả exit code khác `0`.

## 6. Nhiệm vụ thực thi ngay

1. Sửa `src/types/database.ts`.

Yêu cầu:

- Làm type tương thích với `@supabase/supabase-js`.
- Thêm `Relationships: []` cho từng table.
- Thêm `Views: { [_ in never]: never }`.
- Thêm `Functions: { [_ in never]: never }`.
- Thêm `CompositeTypes: { [_ in never]: never }`.
- Định nghĩa `Insert` và `Update` đủ mềm cho các field optional/generate từ database.
- Không phá các type đang được service import: `ProductWithImages`, `BookWithImages`, `NoteWithCategory`, `CategoryInsert`, `ProductInsert`, `BookInsert`, `NoteInsert`.

2. Sửa script Admin Supabase.

Yêu cầu:

- `scripts/admin/set-supabase-admin-role.ts` phải tìm user theo email không lỗi type.
- `scripts/admin/remove-supabase-admin-role.ts` phải tìm user theo email không lỗi type.
- Có thể truyền generic `Database` cho `createClient` nếu cần.
- Không đưa service role key vào frontend.

3. Sửa các lỗi null thật trong service.

Yêu cầu:

- Sau `.insert(...).select().single()`, phải kiểm tra `error` và `data`.
- Sau query lấy record cũ, phải kiểm tra `error` và `existing`.
- Không dùng non-null assertion bừa bãi nếu có thể xử lý rõ ràng.

4. Dọn Firebase còn sót lại nếu không còn dùng.

Yêu cầu:

- Xóa `scripts/admin/set-admin-claim.ts`.
- Xóa `scripts/admin/remove-admin-claim.ts`.
- Gỡ `firebase-admin` khỏi `devDependencies` và cập nhật `package-lock.json`.
- Xóa `firestore.rules` và `firebase-blueprint.json` nếu chúng chỉ còn là file lịch sử, vì dự án đã chốt Supabase và không còn dùng Firestore.

5. Kiểm tra không quay lại dữ liệu cũ.

Yêu cầu:

- Không tạo lại `src/firebase.ts`.
- Không tạo lại `src/data/mockData.ts`.
- Không import Firebase/Firestore/mockData trong `src`.
- Seed script hiện dùng dữ liệu mẫu inline qua `scripts/seed/seed-supabase-sample-data.ts`, không phụ thuộc `src/data/mockData.ts`.

## 7. Lệnh nghiệm thu bắt buộc

Chạy từ repo:

```powershell
Get-Location
npm run lint
npm run build
rg -n "firebase|firestore|mockData" src
rg -n "SUPABASE_SERVICE_ROLE_KEY" dist src
```

Kết quả hợp lệ:

- `Get-Location` phải là `C:\Users\tle53\Desktop\Web bac si`.
- `npm run lint` exit code `0`.
- `npm run build` exit code `0`.
- `rg -n "firebase|firestore|mockData" src` không có kết quả.
- `SUPABASE_SERVICE_ROLE_KEY` không xuất hiện trong `dist`.

Nếu Docker Desktop đang chạy thì chạy thêm:

```powershell
docker compose up -d --build
Invoke-WebRequest http://localhost:3001
docker compose down
```

Nếu Docker Desktop chưa chạy, không được kết luận Docker pass. Phải ghi rõ:

```text
Chưa test Docker vì Docker Desktop chưa chạy.
```

## 8. Tiêu chí hoàn thành lượt này

Lượt này chỉ được xem là xong khi:

- Lint pass thật.
- Build pass thật.
- Không còn Firebase/mockData trong runtime `src`.
- Firebase admin script cũ đã bị gỡ nếu dự án đã chốt Supabase.
- Admin Supabase scripts compile.
- Báo cáo rõ tài khoản Admin nằm ở Supabase Authentication Users và quyền Admin nằm ở `app_metadata.role = 'admin'`.
- Báo cáo rõ Docker đã test được hay chưa test được vì môi trường.

## 9. Prompt giao cho AI thực thi

```text
Làm đúng repo `C:\Users\tle53\Desktop\Web bac si` theo `docs/03-ai-execution-handoff-current-fixes.md` và `docs/00-ke-hoach-thuc-thi-thong-nhat.md`: sửa lỗi TypeScript Supabase để `npm run lint` pass thật, sửa scripts Admin Supabase, xử lý null trong services, gỡ Firebase admin script/dependency còn sót nếu không dùng, không tạo lại Firebase/mockData trong `src`, chạy lint/build/rg/Docker nếu Docker Desktop chạy, rồi báo cáo file đã sửa, kết quả lệnh và cách tài khoản Admin nằm trong Supabase.
```
