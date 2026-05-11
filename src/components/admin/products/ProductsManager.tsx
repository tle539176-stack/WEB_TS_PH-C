import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Plus, Search, Edit, Trash2, Loader2, Save, CheckCircle2, ExternalLink } from 'lucide-react';
import * as content from '../../../services/contentService';
import * as media from '../../../services/mediaService';
import { supabase } from '../../../lib/supabase';
import { CompactMediaManager } from '../listing-editor/CompactMediaManager';
import { ProductCatalogCard } from '../../catalog/ProductCatalogCard';
import { CatalogPreviewShell, type CatalogPreviewMode } from '../../catalog/CatalogPreviewShell';
import { getProductPublishChecks, hasBlockingErrors, hasWarnings } from '../../../lib/contentQuality';
import { StatusBadge } from '../common/StatusBadge';
import { QualityChecklist } from '../common/QualityChecklist';
import { EditorTabs } from '../common/EditorTabs';
import { useAdminToast } from '../common/AdminToast';
import { useConfirm } from '../common/ConfirmDialog';
import {
  createStagingKey, selectControlClass,
  productImagesToEditorImages, editorImagesToCatalogImages, qualityChecksToChecklist,
  type StatCard, type WorkflowStep,
} from '../common/adminHelpers';
import type { ProductWithImages, Product } from '../../../types/database';
import type { EditorImage } from '../../../types/editor';

type ProductFormData = { name: string; price: number; description: string; tag: string; brand: string };
type ProductEditorTab = 'basic' | 'description' | 'review';
const emptyProductForm = (): ProductFormData => ({ name: '', price: 0, description: '', tag: '', brand: '' });

type ProductPreviewModel = {
  name: string;
  price: number;
  tag: string;
  brand: string;
  description: string;
  images: ReturnType<typeof editorImagesToCatalogImages>;
};

