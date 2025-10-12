# Email SMTP Setup Guide - HICv

**Status:** 📝 **DOCUMENTATION ONLY - NOT IMPLEMENTED**  
**Priority:** Medium  
**Estimated Time:** 2-3 hours

---

## 📋 Overview

This guide provides instructions for setting up email functionality in HICv using Gmail SMTP or other email services.

---

## 🎯 Use Cases

### Email Notifications Needed:

1. **Welcome Email** - When user signs up
2. **CV Limit Warning** - When user has 2 or fewer generations left
3. **CV Limit Reached** - When user hits monthly limit
4. **Plan Upgrade Confirmation** - When user upgrades plan
5. **License Activation** - When license is activated
6. **API Key Generated** - When new API key is created
7. **API Quota Warning** - When API usage reaches 80%
8. **Monthly Usage Report** - Monthly summary of usage

---

## 🔧 Setup Options

### Option 1: Gmail SMTP (Recommended for Development)

**Pros:**
- Free for low volume
- Easy to set up
- Reliable

**Cons:**
- Daily sending limit (500 emails/day)
- Requires app password
- Not ideal for production

**Setup Steps:**

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "HICv App"
   - Copy the 16-character password

3. **Add to `.env.local`:**
   ```env
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM_NAME=HICv
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

### Option 2: SendGrid (Recommended for Production)

**Pros:**
- 100 emails/day free tier
- Professional email service
- Better deliverability
- Email analytics

**Cons:**
- Requires account setup
- API key management

**Setup Steps:**

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com
   - Sign up for free account

2. **Generate API Key:**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Add to `.env.local`:**
   ```env
   # SendGrid Configuration
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=HICv
   ```

### Option 3: Resend (Modern Alternative)

**Pros:**
- 3,000 emails/month free
- Simple API
- Great developer experience

**Cons:**
- Newer service
- Requires custom domain for production

**Setup Steps:**

1. **Create Resend Account:**
   - Go to https://resend.com
   - Sign up for free account

2. **Generate API Key:**
   - Go to API Keys
   - Create new API key
   - Copy the key

3. **Add to `.env.local`:**
   ```env
   # Resend Configuration
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_FROM_NAME=HICv
   ```

---

## 📁 File Structure

Create the following files:

```
src/
├── lib/
│   ├── services/
│   │   ├── email.ts              # Email service
│   │   └── email-templates.ts    # Email templates
│   └── utils/
│       └── email-helpers.ts      # Email helper functions
```

---

## 💻 Implementation

### 1. Install Dependencies

```bash
# For Gmail/SMTP
npm install nodemailer
npm install --save-dev @types/nodemailer

# For SendGrid
npm install @sendgrid/mail

