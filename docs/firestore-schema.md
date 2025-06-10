# Firestore Database Schema

This document outlines the Firestore database structure for the Firebase MCP integrated web application.

## Collections Overview

### 1. Users Collection (`users`)
Stores user profile information and authentication data.

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName: string | null;     // User display name
  photoURL: string | null;        // Profile photo URL
  role: 'user' | 'admin';        // User role
  createdAt: Timestamp;           // Account creation date
  updatedAt: Timestamp;           // Last profile update
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: Timestamp | null;
  };
}
```

### 2. Orders Collection (`orders`)
Stores regular food orders.

```typescript
interface Order {
  id: string;                     // Order ID
  userRef: string;                // Reference to user UID
  restaurantId: string;           // Restaurant identifier
  items: OrderItem[];             // Array of ordered items
  total: number;                  // Total order amount
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;       // Stripe payment intent ID
  deliveryAddress: Address;       // Delivery address
  specialInstructions?: string;   // Special delivery instructions
  createdAt: Timestamp;           // Order creation time
  updatedAt: Timestamp;           // Last update time
  estimatedDelivery?: Timestamp;  // Estimated delivery time
  deliveredAt?: Timestamp;        // Actual delivery time
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### 3. Screenshot Orders Collection (`screenshot_orders`)
Stores screenshot-based orders.

```typescript
interface ScreenshotOrder {
  id: string;                     // Order ID
  customerInfo: {
    uid: string;                  // User UID
    name: string;
    email: string;
    phone?: string;
  };
  screenshotUrl: string;          // URL to uploaded screenshot
  extractedItems: ExtractedItem[]; // AI-extracted items
  estimatedTotal: number;         // Estimated order total
  status: 'processing' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: Address;
  notes?: string;                 // Customer notes
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;        // When AI processing completed
}

interface ExtractedItem {
  name: string;
  quantity: number;
  estimatedPrice: number;
  confidence: number;             // AI confidence score (0-1)
}
```

### 4. Restaurants Collection (`restaurants`)
Stores restaurant information and menus.

```typescript
interface Restaurant {
  id: string;                     // Restaurant ID
  name: string;                   // Restaurant name
  description: string;            // Restaurant description
  cuisine: string[];              // Cuisine types
  address: Address;               // Restaurant address
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  hours: {
    [day: string]: {
      open: string;               // Opening time (HH:MM)
      close: string;              // Closing time (HH:MM)
      closed: boolean;            // Is closed on this day
    };
  };
  menu: MenuItem[];               // Restaurant menu
  rating: number;                 // Average rating (1-5)
  reviewCount: number;            // Number of reviews
  imageUrl?: string;              // Restaurant image
  isActive: boolean;              // Is restaurant accepting orders
  deliveryFee: number;            // Delivery fee
  minimumOrder: number;           // Minimum order amount
  estimatedDeliveryTime: number;  // Estimated delivery time in minutes
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

### 5. Analytics Events Collection (`analytics_events`)
Stores user interaction events for analytics.

```typescript
interface AnalyticsEvent {
  id: string;                     // Event ID
  userId: string;                 // User UID
  eventType: string;              // Event type (page_view, order_placed, etc.)
  eventData: Record<string, any>; // Event-specific data
  timestamp: Timestamp;           // Event timestamp
  sessionId?: string;             // User session ID
  userAgent?: string;             // User agent string
  ipAddress?: string;             // User IP address (hashed)
}
```

### 6. User Analytics Collection (`user_analytics`)
Stores aggregated analytics data per user.

```typescript
interface UserAnalytics {
  userId: string;                 // User UID
  totalEvents: number;            // Total events count
  eventCounts: Record<string, number>; // Count per event type
  lastEventAt: Timestamp;         // Last event timestamp
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. Subscriptions Collection (`subscriptions`)
Stores user subscription information.

```typescript
interface Subscription {
  id: string;                     // Subscription ID (Stripe subscription ID)
  userId: string;                 // User UID
  customerId: string;             // Stripe customer ID
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Timestamp;  // Current billing period start
  currentPeriodEnd: Timestamp;    // Current billing period end
  canceledAt?: Timestamp;         // Cancellation timestamp
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 8. Notification Logs Collection (`notification_logs`)
Stores notification delivery logs.

```typescript
interface NotificationLog {
  id: string;                     // Log ID
  userId: string;                 // Target user UID
  type: 'email' | 'push' | 'sms'; // Notification type
  template: string;               // Notification template used
  status: 'sent' | 'failed' | 'pending';
  content: {
    subject?: string;
    body: string;
    data?: Record<string, any>;
  };
  error?: string;                 // Error message if failed
  sentAt?: Timestamp;             // Delivery timestamp
  createdAt: Timestamp;
}
```

### 9. Payment Logs Collection (`payment_logs`)
Stores payment transaction logs.

```typescript
interface PaymentLog {
  id: string;                     // Log ID
  type: 'payment_succeeded' | 'payment_failed' | 'refund_processed';
  orderId?: string;               // Related order ID
  paymentIntentId: string;        // Stripe payment intent ID
  amount: number;                 // Amount in cents
  currency: string;               // Currency code
  error?: string;                 // Error message if failed
  timestamp: Timestamp;
}
```

### 10. Daily Reports Collection (`daily_reports`)
Stores daily analytics reports.

```typescript
interface DailyReport {
  date: string;                   // Date in YYYY-MM-DD format
  metrics: {
    totalEvents: number;
    totalOrders: number;
    completedOrders: number;
    newUsers: number;
    activeUsers: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  generatedAt: Timestamp;
}
```

### 11. Backup Logs Collection (`backup_logs`)
Stores backup operation logs.

```typescript
interface BackupLog {
  backupId: string;               // Backup identifier
  timestamp: Timestamp;           // Backup timestamp
  collections: BackupResult[];    // Results per collection
  status: 'completed' | 'failed'; // Backup status
  type: 'daily_scheduled' | 'manual'; // Backup type
  initiatedBy?: string;           // User UID if manual
  error?: string;                 // Error message if failed
}

interface BackupResult {
  collection: string;
  documentCount?: number;
  fileName?: string;
  status: 'success' | 'failed';
  error?: string;
}
```

## Security Rules Summary

### Users Collection
- Users can read/write their own profile
- Admins can read all user profiles

### Orders Collections
- Users can read/write their own orders
- Admins can read all orders

### Restaurants Collection
- Public read access
- Admin write access only

### Analytics Collections
- Admin read access only
- System write access via Cloud Functions

### Logs Collections
- Admin read access only
- System write access via Cloud Functions

## Indexes Required

### Composite Indexes
1. `analytics_events`: `userId` (ASC) + `timestamp` (DESC)
2. `orders`: `userRef` (ASC) + `createdAt` (DESC)
3. `orders`: `status` (ASC) + `createdAt` (DESC)
4. `screenshot_orders`: `customerInfo.uid` (ASC) + `createdAt` (DESC)
5. `notification_logs`: `userId` (ASC) + `createdAt` (DESC)
6. `payment_logs`: `orderId` (ASC) + `timestamp` (DESC)

### Single Field Indexes
- Most timestamp fields for range queries
- Status fields for filtering
- User reference fields for user-specific queries

## Data Validation

All collections should implement proper data validation through:
1. Firestore Security Rules
2. Cloud Functions validation
3. Client-side validation

Key validation rules:
- Email format validation
- Required field validation
- Data type validation
- Business logic validation (e.g., order totals, user permissions)
- Input sanitization for security

## Performance Considerations

1. **Pagination**: Implement cursor-based pagination for large collections
2. **Caching**: Cache frequently accessed data (restaurants, user profiles)
3. **Batch Operations**: Use batch writes for related document updates
4. **Subcollections**: Consider subcollections for nested data (e.g., order items)
5. **Data Archiving**: Archive old data to separate collections or external storage

## Migration Strategy

When updating the schema:
1. Create migration Cloud Functions
2. Test migrations on development environment
3. Implement backward compatibility
4. Plan for gradual rollout
5. Monitor data integrity during migration