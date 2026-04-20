/**
 * Create a Supabase Auth user and grant admin role.
 * Usage:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/admin/create-supabase-admin.ts admin@example.com "S3cur3P@ssword!"
 *
 * NEVER commit SUPABASE_SERVICE_ROLE_KEY to git.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];
const password = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: npx tsx scripts/admin/create-supabase-admin.ts <email> <password>');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: 'admin' },
});

if (error) {
  console.error('Error creating user:', error.message);
  process.exit(1);
}

console.log(`Created admin user: ${data.user.email} (${data.user.id})`);
