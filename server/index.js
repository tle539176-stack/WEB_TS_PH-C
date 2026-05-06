import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { query } from './db.js';
import { runMigrations } from './migrate.js';
import { handleDbQuery } from './queryApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json({ limit: '10mb' }));

const sessionSecret = process.env.SESSION_SECRET || 'local-dev-session-secret-change-me';

function makeSession(user) {
  return {
    access_token: user.token,
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    refresh_token: '',
    user: {
      id: user.id,
      email: user.email,
      app_metadata: { role: user.role },
      user_metadata: {},
      aud: 'authenticated',
      created_at: user.created_at ?? new Date().toISOString(),
    },
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    sessionSecret,
    { expiresIn: '7d' },
  );
}

function readBearer(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length);
}

async function optionalAuth(req, _res, next) {
  const token = readBearer(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, sessionSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      token,
    };
  } catch {
    req.user = null;
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    res.status(401).json({ error: { message: 'Admin login required' } });
    return;
  }
  next();
}

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/env-config.js', (_req, res) => {
  res.type('application/javascript').send('window.__APP_CONFIG__ = {};');
});

app.post('/api/auth/sign-in', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  if (!email || !password) {
    res.status(400).json({ error: { message: 'Email and password are required' } });
    return;
  }

  const result = await query('select * from admin_users where email = $1 limit 1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: { message: 'Invalid email or password' } });
    return;
  }

  const token = signToken(user);
  res.json({ session: makeSession({ ...user, token }) });
});

app.get('/api/auth/session', optionalAuth, (req, res) => {
  if (!req.user) {
    res.json({ session: null });
    return;
  }
  res.json({ session: makeSession(req.user) });
});

app.post('/api/auth/reset-password', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/db/query', optionalAuth, async (req, res) => {
  try {
    const result = await handleDbQuery(req.body, req.user);
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(400).json({
      data: null,
      error: { message: error.message || 'Database request failed' },
      count: null,
    });
  }
});

app.post('/api/storage/upload', optionalAuth, requireAdmin, upload.single('file'), async (req, res) => {
  const storagePath = String(req.body?.path ?? '').replace(/^\/+/, '');
  const upsert = String(req.body?.upsert ?? 'false') === 'true';

  if (!req.file || !storagePath) {
    res.status(400).json({ error: { message: 'File and path are required' } });
    return;
  }

  if (!upsert) {
    const existing = await query('select storage_path from media_files where storage_path = $1', [storagePath]);
    if (existing.rowCount > 0) {
      res.status(409).json({ error: { message: 'File already exists' } });
      return;
    }
  }

  await query(
    `
    insert into media_files (storage_path, mime_type, size_bytes, data)
    values ($1, $2, $3, $4)
    on conflict (storage_path) do update
    set mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        data = excluded.data,
        updated_at = now()
    `,
    [storagePath, req.file.mimetype, req.file.size, req.file.buffer],
  );

  res.json({ data: { path: storagePath }, error: null });
});

app.post('/api/storage/remove', optionalAuth, requireAdmin, async (req, res) => {
  const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
  await query('delete from media_files where storage_path = any($1)', [paths]);
  res.json({ data: null, error: null });
});

app.get(/^\/media\/(.+)$/, async (req, res) => {
  const storagePath = decodeURIComponent(req.params[0]);
  const result = await query(
    'select mime_type, data from media_files where storage_path = $1 limit 1',
    [storagePath],
  );

  const file = result.rows[0];
  if (!file) {
    res.status(404).send('Not found');
    return;
  }

  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(file.data);
});

app.use(express.static(distDir));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 3000);

runMigrations()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Web Bac Si server listening on ${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
