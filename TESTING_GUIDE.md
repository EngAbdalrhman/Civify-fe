# 🧪 HICv Testing Guide

## Quick Start Testing

### **Prerequisites:**
1. ✅ Appwrite database created with all collections
2. ✅ Environment variables set in `.env.local`
3. ✅ Application built successfully (`npm run build`)

---

## 🚀 **Start the Application:**

```bash
npm run dev
```

Open: http://localhost:3000

---

## 📝 **Test Scenarios:**

### **1. User Registration & Login**

**Steps:**
1. Go to http://localhost:3000/login
2. Click "Sign Up"
3. Enter email and password
4. Click "Sign Up with Email"
5. ✅ Should redirect to `/dashboard`
6. ✅ Should see "Welcome to HICv" message

**Expected Result:**
- User created in Appwrite `users` collection
- User profile created with default values
- `cvCount: 0`, `cvLimit: 3`, `isLicensed: false`

---

### **2. Upload and Save CV**

**Steps:**
1. Login to dashboard
2. Click "Upload CV" or go to `/dashboard`
3. Upload a PDF CV file
4. Wait for AI parsing
5. Click "Save CV"
6. ✅ Should see success message
7. ✅ CV should appear in "My CVs" list

**Expected Result:**
- CV saved in Appwrite `cvs` collection
- File uploaded to Appwrite Storage bucket
- User's `cvCount` incremented to 1

**Test CV Limit:**
1. Upload and save 3 CVs
2. Try to upload a 4th CV
3. ✅ Should see error: "CV limit reached (3/3)"

---

### **3. Activate License Key**

**Steps:**
1. Login as admin (`amabdo30@gmail.com`)
2. Go to `/admin/dashboard`
3. Click "License Keys" tab
4. Click "Generate License Key"
5. ✅ Copy the generated key (format: `HICV-XXXX-XXXX-XXXX`)
6. Logout and login as regular user
7. Go to `/dashboard/license`
8. Paste the license key
9. Click "Activate License"
10. ✅ Should see success message

**Expected Result:**
- License marked as activated in `licenses` collection
- User's `isLicensed` set to `true`
- User's `licenseKey` field updated
- User can now access API Keys page

---

### **4. Generate API Key**

**Steps:**
1. Login as licensed user
2. Go to `/dashboard/api-keys`
3. Click "Generate New API Key"
4. ✅ Should see API key (format: `hicv_live_XXXXXXXX...`)
5. ✅ Copy the key (shown only once!)

**Expected Result:**
- API key saved in `api_keys` collection (hashed with SHA-256)
- User's `apiKeyHash` field updated
- Key shown in "Your API Keys" list

---

### **5. Test API Endpoints**

#### **A. Masked CV API (Text)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/cv/generate-masked \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "cvText": "John Doe\nEmail: john@example.com\nPhone: +1-555-1234\n123 Main St, New York, NY 10001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "maskedCv": "[NAME REDACTED]\nEmail: [EMAIL REDACTED]\nPhone: [PHONE REDACTED]\n[ADDRESS REDACTED]"
  }
}
```

#### **B. Masked CV API (PDF)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/cv/generate-masked-pdf \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "cvPdf": "BASE64_ENCODED_PDF_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "maskedPdf": "BASE64_ENCODED_MASKED_PDF"
  }
}
```

#### **C. Tailored CV API**

**Request:**
```bash
curl -X POST http://localhost:3000/api/cv/generate-tailored \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "cvText": "Your CV text here...",
    "jobDescription": "Job description here..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pdf": "BASE64_ENCODED_TAILORED_CV_PDF"
  }
}
```

**Test Rate Limiting:**
- Make 500+ API calls in a month
- ✅ Should get error: "API rate limit exceeded"

---

### **6. Admin Dashboard Features**

**Steps:**
1. Login as admin (`amabdo30@gmail.com`)
2. Go to `/admin/dashboard`

#### **A. View Statistics**
- ✅ Should see total users count
- ✅ Should see total CVs count
- ✅ Should see API calls this month
- ✅ Should see licensed users count
- ✅ Should see active licenses count
- ✅ Should see unused licenses count

#### **B. Generate License**
1. Click "License Keys" tab
2. Click "Generate License Key"
3. ✅ Should see new license in list
4. ✅ License should have format `HICV-XXXX-XXXX-XXXX`

#### **C. Grant License to User**
1. Click "Users" tab
2. Find a user without license
3. Click "Grant License" button
4. ✅ Should see success message
5. ✅ User should now show as "Licensed"

