"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastNotificationProps {
  type?: ToastType
  title: string
  message?: string
  duration?: number
  onClose?: () => void
  action?: React.ReactNode
}

export function ToastNotification({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  action,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 100 / (duration / 100)
      })
    }, 100)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300)
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  }

  const bgColors = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  }

  return (
    <div
      className={cn(
        "max-w-md w-full pointer-events-auto overflow-hidden rounded-lg border shadow-lg",
        bgColors[type],
        isVisible ? "animate-fade-in" : "animate-fade-out opacity-0",
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
            {action && <div className="mt-3">{action}</div>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {duration !== Number.POSITIVE_INFINITY && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              "h-full transition-all duration-100",
              type === "success" && "bg-green-500",
              type === "error" && "bg-red-500",
              type === "info" && "bg-blue-500",
              type === "warning" && "bg-yellow-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
