# HICv Troubleshooting Guide

## 🚨 Current Issue: Permission Denied Errors

You're experiencing "Permission denied" errors because the Firebase Realtime Database security rules need to be updated.

---

## ✅ **SOLUTION: Update Firebase Security Rules**

### **Step-by-Step Fix:**

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select project: **remindexcel**

2. **Navigate to Database Rules:**
   - Click **Realtime Database** in left sidebar
   - Click **Rules** tab at the top

3. **Replace Rules:**
   - Delete all existing rules
   - Copy rules from `database.rules.json` file in your project
   - Or copy from `FIREBASE_RULES_SETUP.md`

4. **Publish Rules:**
   - Click **Publish** button
   - Wait for confirmation
   - Done! ✅

---

## 📋 **Specific Errors and Solutions:**

### **Error 1: "Permission denied" when generating license**

**Error Message:**
```
Error generating license: Error: PERMISSION_DENIED: Permission denied
```

**Cause:** Firebase rules don't allow writing to `licenses` collection

**Solution:**
1. Update Firebase rules (see above)
2. Make sure you're logged in with admin email: `amabdo30@gmail.com`
3. Or set `isAdmin: true` in your user profile

---

### **Error 2: "Permission denied" when activating license**

**Error Message:**
```
Error activating license: Error: Permission denied
```

**Cause:** Firebase rules don't allow reading `licenses` collection

**Solution:**
1. Update Firebase rules (see above)
2. The new rules allow any authenticated user to READ licenses
3. Only admins can WRITE licenses

---

### **Error 3: "Permission denied" when checking old CVs**

**Error Message:**
```
Error checking old CVs: Error: Permission denied
```

**Cause:** Admin can't read all users' data

**Solution:**
1. Update Firebase rules (see above)
2. New rules allow admin to read all users' data
3. Admin email or `isAdmin: true` flag required

---

### **Error 4: "Permission denied" when loading admin data**

**Error Message:**
```
Error loading admin data: Error: Permission denied
```

**Cause:** Admin can't access user statistics

**Solution:**
1. Update Firebase rules (see above)
2. Admin needs read access to all users
3. Check if you're logged in with admin email

---

### **Error 5: No users visible in admin dashboard**

**Cause:** Admin can't read users collection

**Solution:**
1. Update Firebase rules (see above)
2. Make sure admin email is correct: `amabdo30@gmail.com`
3. Check if users exist in Firebase Console → Realtime Database → Data

---

## 🔧 **Additional Checks:**

### **1. Verify Admin Email**

Check your `.env.local` file:
```env
NEXT_PUBLIC_ADMIN_EMAIL=amabdo30@gmail.com
```

Make sure this matches the email you're logged in with.

---

### **2. Check Firebase Database Structure**

Go to Firebase Console → Realtime Database → Data

Expected structure:
```
root/
  ├── users/
  │   └── {userId}/
  │       ├── profile/
  │       ├── cvs/
  │       ├── apiKeys/
  │       └── apiUsageLogs/
  └── licenses/
      └── {licenseId}/
```

If `licenses` node doesn't exist, it will be created when you generate the first license.

---

### **3. Test Firebase Rules**

In Firebase Console → Realtime Database → Rules tab, you can use the **Rules Playground** to test:

**Test 1: Admin can read all users**
- Location: `/users`
- Type: Read
- Authenticated: Yes
- Email: `amabdo30@gmail.com`
- Expected: ✅ Allowed

**Test 2: User can read licenses**
- Location: `/licenses`
- Type: Read
- Authenticated: Yes
- Expected: ✅ Allowed

**Test 3: Admin can write licenses**
- Location: `/licenses`
- Type: Write
- Authenticated: Yes
- Email: `amabdo30@gmail.com`
- Expected: ✅ Allowed

**Test 4: Regular user cannot write licenses**
- Location: `/licenses`
- Type: Write
- Authenticated: Yes
- Email: `user@example.com`
- Expected: ❌ Denied

---

## 🎯 **Quick Verification Checklist:**

After updating Firebase rules, verify:

- [ ] Can login with admin email (`amabdo30@gmail.com`)
- [ ] Can access `/admin/dashboard`
- [ ] Can see statistics cards (Total Users, CVs, etc.)
- [ ] Can see users in Users tab
- [ ] Can generate license keys in License Keys tab
- [ ] Can scan for old CVs in Migration tab
- [ ] Regular user can activate license at `/dashboard/license`
- [ ] Licensed user can generate API keys at `/dashboard/api-keys`

---

## 🔍 **Debugging Steps:**

### **1. Check Browser Console**

Open browser DevTools (F12) and check Console tab for errors.

Common errors:
- `PERMISSION_DENIED` → Update Firebase rules
- `auth.uid is null` → User not logged in
- `Network error` → Check internet connection

---

### **2. Check Network Tab**

Open browser DevTools (F12) → Network tab

Look for requests to Firebase:
- Should see requests to `firebaseio.com`
- Check response status (should be 200)
- Check response body for error messages

---

### **3. Check Firebase Authentication**

Go to Firebase Console → Authentication → Users

Verify:
- Your user exists
- Email is correct
- User is not disabled

---

### **4. Clear Cache and Retry**

Sometimes cached data causes issues:

1. Logout from the app
2. Clear browser cache and cookies
3. Close browser
4. Reopen browser
5. Login again
6. Try the operation again

---

## 📞 **Still Having Issues?**

If you've followed all steps above and still experiencing issues:

1. **Check Firebase Status:**
   - Go to: https://status.firebase.google.com/
   - Verify all services are operational

2. **Verify Firebase Project:**
   - Make sure you're in the correct Firebase project
   - Project ID should be: `remindexcel`

3. **Check Firebase Billing:**
   - Go to Firebase Console → Usage and billing
   - Make sure you haven't exceeded free tier limits

4. **Review Error Logs:**
   - Check browser console for detailed error messages
   - Check Firebase Console → Realtime Database → Usage tab

---

## 📝 **Summary:**

**The main issue is Firebase security rules.** Follow these steps:

1. ✅ Go to Firebase Console
2. ✅ Navigate to Realtime Database → Rules
3. ✅ Copy rules from `database.rules.json`
4. ✅ Paste and Publish
5. ✅ Logout and login again
6. ✅ Test all features

**After updating rules, all permission errors will be resolved!** 🎉

---

## 🎓 **Understanding Firebase Rules:**

The new rules allow:

- **Regular users:** Read/write their own data
- **Admin users:** Read/write ALL data
- **License activation:** Any authenticated user can read licenses
- **License creation:** Only admins can create licenses

This ensures:
- ✅ Security: Users can't access other users' data
- ✅ Admin access: Admins can manage all users
- ✅ License system: Works correctly for all users
- ✅ Privacy: Personal data is protected

