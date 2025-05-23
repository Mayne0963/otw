import type { ReactNode } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }

  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export interface LayoutProps {
  children: ReactNode;
}

export interface Metadata {
  title: string;
  description: string;
  icons?: {
    icon: string;
  };
}
