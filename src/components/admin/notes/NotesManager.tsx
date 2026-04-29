import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import {
  Plus, Search, Edit, Trash2, Loader2, Save, FileText, X, Link, Calendar,
} from 'lucide-react';
import * as content from '../../../services/contentService';
import * as medical from '../../../services/medicalContentService';
import * as media from '../../../services/mediaService';
import { logAction } from '../../../services/auditLogService';
import { supabase } from '../../../lib/supabase';
import { MediaUploader } from '../media/MediaUploader';
import { AdvancedImageUrlInput } from '../media/AdvancedImageUrlInput';
import { StatusBadge } from '../common/StatusBadge';
import { QualityChecklist } from '../common/QualityChecklist';
import { EditorTabs } from '../common/EditorTabs';
import { useAdminToast } from '../common/AdminToast';
import { useConfirm } from '../common/ConfirmDialog';
import { createStagingKey, selectControlClass, type ChecklistItem } from '../common/adminHelpers';
import { findMedicalRiskTerms } from '../../../lib/contentQuality';
import type { Note, Category, NoteSource, NoteSourceRow, Person } from '../../../types/database';
import type { StructuredSourceInput } from '../../../services/medicalContentService';

type NoteEditorTab = 'content' | 'media' | 'seo' | 'review';

type StructuredSource = {
  title: string;
  url: string;
  publisher: string;
  source_type: NoteSourceRow['source_type'];
  doi: string;
  pmid: string;
  evidence_level: NoteSourceRow['evidence_level'] | '';
  accessed_at: string;
};

type NoteFormData = {
  title: string;
  excerpt: string;
  content: string;
  category_id: string;
  cover_image_url: string;
  cover_storage_path: string;
  cover_alt: string;
  read_time: string;
  next_review_at: string;
  sources: NoteSource[]; // legacy JSONB — kept for backward compat
  structured_sources: StructuredSource[]; // new structured table
  seo_title: string;
  seo_description: string;
  author_id: string;
  reviewed_by_id: string;
  medical_specialty: string;
  medical_audience: string;
  disclaimer_ack: boolean;
};

function emptyForm(): NoteFormData {
  return {
    title: '', excerpt: '', content: '', category_id: '',
    cover_image_url: '', cover_storage_path: '', cover_alt: '',
    read_time: '', next_review_at: '',
    sources: [], structured_sources: [],
    seo_title: '', seo_description: '',
    author_id: '', reviewed_by_id: '',
    medical_specialty: '', medical_audience: 'Patient',
    disclaimer_ack: false,
  };
}

