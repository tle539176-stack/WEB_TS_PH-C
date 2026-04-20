import type { ReactNode } from 'react';

export function CatalogPreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-preview rounded-lg border border-neutral-200 bg-[#F7F8FA] p-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-3">Preview ngoài website</p>
      <div className="max-w-sm mx-auto">
        {children}
      </div>
    </div>
  );
}
