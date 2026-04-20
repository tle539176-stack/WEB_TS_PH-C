/**
 * Grant admin role to an existing Supabase Auth user.
 * Usage:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/admin/set-supabase-admin-role.ts admin@example.com
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!email) {
  console.error('Usage: npx tsx scripts/admin/set-supabase-admin-role.ts <email>');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) { console.error(listErr.message); process.exit(1); }

const user = list.users.find((u: { email?: string }) => u.email === email);
if (!user) { console.error(`User not found: ${email}`); process.exit(1); }

const { error } = await admin.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: 'admin' },
});

if (error) { console.error('Error:', error.message); process.exit(1); }
console.log(`Granted admin role to ${email} (${user.id})`);