# For Resend
npm install resend
```

### 2. Create Email Service

**File:** `src/lib/services/email.ts`

```typescript
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
```

### 3. Create Email Templates

**File:** `src/lib/services/email-templates.ts`

```typescript
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to HICv!',
    html: `
      <h1>Welcome to HICv, ${name}!</h1>
      <p>Thank you for signing up. You can now start creating tailored CVs.</p>
      <p>Your free plan includes:</p>
      <ul>
        <li>5 CV generations per month</li>
        <li>AI-powered CV tailoring</li>
        <li>Personal information masking</li>
      </ul>
      <p>Need more? <a href="https://yourapp.com/plans">Upgrade your plan</a></p>
    `,
  }),

  cvLimitWarning: (name: string, remaining: number) => ({
    subject: 'CV Generation Limit Warning',
    html: `
      <h1>Hi ${name},</h1>
      <p>You have <strong>${remaining}</strong> CV generation${remaining === 1 ? '' : 's'} remaining this month.</p>
      <p>Your limit will reset on the 1st of next month.</p>
      <p>Need more? <a href="https://yourapp.com/plans">Upgrade your plan</a></p>
    `,
  }),

  cvLimitReached: (name: string, resetDate: string) => ({
    subject: 'CV Generation Limit Reached',
    html: `
      <h1>Hi ${name},</h1>
      <p>You've reached your monthly CV generation limit.</p>
      <p>Your limit will reset on <strong>${resetDate}</strong>.</p>
      <p>Can't wait? <a href="https://yourapp.com/plans">Upgrade your plan</a> for unlimited generations!</p>
    `,
  }),

  planUpgrade: (name: string, plan: string) => ({
    subject: 'Plan Upgrade Confirmation',
    html: `
      <h1>Congratulations, ${name}!</h1>
      <p>Your plan has been upgraded to <strong>${plan}</strong>.</p>
      <p>You now have access to:</p>
      <ul>
        ${plan === 'premium' ? '<li>50 CV generations per month</li>' : ''}
        ${plan === 'enterprise' || plan === 'lifetime' ? '<li>Unlimited CV generations</li>' : ''}
        ${plan === 'enterprise' || plan === 'lifetime' ? '<li>Full API access</li>' : ''}
        <li>Priority support</li>
      </ul>
      <p>Thank you for your support!</p>
    `,
  }),

  licenseActivated: (name: string, licenseKey: string) => ({
    subject: 'License Activated Successfully',
    html: `
      <h1>Hi ${name},</h1>
      <p>Your license has been activated successfully!</p>
      <p>License Key: <code>${licenseKey}</code></p>
      <p>You now have access to API features. <a href="https://yourapp.com/dashboard/api-keys">Generate your API key</a></p>
    `,
  }),

  apiKeyGenerated: (name: string, apiKey: string) => ({
    subject: 'New API Key Generated',
    html: `
      <h1>Hi ${name},</h1>
      <p>A new API key has been generated for your account.</p>
      <p><strong>Important:</strong> This is the only time you'll see this key. Please save it securely.</p>
      <p><code>${apiKey}</code></p>
      <p>View the <a href="https://yourapp.com/dashboard/api-docs">API documentation</a> to get started.</p>
    `,
  }),

  apiQuotaWarning: (name: string, usage: number, limit: number) => ({
    subject: 'API Quota Warning',
    html: `
      <h1>Hi ${name},</h1>
      <p>You've used <strong>${usage}</strong> out of <strong>${limit}</strong> API calls this month (${Math.round((usage / limit) * 100)}%).</p>
      <p>Your quota will reset on the 1st of next month.</p>
      <p>Need more API calls? <a href="https://yourapp.com/plans">Upgrade your plan</a></p>
    `,
  }),

  monthlyReport: (name: string, stats: any) => ({
    subject: 'Your Monthly HICv Report',
    html: `
      <h1>Hi ${name},</h1>
      <p>Here's your monthly usage report:</p>
      <ul>
        <li>CV Generations: ${stats.cvCount} / ${stats.cvLimit}</li>
        ${stats.apiUsage ? `<li>API Calls: ${stats.apiUsage} / ${stats.apiLimit}</li>` : ''}
        <li>Current Plan: ${stats.plan}</li>
      </ul>
      <p>Thank you for using HICv!</p>
    `,
  }),
};
```

### 4. Usage Examples

```typescript
import { sendEmail } from '@/lib/services/email';
import { emailTemplates } from '@/lib/services/email-templates';

// Send welcome email
await sendEmail({
  to: user.email,
  ...emailTemplates.welcome(user.name),
});

// Send CV limit warning
await sendEmail({
  to: user.email,
  ...emailTemplates.cvLimitWarning(user.name, 2),
});

// Send plan upgrade confirmation
await sendEmail({
  to: user.email,
  ...emailTemplates.planUpgrade(user.name, 'premium'),
});
```

---

## 🔗 Integration Points

### 1. User Registration
**File:** `src/app/login/page.tsx`
```typescript
// After successful registration
await sendEmail({
  to: userEmail,
  ...emailTemplates.welcome(userName),
});
```

### 2. CV Limit Warning
**File:** `src/components/app/Step4Results.tsx`
```typescript
// When remaining <= 2
if (limitCheck.remaining <= 2 && limitCheck.remaining > 0) {
  await sendEmail({
    to: user.email!,
    ...emailTemplates.cvLimitWarning(profile.name, limitCheck.remaining),
  });
}
```

### 3. CV Limit Reached
**File:** `src/components/app/Step4Results.tsx`
```typescript
// When limit reached
if (!limitCheck.canGenerate) {
  await sendEmail({
    to: user.email!,
    ...emailTemplates.cvLimitReached(profile.name, resetDate),
  });
}
```

---

## 🧪 Testing

### Test Email Sending

Create a test API route:

**File:** `src/app/api/test-email/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/email';
import { emailTemplates } from '@/lib/services/email-templates';

export async function GET() {
  try {
    await sendEmail({
      to: 'test@example.com',
      ...emailTemplates.welcome('Test User'),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Test: `curl http://localhost:9002/api/test-email`

---

## 📝 Environment Variables Checklist

Add to `.env.local`:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=HICv
SMTP_FROM_EMAIL=your-email@gmail.com
```

Add to Netlify environment variables (production).

---

## ✅ Implementation Checklist

- [ ] Choose email service (Gmail/SendGrid/Resend)
- [ ] Install dependencies
- [ ] Create email service file
- [ ] Create email templates
- [ ] Add environment variables
- [ ] Test email sending locally
- [ ] Integrate with user registration
- [ ] Integrate with CV limit warnings
- [ ] Integrate with plan upgrades
- [ ] Integrate with license activation
- [ ] Integrate with API key generation
- [ ] Deploy to production
- [ ] Test in production

---

**Status:** 📝 Documentation complete, implementation pending

