"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)

    // Here you could send the error to your error reporting service
    // Example: reportError(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem
              persists.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</Button>
            </div>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-gray-900 rounded-md text-left overflow-auto max-w-full">
                <p className="text-sm text-red-400 mb-2">Error details (visible in development only):</p>
                <pre className="text-xs text-gray-400 whitespace-pre-wrap break-all">{this.state.error.toString()}</pre>
              </div>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}
