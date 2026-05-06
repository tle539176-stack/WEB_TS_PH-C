import pg from 'pg';

const { Pool } = pg;

pg.types.setTypeParser(1700, value => (value === null ? null : Number(value)));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. API requests will fail until Railway Postgres is attached.');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function withClient(callback) {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
