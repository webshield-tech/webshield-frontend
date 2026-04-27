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
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        width: "fit-content",
        minWidth: "280px",
        maxWidth: "380px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className={`flex-shrink-0 ${styles.icon}`} style={{ display: 'flex' }}>{getIcon()}</div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            fontWeight: 600,
            color: "#fff",
            marginBottom: "2px",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {toast.title}
        </div>
        <div style={{ 
          fontSize: "0.8rem", 
          color: "rgba(255,255,255,0.7)",
          lineHeight: "1.4",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
      >
        <X size={16} />
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
        top: "80px",
        right: "24px",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
        maxWidth: "calc(100vw - 48px)"
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "auto", display: 'flex', justifyContent: 'flex-end' }}>
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
