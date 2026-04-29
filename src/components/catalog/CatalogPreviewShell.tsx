import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export type CatalogPreviewMode = 'mobile' | 'desktop';

type CatalogPreviewShellProps = {
  children: ReactNode | ((mode: CatalogPreviewMode) => ReactNode);
  defaultMode?: CatalogPreviewMode;
  title?: string;
};

export function CatalogPreviewShell({
  children,
  defaultMode = 'mobile',
  title = 'Preview ngoài website',
}: CatalogPreviewShellProps) {
  const [mode, setMode] = useState<CatalogPreviewMode>(defaultMode);
  const frameClass = mode === 'mobile'
    ? 'w-[390px] max-w-full rounded-[28px] border-[8px] border-neutral-900'
    : 'w-[860px] rounded-xl border border-neutral-300';

  return (
    <div className="site-preview rounded-lg border border-neutral-200 bg-[#F7F8FA] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">{title}</p>
        <div className="flex rounded-md border border-neutral-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode('mobile')}
            className={`flex h-7 items-center gap-1 rounded px-2 text-[11px] font-bold ${
              mode === 'mobile' ? 'bg-[#0A3151] text-white' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Điện thoại
          </button>
          <button
            type="button"
            onClick={() => setMode('desktop')}
            className={`flex h-7 items-center gap-1 rounded px-2 text-[11px] font-bold ${
              mode === 'desktop' ? 'bg-[#0A3151] text-white' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> Web
          </button>
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className={`${frameClass} mx-auto overflow-hidden bg-white shadow-sm`}>
          {typeof children === 'function' ? children(mode) : children}
        </div>
      </div>
    </div>
  );
}
