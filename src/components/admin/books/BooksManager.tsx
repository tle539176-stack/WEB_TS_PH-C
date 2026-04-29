import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Plus, Search, Edit, Trash2, Loader2, Save, CheckCircle2 } from 'lucide-react';
import * as content from '../../../services/contentService';
import * as media from '../../../services/mediaService';
import { supabase } from '../../../lib/supabase';
import { CompactMediaManager } from '../listing-editor/CompactMediaManager';
import { BookCatalogCard } from '../../catalog/BookCatalogCard';
import { CatalogPreviewShell } from '../../catalog/CatalogPreviewShell';
import { getBookPublishChecks, hasBlockingErrors, hasWarnings } from '../../../lib/contentQuality';
import { StatusBadge } from '../common/StatusBadge';
import { QualityChecklist } from '../common/QualityChecklist';
import { EditorTabs } from '../common/EditorTabs';
import { useAdminToast } from '../common/AdminToast';
import { useConfirm } from '../common/ConfirmDialog';
import {
  createStagingKey, selectControlClass,
  bookImagesToEditorImages, editorImagesToCatalogImages, qualityChecksToChecklist,
  type StatCard, type WorkflowStep,
} from '../common/adminHelpers';
import type { BookWithImages, Book as BookType } from '../../../types/database';
import type { EditorImage } from '../../../types/editor';

type BookFormData = { title: string; author: string; year: string; description: string; price: number; isNew: boolean };
type BookEditorTab = 'basic' | 'description' | 'review';
const emptyBookForm = (): BookFormData => ({ title: '', author: '', year: '', description: '', price: 0, isNew: false });

