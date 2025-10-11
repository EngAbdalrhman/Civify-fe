# Appwrite Migration Guide

## 🎯 Migration Status

We are migrating from Firebase Realtime Database to Appwrite Database to resolve permission issues and improve scalability.

---

## ✅ **What's Been Completed:**

### **1. Appwrite Database Setup**
- ✅ Database created: `68ea7f01003e7eee9c17`
- ✅ Collections created:
  - `users` - User profiles and settings
  - `cvs` - CV data with file references
  - `licenses` - License keys management
  - `api_keys` - API keys for licensed users
  - `api_usage_logs` - API usage tracking

### **2. Environment Variables**
- ✅ Updated `.env.local` with Appwrite configuration
- ✅ Database ID and Collection IDs configured

### **3. New Services Created**
- ✅ `src/lib/services/appwrite-database.ts` - Main database service
- ✅ `src/lib/services/appwrite-admin-database.ts` - Admin operations
- ✅ Updated `src/lib/middleware/api-auth.ts` - API authentication using Appwrite

### **4. New API Endpoints**
- ✅ `POST /api/cv/generate-masked-pdf` - PDF-based masking API

---

## 🚧 **What Needs to Be Done:**

### **Step 1: Update Components to Use Appwrite**

The following components need to be updated to use `AppwriteDatabaseService` instead of `DatabaseService`:

#### **Files to Update:**

1. **`src/components/app/Step4Results.tsx`**
   - Replace `DatabaseService` with `AppwriteDatabaseService`
   - Update CV save functionality

2. **`src/app/dashboard/page.tsx`**
   - Replace `DatabaseService` with `AppwriteDatabaseService`
   - Update CV list and delete functionality

3. **`src/app/dashboard/license/page.tsx`**
   - Replace `DatabaseService` with `AppwriteDatabaseService`
   - Update license activation

4. **`src/app/dashboard/api-keys/page.tsx`**
   - Replace `DatabaseService` with `AppwriteDatabaseService`
   - Update API key management

5. **`src/app/admin/dashboard/page.tsx`**
   - Replace `AdminDatabaseService` with `AppwriteAdminDatabaseService`
   - Update all admin operations

6. **`src/app/api/cv/generate-masked/route.ts`**
   - Update to use `AppwriteDatabaseService`

7. **`src/app/api/cv/generate-tailored/route.ts`**
   - Update to use `AppwriteDatabaseService`

---

### **Step 2: Add Custom CV Limit Feature**

Add UI in admin dashboard to set custom CV limits per user:

1. **Update `src/app/admin/dashboard/page.tsx`:**
   - Add "Set CV Limit" button in Users tab
   - Add dialog to input custom limit
   - Call `adminService.setUserCVLimit(userId, limit)`

2. **Update Users Table:**
   - Display current CV limit for each user
   - Show CV count vs limit (e.g., "2/5 CVs")

---

### **Step 3: Test All Features**

After migration, test:

- [ ] User registration and profile creation
- [ ] CV upload and save (with limit check)
- [ ] CV deletion
- [ ] License activation
- [ ] API key generation
- [ ] API key revocation
- [ ] API endpoints (masked and tailored)
- [ ] Admin dashboard statistics
- [ ] Admin license management
- [ ] Admin user management
- [ ] Custom CV limits

---

## 📝 **Migration Script (Optional)**

If you want to migrate existing data from Firebase to Appwrite, create a migration script:

```typescript
// src/scripts/migrate-firebase-to-appwrite.ts

import { db } from "@/lib/firebase";
import { databases } from "@/lib/appwrite";
import { ref, get } from "firebase/database";
import { ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const CVS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CVS_COLLECTION_ID!;
const LICENSES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LICENSES_COLLECTION_ID!;

async function migrateUsers() {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) {
    console.log("No users to migrate");
    return;
  }

  const users = snapshot.val();
  
  for (const userId in users) {
    const user = users[userId];
    const profile = user.profile || {};
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          email: profile.email || "",
          name: profile.name || "",
          phone: profile.phone || "",
          summary: profile.summary || "",
          experience: profile.experience || "",
          education: profile.education || "",
          skills: profile.skills || "",
          isAdmin: profile.isAdmin || false,
          isLicensed: profile.isLicensed || false,
          licenseKey: profile.licenseKey || null,
          licenseActivatedAt: profile.licenseActivatedAt || null,
          apiKeyHash: profile.apiKeyHash || null,
          apiUsageMonth: profile.apiUsage?.month || null,
          apiUsageCount: profile.apiUsage?.count || 0,
          cvCount: profile.cvCount || 0,
          cvLimit: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log(`Migrated user: ${userId}`);
    } catch (error) {
      console.error(`Error migrating user ${userId}:`, error);
    }
  }
}

async function migrateCVs() {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) {
    console.log("No CVs to migrate");
    return;
  }

  const users = snapshot.val();
  
  for (const userId in users) {
    const user = users[userId];
    const cvs = user.cvs || {};
    
    for (const cvId in cvs) {
      const cv = cvs[cvId];
      
      // Only migrate CVs with fileId (new format)
      if (cv.fileId) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            CVS_COLLECTION_ID,
            ID.unique(),
            {
              userId: userId,
              fileName: cv.fileName || "Untitled CV",
              fileId: cv.fileId,
              rawText: cv.rawText || "",
              structuredData: JSON.stringify(cv.structuredData || {}),
              profileData: JSON.stringify(cv.profile || {}),
              createdAt: cv.createdAt || new Date().toISOString(),
              updatedAt: cv.updatedAt || new Date().toISOString(),
            }
          );
          
          console.log(`Migrated CV: ${cvId} for user ${userId}`);
        } catch (error) {
          console.error(`Error migrating CV ${cvId}:`, error);
        }
      }
    }
  }
}

async function migrateLicenses() {
  const licensesRef = ref(db, "licenses");
  const snapshot = await get(licensesRef);
  
  if (!snapshot.exists()) {
    console.log("No licenses to migrate");
    return;
  }

  const licenses = snapshot.val();
  
  for (const licenseId in licenses) {
    const license = licenses[licenseId];
    
    try {
      await databases.createDocument(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        ID.unique(),
        {
          key: license.key,
          createdAt: license.createdAt,
          createdBy: license.createdBy,
          activatedBy: license.activatedBy || null,
          activatedAt: license.activatedAt || null,
          isActive: license.isActive !== false,
          notes: license.notes || "",
        }
      );
      
      console.log(`Migrated license: ${licenseId}`);
    } catch (error) {
      console.error(`Error migrating license ${licenseId}:`, error);
    }
  }
}

// Run migration
async function runMigration() {
  console.log("Starting migration from Firebase to Appwrite...");
  
  await migrateUsers();
  await migrateCVs();
  await migrateLicenses();
  
  console.log("Migration completed!");
}

runMigration();
```

---

## 🔄 **Rollback Plan**

If you need to rollback to Firebase:

1. Keep Firebase configuration in `.env.local`
2. Don't delete Firebase data
3. Switch back to `DatabaseService` in components
4. Revert API middleware changes

---

## 📊 **Benefits of Appwrite Migration:**

1. ✅ **No Permission Issues** - Proper RBAC system
2. ✅ **Better Admin Control** - Full access without complex rules
3. ✅ **Custom CV Limits** - Set different limits per user
4. ✅ **Better Performance** - Indexed queries
5. ✅ **Scalability** - Handle millions of records
6. ✅ **Consistent Stack** - Same platform for storage and database
7. ✅ **Better Developer Experience** - Cleaner API

---

## 🚀 **Next Steps:**

1. **Update all components** to use Appwrite services
2. **Add custom CV limit UI** in admin dashboard
3. **Test all features** thoroughly
4. **Optional: Run migration script** to move existing data
5. **Remove Firebase Realtime Database** dependency (optional)

---

## 📞 **Support:**

If you encounter any issues during migration:

1. Check Appwrite Console for errors
2. Check browser console for detailed error messages
3. Verify environment variables are correct
4. Ensure collections are created with correct IDs
5. Check Appwrite permissions are set to "Any" for testing

---

## ✅ **Checklist:**

- [x] Appwrite database created
- [x] Collections created
- [x] Environment variables configured
- [x] Appwrite database service created
- [x] Appwrite admin service created
- [x] API authentication updated
- [x] PDF masking API created
- [ ] Components updated to use Appwrite
- [ ] Custom CV limit UI added
- [ ] All features tested
- [ ] Migration script run (optional)
- [ ] Firebase dependency removed (optional)

**Ready to proceed with component updates!**

