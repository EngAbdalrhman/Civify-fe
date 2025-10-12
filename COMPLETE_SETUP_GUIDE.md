# Complete Setup Guide - HICv

**All features are implemented and ready to use!**

---

## 🎯 Quick Status

### ✅ **IMPLEMENTED & READY:**
1. ✅ Profile auto-fill from CV with email verification
2. ✅ UI CV generation limits (5/month, configurable)
3. ✅ API usage logs for licensed users
4. ✅ Subscription plans page (4 tiers)
5. ✅ Profile settings page
6. ✅ **Payment Integration (Paymob & PayPal)** - READY, DISABLED
7. ✅ **Email Notifications (SMTP/SendGrid/Resend)** - READY, DISABLED
8. ✅ **Push Notifications (Firebase FCM)** - READY, DISABLED

### ⚠️ **ACTION REQUIRED:**
1. ⚠️ Add missing fields to Appwrite database (URGENT)
2. ⚠️ Enable payment integrations (when ready)
3. ⚠️ Enable email notifications (when ready)
4. ⚠️ Enable push notifications (optional)

---

## 🚨 STEP 1: Fix Database Errors (URGENT - 5 minutes)

### Problem:
You're seeing these errors:
- `Unknown attribute: "structuredData"`
- `Unknown attribute: "uiCvMonth"`
- `Attribute "skills" has invalid type`

### Solution:

#### A. Add Fields to `users` Collection

Go to Appwrite Console → `users` collection → Add these attributes:

1. **`uiCvCount`** (Integer, default: 0, min: 0, max: 999999)
2. **`uiCvLimit`** (Integer, default: 5, min: 1, max: 999999)
3. **`uiCvMonth`** (String, size: 10)
4. **`plan`** (String or Enum, default: "free", size: 20)
   - If Enum, add: free, premium, enterprise, lifetime

#### B. Verify `cvs` Collection

Check if these fields exist (add if missing):

1. **`rawText`** (String, size: 50000, optional)
2. **`structuredData`** (String, size: 50000, optional)
3. **`profileData`** (String, size: 50000, optional)

#### C. Check `skills` Field Size

In `users` collection, verify:
- **`skills`** field size is at least **2000** characters (not 1000)

**📖 Detailed guide:** `QUICK_FIX_DATABASE.md`

---

## 🎉 STEP 2: Test Core Features (10 minutes)

After fixing the database, test:

```bash
npm run dev
```

1. ✅ Upload CV → Should save without errors
2. ✅ Profile auto-fill → Should fill empty fields
3. ✅ Generate 5 CVs → Should work
4. ✅ Try 6th CV → Should show limit error
5. ✅ View plans page → Should display all plans
6. ✅ View profile page → Should show usage stats

---

## 💳 STEP 3: Enable Payment Integration (Optional - 4-6 hours)

### Choose Your Provider(s):

#### Option A: Paymob (Egypt/MENA)

**1. Create Account:**
- Go to https://paymob.com
- Sign up as merchant
- Submit documents (ID, tax card, bank details)
- Wait for approval (1-2 days)

**2. Get Credentials:**
- Login to dashboard
- Go to Settings → Account Info
- Copy:
  - API Key
  - Card Integration ID
  - Wallet Integration ID (optional)
  - IFRAME ID
  - HMAC Secret

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_PAYMOB_ENABLED=true
PAYMOB_API_KEY=your_api_key
PAYMOB_CARD_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

**4. Test:**
- Restart dev server
- Go to plans page
- Click upgrade
- Select Paymob
- Complete test payment

#### Option B: PayPal (International)

**1. Create Account:**
- Go to https://developer.paypal.com
- Sign up with PayPal account
- Create new app

