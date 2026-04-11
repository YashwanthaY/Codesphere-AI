import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    barColor: "bg-emerald-500",
    label: "Success",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-400",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/10",
    barColor: "bg-red-500",
    label: "Error",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    barColor: "bg-blue-500",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    barColor: "bg-amber-500",
    label: "Warning",
  },
  xp: {
    icon: CheckCircle,
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/10",
    barColor: "bg-violet-500",
    label: "XP Earned",
  },
};

function Toast({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={
        "relative flex items-start gap-3 p-4 rounded-xl border " +
        "shadow-2xl min-w-72 max-w-sm bg-slate-900 " +
        style.borderColor
      }
      style={{ animation: "slideIn 0.3s ease forwards" }}
    >
      <div
        className={"absolute top-0 left-0 h-0.5 rounded-t-xl " + style.barColor}
        style={{
          animation: "shrink " + (toast.duration || 3000) + "ms linear forwards",
          width: "100%",
        }}
      />
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={18} className={style.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-200 mb-0.5">
          {toast.title || style.label}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={function () { onRemove(toast.id); }}
        className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors mt-0.5 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2"
      style={{ pointerEvents: "none" }}
    >
      {toasts.map(function (toast) {
        return (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(function (id) {
    setToasts(function (prev) {
      return prev.filter(function (t) { return t.id !== id; });
    });
  }, []);

  const showToast = useCallback(function (message, type, options) {
    const id = Date.now() + Math.random();
    const duration = (options && options.duration) || 3000;
    const title = options && options.title;
    const newToast = { id, message, type: type || "info", duration, title };
    setToasts(function (prev) {
      const updated = [...prev, newToast];
      if (updated.length > 5) updated.shift();
      return updated;
    });
    setTimeout(function () { removeToast(id); }, duration);
    return id;
  }, [removeToast]);

  const toast = {
    success: function (message, options) { return showToast(message, "success", options); },
    error:   function (message, options) { return showToast(message, "error",   options); },
    info:    function (message, options) { return showToast(message, "info",    options); },
    warning: function (message, options) { return showToast(message, "warning", options); },
    xp:      function (message, options) { return showToast(message, "xp",     options); },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}