function AdminStatGrid({ items }: { items: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(item => (
        <div key={item.label} className="bg-white border border-neutral-100 rounded-lg p-4 shadow-sm">
          <div className={`w-9 h-1 rounded-full mb-3 ${item.tone}`} />
          <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">{item.label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{item.value}</p>
          <p className="text-xs text-neutral-500 mt-1">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={`rounded-lg border p-3 ${step.active ? 'border-[#0A3151] bg-blue-50' : step.done ? 'border-green-200 bg-green-50' : 'border-neutral-200 bg-white'}`}
        >
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${step.done ? 'bg-green-600 text-white' : step.active ? 'bg-[#0A3151] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
              {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-800">{step.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{step.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BooksManager({ session }: { session: Session }) {
  const { showToast } = useAdminToast();
  const { confirm } = useConfirm();
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stagingKey, setStagingKey] = useState(createStagingKey());
  const [editorImages, setEditorImages] = useState<EditorImage[]>([]);
  const [formData, setFormData] = useState<BookFormData>(emptyBookForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookType['status']>('all');
  const [sortMode, setSortMode] = useState<'newest' | 'title' | 'price'>('newest');
  const [activeTab, setActiveTab] = useState<BookEditorTab>('basic');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setBooks(await content.getAllBooks());
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditorImages([]);
    setFormData(emptyBookForm());
    setStagingKey(createStagingKey());
    setActiveTab('basic');
  };

  const handleCancel = async () => {
    await media.deleteUnattachedStagedAssets(stagingKey).catch(() => undefined);
    resetForm();
  };

  const saveBook = async (status: BookType['status']) => {
    const publishChecks = getBookPublishChecks({ ...formData, images: editorImages });
    if (!formData.title.trim()) {
      showToast('Nhập tên sách trước khi lưu.', 'error');
      setActiveTab('basic');
      return;
    }
    if (status === 'published') {
      if (hasBlockingErrors(publishChecks)) {
        showToast('Chưa đủ điều kiện đăng lên web. Vui lòng kiểm tra checklist.', 'error');
        setActiveTab('review');
        return;
      }
      if (hasWarnings(publishChecks)) {
        const ok = await confirm({
          title: 'Xác nhận đăng lên web',
          message: 'Một số khuyến nghị chất lượng chưa đạt. Bạn vẫn muốn đăng lên web?',
          confirmText: 'Đăng',
        });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      if (!editingId) {
        const book = await content.createBook({
          title: formData.title, author: formData.author, year: formData.year,
          description: formData.description, price: formData.price,
          isNew: formData.isNew, status,
        });
        const attached = await media.attachBookEditorImages(book.id, editorImages);
        setEditingId(book.id);
        setEditorImages(bookImagesToEditorImages(attached));
        setStagingKey(createStagingKey());
        await load();
      } else {
        await content.updateBook(editingId, {
          title: formData.title, author: formData.author, year: formData.year,
          description: formData.description, price: formData.price,
          is_new: formData.isNew, status,
        });
        const attached = await media.attachBookEditorImages(editingId, editorImages);
        setEditorImages(bookImagesToEditorImages(attached));
        await load();
      }
      if (status === 'published') {
        resetForm();
        showToast('Đã đăng sách lên web.', 'success');
      } else {
        showToast('Đã lưu bản nháp.', 'success');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi khi lưu', 'error');
    }
    setSaving(false);
  };

  const handleEdit = (book: BookWithImages) => {
    setFormData({ title: book.title, author: book.author ?? '', year: book.year ?? '', description: book.description ?? '', price: book.price ?? 0, isNew: book.is_new });
    setEditorImages(bookImagesToEditorImages(book.book_images ?? []));
    setEditingId(book.id);
    setStagingKey(createStagingKey());
    setIsAdding(true);
    setActiveTab('basic');
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Xóa sách?', message: 'Hành động này không thể hoàn tác.', confirmText: 'Xóa', danger: true });
    if (!ok) return;
    await content.deleteBook(id);
    await load();
    showToast('Đã xóa sách.', 'success');
  };

  const search = searchTerm.trim().toLowerCase();
  const bookChecks = getBookPublishChecks({ ...formData, images: editorImages });
  const bookStats: StatCard[] = [
    { label: 'Tổng sách', value: books.length, hint: 'Tất cả bản ghi', tone: 'bg-[#0A3151]' },
    { label: 'Đã xuất bản', value: books.filter(b => b.status === 'published').length, hint: 'Đang hiển thị ngoài web', tone: 'bg-green-500' },
    { label: 'Bản nháp', value: books.filter(b => b.status === 'draft').length, hint: 'Cần hoàn thiện', tone: 'bg-amber-500' },
    { label: 'Thiếu ảnh', value: books.filter(b => (b.book_images?.length ?? 0) === 0).length, hint: 'Nên bổ sung bìa', tone: 'bg-red-400' },
  ];
  const workflowSteps: WorkflowStep[] = [
    { label: 'Thông tin', hint: 'Tên sách, tác giả, năm, giá', done: !!formData.title && !!formData.author && !!formData.year && formData.price > 0, active: isAdding && !editingId },
    { label: 'Hình ảnh', hint: 'Upload bìa và chọn ảnh chính', done: editorImages.length > 0 && editorImages.some(i => i.isPrimary), active: activeTab === 'basic' },
    { label: 'Xuất bản', hint: 'Kiểm tra chất lượng rồi đăng', done: !hasBlockingErrors(bookChecks), active: activeTab === 'review' },
  ];
  const filtered = books
    .filter(b => {
      const matchesSearch = !search || b.title.toLowerCase().includes(search) || (b.author ?? '').toLowerCase().includes(search) || (b.description ?? '').toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title, 'vi');
      if (sortMode === 'price') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Thư viện Sách</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý sách theo dòng nhập liệu: tạo nháp, bổ sung bìa, kiểm tra và xuất bản.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm sách mới
        </Button>
      </div>

      <AdminStatGrid items={bookStats} />

      {isAdding && (
        <Card className="border-none shadow-md overflow-hidden">
          <form onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 bg-neutral-50 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Dòng nhập liệu sách</p>
                <h3 className="font-bold text-lg text-neutral-900">{editingId ? 'Chỉnh sửa sách' : 'Tạo sách mới'}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Upload ảnh ngay trong form, sau đó chọn Lưu nháp hoặc Đăng lên web.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>Hủy</Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => saveBook('draft')}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Lưu nháp
                </Button>
                <Button type="button" disabled={saving} onClick={() => saveBook('published')} className="bg-[#0A3151] text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Cập nhật bài đăng' : 'Đăng lên web'}
                </Button>
              </div>
            </div>

            <EditorTabs<BookEditorTab>
              tabs={[{ id: 'basic', label: 'Thông tin cơ bản' }, { id: 'description', label: 'Mô tả' }, { id: 'review', label: 'SEO & kiểm duyệt' }]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className="grid lg:grid-cols-[230px_1fr_320px]">
              <aside className="border-b lg:border-b-0 lg:border-r border-neutral-100 bg-white p-5">
                <WorkflowSteps steps={workflowSteps} />
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">
                  Ảnh có thể tải lên trước khi lưu. Hệ thống tự gắn ảnh khi bạn lưu nháp hoặc đăng.
                </div>
              </aside>

              <div className="p-5 space-y-6">
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <CompactMediaManager label="Ảnh bìa sách" entityType="book" stagingKey={stagingKey} images={editorImages} onChange={setEditorImages} session={session} maxImages={5} aspectHint="3:4" />
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">1. Thông tin hiển thị</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="label-xs">Tên sách</label><Input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Ví dụ: Y học thường thức..." /></div>
                      <div><label className="label-xs">Tác giả</label><Input required value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} placeholder="Bác sĩ Wynn Tran" /></div>
                      <div><label className="label-xs">Năm xuất bản</label><Input required value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} placeholder="2026" /></div>
                      <div><label className="label-xs">Giá (VNĐ)</label><Input required type="number" min={0} value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} /></div>
                      <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
                        <input type="checkbox" checked={formData.isNew} onChange={e => setFormData(p => ({ ...p, isNew: e.target.checked }))} />
                        Đánh dấu là sách mới
                      </label>
                    </div>
                  </div>
                )}
                {activeTab === 'description' && (
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">2. Mô tả sách</h4>
                    <Textarea required className="min-h-64" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Tóm tắt lợi ích, đối tượng độc giả và nội dung chính của sách." />
                    <p className="mt-2 text-xs text-neutral-400">{formData.description.length}/3000 ký tự</p>
                  </div>
                )}
                {activeTab === 'review' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-neutral-900">3. Kiểm duyệt trước khi đăng</h4>
                    <QualityChecklist items={qualityChecksToChecklist(bookChecks)} />
                    <div className="rounded-lg bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                      Bấm <strong>Đăng lên web</strong> khi checklist lỗi đỏ đã đạt. Các cảnh báo màu vàng là khuyến nghị chất lượng.
                    </div>
                  </div>
                )}
              </div>

              <aside className="border-t lg:border-t-0 lg:border-l border-neutral-100 bg-neutral-50 p-5 space-y-4">
                <CatalogPreviewShell>
                  <BookCatalogCard preview book={{ title: formData.title, author: formData.author, year: formData.year, price: formData.price, isNew: formData.isNew, description: formData.description, images: editorImagesToCatalogImages(editorImages) }} />
                </CatalogPreviewShell>
                <QualityChecklist items={qualityChecksToChecklist(bookChecks)} />
              </aside>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <div className="grid lg:grid-cols-[1fr_180px_180px] gap-3">
          <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3">
            <Search className="w-4 h-4 text-neutral-400" />
            <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-10" placeholder="Tìm theo tên sách, tác giả, mô tả..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | BookType['status'])} className={`${selectControlClass} w-full`}>
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select value={sortMode} onChange={e => setSortMode(e.target.value as 'newest' | 'title' | 'price')} className={`${selectControlClass} w-full`}>
            <option value="newest">Mới cập nhật</option>
            <option value="title">Tên A-Z</option>
            <option value="price">Giá cao trước</option>
          </select>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Đang hiển thị {filtered.length}/{books.length} đầu sách.</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Bìa</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tiêu đề & Tác giả</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Năm / Giá</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-sm text-neutral-400">Không có sách phù hợp với bộ lọc hiện tại.</td></tr>}
              {filtered.map(book => {
                const primary = book.book_images?.find(i => i.is_primary);
                return (
                  <tr key={book.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      {primary ? <img src={primary.url} alt={primary.alt} className="w-10 h-14 rounded shadow-sm object-cover" referrerPolicy="no-referrer" /> : <div className="w-10 h-14 bg-neutral-100 rounded" />}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-neutral-700 truncate">{book.title}</p>
                      <p className="text-xs text-neutral-400 mt-1">{book.author}</p>
                      <span className="text-[9px] text-neutral-400">{book.book_images?.length ?? 0} ảnh</span>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-neutral-500">{book.year}</p>
                      <p className="text-xs font-bold text-neutral-800 mt-1">{(book.price ?? 0).toLocaleString()}đ</p>
                    </td>
                    <td className="p-4"><StatusBadge status={book.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(book)} aria-label="Chỉnh sửa" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(book.id)} aria-label="Xóa" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
