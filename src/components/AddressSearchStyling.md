# AddressSearch Component - Styling and Customization Guide

The `AddressSearch` component now includes comprehensive styling and customization options to match any design system or brand requirements.

## 🎨 Features

### Theme Variants
- **Default**: Clean, professional styling with blue accents
- **Modern**: Contemporary design with subtle shadows and indigo accents
- **Minimal**: Clean, borderless design with bottom border only
- **Glassmorphism**: Translucent background with backdrop blur effect
- **Dark**: Dark theme optimized for dark mode interfaces

### Size Options
- **Small (sm)**: Compact input for tight spaces
- **Medium (md)**: Standard size (default)
- **Large (lg)**: Prominent input for hero sections
- **Extra Large (xl)**: Maximum impact sizing

### Customization Options
- Custom focus colors
- Flexible border radius options
- Icon visibility control
- Disabled state support
- Custom CSS class overrides
- Loading and error message customization

## 📋 Props Reference

```typescript
interface AddressSearchProps {
  // Core functionality
  onPlaceSelect: (place: PlaceDetails) => void;
  apiKey: string;
  
  // Basic customization
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  
  // Theme and appearance
  theme?: 'default' | 'modern' | 'minimal' | 'glassmorphism' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  focusColor?: string; // Hex color for focus states
  
  // Icon and visual elements
  showIcon?: boolean;
  
  // Custom styling
  customStyles?: {
    container?: string;
    input?: string;
    loading?: string;
    error?: string;
    icon?: string;
  };
  
  // Messages
  errorMessage?: string;
  loadingText?: string;
}
```

## 🚀 Usage Examples

### Basic Usage
```tsx
import AddressSearch from './AddressSearch';

function MyComponent() {
  const handlePlaceSelect = (place) => {
    console.log('Selected:', place);
  };

  return (
    <AddressSearch
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      onPlaceSelect={handlePlaceSelect}
      placeholder="Enter your address..."
    />
  );
}
```

### Theme Variants
```tsx
{/* Default theme */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="default"
/>

{/* Modern theme with shadow */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="modern"
/>

{/* Minimal theme for clean designs */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="minimal"
/>

{/* Glassmorphism for overlay designs */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="glassmorphism"
/>

{/* Dark theme */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="dark"
/>
```

### Size Variants
```tsx
{/* Small size for compact layouts */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  size="sm"
/>

{/* Large size for hero sections */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  size="lg"
/>

{/* Extra large for maximum impact */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  size="xl"
/>
```

### Custom Focus Colors
```tsx
{/* Purple focus color */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  focusColor="#8B5CF6"
/>

{/* Green focus color */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  focusColor="#10B981"
/>
```

### Border Radius Options
```tsx
{/* No border radius */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  borderRadius="none"
/>

{/* Fully rounded */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  borderRadius="full"
/>
```

### Icon Control
```tsx
{/* Hide the location icon */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  showIcon={false}
/>
```

### Custom Styles
```tsx
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  customStyles={{
    container: 'shadow-2xl',
    input: 'border-2 border-purple-300 focus:border-purple-500',
    icon: 'text-purple-500',
    loading: 'bg-purple-50',
    error: 'bg-red-100 border-red-300'
  }}
/>
```

### Combined Example
```tsx
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="modern"
  size="lg"
  borderRadius="xl"
  focusColor="#F59E0B"
  placeholder="Enter your delivery address..."
  customStyles={{
    container: 'shadow-xl',
    input: 'font-medium'
  }}
  loadingText="Loading maps..."
  errorMessage="Unable to load address search. Please try again."
/>
```

### Disabled State
```tsx
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  disabled={true}
  placeholder="Address search disabled"
/>
```

## 🎯 Design System Integration

### Matching Your Brand Colors
```tsx
// Use your brand's primary color for focus states
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  focusColor="#YOUR_BRAND_COLOR"
  customStyles={{
    input: 'border-gray-300 focus:border-[#YOUR_BRAND_COLOR]'
  }}
/>
```

### Custom CSS Classes
```tsx
// Apply your design system classes
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  className="your-custom-class"
  customStyles={{
    container: 'your-container-class',
    input: 'your-input-class'
  }}
/>
```

## 🌙 Dark Mode Support

The component includes built-in dark mode support:

```tsx
{/* Automatic dark theme */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  theme="dark"
/>

{/* Custom dark mode styling */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  customStyles={{
    input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
  }}
/>
```

## 📱 Responsive Design

The component is fully responsive and works well across all device sizes:

```tsx
{/* Responsive sizing */}
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  size="sm" // Small on mobile
  className="md:text-base lg:text-lg" // Larger on desktop
/>
```

## 🔧 Advanced Customization

### Custom Loading States
```tsx
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  loadingText="Initializing address search..."
  customStyles={{
    loading: 'bg-blue-50 border-blue-200 text-blue-700'
  }}
/>
```

### Custom Error Handling
```tsx
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  errorMessage="Address search is temporarily unavailable. Please try again later."
  customStyles={{
    error: 'bg-red-50 border-red-300 text-red-700 rounded-lg p-4'
  }}
/>
```

## 🎨 Theme Showcase

To see all themes and customization options in action, check out the `AddressSearchStylesExample` component which demonstrates:

- All theme variants
- Size comparisons
- Border radius options
- Custom focus colors
- Icon visibility options
- Custom styling examples
- Combined configurations

```tsx
import AddressSearchStylesExample from './AddressSearchStylesExample';

// Use in your app to see all styling options
<AddressSearchStylesExample />
```

## 🚨 Important Notes

1. **API Key Required**: Make sure to set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment variables
2. **Google Places API**: Ensure the Places API is enabled in your Google Cloud Console
3. **Tailwind CSS**: The component uses Tailwind CSS classes for styling
4. **Performance**: The component is optimized for performance with proper cleanup of Google Maps listeners

## 🔄 Migration from Basic Version

If you're upgrading from the basic AddressSearch component:

```tsx
// Before
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  placeholder="Enter address..."
  className="custom-class"
/>

// After (same functionality, but with new options available)
<AddressSearch
  apiKey={apiKey}
  onPlaceSelect={handlePlaceSelect}
  placeholder="Enter address..."
  className="custom-class"
  // New optional props
  theme="modern"
  size="md"
  showIcon={true}
/>
```

All existing props remain compatible, so no breaking changes are introduced.