#### **D. Set Custom CV Limit**
1. Click "CV Limits" tab
2. Find a user
3. Click "Set Limit" button
4. Enter new limit (e.g., 10)
5. Click "Save"
6. ✅ Should see success message
7. ✅ User's limit should update (e.g., "2/10 CVs")

**Test Custom Limit:**
1. Login as that user
2. Upload and save CVs
3. ✅ Should be able to save up to the new limit (e.g., 10)

---

### **7. Job Applications**

**Steps:**
1. Login to dashboard
2. Go to a saved CV page (`/dashboard/cv/[id]`)
3. Enter job title and company
4. Click "Save Application"
5. ✅ Should see success message
6. ✅ Application should appear in "Job Applications" list

**Expected Result:**
- Job application saved in `job_applications` collection
- Application linked to CV via `cvId`

---

### **8. Delete CV**

**Steps:**
1. Login to dashboard
2. Go to "My CVs" list
3. Click "Delete" on a CV
4. Confirm deletion
5. ✅ Should see success message
6. ✅ CV should disappear from list
7. ✅ User's `cvCount` should decrement

**Expected Result:**
- CV deleted from `cvs` collection
- File deleted from Appwrite Storage
- User's `cvCount` updated

---

## 🔍 **Verification Checklist:**

### **Appwrite Console Checks:**

1. **Users Collection:**
   - [ ] New users appear after registration
   - [ ] `cvCount` increments when CV saved
   - [ ] `isLicensed` changes to `true` after activation
   - [ ] `cvLimit` can be customized by admin

2. **CVs Collection:**
   - [ ] CVs saved with correct `userId`
   - [ ] `fileId` matches Appwrite Storage file
   - [ ] CVs deleted when user deletes them

3. **Licenses Collection:**
   - [ ] New licenses created by admin
   - [ ] `isActive` is `true` for new licenses
   - [ ] `activatedBy` and `activatedAt` set after activation

4. **API Keys Collection:**
   - [ ] API keys saved with hashed value
   - [ ] `isActive` is `true` for new keys
   - [ ] Keys can be deactivated

5. **API Usage Logs Collection:**
   - [ ] Logs created for each API call
   - [ ] `success` field reflects call result
   - [ ] `month` field set correctly (YYYY-MM format)

6. **Job Applications Collection:**
   - [ ] Applications saved with correct `userId` and `cvId`
   - [ ] `applicationStatus` defaults to "pending"

---

## ⚠️ **Common Issues:**

### **Issue: "Permission denied" errors**
**Solution:** Check Appwrite collection permissions are set to "Any"

### **Issue: "Collection not found" errors**
**Solution:** Verify collection IDs in `.env.local` match Appwrite

### **Issue: "File upload failed"**
**Solution:** Check Appwrite Storage bucket ID and permissions

### **Issue: "API key invalid"**
**Solution:** Make sure user is licensed and key is active

### **Issue: "CV limit reached" but count is wrong**
**Solution:** Check user's `cvCount` and `cvLimit` in Appwrite Console

---

## 🎯 **Success Criteria:**

✅ All test scenarios pass  
✅ No console errors  
✅ Data appears correctly in Appwrite Console  
✅ Admin features work as expected  
✅ API endpoints authenticate and respond correctly  
✅ Rate limiting works  
✅ Custom CV limits work  

---

## 📊 **Performance Testing:**

### **Load Test:**
1. Create 100 users
2. Each user uploads 3 CVs
3. Each user makes 10 API calls
4. ✅ Should handle without errors

### **Concurrent Users:**
1. Have 10 users login simultaneously
2. Each uploads a CV at the same time
3. ✅ Should handle without conflicts

---

## 🐛 **Bug Reporting:**

If you find issues:

1. **Check Browser Console** - Look for JavaScript errors
2. **Check Network Tab** - Look for failed API calls
3. **Check Appwrite Console** - Verify data is correct
4. **Check Server Logs** - Look for backend errors

**Report Format:**
- What you were doing
- What you expected to happen
- What actually happened
- Error messages (if any)
- Screenshots (if helpful)

---

## ✅ **Final Checklist:**

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No TypeScript errors (except pre-existing Step1Upload.tsx)
- [ ] Build completes successfully
- [ ] Environment variables set correctly
- [ ] Appwrite permissions configured properly
- [ ] Admin email set correctly
- [ ] License key generation works
- [ ] API authentication works
- [ ] Rate limiting works
- [ ] Custom CV limits work
- [ ] All CRUD operations work

---

**Happy Testing! 🎉**

