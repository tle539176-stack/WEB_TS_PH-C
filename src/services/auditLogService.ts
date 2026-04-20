import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'publish' | 'archive'
  | 'upload_image' | 'delete_image' | 'set_primary_image' | 'reorder_images'
  | 'upload_setting_image' | 'select_library_image';

export type AuditEntityType =
  | 'product' | 'book' | 'note' | 'category' | 'setting' | 'media';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function logAction(
  session: Session | null,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  opts?: { before?: Record<string, unknown>; after?: Record<string, unknown> },
): Promise<void> {
  if (!supabase) return;
  const entityUuid = UUID_PATTERN.test(entityId) ? entityId : null;
  const entityKeyData = entityUuid ? {} : { entity_key: entityId };

  await supabase.from('audit_logs').insert({
    actor_id: session?.user?.id ?? null,
    actor_email: session?.user?.email ?? null,
    action,
    entity_type: entityType,
    entity_id: entityUuid,
    before_data: opts?.before ? { ...entityKeyData, ...opts.before } : null,
    after_data: opts?.after ? { ...entityKeyData, ...opts.after } : entityKeyData,
  });
}

export async function getRecentAuditLogs(limit = 20) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
