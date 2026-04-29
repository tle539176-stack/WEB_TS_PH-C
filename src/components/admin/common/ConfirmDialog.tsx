import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { AlertCircle } from 'lucide-react';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmContextType = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      resolverRef.current = resolve;
      setState({ ...opts, open: true });
    });
  }, []);

  const handleResponse = (value: boolean) => {
    resolverRef.current?.(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state?.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => handleResponse(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 focus:outline-none" tabIndex={-1}>
            <div className="flex items-start gap-3 mb-4">
              {state.danger && (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div>
                <h3 id="confirm-title" className="font-bold text-neutral-900 text-base">
                  {state.title}
                </h3>
                {state.message && (
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{state.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleResponse(false)}
              >
                {state.cancelText ?? 'Hủy'}
              </Button>
              <Button
                type="button"
                onClick={() => handleResponse(true)}
                className={state.danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#0A3151] hover:bg-[#0D426E] text-white'}
              >
                {state.confirmText ?? 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
