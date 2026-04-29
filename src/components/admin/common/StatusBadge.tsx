const colors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-neutral-100 text-neutral-500',
  in_review: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-red-100 text-red-500',
};

const labels: Record<string, string> = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
  in_review: 'Đang duyệt',
  archived: 'Lưu trữ',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}
