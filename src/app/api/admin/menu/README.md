# Menu Management API Documentation

## Authentication

All endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

Only users with the `admin` role can access these endpoints.

## Rate Limiting

- Regular routes: 100 requests per minute
- Admin routes: 500 requests per minute

## Endpoints

### List Menu Items

```http
GET /api/admin/menu
```

Lists all menu items with pagination and sorting.

Query Parameters:
- `limit` (optional): Items per page (default: 50, max: 100)
- `page` (optional): Page number (default: 1)
- `sortBy` (optional): Field to sort by (default: 'name')
- `sortOrder` (optional): Sort direction ('asc' or 'desc', default: 'asc')

Response:
```json
{
  "menu": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "description": "string",
      "image": "string?",
      "type": "'classic' | 'infused'",
      "source": "'broskis' | 'partner'"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### Get Menu Item

```http
GET /api/admin/menu/{id}
```

Retrieves a specific menu item by ID.

Response:
```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string?",
  "type": "'classic' | 'infused'",
  "source": "'broskis' | 'partner'"
}
```

### Create Menu Item

```http
POST /api/admin/menu
```

Creates a new menu item.

Request Body:
```json
{
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string?",
  "type": "'classic' | 'infused'",
  "source": "'broskis' | 'partner'"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string?",
  "type": "'classic' | 'infused'",
  "source": "'broskis' | 'partner'",
  "createdAt": "string",
  "createdBy": "string"
}
```

### Update Menu Item

```http
PATCH /api/admin/menu/{id}
```

Updates an existing menu item. All fields are optional.

Request Body:
```json
{
  "name": "string?",
  "price": "number?",
  "description": "string?",
  "image": "string?",
  "type": "'classic' | 'infused'?",
  "source": "'broskis' | 'partner'?"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string?",
  "type": "'classic' | 'infused'",
  "source": "'broskis' | 'partner'",
  "updatedAt": "string",
  "updatedBy": "string"
}
```

### Delete Menu Item

```http
DELETE /api/admin/menu/{id}
```

Deletes a menu item.

Response:
```json
{
  "success": true,
  "id": "string",
  "message": "Menu item deleted successfully"
}
```

### Search Menu Items

```http
GET /api/admin/menu/search
```

Searches menu items with advanced filtering.

Query Parameters:
- `q` (optional): Search query for name and description
- `type` (optional): Filter by type ('classic' or 'infused')
- `source` (optional): Filter by source ('broskis' or 'partner')
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `limit` (optional): Items per page (default: 50, max: 100)
- `page` (optional): Page number (default: 1)

Response:
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "description": "string",
      "image": "string?",
      "type": "'classic' | 'infused'",
      "source": "'broskis' | 'partner'"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  },
  "filters": {
    "query": "string?",
    "type": "'classic' | 'infused'?",
    "source": "'broskis' | 'partner'?",
    "priceRange": {
      "min": "number?",
      "max": "number?"
    }
  }
}
```

### Bulk Operations

```http
POST /api/admin/menu/bulk
```

Performs bulk updates or deletions on menu items.

Request Body:
```json
{
  "operation": "'update' | 'delete'",
  "items": [
    {
      "id": "string",
      "data": "object?" // Required for updates, omit for deletes
    }
  ]
}
```

Response:
```json
{
  "message": "string",
  "results": {
    "successCount": "number",
    "failureCount": "number",
    "successful": [
      {
        "id": "string",
        "data": "object?"
      }
    ],
    "failed": [
      {
        "id": "string",
        "error": "string"
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "string",
  "code": "string",
  "details": "any?"
}
```

Common Error Codes:
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: User lacks required permissions
- `NOT_FOUND`: Requested resource not found
- `BAD_REQUEST`: Invalid request data
- `VALIDATION_ERROR`: Request data fails validation
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error 