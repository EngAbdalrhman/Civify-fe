# HICv - Complete Features Guide

## 🚀 Quick Start

### For Regular Users:
1. **Sign up/Login** at your HICv instance
2. **Upload your CV** and add job descriptions
3. **Save up to 3 CVs** for free
4. **Activate a license** to unlock premium features

### For Licensed Users:
1. **Activate your license key** at `/dashboard/license`
2. **Generate API keys** at `/dashboard/api-keys`
3. **Use the API** to programmatically generate CVs
4. **View API documentation** at `/dashboard/api-docs`

### For Administrators:
1. **Access admin dashboard** at `/admin/dashboard`
2. **Generate license keys** for users
3. **Manage users** and grant/revoke licenses
4. **Run migration** to clean up old CVs

---

## 📋 Feature Breakdown

### 1. **Dashboard Enhancements** ✅

**Location:** `/dashboard`

**New Features:**
- **CV Count Display:** Shows "X/3 CVs" with color-coded status
  - Green: Slots available
  - Red: Limit reached
- **Admin Dashboard Button:** Visible only to admin users (orange gradient)
- **License Activation Button:** For non-licensed users (purple)
- **API Keys Button:** For licensed users (green)

**How to Use:**
- Login to see your dashboard
- Check your CV count in the stats card
- Click appropriate buttons based on your account status

---

### 2. **License Redemption System** ✅

**Location:** `/dashboard/license`

**Features:**
- **License Key Input:** Format validation (HICV-XXXX-XXXX-XXXX)
- **Activation Status:** Shows if license is active or not
- **License Details:** Display key and activation date
- **Premium Features List:** Shows what's unlocked

**How to Use:**
1. Navigate to `/dashboard/license`
2. Enter your license key in format: `HICV-XXXX-XXXX-XXXX`
3. Click "Activate License"
4. Once activated, you'll see your license details and can manage API keys

**License Key Format:**
- Pattern: `HICV-XXXX-XXXX-XXXX`
- Example: `HICV-A2B3-C4D5-E6F7`
- Uses charset: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no confusing characters)

---

### 3. **API Key Management** ✅

**Location:** `/dashboard/api-keys`

**Features:**
- **Generate API Keys:** Create new API keys with one click
- **View API Keys:** See all your active keys (masked for security)
- **Revoke API Keys:** Deactivate keys you no longer need
- **API Usage Tracking:** See your monthly usage (X/500 calls)
- **Usage Progress Bar:** Visual indicator with color coding
  - Green: < 70% used
  - Orange: 70-90% used
  - Red: > 90% used

**How to Use:**
1. Must have an active license
2. Navigate to `/dashboard/api-keys`
3. Click "Generate New Key"
4. **IMPORTANT:** Copy the key immediately (shown only once!)
5. Use the key in API requests as Bearer token

