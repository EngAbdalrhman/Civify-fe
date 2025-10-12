# 🚨 QUICK FIX - Add Database Fields (5 Minutes)

**This will fix all the errors you're seeing!**

---

## Step 1: Open Appwrite Console

1. Go to https://cloud.appwrite.io
2. Login to your account
3. Select your project
4. Click on "Databases" in the left sidebar
5. Click on your database
6. Click on the "users" collection

---

## Step 2: Add Field 1 - uiCvCount

1. Click "**Create Attribute**" button
2. Select "**Integer**"
3. Fill in:
   - **Key:** `uiCvCount`
   - **Size:** Min: `0`, Max: `999999`
   - **Required:** ❌ Uncheck (leave unchecked)
   - **Default:** `0`
   - **Array:** ❌ No
4. Click "**Create**"
5. Wait for it to be available (green checkmark)

---

## Step 3: Add Field 2 - uiCvLimit

1. Click "**Create Attribute**" button
2. Select "**Integer**"
3. Fill in:
   - **Key:** `uiCvLimit`
   - **Size:** Min: `1`, Max: `999999`
   - **Required:** ❌ Uncheck
   - **Default:** `5`
   - **Array:** ❌ No
4. Click "**Create**"
5. Wait for it to be available

---

## Step 4: Add Field 3 - uiCvMonth

1. Click "**Create Attribute**" button
2. Select "**String**"
3. Fill in:
   - **Key:** `uiCvMonth`
   - **Size:** `10`
   - **Required:** ❌ Uncheck
   - **Default:** (leave empty)
   - **Array:** ❌ No
4. Click "**Create**"
5. Wait for it to be available

---

## Step 5: Add Field 4 - plan

### Option A: String (Simpler)

1. Click "**Create Attribute**" button
2. Select "**String**"
3. Fill in:
   - **Key:** `plan`
   - **Size:** `20`
   - **Required:** ❌ Uncheck
   - **Default:** `free`
   - **Array:** ❌ No
4. Click "**Create**"
5. Wait for it to be available

### Option B: Enum (Better)

1. Click "**Create Attribute**" button
2. Select "**Enum**"
3. Fill in:
   - **Key:** `plan`
   - **Elements:** Add these 4 values:
     - `free`
     - `premium`
     - `enterprise`
     - `lifetime`
   - **Required:** ❌ Uncheck
   - **Default:** `free`
   - **Array:** ❌ No
4. Click "**Create**"
5. Wait for it to be available

---

## Step 6: Verify

1. Go back to the "users" collection
2. Click on "Attributes" tab
3. You should see these new fields:
   - ✅ `uiCvCount` (Integer)
   - ✅ `uiCvLimit` (Integer)
   - ✅ `uiCvMonth` (String)
   - ✅ `plan` (String or Enum)

---

## Step 7: Test

1. Go to your app: http://localhost:9002
2. Upload a CV
3. Complete all steps
4. Generate a CV
5. **No more errors!** ✅

---

## Optional: Add rawText to cvs Collection

If you want to store the original CV text:

1. Go to "cvs" collection
2. Click "Create Attribute"
3. Select "String"
4. Fill in:
   - **Key:** `rawText`
   - **Size:** `50000`
   - **Required:** ❌ No
   - **Default:** (empty)
5. Click "Create"

**Note:** This is optional. The code works without it.

---

## ✅ Done!

All errors should be fixed now. You can:

- ✅ Generate CVs without errors
- ✅ See usage limits enforced
- ✅ View plans page
- ✅ Use all new features

---

## 🎯 What These Fields Do

- **`uiCvCount`** - Tracks how many CVs generated this month
- **`uiCvLimit`** - Monthly limit (default: 5)
- **`uiCvMonth`** - Current tracking month (YYYY-MM format)
- **`plan`** - User's subscription plan (free/premium/enterprise/lifetime)

---

## 🐛 Still Getting Errors?

### Error: "Unknown attribute: uiCvMonth"
**Solution:** Make sure you added all 4 fields exactly as shown above

### Error: "Unknown attribute: rawText"
**Solution:** Either add the `rawText` field to `cvs` collection, or ignore it (code handles it gracefully)

### Error: "Invalid document structure"
**Solution:** 
1. Check field names are exactly correct (case-sensitive)
2. Check field types match (Integer for counts, String for others)
3. Refresh your browser and try again

---

## 📸 Visual Guide

### What You Should See:

**In Appwrite Console → users collection → Attributes:**

```
Attribute Name    Type      Size      Required  Default
─────────────────────────────────────────────────────
email             Email     320       Yes       -
name              String    255       No        -
phone             String    50        No        -
...
uiCvCount         Integer   0-999999  No        0      ← NEW
uiCvLimit         Integer   1-999999  No        5      ← NEW
uiCvMonth         String    10        No        -      ← NEW
plan              String    20        No        free   ← NEW
```

---

**That's it! 5 minutes and all errors are fixed!** 🎉

