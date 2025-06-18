# Firestore Index Solution

## Problem
The application was experiencing "query requires an index" errors when accessing `/otw/rides` and other pages that trigger menu queries.

## Root Cause
The issue was in `/src/app/api/fetch-menu/route.ts` where Firestore queries were using compound filters and ordering:

```javascript
// This query requires a composite index
const q = query(
  collection(db, 'menu_items'),
  where('category', '==', category),  // Filter by category
  orderBy('name')                     // Order by name
);
```

Firestore requires composite indexes when:
1. Using multiple fields in a query
2. Combining `where()` filters with `orderBy()` on different fields
3. Using inequality filters with `orderBy()` on different fields

## Solution
Added the following composite indexes to `firestore.indexes.json`:

### 1. Category + Name Index
```json
{
  "collectionGroup": "menu_items",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "category",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 2. RestaurantId + Category + Name Index
```json
{
  "collectionGroup": "menu_items",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "restaurantId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "category",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 3. RestaurantId + Available + Name Index
```json
{
  "collectionGroup": "menu_items",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "restaurantId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "available",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 4. RestaurantId + Category + Available + Name Index
```json
{
  "collectionGroup": "menu_items",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "restaurantId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "category",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "available",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

## Deployment
Indexes were deployed using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

## Verification
After deployment:
1. The `/otw/rides` page loads without Firestore index errors
2. Menu queries work correctly across the application
3. No console errors related to missing indexes

## Files Modified
- `firestore.indexes.json` - Added composite indexes for menu_items collection

## Notes
- Firestore indexes can take several minutes to build after deployment
- These indexes support all current menu query patterns in the application
- Future menu queries should consider these existing indexes to avoid creating duplicate indexes