import { supabase, assertSupabase } from '../lib/supabase';
import { slugify } from '../lib/slugify';
import type {
  Person, PersonInsert,
  NoteSourceRow, NoteSourceRowInsert,
  ContentReview, ContentReviewInsert,
  ContentRevision, ContentRevisionInsert,
} from '../types/database';

// ============================================================
// People
// ============================================================

export async function getPeople(role?: Person['role']): Promise<Person[]> {
  assertSupabase(supabase);
  let query = supabase.from('people').select('*').order('display_name', { ascending: true });
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function getActivePeople(role?: Person['role']): Promise<Person[]> {
  assertSupabase(supabase);
  let query = supabase
    .from('people')
    .select('*')
    .eq('is_active', true)
    .order('display_name', { ascending: true });
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function createPerson(input: Omit<PersonInsert, 'id'>): Promise<Person> {
  assertSupabase(supabase);
  const row: PersonInsert = {
    display_name: input.display_name,
    slug: input.slug || slugify(input.display_name),
    role: input.role ?? 'reviewer',
    professional_title: input.professional_title ?? null,
    credentials: input.credentials ?? null,
    specialties: input.specialties ?? [],
    bio: input.bio ?? null,
    profile_url: input.profile_url ?? null,
    same_as: input.same_as ?? [],
    is_public: input.is_public ?? true,
    is_active: input.is_active ?? true,
  };
  const { data, error } = await supabase.from('people').insert(row).select().single();
  if (error) throw error;
  return data as Person;
}

export async function updatePerson(id: string, input: Partial<PersonInsert>): Promise<void> {
  assertSupabase(supabase);
  if (input.display_name && !input.slug) {
    input = { ...input, slug: slugify(input.display_name) };
  }
  const { error } = await supabase.from('people').update(input).eq('id', id);
  if (error) throw error;
}

export async function deactivatePerson(id: string): Promise<void> {
  assertSupabase(supabase);
  const { error } = await supabase.from('people').update({ is_active: false }).eq('id', id);
  if (error) throw error;
}

// ============================================================
// Note Sources
// ============================================================

export async function getNoteSourcesByNoteId(noteId: string): Promise<NoteSourceRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('note_sources')
    .select('*')
    .eq('note_id', noteId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data ?? []) as NoteSourceRow[];
}

export type StructuredSourceInput = {
  title: string;
  url?: string | null;
  publisher?: string | null;
  source_type?: NoteSourceRow['source_type'];
  doi?: string | null;
  pmid?: string | null;
  published_at?: string | null;
  accessed_at?: string | null;
  evidence_level?: NoteSourceRow['evidence_level'];
  notes?: string | null;
};

export async function upsertNoteSources(
  noteId: string,
  sources: StructuredSourceInput[],
): Promise<NoteSourceRow[]> {
  assertSupabase(supabase);

  // Delete existing and re-insert
  const { error: deleteError } = await supabase
    .from('note_sources')
    .delete()
    .eq('note_id', noteId);
  if (deleteError) throw deleteError;

  if (sources.length === 0) return [];

  const rows: NoteSourceRowInsert[] = sources.map((s, i) => ({
    note_id: noteId,
    title: s.title,
    url: s.url || null,
    publisher: s.publisher || null,
    source_type: s.source_type ?? 'website',
    doi: s.doi || null,
    pmid: s.pmid || null,
    published_at: s.published_at || null,
    accessed_at: s.accessed_at || null,
    evidence_level: s.evidence_level ?? null,
    notes: s.notes || null,
    sort_order: i,
  }));

  const { data, error } = await supabase.from('note_sources').insert(rows).select();
  if (error) throw error;
  return (data ?? []) as NoteSourceRow[];
}

// ============================================================
// Content Reviews
// ============================================================

export async function createContentReview(input: ContentReviewInsert): Promise<ContentReview> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('content_reviews')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as ContentReview;
}

export async function getLatestReview(entityType: ContentReview['entity_type'], entityId: string): Promise<ContentReview | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('content_reviews')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('decision', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ContentReview | null) ?? null;
}

// ============================================================
// Content Revisions
// ============================================================

export async function createContentRevision(input: ContentRevisionInsert): Promise<ContentRevision> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('content_revisions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as ContentRevision;
}

export async function getNextRevisionVersion(entityType: ContentRevision['entity_type'], entityId: string): Promise<number> {
  if (!supabase) return 1;
  const { data } = await supabase
    .from('content_revisions')
    .select('version')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data as { version: number } | null)?.version ?? 0) + 1;
}
