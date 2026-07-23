import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const api = useMemo(() => ({
    show(message, tone = 'success') {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 2800);
    }
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.tone}`} key={toast.id}>
            {toast.tone === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
            <span>{toast.message}</span>
            <button aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
