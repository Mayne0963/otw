"use client"

import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <AlertCircle className="h-5 w-5 text-otw-gold" />,
}

const toastStyles = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  info: "bg-otw-black text-white border-otw-gold/20",
}

function ToastItem({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all",
        toastStyles[type]
      )}
    >
      {toastIcons[type]}
      <p className="flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const _addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}