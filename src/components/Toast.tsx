import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "rgba(0, 255, 100, 0.1)",
          border: "1px solid rgba(0, 255, 100, 0.3)",
          icon: "text-green-400",
        };
      case "error":
        return {
          bg: "rgba(255, 50, 50, 0.1)",
          border: "1px solid rgba(255, 50, 50, 0.3)",
          icon: "text-red-400",
        };
      case "warning":
        return {
          bg: "rgba(255, 200, 50, 0.1)",
          border: "1px solid rgba(255, 200, 50, 0.3)",
          icon: "text-yellow-400",
        };
      default:
        return {
          bg: "rgba(100, 150, 255, 0.1)",
          border: "1px solid rgba(100, 150, 255, 0.3)",
          icon: "text-blue-400",
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        background: styles.bg,
        border: styles.border,
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        minWidth: "320px",
        maxWidth: "400px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            color: "#fff",
            marginBottom: "4px",
            fontSize: "0.95rem",
          }}
        >
          {toast.title}
        </div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          padding: "0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={18} />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast toast={toast} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration: duration !== undefined ? duration : 4000,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
