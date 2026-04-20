# Web Bác Sĩ

Dự án Vite + React + TypeScript cho website bác sĩ bán tĩnh, dùng Supabase cho Auth, Postgres và Storage.

## Run Locally

Prerequisites: Node.js, Docker Desktop, Supabase CLI qua `npx`.

1. Install dependencies:

```bash
npm install
```

2. Khởi động Supabase local:

```bash
npx supabase start
```

3. Lấy `Project URL` và `Publishable` từ:

```bash
npx supabase status
```

4. Tạo `.env`:

```env
APP_URL="http://localhost:3001"
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="your-local-publishable-key"
```

5. Tạo tài khoản Admin local:

```bash
$env:VITE_SUPABASE_URL="http://127.0.0.1:54321"
$env:SUPABASE_SERVICE_ROLE_KEY="your-local-secret-key"
npx tsx scripts/admin/create-supabase-admin.ts "<admin-email>" "<strong-password>"
```

Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend, Docker env public hoặc file build.

6. Run the app:

```bash
npm run dev
```

## Run With Docker

1. Đảm bảo `.env` có:

```env
APP_URL="http://localhost:3001"
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="your-local-publishable-key"
```

2. Build and run:

```bash
docker compose up -d --build
```

3. Open:

```text
http://localhost:3001
http://localhost:3001/admin
```

Stop:

```bash
docker compose down
```

## Implementation Docs

- [00 - Kế hoạch thực thi thống nhất](docs/00-ke-hoach-thuc-thi-thong-nhat.md)
- [03 - Handoff hiện tại cho AI thực thi](docs/03-ai-execution-handoff-current-fixes.md)
- [Documentation Index](docs/README.md)
