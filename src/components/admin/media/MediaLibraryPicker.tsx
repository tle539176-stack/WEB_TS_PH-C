import { useEffect, useState } from 'react';
import { Search, X, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { listMediaAssets } from '@/services/mediaService';
import type { MediaAsset } from '@/types/database';

interface MediaLibraryPickerProps {
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
  filterEntityType?: string;
}

export function MediaLibraryPicker({ onSelect, onClose, filterEntityType }: MediaLibraryPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listMediaAssets({ entityType: filterEntityType, search: search || undefined, limit: 60 })
      .then(setAssets)
      .finally(() => setLoading(false));
  }, [search, filterEntityType]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-[#0A3151]">Thư viện ảnh</h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-2 bg-neutral-50 border rounded px-3">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên file hoặc alt text..."
              className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-neutral-400 py-12 text-sm">Đang tải...</p>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Chưa có ảnh nào trong thư viện.</p>
              <p className="text-xs text-neutral-300 mt-1">Upload ảnh từ trang sản phẩm, sách hoặc bài viết.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelect(asset)}
                  className="group relative border rounded overflow-hidden hover:border-[#0A3151] transition-colors text-left"
                >
                  <img
                    src={asset.public_url}
                    alt={asset.alt || asset.file_name}
                    className="w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#0A3151]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Chọn</span>
                  </div>
                  <div className="p-1.5">
                    <p className="text-[9px] text-neutral-500 truncate">{asset.file_name}</p>
                    {asset.alt && <p className="text-[9px] text-neutral-400 truncate italic">{asset.alt}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