**2. Get Credentials:**
- Go to Apps & Credentials
- Copy Client ID and Secret
- Start with Sandbox mode

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_MODE=sandbox
```

**4. Test:**
- Restart dev server
- Go to plans page
- Click upgrade
- Select PayPal
- Complete test payment

#### Option C: Both (Recommended)

Enable both for maximum coverage:
- Paymob for local users (Egypt/MENA)
- PayPal for international users

**📖 Detailed guide:** `PAYMENT_INTEGRATION_GUIDE.md`

---

## 📧 STEP 4: Enable Email Notifications (Optional - 2-3 hours)

### Choose Your Provider:

#### Option A: Gmail (Development)

**1. Enable 2FA:**
- Go to Google Account → Security
- Enable 2-Step Verification

**2. Generate App Password:**
- Go to App Passwords
- Select Mail → Other
- Name it "HICv"
- Copy 16-character password

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=HICv
```

**4. Install Dependencies:**
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

#### Option B: SendGrid (Production)

**1. Create Account:**
- Go to https://sendgrid.com
- Sign up (100 emails/day free)

**2. Generate API Key:**
- Go to Settings → API Keys
- Create key with Mail Send permissions
- Copy key

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_EMAIL_ENABLED=true
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=HICv
```

**4. Install Dependencies:**
```bash
npm install @sendgrid/mail
```

#### Option C: Resend (Modern Alternative)

**1. Create Account:**
- Go to https://resend.com
- Sign up (3,000 emails/month free)

**2. Generate API Key:**
- Go to API Keys
- Create new key
- Copy key

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_EMAIL_ENABLED=true
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=HICv
```

**4. Install Dependencies:**
```bash
npm install resend
```

**📖 Detailed guide:** `EMAIL_SMTP_SETUP_GUIDE.md`

---

## 🔔 STEP 5: Enable Push Notifications (Optional - 2-3 hours)

### Setup Firebase Cloud Messaging:

**1. Enable FCM:**
- Go to Firebase Console
- Select your project
- Go to Project Settings → Cloud Messaging
- Enable Cloud Messaging API

**2. Get VAPID Key:**
- In Cloud Messaging tab
- Under Web Push certificates
- Generate key pair
- Copy VAPID key

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

**4. Create Service Worker:**

Create `public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

**5. Test:**
- Restart dev server
- Allow notifications when prompted
- Trigger a notification event

---

## 📦 Dependencies to Install

### Required (Already Installed):
- ✅ Next.js, React, TypeScript
- ✅ Firebase, Appwrite
- ✅ Tailwind CSS, shadcn/ui

### Optional (Install When Enabling Features):

```bash
# For Paymob
npm install axios

# For PayPal
# (Uses native fetch, no extra dependencies needed)

# For Email - SMTP
npm install nodemailer
npm install --save-dev @types/nodemailer

# For Email - SendGrid
npm install @sendgrid/mail

# For Email - Resend
npm install resend

# For Push Notifications
# (Already included in Firebase SDK)
```

---

## 🚀 Production Deployment

### 1. Environment Variables

Add all variables to Netlify/Vercel:

**Required:**
- All `NEXT_PUBLIC_*` variables
- `APPWRITE_API_KEY`
- `GEMINI_API_KEY`

**Optional (if enabled):**
- Payment credentials
- Email credentials
- Push notification credentials

### 2. Build & Deploy

```bash
npm run build
git push origin main
```

### 3. Test Production

- Test CV generation
- Test payment flow (if enabled)
- Test email sending (if enabled)
- Test push notifications (if enabled)

---

## ✅ Final Checklist

### Database Setup:
- [ ] Added `uiCvCount`, `uiCvLimit`, `uiCvMonth`, `plan` to `users`
- [ ] Verified `structuredData`, `profileData`, `rawText` in `cvs`
- [ ] Increased `skills` field size to 2000+ chars
- [ ] Tested CV generation without errors

### Core Features:
- [ ] Profile auto-fill works
- [ ] Email verification works
- [ ] UI CV limits enforced
- [ ] Plans page displays correctly
- [ ] API logs accessible (licensed users)
- [ ] Profile settings work

### Optional Features:
- [ ] Payment integration enabled (if desired)
- [ ] Email notifications enabled (if desired)
- [ ] Push notifications enabled (if desired)

### Production:
- [ ] All environment variables set
- [ ] Deployed to production
- [ ] Tested in production
- [ ] Monitoring errors

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Appwrite console for database issues
3. Review documentation files
4. Check error logs in hosting platform

---

**Status:** All features implemented and ready! Just need database setup and optional integrations.

