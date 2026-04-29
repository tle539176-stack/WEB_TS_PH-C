import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Plus, Search, Edit, UserX } from 'lucide-react';
import * as medical from '../../../services/medicalContentService';
import { useConfirm } from '../common/ConfirmDialog';
import { useAdminToast } from '../common/AdminToast';
import { selectControlClass } from '../common/adminHelpers';
import type { Person, PersonInsert } from '../../../types/database';

const ROLE_OPTIONS: { value: Person['role']; label: string }[] = [
  { value: 'reviewer', label: 'Reviewer y tế' },
  { value: 'author', label: 'Tác giả' },
  { value: 'editor', label: 'Biên tập viên' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'contributor', label: 'Cộng tác viên' },
];

const ROLE_LABEL: Record<Person['role'], string> = {
  reviewer: 'Reviewer y tế',
  author: 'Tác giả',
  editor: 'Biên tập',
  admin: 'Admin',
  contributor: 'Cộng tác',
};

type PersonFormData = {
  display_name: string;
  role: Person['role'];
  professional_title: string;
  credentials: string;
  specialties: string;
  bio: string;
  profile_url: string;
  is_public: boolean;
  is_active: boolean;
};

function emptyForm(): PersonFormData {
  return {
    display_name: '',
    role: 'reviewer',
    professional_title: '',
    credentials: '',
    specialties: '',
    bio: '',
    profile_url: '',
    is_public: true,
    is_active: true,
  };
}

export function PeopleManager({ session: _session }: { session: Session }) {
  const { confirm } = useConfirm();
  const { showToast } = useAdminToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PersonFormData>(emptyForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await medical.getPeople();
      setPeople(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.display_name.trim()) {
      showToast('Nhập tên hiển thị.', 'error');
      return;
    }
    setSaving(true);
    try {
      const input: Partial<PersonInsert> = {
        display_name: formData.display_name.trim(),
        role: formData.role,
        professional_title: formData.professional_title.trim() || null,
        credentials: formData.credentials.trim() || null,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        bio: formData.bio.trim() || null,
        profile_url: formData.profile_url.trim() || null,
        is_public: formData.is_public,
        is_active: formData.is_active,
      };

      if (editingId) {
        await medical.updatePerson(editingId, input);
        showToast('Đã cập nhật thông tin.', 'success');
      } else {
        await medical.createPerson(input as Omit<PersonInsert, 'id'>);
        showToast('Đã thêm người mới.', 'success');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData(emptyForm());
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Person) => {
    setFormData({
      display_name: p.display_name,
      role: p.role,
      professional_title: p.professional_title ?? '',
      credentials: p.credentials ?? '',
      specialties: p.specialties.join(', '),
      bio: p.bio ?? '',
      profile_url: p.profile_url ?? '',
      is_public: p.is_public,
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const handleDeactivate = async (p: Person) => {
    if (p.is_active) {
      const ok = await confirm({
        title: 'Vô hiệu hóa?',
        message: `"${p.display_name}" sẽ không còn xuất hiện trong danh sách chọn reviewer/author. Bài viết đã liên kết vẫn giữ nguyên.`,
        confirmText: 'Vô hiệu hóa',
        danger: true,
      });
      if (!ok) return;
      await medical.deactivatePerson(p.id);
    } else {
      await medical.updatePerson(p.id, { is_active: true });
    }
    await load();
    showToast(p.is_active ? 'Đã vô hiệu hóa.' : 'Đã kích hoạt lại.', 'success');
  };

  const filtered = people.filter(p =>
    p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.professional_title ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Người viết & Reviewer</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý tác giả, reviewer y tế, biên tập viên</p>
        </div>
        <Button
          onClick={() => { setEditingId(null); setFormData(emptyForm()); setIsAdding(true); }}
          className="bg-[#0A3151] hover:bg-[#0D426E] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm người
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Cập nhật thông tin' : 'Thêm người mới'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-xs">Tên hiển thị <span className="text-red-500">*</span></label>
                <Input
                  required
                  value={formData.display_name}
                  onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Ví dụ: BS. Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="label-xs">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value as Person['role'] }))}
                  className={`${selectControlClass} w-full`}
                >
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xs">Chức danh chuyên môn</label>
                <Input
                  value={formData.professional_title}
                  onChange={e => setFormData(p => ({ ...p, professional_title: e.target.value }))}
                  placeholder="Bác sĩ chuyên khoa Nội tiết"
                />
              </div>
              <div>
                <label className="label-xs">Bằng cấp / Chứng chỉ</label>
                <Input
                  value={formData.credentials}
                  onChange={e => setFormData(p => ({ ...p, credentials: e.target.value }))}
                  placeholder="MD, PhD..."
                />
              </div>
              <div>
                <label className="label-xs">Chuyên môn (phân cách bằng dấu phẩy)</label>
                <Input
                  value={formData.specialties}
                  onChange={e => setFormData(p => ({ ...p, specialties: e.target.value }))}
                  placeholder="Lão khoa, Nội tiết, Dinh dưỡng"
                />
              </div>
              <div>
                <label className="label-xs">URL hồ sơ công khai</label>
                <Input
                  type="url"
                  value={formData.profile_url}
                  onChange={e => setFormData(p => ({ ...p, profile_url: e.target.value }))}
                  placeholder="https://example.com/profile"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label-xs">Giới thiệu ngắn</label>
                <Textarea
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả ngắn về chuyên môn và kinh nghiệm..."
                />
              </div>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={e => setFormData(p => ({ ...p, is_public: e.target.checked }))}
                    className="rounded border-neutral-300"
                  />
                  Hiển thị công khai
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                    className="rounded border-neutral-300"
                  />
                  Đang hoạt động
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Hủy</Button>
              <Button type="submit" disabled={saving} className="bg-[#0A3151] text-white px-8">
                {editingId ? 'Cập nhật' : 'Lưu'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input
          className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto"
          placeholder="Tìm kiếm theo tên hoặc chức danh..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tên & Chức danh</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Vai trò</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Bằng cấp</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-neutral-50 ${!p.is_active ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <p className="font-bold text-[#0A3151]">{p.display_name}</p>
                  {p.professional_title && <p className="text-xs text-neutral-500 mt-0.5">{p.professional_title}</p>}
                  {p.specialties.length > 0 && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">{p.specialties.join(' · ')}</p>
                  )}
                </td>
                <td className="p-4 text-sm text-neutral-600">{ROLE_LABEL[p.role] ?? p.role}</td>
                <td className="p-4 text-sm text-neutral-500">{p.credentials ?? '—'}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {p.is_active ? 'Hoạt động' : 'Đã vô hiệu hóa'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} aria-label="Chỉnh sửa" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleDeactivate(p)}
                      aria-label={p.is_active ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
                      className={`h-8 w-8 p-0 ${p.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-neutral-400">Chưa có người viết hoặc reviewer nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
