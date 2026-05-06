import { supabase, assertSupabase } from '../lib/supabase';
import type { Video, VideoInsert } from '../types/database';

export type VideoInput = {
  title: string;
  video_url: string;
  thumbnail_url?: string | null;
  description?: string | null;
  category?: string | null;
  duration?: string | null;
  source?: Video['source'];
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
};

function normalizeVideoInput(input: VideoInput): VideoInsert {
  return {
    title: input.title.trim(),
    video_url: input.video_url.trim(),
    thumbnail_url: input.thumbnail_url?.trim() || null,
    description: input.description?.trim() || null,
    category: input.category?.trim() || null,
    duration: input.duration?.trim() || null,
    source: input.source ?? 'facebook',
    sort_order: input.sort_order ?? 0,
    is_featured: input.is_featured ?? false,
    is_active: input.is_active ?? true,
  };
}

export function buildFacebookEmbedUrl(videoUrl: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=734`;
}

export async function getHomeVideos(limit = 6): Promise<Video[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Video[];
}

export async function getAllVideos(): Promise<Video[]> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Video[];
}

export async function createVideo(input: VideoInput): Promise<Video> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('videos')
    .insert(normalizeVideoInput(input))
    .select()
    .single();
  if (error) throw error;
  return data as Video;
}

export async function updateVideo(id: string, input: Partial<VideoInput>): Promise<void> {
  assertSupabase(supabase);
  const row = normalizeVideoInput({
    title: input.title ?? '',
    video_url: input.video_url ?? '',
    thumbnail_url: input.thumbnail_url,
    description: input.description,
    category: input.category,
    duration: input.duration,
    source: input.source,
    sort_order: input.sort_order,
    is_featured: input.is_featured,
    is_active: input.is_active,
  });
  const updates = Object.fromEntries(
    Object.entries(row).filter(([key, value]) => {
      if (key === 'title' && value === '') return false;
      if (key === 'video_url' && value === '') return false;
      return value !== undefined;
    }),
  ) as Partial<VideoInsert>;

  const { error } = await supabase.from('videos').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteVideo(id: string): Promise<void> {
  assertSupabase(supabase);
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}
