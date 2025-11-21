# Generic Filter System Guide

## Overview

The generic filter system provides flexible filtering, sorting, and pagination for all entities in the application. There are two ways to use it:

1. **Simple Search** (Recommended for most cases) - Using `SearchRequest`
2. **Advanced Search** - Using `InputDataModel` with `FilterGroup`

---

## 1. Simple Search (Recommended)

### Model: `SearchRequest`

**Endpoint Example:**
```
POST /api/v1/admin/users/search
```

**Request Body:**
```json
{
  "filters": {
    "email": "example.com",
    "role": "ROLE_USER",
    "isEmailVerified": true
  },
  "sort": [
    {"field": "createdAt", "direction": "DESC"},
    {"field": "email", "direction": "ASC"}
  ],
  "page": 0,
  "size": 10
}
```

**Features:**
- ✅ Simple key-value filters
- ✅ Automatic operation detection (MATCH for strings, EQUAL for booleans/numbers)
- ✅ Easy to use and understand
- ✅ Perfect for 90% of use cases

---

## 2. Advanced Search (Current Implementation)

### Model: `InputDataModel`

**Endpoint Example:**
```
POST /api/v1/admin/users/filter
```

### Basic Filtering

**Request Body:**
```json
{
  "filters": [
    {"fieldName": "email", "operation": "MATCH", "value": "example.com"},
    {"fieldName": "role", "operation": "EQUAL", "value": "ROLE_USER"}
  ],
  "page": 0,
  "size": 10
}
```

**Explanation:**
- `filters`: Array of filter criteria (combined with AND by default)
- `page`: Page number (0-based, like offset in SQL)
- `size`: Number of items per page (like LIMIT in SQL)

### Advanced Filtering with Groups

**Use Case:** Find users where (email contains "gmail" OR email contains "yahoo") AND role is "ROLE_USER"

**Request Body:**
```json
{
  "filterGroups": [
    {
      "operation": "OR",
      "filters": [
        {"fieldName": "email", "operation": "MATCH", "value": "gmail"},
        {"fieldName": "email", "operation": "MATCH", "value": "yahoo"}
      ]
    },
    {
      "operation": "AND",
      "filters": [
        {"fieldName": "role", "operation": "EQUAL", "value": "ROLE_USER"}
      ]
    }
  ],
  "operation": "AND",
  "page": 0,
  "size": 10
}
```

---

## Filter Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `EQUAL` | Exact match | `{"fieldName": "role", "operation": "EQUAL", "value": "ROLE_USER"}` |
| `NOT_EQUAL` | Not equal | `{"fieldName": "role", "operation": "NOT_EQUAL", "value": "ROLE_ADMIN"}` |
| `MATCH` | Contains (case-insensitive) | `{"fieldName": "email", "operation": "MATCH", "value": "example"}` |
| `MATCH_START` | Starts with | `{"fieldName": "email", "operation": "MATCH_START", "value": "admin"}` |
| `MATCH_END` | Ends with | `{"fieldName": "email", "operation": "MATCH_END", "value": ".com"}` |
| `MATCH_EXACT` | Exact string match (case-sensitive) | `{"fieldName": "username", "operation": "MATCH_EXACT", "value": "JohnDoe"}` |
| `GREATER_THAN` | Greater than | `{"fieldName": "createdAt", "operation": "GREATER_THAN", "value": "2024-01-01"}` |
| `GREATER_THAN_EQUAL` | Greater than or equal | `{"fieldName": "age", "operation": "GREATER_THAN_EQUAL", "value": 18}` |
| `LESS_THAN` | Less than | `{"fieldName": "createdAt", "operation": "LESS_THAN", "value": "2024-12-31"}` |
| `LESS_THAN_EQUAL` | Less than or equal | `{"fieldName": "age", "operation": "LESS_THAN_EQUAL", "value": 65}` |
| `BETWEEN` | Between two values | `{"fieldName": "createdAt", "operation": "BETWEEN", "value": "2024-01-01", "value2": "2024-12-31"}` |
| `IN_STRING_LIST` | In list of strings | `{"fieldName": "role", "operation": "IN_STRING_LIST", "value": ["ROLE_USER", "ROLE_ADMIN"]}` |
| `IN_LONG_LIST` | In list of numbers | `{"fieldName": "id", "operation": "IN_LONG_LIST", "value": [1, 2, 3]}` |
| `IS_NULL` | Is null | `{"fieldName": "deletedAt", "operation": "IS_NULL"}` |
| `IS_NOT_NULL` | Is not null | `{"fieldName": "lastLoginAt", "operation": "IS_NOT_NULL"}` |

