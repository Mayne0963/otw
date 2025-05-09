import type { ReactNode } from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export interface LayoutProps {
  children: ReactNode
}

export interface Metadata {
  title: string
  description: string
  icons?: {
    icon: string
  }
}
