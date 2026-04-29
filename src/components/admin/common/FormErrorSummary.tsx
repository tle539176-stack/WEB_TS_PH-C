import { AlertCircle } from 'lucide-react';

export function FormErrorSummary({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert" aria-live="polite">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
        <p className="text-sm font-bold text-red-700">
          {errors.length === 1 ? 'Cần sửa lỗi sau trước khi tiếp tục:' : `Cần sửa ${errors.length} lỗi sau trước khi tiếp tục:`}
        </p>
      </div>
      <ul className="space-y-1 pl-6">
        {errors.map((err, i) => (
          <li key={i} className="text-sm text-red-600 list-disc">{err}</li>
        ))}
      </ul>
    </div>
  );
}