---

## Pagination

### Understanding `page` and `size`

- **`page`**: Page number (0-based index)
  - `page: 0` = First page
  - `page: 1` = Second page
  - `page: 2` = Third page

- **`size`**: Number of items per page
  - `size: 10` = 10 items per page
  - `size: 20` = 20 items per page

### SQL Equivalent

```
page = 0, size = 10  →  LIMIT 10 OFFSET 0   (items 1-10)
page = 1, size = 10  →  LIMIT 10 OFFSET 10  (items 11-20)
page = 2, size = 10  →  LIMIT 10 OFFSET 20  (items 21-30)
```

### Response

```json
{
  "content": [...],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false,
  "hasNext": true,
  "hasPrevious": false
}
```

---

## Sorting

```json
{
  "sorts": [
    {"fieldName": "createdAt", "direction": "DESC"},
    {"fieldName": "email", "direction": "ASC"}
  ]
}
```

**Directions:**
- `ASC`: Ascending (A-Z, 0-9, oldest first)
- `DESC`: Descending (Z-A, 9-0, newest first)

---

## Complete Examples

### Example 1: Find verified users with Gmail

```json
{
  "filters": [
    {"fieldName": "email", "operation": "MATCH", "value": "gmail"},
    {"fieldName": "isEmailVerified", "operation": "EQUAL", "value": true}
  ],
  "sorts": [
    {"fieldName": "createdAt", "direction": "DESC"}
  ],
  "page": 0,
  "size": 20
}
```

### Example 2: Find users created in 2024

```json
{
  "filters": [
    {"fieldName": "createdAt", "operation": "BETWEEN", "value": "2024-01-01T00:00:00", "value2": "2024-12-31T23:59:59"}
  ],
  "page": 0,
  "size": 10
}
```

### Example 3: Complex query with groups

Find users where:
- (Email contains "gmail" OR email contains "yahoo")
- AND (Role is USER OR role is LICENSED_USER)
- AND Email is verified

```json
{
  "filterGroups": [
    {
      "operation": "OR",
      "filters": [
        {"fieldName": "email", "operation": "MATCH", "value": "gmail"},
        {"fieldName": "email", "operation": "MATCH", "value": "yahoo"}
      ]
    },
    {
      "operation": "OR",
      "filters": [
        {"fieldName": "role", "operation": "EQUAL", "value": "ROLE_USER"},
        {"fieldName": "role", "operation": "EQUAL", "value": "ROLE_LICENSED_USER"}
      ]
    }
  ],
  "filters": [
    {"fieldName": "isEmailVerified", "operation": "EQUAL", "value": true}
  ],
  "operation": "AND",
  "page": 0,
  "size": 10
}
```

---

## Recommendations

### Current Issues

1. **Two filter lists confusing**: Having both `filters` and `filterGroups` is confusing
2. **Verbose for simple cases**: Most queries don't need complex grouping
3. **Not intuitive**: Requires understanding of logical operations

### Proposed Improvements

1. **Use `SearchRequest` for simple cases** (90% of use cases)
2. **Keep `InputDataModel` for complex cases** (10% of use cases)
3. **Add a simpler endpoint** for basic filtering

### Implementation Suggestion

Add both endpoints to controllers:

```java
// Simple search (recommended)
@PostMapping("/search")
public ResponseEntity<PagedResponse<UserResponseDTO>> searchUsers(@RequestBody SearchRequest request) {
    InputDataModel inputData = request.toInputDataModel();
    // ... rest of the logic
}

// Advanced search (for complex queries)
@PostMapping("/filter")
public ResponseEntity<PagedResponse<UserResponseDTO>> filterUsers(@RequestBody InputDataModel inputData) {
    // ... existing logic
}
```

This gives users the choice between simplicity and power!