function sourcesToLegacy(ss: StructuredSource[]): NoteSource[] {
  return ss
    .filter(s => s.url || s.doi || s.pmid)
    .map(s => ({
      title: s.title,
      url: s.url || (s.doi ? `https://doi.org/${s.doi}` : s.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}` : ''),
      accessed_at: s.accessed_at || undefined,
    }));
}

function legacySourcesToStructured(sources: NoteSource[]): StructuredSource[] {
  return sources.map(source => ({
    title: source.title,
    url: source.url,
    publisher: '',
    source_type: 'website',
    doi: '',
    pmid: '',
    evidence_level: '',
    accessed_at: source.accessed_at ?? '',
  }));
}

function noteSourceRowsToStructured(rows: NoteSourceRow[]): StructuredSource[] {
  return rows.map(r => ({
    title: r.title,
    url: r.url ?? '',
    publisher: r.publisher ?? '',
    source_type: r.source_type,
    doi: r.doi ?? '',
    pmid: r.pmid ?? '',
    evidence_level: r.evidence_level ?? '',
    accessed_at: r.accessed_at ?? '',
  }));
}

function getNotePublishChecks(form: NoteFormData): ChecklistItem[] {
  const riskTerms = findMedicalRiskTerms(`${form.title} ${form.content}`);
  const hasSources = form.structured_sources.length > 0 || form.sources.length > 0;
  return [
    { label: 'Tiêu đề bài viết', ok: form.title.trim().length > 0 },
    { label: 'Tóm tắt 80–160 ký tự', ok: form.excerpt.length >= 80 && form.excerpt.length <= 160, warn: form.excerpt.length > 0 && (form.excerpt.length < 80 || form.excerpt.length > 160) },
    { label: 'Nội dung tối thiểu 600 ký tự', ok: form.content.length >= 600, warn: form.content.length > 0 && form.content.length < 600 },
    { label: 'Chuyên mục', ok: !!form.category_id },
    { label: 'Ảnh bìa', ok: !!form.cover_image_url, warn: !form.cover_image_url },
    { label: 'Alt text ảnh bìa', ok: !!form.cover_alt, warn: !!form.cover_image_url && !form.cover_alt },
    { label: 'Tác giả hoặc Reviewer y tế', ok: !!(form.author_id || form.reviewed_by_id) },
    { label: 'Reviewer y tế', ok: !!form.reviewed_by_id },
    { label: 'Có ít nhất 1 nguồn tham khảo', ok: hasSources },
    { label: 'Xác nhận disclaimer y tế', ok: form.disclaimer_ack },
    { label: 'Có ngày review tiếp theo', ok: !!form.next_review_at },
    { label: 'Không có claim y tế nhạy cảm', ok: riskTerms.length === 0, warn: riskTerms.length > 0 },
    { label: 'SEO title', ok: !!form.seo_title },
    { label: 'SEO description', ok: !!form.seo_description },
  ];
}

const SOURCE_TYPE_OPTIONS: { value: NoteSourceRow['source_type']; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'guideline', label: 'Guideline lâm sàng' },
  { value: 'journal', label: 'Tạp chí y khoa' },
  { value: 'systematic_review', label: 'Systematic review' },
  { value: 'textbook', label: 'Sách giáo khoa' },
  { value: 'government', label: 'Cơ quan nhà nước' },
  { value: 'organization', label: 'Tổ chức y tế' },
  { value: 'other', label: 'Khác' },
];

const EVIDENCE_OPTIONS = [
  { value: '', label: 'Chưa đánh giá' },
  { value: 'high', label: 'Cao' },
  { value: 'moderate', label: 'Trung bình' },
  { value: 'low', label: 'Thấp' },
  { value: 'expert_opinion', label: 'Ý kiến chuyên gia' },
  { value: 'unknown', label: 'Không rõ' },
];

function StructuredSourcesEditor({
  sources,
  onChange,
}: {
  sources: StructuredSource[];
  onChange: (s: StructuredSource[]) => void;
}) {
  const emptyDraft = (): StructuredSource => ({
    title: '', url: '', publisher: '', source_type: 'website',
    doi: '', pmid: '', evidence_level: '', accessed_at: '',
  });
  const [draft, setDraft] = useState<StructuredSource>(emptyDraft());
  const [showExtra, setShowExtra] = useState(false);

  const addSource = () => {
    if (!draft.title.trim()) return;
    if (!draft.url.trim() && !draft.doi.trim() && !draft.pmid.trim()) return;
    onChange([...sources, { ...draft }]);
    setDraft(emptyDraft());
    setShowExtra(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nguồn tham khảo có cấu trúc</p>
      {sources.map((src, i) => (
        <div key={i} className="flex items-start gap-2 bg-neutral-50 rounded-lg px-3 py-2">
          <Link className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{src.title}</p>
            <div className="flex flex-wrap gap-x-3 mt-0.5">
              {src.url && <p className="text-xs text-blue-600 truncate">{src.url}</p>}
              {src.doi && <p className="text-xs text-neutral-500">DOI: {src.doi}</p>}
              {src.pmid && <p className="text-xs text-neutral-500">PMID: {src.pmid}</p>}
              {src.publisher && <p className="text-xs text-neutral-500">{src.publisher}</p>}
              {src.evidence_level && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  {src.evidence_level}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label={`Xóa nguồn ${src.title}`}
            onClick={() => onChange(sources.filter((_, j) => j !== i))}
            className="text-red-400 hover:text-red-600 shrink-0 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="space-y-2 pt-1 border border-dashed border-neutral-200 rounded-lg p-3">
        <p className="text-[10px] font-bold text-neutral-400 uppercase">Thêm nguồn mới</p>
        <Input
          placeholder="Tên nguồn / tiêu đề bài báo *"
          value={draft.title}
          onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="URL"
            type="url"
            value={draft.url}
            onChange={e => setDraft(p => ({ ...p, url: e.target.value }))}
          />
          <select
            value={draft.source_type}
            onChange={e => setDraft(p => ({ ...p, source_type: e.target.value as NoteSourceRow['source_type'] }))}
            className={`${selectControlClass}`}
          >
            {SOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button
          type="button"
          className="text-xs text-neutral-400 underline hover:text-neutral-600"
          onClick={() => setShowExtra(v => !v)}
        >
          {showExtra ? '▲ Ẩn bớt' : '▼ Thêm DOI / PMID / nhà xuất bản'}
        </button>
        {showExtra && (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="DOI (không cần https://doi.org/)" value={draft.doi} onChange={e => setDraft(p => ({ ...p, doi: e.target.value }))} />
            <Input placeholder="PMID" value={draft.pmid} onChange={e => setDraft(p => ({ ...p, pmid: e.target.value }))} />
            <Input placeholder="Nhà xuất bản / tổ chức" value={draft.publisher} onChange={e => setDraft(p => ({ ...p, publisher: e.target.value }))} />
            <select
              value={draft.evidence_level}
              onChange={e => setDraft(p => ({ ...p, evidence_level: e.target.value as NoteSourceRow['evidence_level'] | '' }))}
              className={`${selectControlClass}`}
            >
              {EVIDENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Input type="date" value={draft.accessed_at} onChange={e => setDraft(p => ({ ...p, accessed_at: e.target.value }))} />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={addSource}
          disabled={!draft.title.trim() || (!draft.url.trim() && !draft.doi.trim() && !draft.pmid.trim())}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm nguồn
        </Button>
        <p className="text-[10px] text-neutral-400">Cần ít nhất URL hoặc DOI hoặc PMID.</p>
      </div>
    </div>
  );
}

export function NotesManager({ session }: { session: Session }) {
  const { showToast } = useAdminToast();
  const { confirm } = useConfirm();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stagingKey, setStagingKey] = useState(createStagingKey());
  const [savedCoverStoragePath, setSavedCoverStoragePath] = useState('');
  const [formData, setFormData] = useState<NoteFormData>(emptyForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Note['status']>('all');
  const [activeTab, setActiveTab] = useState<NoteEditorTab>('content');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [n, c] = await Promise.all([content.getAllNotes(), content.getCategories()]);
    setNotes(n);
    setCategories(c);
    // Load people with best-effort (may fail if migration not yet applied)
    medical.getActivePeople().then(setPeople).catch(() => {/* ignore */});
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setStagingKey(createStagingKey());
    setSavedCoverStoragePath('');
    setFormData(emptyForm());
    setActiveTab('content');
  };

  const cleanupDraftCover = async (currentPath: string, nextPath = '') => {
    if (currentPath && currentPath !== savedCoverStoragePath && currentPath !== nextPath) {
      await media.deleteStorageObjectIfUnused({ storagePath: currentPath });
    }
  };

  const handleCancel = () => {
    void cleanupDraftCover(formData.cover_storage_path);
    resetForm();
  };

  const handleCoverUpload = async (file: File, alt: string): Promise<{ url: string; storagePath: string }> => {
    if (editingId) {
      const result = await media.uploadNoteCover(editingId, file, { alt, uploadedBy: session.user.id });
      return { url: result.url, storagePath: result.storagePath };
    }
    const result = await media.uploadStagedNoteCover({ file, stagingKey, alt, uploadedBy: session.user.id });
    return { url: result.url, storagePath: result.storagePath };
  };

  const saveNote = async (status: Note['status']) => {
    if (!formData.title.trim()) {
      showToast('Nhập tiêu đề bài viết trước khi lưu.', 'error');
      setActiveTab('content');
      return;
    }

    if (status === 'published') {
      const checks = getNotePublishChecks(formData);
      const blockingErrors = checks.filter(c => !c.ok && !c.warn);
      if (blockingErrors.length > 0) {
        showToast('Chưa đủ điều kiện đăng lên web. Kiểm tra tab Review y tế.', 'error');
        setActiveTab('review');
        return;
      }
      const warnings = checks.filter(c => !c.ok && c.warn);
      if (warnings.length > 0) {
        const ok = await confirm({
          title: 'Xác nhận đăng lên web',
          message: `Còn ${warnings.length} khuyến nghị chưa đạt. Bạn vẫn muốn đăng?`,
          confirmText: 'Đăng',
        });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      const legacySources = sourcesToLegacy(formData.structured_sources);
      const reviewedAt = (status === 'published' && !!formData.reviewed_by_id)
        ? new Date().toISOString()
        : undefined;
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category_id: formData.category_id || undefined,
        cover_image_url: formData.cover_image_url || undefined,
        cover_storage_path: formData.cover_storage_path || undefined,
        cover_alt: formData.cover_alt || undefined,
        read_time: formData.read_time || undefined,
        next_review_at: formData.next_review_at || undefined,
        sources: legacySources,
        seo_title: formData.seo_title || undefined,
        seo_description: formData.seo_description || undefined,
        author_id: formData.author_id || undefined,
        reviewed_by_id: formData.reviewed_by_id || undefined,
        reviewed_at: reviewedAt,
        medical_specialty: formData.medical_specialty || undefined,
        medical_audience: formData.medical_audience || 'Patient',
        disclaimer_ack: formData.disclaimer_ack,
        status,
      };
      const structuredSourceRows = formData.structured_sources.map<StructuredSourceInput>(s => ({
        title: s.title,
        url: s.url || null,
        publisher: s.publisher || null,
        source_type: s.source_type,
        doi: s.doi || null,
        pmid: s.pmid || null,
        evidence_level: (s.evidence_level || null) as NoteSourceRow['evidence_level'] | null,
        accessed_at: s.accessed_at || null,
      }));
      const createBlockingReview = async (noteId: string) => {
        if (status !== 'published' || !payload.reviewed_by_id) return;
        await medical.createContentReview({
          entity_type: 'note',
          entity_id: noteId,
          reviewer_id: payload.reviewed_by_id,
          reviewed_at: reviewedAt!,
          decision: 'approved',
          review_scope: 'medical',
          created_by: session.user.id,
        });
      };

      if (editingId) {
        if (formData.cover_storage_path) {
          await media.updateMediaAssetAltByStoragePath(formData.cover_storage_path, formData.cover_alt);
          const oldPath = savedCoverStoragePath;
          if (oldPath && oldPath !== formData.cover_storage_path) {
            await media.deleteStorageObjectIfUnused({ storagePath: oldPath });
          }
        }
        // Always sync structured sources — empty array clears stale rows
        await medical.upsertNoteSources(editingId, structuredSourceRows);
        // For medical publish, review must exist before the note is made public.
        await createBlockingReview(editingId);
        await content.updateNote(editingId, payload);
        // Audit revision (non-blocking — audit trail only)
        medical.getNextRevisionVersion('note', editingId).then(version =>
          medical.createContentRevision({
            entity_type: 'note',
            entity_id: editingId,
            created_by: session.user.id,
            version,
            snapshot: payload as Record<string, unknown>,
          })
        ).catch(() => {/* non-blocking */});
        setSavedCoverStoragePath(formData.cover_storage_path);
        logAction(session, 'update', 'note', editingId, { after: { status } });
        if (status === 'published') {
          resetForm();
          showToast('Đã đăng bài viết lên web.', 'success');
        } else {
          showToast(status === 'in_review' ? 'Đã gửi bài viết để duyệt.' : 'Đã lưu bản nháp.', 'success');
        }
      } else {
        const note = await content.createNote({
          ...payload,
          status: 'draft',
          reviewed_at: status === 'published' ? undefined : payload.reviewed_at,
        });
        if (formData.cover_storage_path) {
          await media.linkNoteCoverAsset(formData.cover_storage_path, note.id);
        }
        // Always sync structured sources — empty array clears stale rows
        await medical.upsertNoteSources(note.id, structuredSourceRows);
        // Audit revision (non-blocking — audit trail only)
        medical.createContentRevision({
          entity_type: 'note',
          entity_id: note.id,
          created_by: session.user.id,
          version: 1,
          snapshot: payload as Record<string, unknown>,
        }).catch(() => {/* non-blocking */});
        setEditingId(note.id);
        setSavedCoverStoragePath(formData.cover_storage_path);
        setStagingKey(createStagingKey());
        logAction(session, 'create', 'note', note.id, { after: { status: 'draft' } });

        if (status !== 'draft') {
          await createBlockingReview(note.id);
          await content.updateNote(note.id, { ...payload, status });
          if (status === 'published') {
            resetForm();
            showToast('Đã đăng bài viết lên web.', 'success');
          } else {
            showToast('Đã gửi bài viết để duyệt.', 'success');
          }
        } else {
          showToast('Đã lưu bản nháp.', 'success');
        }
      }
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi khi lưu bài viết.', 'error');
    }
    setSaving(false);
  };

  const handleEdit = async (n: Note) => {
    setFormData({
      title: n.title,
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      category_id: n.category_id ?? '',
      cover_image_url: n.cover_image_url ?? '',
      cover_storage_path: n.cover_storage_path ?? '',
      cover_alt: n.cover_alt ?? '',
      read_time: n.read_time ?? '',
      next_review_at: n.next_review_at ? n.next_review_at.split('T')[0] : '',
      sources: n.sources ?? [],
      structured_sources: legacySourcesToStructured(n.sources ?? []),
      seo_title: n.seo_title ?? '',
      seo_description: n.seo_description ?? '',
      author_id: n.author_id ?? '',
      reviewed_by_id: n.reviewed_by_id ?? '',
      medical_specialty: n.medical_specialty ?? '',
      medical_audience: n.medical_audience ?? 'Patient',
      disclaimer_ack: n.disclaimer_ack ?? false,
    });
    setEditingId(n.id);
    setSavedCoverStoragePath(n.cover_storage_path ?? '');
    setStagingKey(createStagingKey());
    setIsAdding(true);
    setActiveTab('content');

    // Load structured sources in background
    medical.getNoteSourcesByNoteId(n.id).then(rows => {
      if (rows.length > 0) {
        setFormData(prev => ({ ...prev, structured_sources: noteSourceRowsToStructured(rows) }));
      }
    }).catch(() => {/* ignore */});
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Xóa bài viết?', message: 'Hành động này không thể hoàn tác.', confirmText: 'Xóa', danger: true });
    if (!ok) return;
    await content.deleteNote(id);
    await load();
    showToast('Đã xóa bài viết.', 'success');
  };

  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name ?? '—';
  const checks = getNotePublishChecks(formData);
  const errorCount = checks.filter(c => !c.ok && !c.warn).length;
  const warnCount = checks.filter(c => !c.ok && c.warn).length;

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const reviewers = people.filter(p => p.role === 'reviewer' || p.role === 'editor' || p.role === 'admin');
  const authors = people.filter(p => p.role === 'author' || p.role === 'contributor' || p.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Quản lý Kho Bài viết</h2>
          <p className="text-xs text-neutral-400 mt-1">Ghi chú y khoa, kiến thức chống lão hóa và chăm sóc sức khỏe</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Viết bài mới
        </Button>
      </div>

      {isAdding && (
        <Card className="border-none shadow-md overflow-hidden">
          <form onSubmit={e => e.preventDefault()}>
            {/* Editor header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 bg-neutral-50 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Editor bài viết y tế</p>
                <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {editingId ? `Chỉnh sửa: ${formData.title || 'Bài viết'}` : 'Bài viết mới'}
                </h3>
                {(errorCount > 0 || warnCount > 0) && (
                  <p className="text-xs mt-0.5">
                    {errorCount > 0 && <span className="text-red-600 mr-2">{errorCount} lỗi cần sửa</span>}
                    {warnCount > 0 && <span className="text-amber-600">{warnCount} khuyến nghị</span>}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>Hủy</Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => saveNote('draft')}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Lưu nháp
                </Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => saveNote('in_review')} className="border-amber-400 text-amber-700 hover:bg-amber-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Gửi duyệt
                </Button>
                <Button type="button" disabled={saving} onClick={() => saveNote('published')} className="bg-[#0A3151] text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Cập nhật bài đăng' : 'Đăng lên web'}
                </Button>
              </div>
            </div>

            <EditorTabs<NoteEditorTab>
              tabs={[
                { id: 'content', label: 'Nội dung' },
                { id: 'media', label: 'Ảnh bìa' },
                { id: 'seo', label: 'SEO & Schema' },
                { id: 'review', label: 'Nguồn & Review' },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {/* Two-column layout: main + sidebar */}
            <div className="grid lg:grid-cols-[1fr_300px]">
              {/* Main editor area */}
              <div className="p-5 space-y-5 border-b lg:border-b-0 lg:border-r border-neutral-100">
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label-xs">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                      <Input
                        required
                        className="text-base font-medium"
                        value={formData.title}
                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                        placeholder="Tiêu đề rõ ràng, dễ hiểu cho bệnh nhân..."
                      />
                    </div>
                    <div>
                      <label className="label-xs">
                        Tóm tắt <span className="text-neutral-400">({formData.excerpt.length}/160)</span>
                        <span className={formData.excerpt.length >= 80 && formData.excerpt.length <= 160 ? ' text-green-600' : ' text-amber-600'}>
                          {formData.excerpt.length >= 80 && formData.excerpt.length <= 160 ? ' ✓ đạt' : ' cần 80-160 ký tự'}
                        </span>
                      </label>
                      <Textarea
                        value={formData.excerpt}
                        onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                        rows={3}
                        placeholder="Tóm tắt ngắn giúp người đọc biết bài viết này nói về gì..."
                      />
                    </div>
                    <div>
                      <label className="label-xs">
                        Nội dung chi tiết <span className="text-neutral-400">({formData.content.length} ký tự)</span>
                        {formData.content.length < 600 && formData.content.length > 0 && (
                          <span className="text-amber-600"> cần ít nhất 600 ký tự</span>
                        )}
                      </label>
                      <Textarea
                        required
                        className="min-h-[400px] font-mono text-sm"
                        value={formData.content}
                        onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                        placeholder="Nội dung bài viết y tế. Hỗ trợ Markdown hoặc HTML."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-4 max-w-xl">
                    <p className="text-sm text-neutral-600">Upload ảnh bìa ngay — không cần lưu nháp trước.</p>
                    <MediaUploader
                      label="Ảnh bìa bài viết"
                      currentUrl={formData.cover_image_url}
                      currentAlt={formData.cover_alt}
                      aspectHint="16:9"
                      onUpload={handleCoverUpload}
                      onUploaded={({ url, storagePath, alt }) => {
                        void cleanupDraftCover(formData.cover_storage_path, storagePath);
                        setFormData(p => ({ ...p, cover_image_url: url, cover_storage_path: storagePath, cover_alt: alt ?? p.cover_alt }));
                        if (editingId) logAction(session, 'upload_image', 'note', editingId, { after: { url } });
                      }}
                      onRemove={() => {
                        void cleanupDraftCover(formData.cover_storage_path);
                        setFormData(p => ({ ...p, cover_image_url: '', cover_storage_path: '', cover_alt: '' }));
                      }}
                      onAltChange={alt => setFormData(p => ({ ...p, cover_alt: alt }))}
                      onSelectAsset={asset => {
                        void cleanupDraftCover(formData.cover_storage_path, asset.storage_path);
                        setFormData(p => ({ ...p, cover_image_url: asset.public_url, cover_storage_path: asset.storage_path, cover_alt: asset.alt }));
                        if (editingId) logAction(session, 'select_library_image', 'note', editingId, { after: { media_asset_id: asset.id } });
                      }}
                      libraryFilterEntityType="note"
                    />
                    <AdvancedImageUrlInput
                      value={formData.cover_image_url}
                      onChange={url => {
                        void cleanupDraftCover(formData.cover_storage_path);
                        setFormData(p => ({ ...p, cover_image_url: url, cover_storage_path: '' }));
                      }}
                      placeholder="https://example.com/cover.jpg"
                    />
                    {formData.cover_image_url && (
                      <div>
                        <label className="label-xs">Alt text ảnh bìa</label>
                        <Input
                          value={formData.cover_alt}
                          onChange={e => setFormData(p => ({ ...p, cover_alt: e.target.value }))}
                          placeholder="Mô tả ngắn nội dung ảnh bìa..."
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="label-xs">
                        SEO Title <span className="text-neutral-400">({formData.seo_title.length}/70)</span>
                      </label>
                      <Input
                        value={formData.seo_title}
                        onChange={e => setFormData(p => ({ ...p, seo_title: e.target.value }))}
                        placeholder="Tiêu đề cho Google Search..."
                        maxLength={70}
                      />
                      <p className="text-xs text-neutral-400 mt-1">Để trống sẽ dùng tiêu đề bài viết.</p>
                    </div>
                    <div>
                      <label className="label-xs">
                        SEO Description <span className="text-neutral-400">({formData.seo_description.length}/160)</span>
                      </label>
                      <Textarea
                        value={formData.seo_description}
                        onChange={e => setFormData(p => ({ ...p, seo_description: e.target.value }))}
                        rows={3}
                        placeholder="Mô tả ngắn hiển thị trong kết quả tìm kiếm..."
                        maxLength={160}
                      />
                    </div>
                    <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                      <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">Schema Type</p>
                      <p className="text-sm font-mono text-neutral-700">MedicalWebPage</p>
                      <p className="text-[10px] text-neutral-400 mt-1">Schema.org/MedicalWebPage — mặc định cho tất cả bài viết y tế.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-5 max-w-xl">
                    <QualityChecklist items={checks} />
                    <StructuredSourcesEditor
                      sources={formData.structured_sources}
                      onChange={structured_sources => setFormData(p => ({ ...p, structured_sources }))}
                    />
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Xác nhận Disclaimer y tế</p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.disclaimer_ack}
                          onChange={e => setFormData(p => ({ ...p, disclaimer_ack: e.target.checked }))}
                          className="mt-0.5 rounded border-amber-400 w-4 h-4"
                        />
                        <span className="text-sm text-amber-900 leading-relaxed">
                          Tôi xác nhận nội dung bài viết này đã được kiểm tra về mặt y khoa, có nguồn tham khảo rõ ràng và không đưa ra lời khuyên chẩn đoán hoặc điều trị thay thế bác sĩ.
                        </span>
                      </label>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900 leading-relaxed">
                      <strong>Lưu ý:</strong> Tránh các câu khẳng định chữa khỏi, điều trị bệnh hoặc thay thế thuốc. Luôn khuyến khích bệnh nhân tham khảo bác sĩ.
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <aside className="p-5 space-y-5 bg-neutral-50">
                {/* Status */}
                {editingId && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Trạng thái hiện tại</p>
                    <StatusBadge status={notes.find(n => n.id === editingId)?.status ?? 'draft'} />
                  </div>
                )}

                {/* People */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tác giả & Reviewer</p>
                  <div>
                    <label className="label-xs">Tác giả</label>
                    <select
                      value={formData.author_id}
                      onChange={e => setFormData(p => ({ ...p, author_id: e.target.value }))}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                    >
                      <option value="">Chọn tác giả...</option>
                      {authors.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-xs">Reviewer y tế <span className="text-red-500">*</span></label>
                    <select
                      value={formData.reviewed_by_id}
                      onChange={e => setFormData(p => ({ ...p, reviewed_by_id: e.target.value }))}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                    >
                      <option value="">Chọn reviewer...</option>
                      {reviewers.map(p => <option key={p.id} value={p.id}>{p.display_name}{p.credentials ? ` (${p.credentials})` : ''}</option>)}
                    </select>
                  </div>
                  {people.length === 0 && (
                    <p className="text-[10px] text-neutral-400">Chưa có reviewer. Thêm tại mục "Người viết & Reviewer".</p>
                  )}
                </div>

                {/* Category & meta */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phân loại & meta</p>
                  <div>
                    <label className="label-xs">Chuyên mục</label>
                    <select
                      value={formData.category_id}
                      onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                    >
                      <option value="">Chọn chuyên mục...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-xs">Thời gian đọc</label>
                    <Input placeholder="VD: 5 phút" value={formData.read_time} onChange={e => setFormData(p => ({ ...p, read_time: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-xs">Chuyên khoa</label>
                    <Input
                      placeholder="VD: Lão khoa"
                      value={formData.medical_specialty}
                      onChange={e => setFormData(p => ({ ...p, medical_specialty: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label-xs">Đối tượng</label>
                    <select
                      value={formData.medical_audience}
                      onChange={e => setFormData(p => ({ ...p, medical_audience: e.target.value }))}
                      className={`${selectControlClass} w-full`}
                    >
                      <option value="Patient">Bệnh nhân / Công chúng</option>
                      <option value="MedicalAudience">Nhân viên y tế</option>
                      <option value="Clinician">Bác sĩ lâm sàng</option>
                    </select>
                  </div>
                </div>

                {/* Review schedule */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Lịch review y tế
                  </p>
                  <div>
                    <label className="label-xs">Ngày review tiếp theo <span className="text-red-500">*</span></label>
                    <Input
                      type="date"
                      value={formData.next_review_at}
                      onChange={e => setFormData(p => ({ ...p, next_review_at: e.target.value }))}
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Khuyến nghị: 12 tháng kể từ ngày đăng.</p>
                  </div>
                </div>

                {/* Cover preview */}
                {formData.cover_image_url && (
                  <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                    <img
                      src={formData.cover_image_url}
                      alt={formData.cover_alt || formData.title}
                      className="w-full aspect-video object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2">
                      <p className="text-[10px] text-neutral-400">Ảnh bìa</p>
                      {!formData.cover_alt && (
                        <p className="text-[10px] text-amber-600">Chưa có alt text</p>
                      )}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </form>
        </Card>
      )}

      {/* Search + filter */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <div className="grid lg:grid-cols-[1fr_180px] gap-3">
          <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3">
            <Search className="w-4 h-4 text-neutral-400" />
            <Input
              className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-10"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | Note['status'])} className={`${selectControlClass} w-full`}>
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="in_review">Đang duyệt</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Đang hiển thị {filtered.length}/{notes.length} bài viết.</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b">
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Ảnh</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tiêu đề & Chuyên mục</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Lệnh</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-sm text-neutral-400">Không có bài viết phù hợp.</td></tr>
              )}
              {filtered.map(n => (
                <tr key={n.id} className="hover:bg-neutral-50">
                  <td className="p-4">
                    {n.cover_image_url
                      ? <img src={n.cover_image_url} alt={n.cover_alt || n.title} className="w-16 h-12 rounded object-cover border" referrerPolicy="no-referrer" />
                      : <div className="w-16 h-12 bg-neutral-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-neutral-300" /></div>
                    }
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-neutral-700 truncate max-w-md">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                        #{getCatName(n.category_id)}
                      </span>
                      {n.read_time && <span className="text-[10px] text-neutral-400">• {n.read_time}</span>}
                      {!n.reviewed_by_id && n.status === 'published' && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Thiếu reviewer</span>
                      )}
                      {!n.disclaimer_ack && n.status === 'published' && (
                        <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">Thiếu disclaimer</span>
                      )}
                      {n.next_review_at && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          new Date(n.next_review_at) < new Date()
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          Review: {new Date(n.next_review_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={n.status} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(n)} aria-label="Chỉnh sửa" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)} aria-label="Xóa" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
