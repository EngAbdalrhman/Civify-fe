# CV Limit & API Rate Limit Fixes

## Issues Fixed

### ✅ 1. CV Limit Not Showing Correctly in User Dashboard - FIXED

**Problem:** 
User dashboard was showing hardcoded "0/3" even though admin set the CV limit to 10 for the user.

**Root Cause:**
The dashboard was using hardcoded value `3` instead of reading `userProfile.cvLimit` from the database.

**Solution:**
Updated `src/app/dashboard/page.tsx` to use dynamic `userProfile.cvLimit` value.

**Files Modified:**
- `src/app/dashboard/page.tsx` (lines 229-242)

**Changes:**
```typescript
// Before (BROKEN):
<div className="text-2xl font-bold">{cvs.length}/3</div>
<p className="text-xs text-muted-foreground mt-1">
  {cvs.length >= 3 ? (
    <span className="text-red-500">Limit reached</span>
  ) : (
    <span className="text-green-500">
      {3 - cvs.length} slots available
    </span>
  )}
</p>

// After (FIXED):
<div className="text-2xl font-bold">
  {cvs.length}/{userProfile?.cvLimit || 3}
</div>
<p className="text-xs text-muted-foreground mt-1">
  {cvs.length >= (userProfile?.cvLimit || 3) ? (
    <span className="text-red-500">Limit reached</span>
  ) : (
    <span className="text-green-500">
      {(userProfile?.cvLimit || 3) - cvs.length} slots available
    </span>
  )}
</p>
```

---

### ✅ 2. Missing API Rate Limit Management - FIXED

**Problem:** 
Admin could set CV limits but there was no way to set custom API rate limits per user.

**Solution:**
- Added `apiRateLimit` field to `UserProfile` type
- Created `setUserApiLimit()` method in admin database service
- Added new "API Rate Limits" tab in admin dashboard
- Updated API authentication middleware to use custom limits
- Updated database service to check custom limits

**Files Modified:**
1. `src/lib/types.ts` - Added `apiRateLimit` field
2. `src/lib/services/appwrite-admin-database.ts` - Added `setUserApiLimit()` method
3. `src/lib/services/appwrite-database.ts` - Updated mapping and rate limit checking
4. `src/lib/middleware/api-auth.ts` - Use custom rate limit in authentication
5. `src/app/admin/dashboard/page.tsx` - Added API Rate Limits tab

---

## Detailed Changes

### 1. Type Definition (`src/lib/types.ts`)

Added `apiRateLimit` field to UserProfile:

```typescript
export interface UserProfile {
  // ... existing fields
  cvCount?: number;
  cvLimit?: number; // Custom CV limit per user (default: 3)
  apiUsageMonth?: string; // Current month for API usage tracking
  apiUsageCount?: number; // API usage count for current month
  apiRateLimit?: number; // Custom API rate limit per month (default: 500) ⭐ NEW
}
```

---

### 2. Admin Database Service (`src/lib/services/appwrite-admin-database.ts`)

**Added Method:**
```typescript
/**
 * Set custom API rate limit for user (calls per month)
 */
async setUserApiLimit(userId: string, limit: number): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      {
        apiRateLimit: limit,
      }
    );
  } catch (error) {
    console.error("Error setting API rate limit:", error);
    throw error;
  }
}
```

**Updated Mapping:**
```typescript
return {
  // ... existing fields
  cvCount: doc.cvCount || 0,
  cvLimit: doc.cvLimit || 3,
  apiUsageMonth: doc.apiUsageMonth,
  apiUsageCount: doc.apiUsageCount || 0,
  apiRateLimit: doc.apiRateLimit || 500, // ⭐ NEW
};
```

---

### 3. Database Service (`src/lib/services/appwrite-database.ts`)

**Updated User Creation:**
```typescript
const newUser = await databases.createDocument(
  DATABASE_ID,
  USERS_COLLECTION_ID,
  this.userId,
  {
    // ... existing fields
    cvLimit: isAdminUser ? 100 : DEFAULT_CV_LIMIT,
    apiUsageCount: 0,
    apiRateLimit: MAX_API_CALLS_PER_MONTH, // ⭐ NEW - Default 500
  }
);
```

**Updated Rate Limit Check:**
```typescript
async checkApiRateLimit(): Promise<boolean> {
  try {
    const profile = await this.getUserProfile();
    const usage = await this.getApiUsageThisMonth();
    const limit = profile.apiRateLimit || MAX_API_CALLS_PER_MONTH; // ⭐ Use custom limit
    return usage < limit;
  } catch (error) {
    console.error("Error checking API rate limit:", error);
    return false;
  }
}
```

