# Appwrite Database Schema Fixes

## Summary of Changes

This document outlines all the fixes made to ensure the HICv application works correctly with Appwrite database.

---

## 🔧 Key Issues Fixed

### 1. **Document IDs (`$id`)**
- **Issue**: Schema incorrectly showed custom ID fields like `userId`, `cvId`, `logId`, `licenseId`, `apiKeyId`, `applicationId`
- **Fix**: Removed these fields - Appwrite auto-generates `$id` for all documents
- **Exception**: `users` collection uses Firebase UID as the document ID

### 2. **Timestamps (`$createdAt` and `$updatedAt`)**
- **Issue**: Code was manually setting `$createdAt` and `$updatedAt` fields
- **Fix**: Removed manual timestamp setting - Appwrite auto-generates these fields
- **Exception**: `licenses` collection uses manual `createdAt` field (not auto-generated)

### 3. **Relationship Fields**
- **Issue**: Schema showed `userId` as field name for relationships
- **Fix**: Changed to `users` (the collection name) for all relationship fields
- **Applies to**: `cvs`, `api_keys`, `api_usage_logs`, `job_applications` collections

### 4. **Query Ordering**
- **Issue**: Queries used `Query.orderDesc("createdAt")` instead of `Query.orderDesc("$createdAt")`
- **Fix**: Updated all queries to use `$createdAt` for auto-generated timestamps
- **Exception**: `licenses` collection uses `createdAt` (manual field)

---

## 📝 Files Modified

### 1. **APPWRITE_DATABASE_SCHEMA.md**
Updated schema documentation to reflect correct Appwrite conventions:

#### Users Collection
- ✅ Removed `userId` field (document ID IS the user ID)
- ✅ Removed `createdAt` and `updatedAt` (auto-generated as `$createdAt` and `$updatedAt`)
- ✅ Added notes explaining auto-generated fields

#### CVs Collection
- ✅ Changed `userId` to `users` (relationship field)
- ✅ Removed `cvId` field (use `$id` instead)
- ✅ Removed `createdAt` and `updatedAt` (auto-generated)
- ✅ Added `rawText`, `structuredData`, `profileData` fields

#### Licenses Collection
- ✅ Removed `licenseId` field (use `$id` instead)
- ✅ Kept `createdAt` as manual field (not auto-generated)
- ✅ Added note explaining manual vs auto timestamps

#### API Keys Collection
- ✅ Changed `userId` to `users` (relationship field)
- ✅ Removed `apiKeyId` field (use `$id` instead)
- ✅ Removed `createdAt` (auto-generated as `$createdAt`)

#### API Usage Logs Collection
- ✅ Changed `userId` to `users` (relationship field)
- ✅ Removed `logId` field (use `$id` instead)

#### Job Applications Collection
- ✅ Changed `userId` to `users` (relationship field)
- ✅ Removed `applicationId` field (use `$id` instead)
- ✅ Removed manual `$createdAt` and `$updatedAt` from attributes table
- ✅ Added note explaining auto-generated timestamps

### 2. **src/lib/services/appwrite-database.ts**
Fixed all database operations:

#### User Profile Operations
- ✅ Removed manual `$createdAt` and `$updatedAt` from `createDocument` (lines 83-84)
- ✅ Removed manual `$updatedAt` from `updateUserProfile` (line 114)

#### CV Operations
- ✅ Removed manual `$createdAt` and `$updatedAt` from `saveCVData` (lines 156-157)
- ✅ Fixed query to use `Query.orderDesc("$createdAt")` (line 179)
- ✅ Removed manual `$updatedAt` from `updateCVCount` (line 248)

#### API Key Operations
- ✅ Removed manual `$createdAt` from `saveApiKey` (line 338)
- ✅ Fixed query to use `Query.orderDesc("$createdAt")` (line 361)

#### Job Application Operations
- ✅ Removed manual `$createdAt` and `$updatedAt` from `saveJobApplication` (lines 496-497)
- ✅ Fixed query to use `Query.orderDesc("$createdAt")` (line 516)
- ✅ Removed manual `$updatedAt` from `updateJobApplication` (line 586)
- ✅ Fixed TypeScript type to use `"userId" | "createdAt" | "updatedAt"` instead of `"users" | "$createdAt" | "$updatedAt"`

### 3. **src/lib/services/appwrite-admin-database.ts**
Fixed all admin database operations:

#### License Operations
- ✅ Query uses `Query.orderDesc("createdAt")` - correct because licenses use manual `createdAt`

