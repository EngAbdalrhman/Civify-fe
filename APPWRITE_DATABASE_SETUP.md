# Appwrite Database Setup - Required Fields

**IMPORTANT:** You need to add these fields to your Appwrite database to fix the current errors.

---

## 🚨 Current Errors

You're seeing these errors because the database is missing required fields:

1. **`Unknown attribute: "uiCvMonth"`** - Missing UI CV tracking fields
2. **`Unknown attribute: "rawText"`** - Missing in CVs collection (optional)

---

## ✅ Step-by-Step Setup

### 1. Add Fields to `users` Collection

Go to Appwrite Console → Databases → Your Database → `users` collection → Attributes

**Add these 4 new attributes:**

#### Attribute 1: `uiCvCount`
- **Type:** Integer
- **Key:** `uiCvCount`
- **Required:** No
- **Default:** 0
- **Min:** 0
- **Max:** 999999
- **Array:** No

#### Attribute 2: `uiCvLimit`
- **Type:** Integer
- **Key:** `uiCvLimit`
- **Required:** No
- **Default:** 5
- **Min:** 1
- **Max:** 999999
- **Array:** No

#### Attribute 3: `uiCvMonth`
- **Type:** String
- **Key:** `uiCvMonth`
- **Size:** 10
- **Required:** No
- **Default:** (leave empty)
- **Array:** No

#### Attribute 4: `plan`
- **Type:** String (Enum recommended)
- **Key:** `plan`
- **Size:** 20
- **Required:** No
- **Default:** `free`
- **Array:** No
- **Enum Values (if using enum):**
  - `free`
  - `premium`
  - `enterprise`
  - `lifetime`

---

### 2. Verify `cvs` Collection Has `rawText`

Go to Appwrite Console → Databases → Your Database → `cvs` collection → Attributes

**Check if `rawText` exists. If not, add it:**

#### Attribute: `rawText`
- **Type:** String
- **Key:** `rawText`
- **Size:** 50000
- **Required:** No
- **Default:** (leave empty)
- **Array:** No

**Note:** This field is optional. The code will work without it, but it's useful for storing the original CV text.

---

### 3. Update Existing Users (Optional)

If you have existing users, you may want to set default values for the new fields.

**Option A: Via Appwrite Console**
1. Go to `users` collection
2. Click on each user document
3. Add the new fields manually:
   - `uiCvCount`: 0
   - `uiCvLimit`: 5
   - `uiCvMonth`: "" (empty)
   - `plan`: "free"

**Option B: Via API Script**

Create a file `scripts/update-users.ts`:

```typescript
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // Admin API key

const databases = new Databases(client);

async function updateAllUsers() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

  try {
    // Get all users
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    
    console.log(`Found ${response.documents.length} users to update`);

    // Update each user
    for (const user of response.documents) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          {
            uiCvCount: user.uiCvCount || 0,
            uiCvLimit: user.uiCvLimit || 5,
            uiCvMonth: user.uiCvMonth || "",
            plan: user.plan || "free",
          }
        );
        console.log(`✅ Updated user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user.email}:`, error);
      }
    }

    console.log('✅ All users updated!');
  } catch (error) {
    console.error('Error updating users:', error);
  }
}

updateAllUsers();
```

Run it:
```bash
npx ts-node scripts/update-users.ts
```

---

## 🧪 Testing After Setup

### Test 1: Check Database Fields

1. Go to Appwrite Console
2. Navigate to `users` collection
3. Click on any user document
4. Verify you see:
   - `uiCvCount`
   - `uiCvLimit`
   - `uiCvMonth`
   - `plan`

### Test 2: Test CV Generation

1. Go to your app: http://localhost:9002
2. Upload a CV
3. Complete all steps
4. Generate a CV
5. Check browser console - should see no errors about "Unknown attribute"

### Test 3: Check Limits

1. Generate 5 CVs (or whatever your limit is)
2. Try to generate a 6th CV
3. Should see limit reached error

---

## 📋 Quick Checklist

- [ ] Added `uiCvCount` to `users` collection
- [ ] Added `uiCvLimit` to `users` collection
- [ ] Added `uiCvMonth` to `users` collection
- [ ] Added `plan` to `users` collection
- [ ] Verified `rawText` exists in `cvs` collection (or code handles it gracefully)
- [ ] Updated existing users with default values (optional)
- [ ] Tested CV generation - no errors
- [ ] Tested CV limit enforcement

---

## 🔧 Troubleshooting

### Error: "Unknown attribute: uiCvMonth"

**Solution:** You haven't added the new fields to the `users` collection yet. Follow Step 1 above.

### Error: "Unknown attribute: rawText"

**Solution:** Either:
1. Add `rawText` field to `cvs` collection (Step 2 above), OR
2. The code should handle this gracefully now (it's optional)

### Error: "Invalid document structure"

**Solution:** Make sure:
1. Field names match exactly (case-sensitive)
2. Field types are correct (Integer for counts, String for others)
3. You're not trying to set fields that don't exist

### CV generation works but limit not enforced

**Solution:** 
1. Check that `uiCvLimit` has a default value of 5
2. Check that `uiCvCount` starts at 0
3. Clear browser cache and try again

---

## 📸 Screenshots Guide

### Adding an Integer Attribute

1. Click "Create Attribute"
2. Select "Integer"
3. Enter key name (e.g., `uiCvCount`)
4. Set size: 0 to 999999
5. Set default value: 0
6. Uncheck "Required" (optional field)
7. Click "Create"

### Adding a String Attribute

1. Click "Create Attribute"
2. Select "String"
3. Enter key name (e.g., `plan`)
4. Set size: 20
5. Set default value: `free`
6. Uncheck "Required" (optional field)
7. Click "Create"

### Adding an Enum Attribute (for `plan`)

1. Click "Create Attribute"
2. Select "Enum"
3. Enter key name: `plan`
4. Add elements:
   - `free`
   - `premium`
   - `enterprise`
   - `lifetime`
5. Set default: `free`
6. Uncheck "Required"
7. Click "Create"

---

## ✅ After Setup

Once you've added all the fields:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test the app:**
   - Upload a CV
   - Generate a tailored CV
   - Check that it works without errors

3. **Verify in Appwrite Console:**
   - Go to `users` collection
   - Click on your user
   - Check that `uiCvCount` incremented after generation

---

## 🚀 Production Deployment

When deploying to production:

1. **Add the same fields to production database**
2. **Update existing production users** (if any)
3. **Test thoroughly** before announcing new features

---

**Status:** Follow these steps to fix the database errors and enable all new features!

