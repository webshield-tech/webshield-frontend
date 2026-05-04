/* eslint-disable react-refresh/only-export-components */
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
          bg: "linear-gradient(135deg, rgba(0, 255, 157, 0.16), rgba(0, 255, 157, 0.08))",
          border: "1px solid rgba(0, 255, 157, 0.35)",
          accent: "#00ff9d",
          iconBg: "rgba(0, 255, 157, 0.12)",
        };
      case "error":
        return {
          bg: "linear-gradient(135deg, rgba(255, 77, 77, 0.16), rgba(255, 77, 77, 0.08))",
          border: "1px solid rgba(255, 77, 77, 0.35)",
          accent: "#ff5d5d",
          iconBg: "rgba(255, 77, 77, 0.12)",
        };
      case "warning":
        return {
          bg: "linear-gradient(135deg, rgba(255, 200, 50, 0.16), rgba(255, 200, 50, 0.08))",
          border: "1px solid rgba(255, 200, 50, 0.35)",
          accent: "#ffd54f",
          iconBg: "rgba(255, 200, 50, 0.12)",
        };
      default:
        return {
          bg: "linear-gradient(135deg, rgba(0, 242, 255, 0.14), rgba(0, 242, 255, 0.06))",
          border: "1px solid rgba(0, 242, 255, 0.3)",
          accent: "#00f2ff",
          iconBg: "rgba(0, 242, 255, 0.12)",
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
        borderLeft: `4px solid ${styles.accent}`,
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
      <div
        className="flex-shrink-0"
        style={{
          display: "flex",
          color: styles.accent,
          background: styles.iconBg,
          borderRadius: "10px",
          width: "36px",
          height: "36px",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 18px ${styles.accent}22`,
        }}
      >
        {getIcon()}
      </div>
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
  removeToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
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
            <Toast toast={toast} onClose={removeToast} />
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
    setToasts((prev) => {
      const next = [...prev, newToast];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
