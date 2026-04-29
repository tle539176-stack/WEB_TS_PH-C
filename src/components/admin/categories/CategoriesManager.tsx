import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import * as content from '../../../services/contentService';
import { supabase } from '../../../lib/supabase';
import { useConfirm } from '../common/ConfirmDialog';
import { useAdminToast } from '../common/AdminToast';
import { selectControlClass } from '../common/adminHelpers';
import type { Category } from '../../../types/database';

const CATEGORY_TYPES = [
  { value: 'note', label: 'Bài viết' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'book', label: 'Sách' },
  { value: 'tag', label: 'Tag' },
  { value: 'topic', label: 'Chủ đề' },
  { value: 'condition', label: 'Bệnh lý / Tình trạng' },
  { value: 'service', label: 'Dịch vụ' },
];

function TableAction({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Chỉnh sửa" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
          <Edit className="w-3.5 h-3.5" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Xóa" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function CategoriesManager({ session: _session }: { session: Session }) {
  const { confirm } = useConfirm();
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'note', parent_id: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    if (supabase) setCategories(await content.getCategories());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const saveData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        parent_id: formData.parent_id || undefined,
      };
      if (editingId) await content.updateCategory(editingId, saveData);
      else await content.createCategory(saveData);
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', description: '', type: 'note', parent_id: '' });
      await load();
      showToast(editingId ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục mới.', 'success');
    } catch {
      showToast('Lỗi khi lưu danh mục.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Xóa danh mục?', message: 'Hành động này không thể hoàn tác.', confirmText: 'Xóa', danger: true });
    if (!ok) return;
    try {
      await content.deleteCategory(id);
      await load();
      showToast('Đã xóa danh mục.', 'success');
    } catch {
      showToast('Lỗi khi xóa danh mục.', 'error');
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Cấu hình Danh mục</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý các chuyên mục phân loại bài viết</p>
        </div>
        <Button
          onClick={() => { setEditingId(null); setFormData({ name: '', description: '', type: 'note', parent_id: '' }); setIsAdding(true); }}
          className="bg-[#0A3151] hover:bg-[#0D426E] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Cập nhật chuyên mục' : 'Tạo chuyên mục mới'}</h3>
            <div>
              <label className="label-xs">Tên danh mục</label>
              <Input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label-xs">Loại danh mục</label>
              <select
                value={formData.type}
                onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                className={`${selectControlClass} w-full`}
              >
                {CATEGORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Danh mục cha (Tùy chọn)</label>
              <select
                value={formData.parent_id}
                onChange={e => setFormData(p => ({ ...p, parent_id: e.target.value }))}
                className={`${selectControlClass} w-full`}
              >
                <option value="">— Không có danh mục cha —</option>
                {categories
                  .filter(c => c.id !== editingId)
                  .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Mô tả (Tùy chọn)</label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Hủy</Button>
              <Button type="submit" className="bg-[#0A3151] text-white px-8">{editingId ? 'Cập nhật' : 'Lưu'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input
          className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tên</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Mô tả</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="p-4 font-bold text-[#0A3151]">{c.name}</td>
                <td className="p-4 text-xs text-neutral-500">{c.description ?? '—'}</td>
                <td className="p-4">
                  <TableAction
                    onEdit={() => { setFormData({ name: c.name, description: c.description ?? '', type: c.type, parent_id: c.parent_id ?? '' }); setEditingId(c.id); setIsAdding(true); }}
                    onDelete={() => handleDelete(c.id)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-sm text-neutral-400">Không có danh mục phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
