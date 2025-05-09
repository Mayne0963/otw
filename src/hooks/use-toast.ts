import { useState } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, action, duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, title, description, action, duration }

    setToasts((currentToasts) => [...currentToasts, newToast])

    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id)
        )
      }, duration)
    }

    return id
  }

  const dismiss = (toastId?: string) => {
    setToasts((currentToasts) =>
      toastId
        ? currentToasts.filter((toast) => toast.id !== toastId)
        : []
    )
  }

  return {
    toasts,
    toast,
    dismiss,
  }
} 