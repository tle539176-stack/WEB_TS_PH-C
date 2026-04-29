import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { ChecklistItem } from './adminHelpers';

export function QualityChecklist({ items }: { items: ChecklistItem[] }) {
  const allOk = items.every(i => i.ok);
  return (
    <div className={`rounded-lg p-3 border ${allOk ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-neutral-500">Kiểm tra chất lượng</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.ok
              ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              : item.warn
              ? <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              : <Info className="w-3 h-3 text-red-400 shrink-0" />
            }
            <span className={`text-[11px] ${item.ok ? 'text-green-700' : item.warn ? 'text-amber-700' : 'text-red-600'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
