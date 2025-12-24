# Redirect URLs Configuration Guide

This guide provides the required redirect URLs for **Fawaterk Payment Gateway** and **Google OAuth2** integration, along with a detailed comparison of list/filter implementations between HICv and the legacy Civify-fe application.

---

## Part 1: Payment & OAuth Redirect URLs

### Fawaterk Payment Gateway

Configure these URLs in your Fawaterk merchant dashboard:

| Setting | URL |
|---------|-----|
| **Success Redirect URL** | `http://localhost:3000/payment/success` |
| **Fail Redirect URL** | `http://localhost:3000/payment/failure` |

> [!IMPORTANT]
> For production, replace `localhost:3000` with your actual domain (e.g., `https://civify.cv`).

#### Current Implementation
- **Success Page**: [`/app/[locale]/payment/success/page.tsx`](file:///d:/Personal/work/HICv-master/cllone/HICv/src/app/[locale]/payment/success/page.tsx)
  - Parses callback parameters (gateway, transactionId, success status)
  - Verifies payment with backend (retry logic: 5 attempts, 2s delay)
  - Redirects to failure page if payment not successful
  
- **Failure Page**: [`/app/[locale]/payment/failure/page.tsx`](file:///d:/Personal/work/HICv-master/cllone/HICv/src/app/[locale]/payment/failure/page.tsx)
  - Displays error message from URL params
  - Provides retry and dashboard navigation options

---

### Google OAuth2 Configuration

#### Frontend URLs (Next.js App)

| Setting | URL |
|---------|-----|
| **OAuth Initiation Endpoint** | `{BACKEND_URL}/apis/oauth2/authorization/google` |
| **Callback URL (Frontend)** | `http://localhost:3000/auth/callback` |

#### Google Cloud Console Configuration

Configure in Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs:

**Authorized JavaScript Origins:**
| Environment | URI |
|-------------|-----|
| Backend Local | `http://localhost:8077` |
| Legacy Frontend | `http://localhost:9002` |
| HICv Frontend | `http://localhost:3000` |
| Production | `https://civify.cv` |

**Authorized Redirect URIs:**
| Environment | URI |
|-------------|-----|
| Backend Local | `http://localhost:8077/apis/login/oauth2/code/google` |
| Legacy Frontend Callback | `http://localhost:9002/auth/callback` |
| HICv Frontend Callback | `http://localhost:3000/auth/callback` |
| Production Frontend | `https://civify.cv/auth/callback` |
| Production Backend | `https://civify.cv/apis/login/oauth2/code/google` |

> [!CAUTION]
> **Issue Fixed:** The backend was configured with `{baseUrl}/apis/login/oauth2/code/google` but `{baseUrl}` already includes the context path `/apis`, causing a duplicate `/apis/apis/` in the redirect URI.
> 
> **Solution:** Changed to `{baseUrl}/login/oauth2/code/google` in both `application.properties` and `application-dev.properties`.

#### Environment Variables (Backend)
```properties
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Current Implementation
- **Auth Callback**: [`/app/[locale]/auth/callback/page.tsx`](file:///d:/Personal/work/HICv-master/cllone/HICv/src/app/[locale]/auth/callback/page.tsx)
  - Handles OAuth2 callback (extracts `accessToken` from URL)
  - Handles email verification callback (`verified` param)
  - Stores token in localStorage and redirects to dashboard

---

## Part 2: List & Filter Implementation Comparison

### Overview

| Feature | HICv (New) | Civify-fe (Legacy) |
|---------|------------|-------------------|
| **Component** | `UsersTable.tsx` (380 lines) | `GenericList.tsx` (393 lines) |
| **Filtering** | Client-side | Server-side (API) |
| **Reusability** | Entity-specific | Generic/Reusable |
| **Filter Operations** | 4 fixed filters | 24 operations |

---

### HICv Admin Dashboard (Current)

**File**: [`UsersTable.tsx`](file:///d:/Personal/work/HICv-master/cllone/HICv/src/features/admin-dashboard/users/components/UsersTable.tsx)

#### Filter Implementation
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [roleFilter, setRoleFilter] = useState('all');
const [planFilter, setPlanFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');

const filteredUsers = users.filter(user => {
  const matchesSearch = 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesRole = roleFilter === 'all' || user.role === roleFilter;
  // ... more filters
});
```

#### ✅ Pros
| Advantage | Description |
|-----------|-------------|
| **Simplicity** | Easy to understand and maintain |
| **Performance** | Fast for small datasets (no API calls) |
| **Immediate Feedback** | Instant filtering as user types |
| **Self-contained** | All logic in one component |

#### ❌ Cons
| Disadvantage | Description |
|--------------|-------------|
| **Not Reusable** | Must duplicate code for each entity |
| **Scalability** | Doesn't scale (loads all data to client) |
| **No Server-side Operations** | Can't do complex queries (BETWEEN, date ranges) |
| **Hard-coded Filters** | Adding filters requires code changes |
| **No Sorting API** | Sorting must be done client-side |

---

### Civify-fe Legacy (GenericList)

**Files**: 
- [`GenericList.tsx`](file:///d:/Personal/work/HICv-master/legacy%20ui/Civify-fe/src/components/generic-list/GenericList.tsx)
- [`ColumnFilter.tsx`](file:///d:/Personal/work/HICv-master/legacy%20ui/Civify-fe/src/components/generic-list/ColumnFilter.tsx)
- [`types.ts`](file:///d:/Personal/work/HICv-master/legacy%20ui/Civify-fe/src/components/generic-list/types.ts)

#### Filter Operations (24 Total)
```typescript
export enum FilterOperation {
  // Comparison
  GREATER_THAN, LESS_THAN, GREATER_THAN_EQUAL, LESS_THAN_EQUAL, NOT_EQUAL, EQUAL,
  // String
  MATCH, MATCH_START, MATCH_END, MATCH_EXACT, MATCH_REGEX,
  // Collection
  IN_LONG_LIST, NOT_IN_LONG_LIST, IN_STRING_LIST, NOT_IN_STRING_LIST,
  // Null
  IS_NOT_NULL, IS_NULL,
  // Date
  DAY_EQUAL, DATE_GREATER_THAN, DATE_LESS_THAN, DATE_BETWEEN, DATE_RANGE,
  // Range
  BETWEEN, NOT_BETWEEN,
  // Special
  FULL_TEXT_SEARCH
}
```

#### Column Definition
```typescript
const columns: ColumnDef<User>[] = [
  { key: 'email', label: 'Email', filterable: true, filterType: 'text', sortable: true },
  { key: 'role', label: 'Role', filterable: true, filterType: 'dropdown', 
    filterOptions: [{ label: 'Admin', value: 'admin' }] },
  { key: 'createdAt', label: 'Created', filterable: true, filterType: 'date', sortable: true }
];
```

#### ✅ Pros
| Advantage | Description |
|-----------|-------------|
| **Highly Reusable** | One component for all entities |
| **Server-side Filtering** | Scales to millions of records |
| **Rich Operations** | 24 filter operations available |
| **Configurable** | Columns defined via config, not code |
| **Localization** | Built-in locale support (`nameAr`, `nameEn`) |
| **Conditional Actions** | Actions can be shown/hidden per row |
| **Type-safe** | Full TypeScript generics support |

#### ❌ Cons
| Disadvantage | Description |
|--------------|-------------|
| **Complexity** | Steeper learning curve |
| **API Dependency** | Requires backend filter/sort support |
| **Network Latency** | Each filter change = API call |
| **Overkill for Simple Cases** | Unnecessary for static data |

---

## Recommendation

### When to Use Each Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| < 100 records, static data | **HICv Style** (client-side) |
| > 100 records, dynamic data | **Legacy Style** (server-side) |
| Multiple entities with similar views | **GenericList** (reusable) |
| Single-purpose admin page | **Entity-specific table** |
| Complex queries (date ranges, aggregations) | **GenericList + API** |

### Migration Path for HICv

1. **Create `GenericList` component** based on legacy with modern UI
2. **Implement backend filter API** following `FILTER_SYSTEM_GUIDE.md`
3. **Gradually migrate entity tables** to use GenericList
4. **Keep simple tables** for small, static datasets

---

## Quick Reference

### Production URLs Template

```
# Fawaterk Payment Redirect URLs
Success: https://your-domain.com/payment/success
Failure: https://your-domain.com/payment/failure

# Google OAuth (Frontend Callback)
Callback: https://your-domain.com/auth/callback

# Google OAuth (Backend - configure in Google Console)
Redirect URI: https://your-backend.com/apis/login/oauth2/code/google
```