**Updated Mapping:**
```typescript
private mapDocumentToUserProfile(doc: any): UserProfile {
  return {
    // ... existing fields
    cvCount: doc.cvCount || 0,
    cvLimit: doc.cvLimit || DEFAULT_CV_LIMIT,
    apiUsageMonth: doc.apiUsageMonth,
    apiUsageCount: doc.apiUsageCount || 0,
    apiRateLimit: doc.apiRateLimit || 500, // ⭐ NEW
  };
}
```

---

### 4. API Authentication Middleware (`src/lib/middleware/api-auth.ts`)

**Updated Rate Limit Check:**
```typescript
// Before (HARDCODED):
if (apiUsageMonth === currentMonth && apiUsageCount >= 500) {
  return {
    authenticated: false,
    error: "API rate limit exceeded (500 calls/month)",
    status: 429,
  };
}

// After (DYNAMIC):
const apiRateLimit = userDoc.apiRateLimit || 500; // ⭐ Custom or default limit

if (apiUsageMonth === currentMonth && apiUsageCount >= apiRateLimit) {
  return {
    authenticated: false,
    error: `API rate limit exceeded (${apiRateLimit} calls/month)`,
    status: 429,
  };
}
```

---

### 5. Admin Dashboard (`src/app/admin/dashboard/page.tsx`)

**Added Tab:**
```typescript
<TabsList>
  <TabsTrigger value="users">Users</TabsTrigger>
  <TabsTrigger value="licenses">License Keys</TabsTrigger>
  <TabsTrigger value="cv-limits">CV Limits</TabsTrigger>
  <TabsTrigger value="api-limits">API Rate Limits</TabsTrigger> {/* ⭐ NEW */}
</TabsList>
```

**Added Component:**
- `ApiRateLimitsTab` - Full UI for managing API rate limits per user
- Shows current limit, usage, and allows admin to set custom limits
- Only enabled for licensed users
- Default: 500 calls/month
- Range: 0-10,000 calls/month

---

## Database Schema Update Required

You need to add the `apiRateLimit` attribute in Appwrite Console:

1. Go to Appwrite Console → Database → `users` collection
2. Click "Create Attribute"
3. Add:
   - **Name:** `apiRateLimit`
   - **Type:** Integer
   - **Required:** No
   - **Default:** 500
   - **Min:** 0
   - **Max:** 100000

---

## How It Works Now

### CV Limits:
1. **Default:** 3 CVs per user
2. **Admin can set custom limit:** Any number (e.g., 10, 50, 100)
3. **User sees correct limit:** Dashboard shows "2/10" if admin set limit to 10
4. **Enforced on save:** User cannot save more CVs than their limit

### API Rate Limits:
1. **Default:** 500 calls/month for licensed users
2. **Admin can set custom limit:** 0-10,000 calls/month
3. **Enforced on API calls:** Middleware checks custom limit
4. **Resets monthly:** Usage count resets each month
5. **Shows in admin dashboard:** Admin can see usage vs limit

---

## Testing Steps

### Test CV Limit:
1. ✅ Login as admin
2. ✅ Go to Admin Dashboard → CV Limits tab
3. ✅ Set a user's CV limit to 10
4. ✅ Login as that user
5. ✅ Check dashboard - should show "X/10" instead of "X/3"
6. ✅ Try to save CVs - should allow up to 10

### Test API Rate Limit:
1. ✅ Login as admin
2. ✅ Go to Admin Dashboard → API Rate Limits tab
3. ✅ Set a licensed user's API limit to 1000
4. ✅ Make API calls with that user's API key
5. ✅ Verify limit is 1000 (not 500)
6. ✅ Check usage in admin dashboard

---

## Summary

**Fixed Issues:**
1. ✅ CV limit now shows correctly in user dashboard (dynamic, not hardcoded)
2. ✅ Admin can now set custom API rate limits per user
3. ✅ API authentication uses custom rate limits
4. ✅ All mapping functions include apiRateLimit field
5. ✅ New users get default apiRateLimit of 500

**New Features:**
1. ✅ API Rate Limits tab in admin dashboard
2. ✅ Per-user API rate limit customization
3. ✅ Visual display of API usage vs limit
4. ✅ Dynamic rate limit enforcement

**Files Modified:** 5 files
**New Components:** 1 (ApiRateLimitsTab)
**Database Fields Added:** 1 (apiRateLimit)

---

**Last Updated:** 2025-10-11  
**Status:** ✅ All issues fixed and ready for testing

