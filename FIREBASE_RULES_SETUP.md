# Firebase Realtime Database Security Rules Setup

## 🚨 IMPORTANT: You MUST update your Firebase security rules!

The current Firebase security rules are blocking admin operations. Follow these steps to fix the permission errors:

---

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **remindexcel**
3. Click on **Realtime Database** in the left sidebar
4. Click on the **Rules** tab

---

## Step 2: Replace Security Rules

**Copy the rules from `database.rules.json` file** or use the rules below:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
        "profile": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'"
        },
        "cvs": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
          ".write": "$uid === auth.uid"
        },
        "jobApplications": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "generatedContent": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "settings": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "apiKeys": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
          ".write": "$uid === auth.uid"
        },
        "apiUsageLogs": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
          ".write": "$uid === auth.uid"
        }
      }
    },
    "licenses": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'",
      "$licenseId": {
        ".read": "auth != null",
        ".write": "root.child('users').child(auth.uid).child('profile').child('isAdmin').val() === true || auth.token.email === 'amabdo30@gmail.com'"
      }
    }
  }
}
```

---

## Step 3: Publish Rules

1. After pasting the rules, click **Publish** button
2. Wait for confirmation message
3. Rules are now active!

---

## What These Rules Do:

### **User Data Access:**
- ✅ Users can read/write their own data
- ✅ Admin users (with `isAdmin: true` or email `amabdo30@gmail.com`) can read/write ALL user data
- ✅ Admin can view all CVs, API keys, and usage logs

### **License Management:**
- ✅ Any authenticated user can READ licenses (to check if a key is valid)
- ✅ Only admin users can WRITE/CREATE licenses
- ✅ Users can activate licenses (updates their profile)

### **Security:**
- 🔒 Users cannot access other users' data (unless they're admin)
- 🔒 Only admins can create/manage license keys
- 🔒 All operations require authentication

---

## Step 4: Set Admin Flag (Optional)

If you want to make a user an admin permanently (instead of just checking email), you can manually set the `isAdmin` flag in Firebase:

1. Go to **Realtime Database** → **Data** tab
2. Navigate to: `users/{userId}/profile`
3. Add a new field: `isAdmin: true`
4. Click **Add**

This user will now have admin access even if their email changes.

---

## Step 5: Test the Rules

After updating the rules, test the following:

### **As Admin User (amabdo30@gmail.com):**
1. ✅ Login to the app
2. ✅ Go to `/admin/dashboard`
3. ✅ Generate a license key
4. ✅ View all users
5. ✅ Run migration scan

### **As Regular User:**
1. ✅ Login to the app
2. ✅ Go to `/dashboard/license`
3. ✅ Enter a license key
4. ✅ Activate the license
5. ✅ Generate API keys

---

## Troubleshooting:

### **Still getting "Permission denied" errors?**

1. **Check if rules are published:**
   - Go to Firebase Console → Realtime Database → Rules
   - Verify the rules match the ones above
   - Look for "Last published" timestamp

2. **Check admin email:**
   - Make sure you're logged in with `amabdo30@gmail.com`
   - Or set `isAdmin: true` in your user profile

3. **Clear browser cache:**
   - Logout and login again
   - Clear browser cache and cookies
   - Try in incognito mode

4. **Check Firebase Authentication:**
   - Go to Firebase Console → Authentication
   - Verify your user exists
   - Check if email is verified

5. **Check database structure:**
   - Go to Firebase Console → Realtime Database → Data
   - Verify `users` and `licenses` nodes exist
   - Check if your user profile has correct structure

---

## Error Messages Explained:

### **"Invalid license key"**
- The license key doesn't exist in the database
- Check if the key was generated correctly
- Verify the key format: `HICV-XXXX-XXXX-XXXX`

### **"This license key has already been activated"**
- The license key is already in use by another user
- Each license can only be activated once
- Admin needs to generate a new license key

### **"This license key has been deactivated"**
- The license was revoked by an admin
- Contact admin to get a new license key

### **"Permission denied"**
- Firebase security rules are not updated
- Follow steps above to update rules
- Make sure you're logged in as admin

---

## Quick Fix Commands:

If you have Firebase CLI installed, you can deploy rules from command line:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init database

# Deploy rules
firebase deploy --only database
```

---

## Summary:

1. ✅ Copy rules from `database.rules.json`
2. ✅ Paste into Firebase Console → Realtime Database → Rules
3. ✅ Click **Publish**
4. ✅ Test admin dashboard
5. ✅ Test license activation

**After updating the rules, all permission errors should be resolved!** 🎉

