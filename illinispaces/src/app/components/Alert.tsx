import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning";
  onClose?: () => void;
  duration?: number; // in ms
}

export const Alert: React.FC<AlertProps> = ({ message, type = "success", onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }[type];

  return (
    <div
      className={`w-full border px-4 py-3 rounded shadow-sm transition-opacity duration-300 ${bgColor}`}
    >
      {message}
    </div>
  );
};
