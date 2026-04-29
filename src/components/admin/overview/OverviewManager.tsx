import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import {
  History, PlusCircle, Edit3, ShoppingBag, Book, FileText, Tags,
  AlertCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import * as content from '../../../services/contentService';
import type { WorkQueueItem } from '../../../services/contentService';
import { supabase } from '../../../lib/supabase';

const typeIcon: Record<WorkQueueItem['type'], React.FC<{ className?: string }>> = {
  book: Book,
  product: ShoppingBag,
  note: FileText,
};

const typeLabel: Record<string, string> = { products: 'Sản phẩm', books: 'Sách', notes: 'Ghi chú' };

function WorkQueuePanel({
  items,
  loading,
  setActiveMenu,
}: {
  items: WorkQueueItem[];
  loading: boolean;
  setActiveMenu: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-sm font-medium text-neutral-600">Không có việc cần xử lý</p>
        <p className="text-xs text-neutral-400 mt-1">Nội dung đang ở trạng thái tốt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 12).map((item, i) => {
        const Icon = typeIcon[item.type];
        return (
          <button
            key={`${item.id}-${i}`}
            type="button"
            onClick={() => setActiveMenu(item.type === 'book' ? 'books' : item.type === 'product' ? 'products' : 'notes')}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 text-left transition-all"
          >
            <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{item.title}</p>
              <p className={`text-xs mt-0.5 ${item.issueType === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                {item.issueType === 'error'
                  ? <AlertCircle className="inline w-3 h-3 mr-1" />
                  : <AlertTriangle className="inline w-3 h-3 mr-1" />
                }
                {item.issue}
              </p>
            </div>
          </button>
        );
      })}
      {items.length > 12 && (
        <p className="text-xs text-neutral-400 text-center pt-2">
          +{items.length - 12} mục khác cần xử lý
        </p>
      )}
    </div>
  );
}

export function OverviewManager({ setActiveMenu }: { setActiveMenu: (id: string) => void }) {
  const [stats, setStats] = useState({ products: 0, books: 0, notes: 0, categories: 0 });
  const [recentActivity, setRecentActivity] = useState<Awaited<ReturnType<typeof content.getRecentActivity>>>([]);
  const [workQueue, setWorkQueue] = useState<WorkQueueItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoadingStats(false); setLoadingQueue(false); return; }
    content.getDashboardStats().then(s => { setStats(s); setLoadingStats(false); });
    content.getRecentActivity().then(setRecentActivity);
    content.getAdminWorkQueue()
      .then(setWorkQueue)
      .catch(() => setWorkQueue([]))
      .finally(() => setLoadingQueue(false));
  }, []);

  const statCards = [
    { id: 'products', label: 'Sản phẩm', count: stats.products, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { id: 'books', label: 'Đầu sách', count: stats.books, icon: Book, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'notes', label: 'Bài viết', count: stats.notes, icon: FileText, color: 'bg-amber-50 text-amber-600' },
    { id: 'categories', label: 'Danh mục', count: stats.categories, icon: Tags, color: 'bg-indigo-50 text-indigo-600' },
  ];

  const errorCount = workQueue.filter(i => i.issueType === 'error').length;
  const warnCount = workQueue.filter(i => i.issueType === 'warning').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <Card
            key={card.id}
            className="p-6 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveMenu(card.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}><card.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-neutral-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-800">{loadingStats ? '—' : card.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#0A3151] flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Việc cần xử lý hôm nay
            </h3>
            <div className="flex gap-2">
              {errorCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {errorCount} lỗi
                </span>
              )}
              {warnCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {warnCount} cảnh báo
                </span>
              )}
            </div>
          </div>
          <WorkQueuePanel items={workQueue} loading={loadingQueue} setActiveMenu={setActiveMenu} />
        </Card>

        <Card className="p-6 border-none shadow-sm">
          <h3 className="font-bold text-[#0A3151] mb-6 flex items-center gap-2">
            <History className="w-4 h-4" /> Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0
              ? recentActivity.map((a, i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-neutral-100 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.action.includes('thêm') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {a.action.includes('thêm') ? <PlusCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      <span className="font-bold">{typeLabel[a.type] ?? a.type}:</span> {a.title}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{a.action}</p>
                    <p className="text-[10px] text-neutral-400">{new Date(a.updated_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))
              : <p className="text-sm text-neutral-400 italic">Chưa có hoạt động nào được ghi nhận...</p>
            }
          </div>
        </Card>
      </div>
    </div>
  );
}
