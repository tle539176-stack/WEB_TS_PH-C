import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Edit, ExternalLink, Plus, Search, Trash2, Video as VideoIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { useAdminToast } from '../common/AdminToast';
import { useConfirm } from '../common/ConfirmDialog';
import * as videoService from '../../../services/videoService';
import type { Video, VideoInsert } from '../../../types/database';

type VideoForm = {
  title: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  category: string;
  duration: string;
  sort_order: string;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY_FORM: VideoForm = {
  title: '',
  video_url: '',
  thumbnail_url: '',
  description: '',
  category: 'Kiến thức sức khỏe và đời sống',
  duration: '',
  sort_order: '0',
  is_featured: false,
  is_active: true,
};

function toForm(video: Video): VideoForm {
  return {
    title: video.title,
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url ?? '',
    description: video.description ?? '',
    category: video.category ?? '',
    duration: video.duration ?? '',
    sort_order: String(video.sort_order),
    is_featured: video.is_featured,
    is_active: video.is_active,
  };
}

function toInput(form: VideoForm): VideoInsert {
  return {
    title: form.title,
    video_url: form.video_url,
    thumbnail_url: form.thumbnail_url || null,
    description: form.description || null,
    category: form.category || null,
    duration: form.duration || null,
    source: 'facebook',
    sort_order: Number(form.sort_order) || 0,
    is_featured: form.is_featured,
    is_active: form.is_active,
  };
}

export function VideosManager({ session: _session }: { session: Session }) {
  const { showToast } = useAdminToast();
  const { confirm } = useConfirm();
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<VideoForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setVideos(await videoService.getAllVideos());
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsAdding(false);
    setIsSaving(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingId) await videoService.updateVideo(editingId, toInput(form));
      else await videoService.createVideo(toInput(form));
      await load();
      showToast(editingId ? 'Đã cập nhật video.' : 'Đã thêm video Facebook.', 'success');
      resetForm();
    } catch {
      setIsSaving(false);
      showToast('Không lưu được video. Kiểm tra lại link và thông tin.', 'error');
    }
  };

  const remove = async (video: Video) => {
    const ok = await confirm({
      title: 'Xóa video?',
      message: `Video "${video.title}" sẽ bị gỡ khỏi trang chủ.`,
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await videoService.deleteVideo(video.id);
      await load();
      showToast('Đã xóa video.', 'success');
    } catch {
      showToast('Không xóa được video.', 'error');
    }
  };

  const filtered = videos.filter(video => {
    const q = searchTerm.toLowerCase();
    return video.title.toLowerCase().includes(q) || video.video_url.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Video Facebook</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Chọn lọc video hiển thị trên trang chủ theo dạng dải ngang.
          </p>
        </div>
        <Button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setIsAdding(true); }}
          className="bg-[#0A3151] text-white hover:bg-[#0D426E]"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm video
        </Button>
      </div>

      {isAdding && (
        <Card className="border-none p-6 shadow-md">
          <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div>
                <label className="label-xs">Tiêu đề video</label>
                <Input
                  required
                  value={form.title}
                  onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                  placeholder="#515. Uống bổ sung Whey protein có tốt không?"
                />
              </div>
              <div>
                <label className="label-xs">Link video Facebook</label>
                <Input
                  required
                  value={form.video_url}
                  onChange={event => setForm(prev => ({ ...prev, video_url: event.target.value }))}
                  placeholder="https://www.facebook.com/.../videos/..."
                />
                <p className="mt-1 text-[11px] text-neutral-400">Video cần để chế độ Public thì mới nhúng xem trực tiếp được.</p>
              </div>
              <div>
                <label className="label-xs">Link ảnh thumbnail</label>
                <Input
                  value={form.thumbnail_url}
                  onChange={event => setForm(prev => ({ ...prev, thumbnail_url: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label-xs">Mô tả ngắn</label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                  placeholder="Một vài dòng để người xem hiểu video nói về điều gì..."
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg bg-neutral-50 p-4">
              <div>
                <label className="label-xs">Nhóm nội dung</label>
                <Input
                  value={form.category}
                  onChange={event => setForm(prev => ({ ...prev, category: event.target.value }))}
                  placeholder="Kiến thức sức khỏe và đời sống"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Thời lượng</label>
                  <Input
                    value={form.duration}
                    onChange={event => setForm(prev => ({ ...prev, duration: event.target.value }))}
                    placeholder="17:31"
                  />
                </div>
                <div>
                  <label className="label-xs">Thứ tự</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={event => setForm(prev => ({ ...prev, sort_order: event.target.value }))}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={event => setForm(prev => ({ ...prev, is_featured: event.target.checked }))}
                />
                Ghim lên trước
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={event => setForm(prev => ({ ...prev, is_active: event.target.checked }))}
                />
                Hiển thị trang chủ
              </label>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
                <Button type="submit" disabled={isSaving} className="bg-[#0A3151] px-7 text-white">
                  {editingId ? 'Cập nhật' : 'Lưu'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 rounded-lg border border-neutral-100 bg-white p-3 shadow-sm">
        <Search className="ml-2 h-4 w-4 text-neutral-400" />
        <Input
          className="h-auto border-none p-0 text-sm shadow-none focus-visible:ring-0"
          placeholder="Tìm video..."
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
      </div>

      <Card className="overflow-hidden border-none shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-4 text-[10px] font-bold uppercase text-neutral-400">Video</th>
              <th className="p-4 text-[10px] font-bold uppercase text-neutral-400">Trạng thái</th>
              <th className="p-4 text-right text-[10px] font-bold uppercase text-neutral-400">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filtered.map(video => (
              <tr key={video.id} className="hover:bg-neutral-50">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden bg-neutral-100">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                      ) : (
                        <VideoIcon className="h-6 w-6 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold text-[#0A3151]">{video.title}</p>
                      <a href={video.video_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#0A3151]">
                        Mở link Facebook <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs text-neutral-500">
                  <div>{video.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</div>
                  {video.is_featured && <div className="mt-1 font-semibold text-[#0A3151]">Đã ghim</div>}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setForm(toForm(video)); setEditingId(video.id); setIsAdding(true); }}
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                      aria-label="Chỉnh sửa video"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(video)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                      aria-label="Xóa video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-sm text-neutral-400">
                  Chưa có video nào. Bấm “Thêm video” để tạo dải video trên trang chủ.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