function getEditorSnapshot(formData: ProductFormData, images: EditorImage[]): string {
  return JSON.stringify({
    formData,
    images: images.map(image => ({
      id: image.id,
      source: image.source,
      url: image.url,
      storagePath: image.storagePath,
      mediaAssetId: image.mediaAssetId,
      alt: image.alt,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
  });
}

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

function ProductPublicPreview({
  product,
  mode,
}: {
  product: ProductPreviewModel;
  mode: CatalogPreviewMode;
}) {
  const isMobile = mode === 'mobile';

  return (
    <div className="bg-[#F7F8FA]">
      <div className={`${isMobile ? 'px-4 pb-8 pt-8' : 'px-8 pb-10 pt-10'}`}>
        <section className={isMobile ? 'mb-6' : 'mb-8'}>
          <div className={isMobile ? '' : 'max-w-3xl'}>
            <Badge className="mb-4 rounded-full border-none bg-[#0A3151] px-3 py-1 text-[10px] uppercase tracking-wider text-white shadow-sm">
              Sản phẩm khuyên dùng
            </Badge>
            <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-3 font-serif font-bold text-neutral-950`}>
              Danh Mục Sản Phẩm
            </h1>
            <p className="text-sm leading-6 text-neutral-600">
              Lọc nhanh theo tag, thương hiệu và từ khóa để tìm đúng nhóm sản phẩm đang cần xem.
            </p>
          </div>

          <div className={`${isMobile ? 'mt-6 rounded-2xl p-3' : 'mt-8 rounded-2xl p-4'} border border-neutral-200 bg-white shadow-sm`}>
            <div className={isMobile ? 'space-y-3' : 'grid grid-cols-[1fr_150px_150px_150px] gap-3'}>
              <div className="flex h-11 items-center gap-3 rounded-md border border-neutral-200 px-3">
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate text-sm text-neutral-400">Tìm sản phẩm, thương hiệu, tag...</span>
              </div>
              <div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
                Tất cả tag
              </div>
              <div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
                Tất cả thương hiệu
              </div>
              <div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
                Mới nhất
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400">1/1 sản phẩm</span>
              {product.tag && (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                  {product.tag}
                </span>
              )}
              {product.brand && (
                <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">
                  {product.brand}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className={isMobile ? 'grid grid-cols-1 gap-7' : 'grid grid-cols-2 gap-7'}>
          <ProductCatalogCard preview product={product} />
        </div>
      </div>
    </div>
  );
}

function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.label} className={`rounded-lg border p-3 ${step.active ? 'border-[#0A3151] bg-blue-50' : step.done ? 'border-green-200 bg-green-50' : 'border-neutral-200 bg-white'}`}>
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

export function ProductsManager({ session }: { session: Session }) {
  const { showToast } = useAdminToast();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stagingKey, setStagingKey] = useState(createStagingKey());
  const [editorImages, setEditorImages] = useState<EditorImage[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Product['status']>('all');
  const [sortMode, setSortMode] = useState<'newest' | 'name' | 'price'>('newest');
  const [activeTab, setActiveTab] = useState<ProductEditorTab>('basic');
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => getEditorSnapshot(emptyProductForm(), []));

  const load = useCallback(async () => { if (supabase) setProducts(await content.getAllProducts()); }, []);
  useEffect(() => { load(); }, [load]);

  const isEditorMode = isAdding || !!editingId;
  const currentSnapshot = getEditorSnapshot(formData, editorImages);
  const isDirty = isEditorMode && currentSnapshot !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const resetForm = () => {
    const nextForm = emptyProductForm();
    setIsAdding(false); setEditingId(null); setEditorImages([]); setFormData(nextForm);
    setStagingKey(createStagingKey()); setActiveTab('basic');
    setSavedSnapshot(getEditorSnapshot(nextForm, []));
  };

  const startCreateProduct = () => {
    const nextForm = emptyProductForm();
    setFormData(nextForm);
    setEditorImages([]);
    setEditingId(null);
    setStagingKey(createStagingKey());
    setActiveTab('basic');
    setSavedSnapshot(getEditorSnapshot(nextForm, []));
    setIsAdding(true);
  };

  const requestCloseEditor = async () => {
    if (saving) return;
    if (isDirty) {
      const ok = await confirm({
        title: 'Rời khỏi form sản phẩm?',
        message: 'Các thay đổi chưa lưu sẽ bị bỏ. Bạn muốn quay lại danh sách?',
        confirmText: 'Bỏ thay đổi',
        danger: true,
      });
      if (!ok) return;
    }
    await media.deleteUnattachedStagedAssets(stagingKey).catch(() => undefined);
    resetForm();
  };

  const saveProduct = async (status: Product['status']) => {
    const publishChecks = getProductPublishChecks({ ...formData, images: editorImages });
    if (!formData.name.trim()) {
      showToast('Nhập tên sản phẩm trước khi lưu.', 'error');
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
        const ok = await confirm({ title: 'Xác nhận đăng lên web', message: 'Một số khuyến nghị chất lượng hoặc cảnh báo y tế chưa đạt. Bạn vẫn muốn đăng?', confirmText: 'Đăng' });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        tag: formData.tag || null,
        brand: formData.brand || null,
        status,
      };

      if (!editingId) {
        const product = await content.createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          tag: formData.tag || undefined,
          brand: formData.brand || undefined,
          status: 'draft',
        });
        const attached = await media.attachProductEditorImages(product.id, editorImages);
        if (status === 'published') {
          await content.updateProduct(product.id, payload);
        }
        const nextImages = productImagesToEditorImages(attached);
        setEditingId(product.id);
        setEditorImages(nextImages);
        setStagingKey(createStagingKey());
        setSavedSnapshot(getEditorSnapshot(formData, nextImages));
        await load();
      } else {
        const attached = await media.attachProductEditorImages(editingId, editorImages);
        await content.updateProduct(editingId, payload);
        const nextImages = productImagesToEditorImages(attached);
        setEditorImages(nextImages);
        setSavedSnapshot(getEditorSnapshot(formData, nextImages));
        await load();
      }
      if (status === 'published') {
        resetForm();
        showToast('Đã đăng sản phẩm lên web.', 'success');
      } else {
        showToast('Đã lưu bản nháp.', 'success');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error');
    }
    setSaving(false);
  };

  const handleEdit = (p: ProductWithImages) => {
    const nextForm = { name: p.name, price: p.price ?? 0, description: p.description ?? '', tag: p.tag ?? '', brand: p.brand ?? '' };
    const nextImages = productImagesToEditorImages(p.product_images ?? []);
    setFormData(nextForm);
    setEditorImages(nextImages);
    setSavedSnapshot(getEditorSnapshot(nextForm, nextImages));
    setEditingId(p.id); setStagingKey(createStagingKey()); setIsAdding(true); setActiveTab('basic');
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Xóa sản phẩm?', message: 'Hành động này không thể hoàn tác.', confirmText: 'Xóa', danger: true });
    if (!ok) return;
    await content.deleteProduct(id);
    await load();
    showToast('Đã xóa sản phẩm.', 'success');
  };

  const search = searchTerm.trim().toLowerCase();
  const productChecks = getProductPublishChecks({ ...formData, images: editorImages });
  const productStats: StatCard[] = [
    { label: 'Tổng sản phẩm', value: products.length, hint: 'Tất cả bản ghi', tone: 'bg-[#0A3151]' },
    { label: 'Đã xuất bản', value: products.filter(p => p.status === 'published').length, hint: 'Đang hiển thị ngoài web', tone: 'bg-green-500' },
    { label: 'Bản nháp', value: products.filter(p => p.status === 'draft').length, hint: 'Cần hoàn thiện', tone: 'bg-amber-500' },
    { label: 'Thiếu ảnh', value: products.filter(p => (p.product_images?.length ?? 0) === 0).length, hint: 'Nên bổ sung ảnh', tone: 'bg-red-400' },
  ];
  const workflowSteps: WorkflowStep[] = [
    { label: 'Thông tin', hint: 'Tên, giá, tag, mô tả', done: !!formData.name && formData.price > 0 && formData.description.length >= 30, active: isAdding && !editingId },
    { label: 'Hình ảnh', hint: 'Upload ảnh vuông và chọn ảnh chính', done: editorImages.length > 0 && editorImages.some(i => i.isPrimary), active: activeTab === 'basic' },
    { label: 'Xuất bản', hint: 'Kiểm tra chất lượng rồi đăng', done: !hasBlockingErrors(productChecks), active: activeTab === 'review' },
  ];
  const previewProduct: ProductPreviewModel = {
    name: formData.name,
    price: formData.price,
    tag: formData.tag,
    brand: formData.brand,
    description: formData.description,
    images: editorImagesToCatalogImages(editorImages),
  };
  const filtered = products
    .filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search) || (p.description ?? '').toLowerCase().includes(search) || (p.tag ?? '').toLowerCase().includes(search) || (p.brand ?? '').toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'vi');
      if (sortMode === 'price') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Danh mục Sản phẩm</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý sản phẩm theo dòng nhập liệu: tạo nháp, bổ sung ảnh, kiểm tra và xuất bản.</p>
        </div>
        {!isEditorMode && (
          <Button onClick={startCreateProduct} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        )}
      </div>

      {!isEditorMode && <AdminStatGrid items={productStats} />}

      {isEditorMode && (
        <Card className="border-none shadow-md overflow-hidden">
          <form onSubmit={e => e.preventDefault()}>
            <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 bg-neutral-50 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Dòng nhập liệu sản phẩm</p>
                <h3 className="font-bold text-lg text-neutral-900">{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Upload ảnh ngay trong form, sau đó chọn Lưu nháp hoặc Đăng lên web.
                  {isDirty && <span className="ml-2 font-bold text-amber-600">Có thay đổi chưa lưu.</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={saving} onClick={requestCloseEditor}>Quay lại danh sách</Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => saveProduct('draft')}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Lưu nháp
                </Button>
                <Button type="button" disabled={saving} onClick={() => saveProduct('published')} className="bg-[#0A3151] text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Cập nhật bài đăng' : 'Đăng lên web'}
                </Button>
              </div>
            </div>

            <EditorTabs<ProductEditorTab>
              tabs={[{ id: 'basic', label: 'Thông tin cơ bản' }, { id: 'description', label: 'Mô tả' }, { id: 'review', label: 'SEO & kiểm duyệt' }]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className="grid lg:grid-cols-[230px_minmax(0,1fr)_420px]">
              <aside className="border-b lg:border-b-0 lg:border-r border-neutral-100 bg-white p-5">
                <WorkflowSteps steps={workflowSteps} />
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">
                  Ảnh có thể tải lên trước khi lưu. Hệ thống tự gắn ảnh khi bạn lưu nháp hoặc đăng.
                </div>
              </aside>
              <div className="p-5 space-y-6">
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <CompactMediaManager label="Hình ảnh sản phẩm" entityType="product" stagingKey={stagingKey} images={editorImages} onChange={setEditorImages} session={session} maxImages={9} aspectHint="1:1" />
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">1. Thông tin hiển thị</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="label-xs">Tên sản phẩm</label><Input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Tên sản phẩm hiển thị ngoài website" /></div>
                      <div><label className="label-xs">Giá (VNĐ)</label><Input required type="number" min={0} value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} /></div>
                      <div><label className="label-xs">Tag ngắn</label><Input value={formData.tag} onChange={e => setFormData(p => ({ ...p, tag: e.target.value }))} placeholder="VD: Bán chạy, Mới, Ưu đãi" /></div>
                      <div><label className="label-xs">Thương hiệu</label><Input value={formData.brand} onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))} placeholder="Nếu có" /></div>
                    </div>
                  </div>
                )}
                {activeTab === 'description' && (
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">2. Mô tả sản phẩm</h4>
                    <Textarea required className="min-h-64" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Mô tả công dụng, đối tượng phù hợp và lưu ý khi sử dụng." />
                    <p className="mt-2 text-xs text-neutral-400">{formData.description.length}/3000 ký tự</p>
                  </div>
                )}
                {activeTab === 'review' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-neutral-900">3. Kiểm duyệt trước khi đăng</h4>
                    <QualityChecklist items={qualityChecksToChecklist(productChecks)} />
                    <div className="rounded-lg bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                      Cảnh báo y tế chỉ là lớp rà soát hỗ trợ. Hãy tránh các câu khẳng định chữa khỏi, thay thế thuốc hoặc cam kết hiệu quả.
                    </div>
                  </div>
                )}
              </div>
              <aside className="border-t lg:border-t-0 lg:border-l border-neutral-100 bg-neutral-50 p-5 space-y-4">
                <CatalogPreviewShell defaultMode="mobile" title="Preview đúng giao diện /products">
                  {mode => <ProductPublicPreview mode={mode} product={previewProduct} />}
                </CatalogPreviewShell>
                <QualityChecklist items={qualityChecksToChecklist(productChecks)} />
              </aside>
            </div>
          </form>
        </Card>
      )}

      {!isEditorMode && (
        <>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
            <div className="grid lg:grid-cols-[1fr_180px_180px] gap-3">
              <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-10" placeholder="Tìm theo tên, tag, thương hiệu, mô tả..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | Product['status'])} className={`${selectControlClass} w-full`}>
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
              <select value={sortMode} onChange={e => setSortMode(e.target.value as 'newest' | 'name' | 'price')} className={`${selectControlClass} w-full`}>
                <option value="newest">Mới cập nhật</option>
                <option value="name">Tên A-Z</option>
                <option value="price">Giá cao trước</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-neutral-400">Đang hiển thị {filtered.length}/{products.length} sản phẩm.</p>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Hình</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Sản phẩm</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Giá</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-sm text-neutral-400">Không có sản phẩm phù hợp với bộ lọc hiện tại.</td></tr>}
                  {filtered.map(p => {
                    const primary = p.product_images?.find(i => i.is_primary);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="p-4">
                          {primary ? <img src={primary.url} alt={primary.alt} className="w-12 h-12 rounded object-cover border" referrerPolicy="no-referrer" /> : <div className="w-12 h-12 bg-neutral-100 rounded" />}
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="font-bold text-neutral-700 truncate">{p.name}</p>
                          {p.tag && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{p.tag}</span>}
                        </td>
                        <td className="p-4"><p className="text-sm font-bold text-neutral-600">{(p.price ?? 0).toLocaleString()}đ</p></td>
                        <td className="p-4"><StatusBadge status={p.status} /></td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 justify-end">
                            {p.status === 'published' && (
                              <a
                                href={`/products/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Mở sản phẩm ngoài web"
                                className="inline-flex h-8 w-8 items-center justify-center text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} aria-label="Chỉnh sửa" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} aria-label="Xóa" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
