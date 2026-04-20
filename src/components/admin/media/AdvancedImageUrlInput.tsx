import { ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdvancedImageUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function AdvancedImageUrlInput({ value, onChange, placeholder }: AdvancedImageUrlInputProps) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs font-medium text-neutral-400 hover:text-neutral-600 flex items-center gap-1 select-none">
        <ChevronRight className="w-3 h-3 transition-transform open:rotate-90" />
        Nâng cao: dùng ảnh từ URL ngoài
      </summary>
      <div className="mt-3 pl-4 border-l-2 border-neutral-100 space-y-2">
        <p className="text-[10px] text-amber-600 font-medium">
          ⚠️ Không khuyến nghị. URL ngoài có thể bị xóa hoặc thay đổi bất kỳ lúc nào.
        </p>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://example.com/image.jpg'}
          className="text-xs h-8"
        />
        {value && (
          <img
            src={value}
            alt="URL preview"
            className="h-20 w-32 object-cover rounded border border-neutral-200"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </details>
  );
}
