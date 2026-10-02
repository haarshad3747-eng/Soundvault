import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-[#00f0ff] shrink-0" />;
        let borderClass = 'border-[#00f0ff]/40';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />;
          borderClass = 'border-[#10b981]/50';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0" />;
          borderClass = 'border-[#ef4444]/50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d111d]/90 backdrop-blur-xl border ${borderClass} shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-2 duration-200 text-sm`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="text-white font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
