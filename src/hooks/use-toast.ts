import { useState } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    action,
    duration = 5000,
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, duration };
    if (title !== undefined) {newToast.title = title;}
    if (description !== undefined) {newToast.description = description;}
    if (action !== undefined) {newToast.action = action;}

    setToasts((currentToasts) => [...currentToasts, newToast]);

    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id),
        );
      }, duration);
    }

    return id;
  };

  const dismiss = (toastId?: string) => {
    setToasts((currentToasts) =>
      toastId ? currentToasts.filter((toast) => toast.id !== toastId) : [],
    );
  };

  return {
    toasts,
    toast,
    dismiss,
  };
}