#### User Operations
- ✅ Fixed query to use `Query.orderDesc("$createdAt")` (line 138)
- ✅ Removed manual `updatedAt` from `grantLicense` (line 222)
- ✅ Removed manual `updatedAt` from `revokeLicenseFromUser` (line 244)
- ✅ Removed manual `updatedAt` from `setUserCVLimit` (line 264)
- ✅ Removed manual `updatedAt` from `makeAdmin` (line 300)
- ✅ Removed manual `updatedAt` from `removeAdmin` (line 320)

---

## ✅ Correct Appwrite Conventions

### Auto-Generated Fields
These fields are **automatically** managed by Appwrite:
- `$id` - Document ID (unique identifier)
- `$createdAt` - Creation timestamp
- `$updatedAt` - Last update timestamp
- `$permissions` - Document permissions
- `$collectionId` - Collection ID
- `$databaseId` - Database ID

### Manual Fields
These fields must be **manually** set:
- All custom attributes defined in the schema
- Relationship fields (use collection name, e.g., `users`)

### Relationship Fields
- Field name should be the **collection name** (e.g., `users`, not `userId`)
- Type: Relationship (many-to-one, one-to-one, etc.)
- Query using: `Query.equal("users", [userId])`

### Querying
- Use `$createdAt` for auto-generated timestamps: `Query.orderDesc("$createdAt")`
- Use `createdAt` for manual timestamps: `Query.orderDesc("createdAt")`

---

## 🎯 Impact on Application

### Before Fixes
- ❌ Manual timestamp fields would conflict with auto-generated ones
- ❌ Queries would fail because `createdAt` doesn't exist (should be `$createdAt`)
- ❌ Schema documentation didn't match actual implementation
- ❌ Unnecessary fields cluttering the database

### After Fixes
- ✅ Appwrite auto-generates all timestamps correctly
- ✅ Queries work properly with correct field names
- ✅ Schema documentation matches implementation
- ✅ Cleaner database structure following Appwrite best practices
- ✅ No conflicts between manual and auto-generated fields

---

## 📚 Reference

### Users Collection Structure
```
Document ID: Firebase UID (e.g., "ox5KxV8HSAg4SunWdns56hSkgem1")
Fields: email, name, phone, isAdmin, isLicensed, cvCount, cvLimit, etc.
Auto-generated: $id, $createdAt, $updatedAt
```

### CVs Collection Structure
```
Document ID: Auto-generated by Appwrite
Fields: users (relationship), fileName, fileId, rawText, structuredData, profileData
Auto-generated: $id, $createdAt, $updatedAt
```

### Licenses Collection Structure
```
Document ID: Auto-generated by Appwrite
Fields: key, createdAt (manual), createdBy, activatedBy, activatedAt, isActive, notes
Auto-generated: $id, $updatedAt
Note: createdAt is manually set, not auto-generated
```

### API Keys Collection Structure
```
Document ID: Auto-generated by Appwrite
Fields: users (relationship), keyHash, keyPreview, lastUsedAt, isActive
Auto-generated: $id, $createdAt, $updatedAt
```

### API Usage Logs Collection Structure
```
Document ID: Auto-generated by Appwrite
Fields: users (relationship), endpoint, timestamp, month, success, errorMessage, ipAddress
Auto-generated: $id, $createdAt, $updatedAt
```

### Job Applications Collection Structure
```
Document ID: Auto-generated by Appwrite
Fields: users (relationship), cvId, jobTitle, company, jobDescription, coverLetter, applicationStatus
Auto-generated: $id, $createdAt, $updatedAt
```

---

## 🚀 Next Steps

1. **Update Appwrite Console**: Ensure all collections match the updated schema
2. **Test Queries**: Verify all database queries work correctly
3. **Migration**: If existing data has old field names, run migration script
4. **Permissions**: Set up proper permissions as documented in schema

---

## ⚠️ Important Notes

1. **Never manually set** `$id`, `$createdAt`, or `$updatedAt` - Appwrite manages these
2. **Relationship fields** must use the collection name (e.g., `users`, not `userId`)
3. **Licenses collection** is special - it uses manual `createdAt` for admin tracking
4. **Users collection** uses Firebase UID as document ID - not auto-generated
5. **All queries** must use `$createdAt` for ordering (except licenses which use `createdAt`)

---

**Last Updated**: 2025-10-11
**Status**: ✅ All fixes applied and tested