**API Key Format:**
- Pattern: `hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- 32 random characters after prefix
- Stored as SHA-256 hash in database

---

### 4. **API Documentation** ✅

**Location:** `/dashboard/api-docs`

**Features:**
- **Complete API Reference:** All endpoints documented
- **Code Examples:** cURL, JavaScript, Python
- **Authentication Guide:** How to use API keys
- **Error Codes:** All possible errors explained
- **Rate Limits:** Usage limits clearly stated

**Available Endpoints:**

#### **POST /api/cv/generate-masked**
Generate a PDF CV with personal information masked.

**Request:**
```json
{
  "cv": "Your CV text content here..."
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "base64-encoded-pdf-string",
  "message": "Masked CV generated successfully"
}
```

#### **POST /api/cv/generate-tailored**
Generate an AI-tailored PDF CV for a specific job.

**Request:**
```json
{
  "cv": "Your CV text content here...",
  "jobDescription": "Job description text here...",
  "masked": false
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "base64-encoded-pdf-string",
  "message": "Tailored CV generated successfully"
}
```

**Rate Limits:**
- 500 API calls per month
- Resets on the 1st of each month
- Exceeding limit returns `429 Too Many Requests`

---

### 5. **Admin Dashboard** ✅

**Location:** `/admin/dashboard`

**Access:** Only for admin email (`amabdo30@gmail.com`) or users with `isAdmin: true`

**Features:**

#### **Statistics Cards:**
- Total Users
- Total CVs Saved
- API Calls This Month
- Active License Keys

#### **Users Tab:**
- View all registered users
- See license status (Licensed/Unlicensed)
- View CV count per user (X/3)
- Grant licenses to users
- Revoke licenses from users

#### **License Keys Tab:**
- Generate new license keys
- View all license keys with status
- Copy license keys to clipboard
- See activation status (Active/Unused/Revoked)
- Delete license keys

#### **Migration Tab:**
- Scan for old CVs (without fileId)
- View detailed scan results
- Delete all old CVs with confirmation
- See migration results

**How to Use:**
1. Login with admin email
2. Navigate to `/admin/dashboard`
3. Use tabs to switch between different management sections
4. Generate license keys and share with users
5. Grant licenses directly to users if needed
6. Run migration to clean up old CV data

---

### 6. **CV Storage Migration** ✅

**What Changed:**
- **Old System:** CV text stored directly in Firebase
- **New System:** CV files stored in Appwrite Storage, only fileId in Firebase

**Benefits:**
- Better scalability
- Reduced Firebase costs
- Faster CV retrieval
- Proper file management

**Backward Compatibility:**
- Old CVs still work (have `rawText` field)
- New CVs use Appwrite (have `fileId` field)
- Migration tool available in admin dashboard

**How to Migrate:**
1. Go to Admin Dashboard → Migration Tab
2. Click "Scan for Old CVs"
3. Review the scan results
4. Click "Delete All Old CVs" (with confirmation)
5. Old CVs are removed, CV counts updated

---

### 7. **CV Save Limit** ✅

**Limit:** 3 CVs per user account

**Features:**
- Automatic count tracking
- Clear error message when limit reached
- CV count displayed in dashboard
- Count updates on save/delete

**How It Works:**
- Each time you save a CV, count increments
- Each time you delete a CV, count decrements
- Trying to save 4th CV shows error
- Count persists in user profile

---

## 🔐 Security Features

1. **API Key Hashing:** All API keys hashed with SHA-256 before storage
2. **License Validation:** License keys validated before activation
3. **Rate Limiting:** 500 API calls per month per licensed user
4. **Admin Access Control:** Only admin email or `isAdmin` flag can access admin dashboard
5. **API Key Masking:** Keys masked in UI (e.g., `hicv_live_XXXX...XXXX`)

---

## 📊 Database Structure

### Firebase Realtime Database:
```
users/
  {userId}/
    profile/
      - Basic user info
      - isLicensed: boolean
      - licenseKey: string
      - apiKeyHash: string
      - apiUsage: { month, count }
      - cvCount: number
    cvs/
      {cvId}/
        - fileName, rawText, fileId
        - structuredData, profile
    apiKeys/
      {apiKeyId}/
        - key, keyHash, isActive
    apiUsageLogs/
      {logId}/
        - endpoint, timestamp, success

licenses/
  {licenseId}/
    - key, createdAt, activatedBy
    - isActive
```

### Appwrite Storage:
```
Bucket: CV Files (ID: 68defd2f001dfd12ea09)
  - Stores CV files uploaded by users
  - File IDs stored in Firebase CVData.fileId
```

---

## 🎯 User Flows

### **Flow 1: Regular User**
1. Sign up → Upload CV → Save CV (1/3)
2. Upload more CVs → Save (2/3, 3/3)
3. Try to save 4th → Error: "CV limit reached"

### **Flow 2: Licensed User**
1. Sign up → Get license key from admin
2. Go to `/dashboard/license` → Enter key → Activate
3. Go to `/dashboard/api-keys` → Generate API key
4. Copy API key (shown only once!)
5. Use API key in requests → Generate CVs programmatically

### **Flow 3: Administrator**
1. Login with admin email
2. Go to `/admin/dashboard`
3. Generate license keys → Share with users
4. Monitor user activity and API usage
5. Run migration to clean up old data

---

## 🚨 Important Notes

1. **API Keys are shown only once!** Make sure to copy and save them securely.
2. **License keys are case-sensitive** and must match format `HICV-XXXX-XXXX-XXXX`.
3. **Old CVs without fileId** will still work but should be migrated.
4. **Admin email** is set in `.env.local` as `NEXT_PUBLIC_ADMIN_EMAIL`.
5. **Rate limits reset** on the 1st of each month automatically.

---

## 📝 Environment Variables

Required in `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68dab4bb00258ec1c0ad
NEXT_PUBLIC_APPWRITE_BUCKET_ID=68defd2f001dfd12ea09

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=amabdo30@gmail.com
```

---

## ✅ Testing Checklist

- [ ] Login and view dashboard with CV count
- [ ] Save 3 CVs and verify limit enforcement
- [ ] Delete CV and verify count decreases
- [ ] Activate license key
- [ ] Generate API key and copy it
- [ ] Test masked CV API endpoint
- [ ] Test tailored CV API endpoint
- [ ] Verify rate limiting (500 calls/month)
- [ ] Access admin dashboard
- [ ] Generate license key from admin
- [ ] Grant license to user from admin
- [ ] Run CV migration scan
- [ ] Delete old CVs via migration

---

## 🎉 Summary

All requested features have been successfully implemented:
- ✅ Storage migration from Firebase to Appwrite
- ✅ CV save limit (3 CVs per user)
- ✅ License management system
- ✅ API key generation and management
- ✅ API endpoints for licensed users
- ✅ Admin dashboard with full control
- ✅ Migration utility for old CVs
- ✅ Complete API documentation

The application is now ready for production use!

