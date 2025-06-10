import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * TabLoadingSpinner Component
 * 
 * A loading spinner component specifically designed for dashboard tabs.
 * Provides a consistent loading experience across different tab content.
 */
const TabLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default TabLoadingSpinner;