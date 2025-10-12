# Payment Integration Guide - Paymob & PayPal

**Status:** 📝 **READY TO IMPLEMENT**  
**Priority:** High  
**Estimated Time:** 4-6 hours

---

## 🎯 Overview

This guide covers integrating **Paymob** (for Middle East/Egypt) and **PayPal** (for international) payment gateways into HICv.

### Why These Two?

1. **Paymob** - Easy to set up in Egypt/MENA region, supports local payment methods
2. **PayPal** - Worldwide coverage, trusted, easy API

---

## 💳 Option 1: Paymob (Recommended for Egypt/MENA)

### Pros:
- ✅ Easy to get approved in Egypt
- ✅ Supports Egyptian cards, wallets (Vodafone Cash, etc.)
- ✅ Good documentation
- ✅ Fast approval (1-2 days)
- ✅ Low fees

### Cons:
- ❌ Mainly for MENA region
- ❌ Less international coverage

### Setup Steps:

#### 1. Create Paymob Account

1. Go to https://paymob.com
2. Click "Sign Up" → "Merchant Account"
3. Fill in business details
4. Submit required documents:
   - National ID
   - Tax card (if company)
   - Bank account details
5. Wait for approval (1-2 days)

#### 2. Get API Keys

After approval:

1. Login to Paymob Dashboard
2. Go to "Settings" → "Account Info"
3. Copy these credentials:
   - **API Key**
   - **Integration ID** (for card payments)
   - **Integration ID** (for wallet payments)
   - **HMAC Secret** (for webhooks)

#### 3. Add to Environment Variables

```env
# Paymob Configuration
PAYMOB_API_KEY=your_api_key_here
PAYMOB_CARD_INTEGRATION_ID=your_card_integration_id
PAYMOB_WALLET_INTEGRATION_ID=your_wallet_integration_id
PAYMOB_HMAC_SECRET=your_hmac_secret
PAYMOB_IFRAME_ID=your_iframe_id
```

#### 4. Install Paymob SDK

```bash
npm install paymob-solutions
```

#### 5. Create Paymob Service

**File:** `src/lib/services/paymob.ts`

```typescript
import axios from 'axios';

const PAYMOB_API_URL = 'https://accept.paymob.com/api';

interface PaymobPaymentData {
  amount: number; // in cents (e.g., 999 for $9.99)
  currency: string; // 'EGP' or 'USD'
  userEmail: string;
  userName: string;
  userId: string;
  planId: string;
}

export class PaymobService {
  private apiKey: string;
  private cardIntegrationId: string;
  private iframeId: string;

  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY!;
    this.cardIntegrationId = process.env.PAYMOB_CARD_INTEGRATION_ID!;
    this.iframeId = process.env.PAYMOB_IFRAME_ID!;
  }

  // Step 1: Get authentication token
  async getAuthToken(): Promise<string> {
    const response = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
      api_key: this.apiKey,
    });
    return response.data.token;
  }

  // Step 2: Create order
  async createOrder(authToken: string, amount: number): Promise<number> {
    const response = await axios.post(`${PAYMOB_API_URL}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: 'false',
      amount_cents: amount,
      currency: 'EGP',
      items: [],
    });
    return response.data.id;
  }

  // Step 3: Get payment key
  async getPaymentKey(
    authToken: string,
    orderId: number,
    paymentData: PaymobPaymentData
  ): Promise<string> {
    const response = await axios.post(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
      auth_token: authToken,
      amount_cents: paymentData.amount,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        email: paymentData.userEmail,
        first_name: paymentData.userName.split(' ')[0] || 'User',
        last_name: paymentData.userName.split(' ')[1] || 'Name',
        phone_number: '+201000000000', // You can collect this
        country: 'EG',
        city: 'Cairo',
        street: 'N/A',
        building: 'N/A',
        floor: 'N/A',
        apartment: 'N/A',
      },
      currency: paymentData.currency,
      integration_id: this.cardIntegrationId,
    });
    return response.data.token;
  }

  // Complete flow: Create payment URL
  async createPaymentUrl(paymentData: PaymobPaymentData): Promise<string> {
    try {
      // Step 1: Get auth token
      const authToken = await this.getAuthToken();

      // Step 2: Create order
      const orderId = await this.createOrder(authToken, paymentData.amount);

      // Step 3: Get payment key
      const paymentKey = await this.getPaymentKey(authToken, orderId, paymentData);

      // Step 4: Return iframe URL
      return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
    } catch (error) {
      console.error('Paymob payment error:', error);
      throw new Error('Failed to create payment');
    }
  }

  // Verify webhook signature
  verifyWebhook(data: any, receivedHmac: string): boolean {
    const crypto = require('crypto');
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET!;

    // Concatenate specific fields as per Paymob docs
    const concatenatedString = 
      data.amount_cents +
      data.created_at +
      data.currency +
      data.error_occured +
      data.has_parent_transaction +
      data.id +
      data.integration_id +
      data.is_3d_secure +
      data.is_auth +
      data.is_capture +
      data.is_refunded +
      data.is_standalone_payment +
      data.is_voided +
      data.order +
      data.owner +
      data.pending +
      data.source_data_pan +
      data.source_data_sub_type +
      data.source_data_type +
      data.success;

    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === receivedHmac;
  }
}

export const paymobService = new PaymobService();
```

---

## 💰 Option 2: PayPal (Recommended for International)

### Pros:
- ✅ Worldwide coverage
- ✅ Trusted brand
- ✅ Easy integration
- ✅ Instant approval for sandbox
- ✅ Good documentation

### Cons:
- ❌ Higher fees (~3.9% + $0.30)
- ❌ May require business verification

### Setup Steps:

#### 1. Create PayPal Developer Account

1. Go to https://developer.paypal.com
2. Sign up with your PayPal account
3. Go to "Dashboard" → "Apps & Credentials"
4. Create a new app
5. Get your credentials:
   - **Client ID**
   - **Secret**

#### 2. Add to Environment Variables

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # Change to 'live' for production
```

#### 3. Install PayPal SDK

```bash
npm install @paypal/checkout-server-sdk
npm install @paypal/react-paypal-js
```

#### 4. Create PayPal Service

**File:** `src/lib/services/paypal.ts`

```typescript
import paypal from '@paypal/checkout-server-sdk';

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_SECRET!;

  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

const client = new paypal.core.PayPalHttpClient(environment());

export interface PayPalPaymentData {
  amount: string; // e.g., "9.99"
  currency: string; // 'USD'
  description: string;
  userId: string;
  planId: string;
}

export class PayPalService {
  // Create order
  async createOrder(paymentData: PayPalPaymentData): Promise<string> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: paymentData.currency,
            value: paymentData.amount,
          },
          description: paymentData.description,
        },
      ],
    });

    try {
      const order = await client.execute(request);
      return order.result.id;
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  // Capture payment
  async captureOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await client.execute(request);
      return capture.result;
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw new Error('Failed to capture PayPal payment');
    }
  }

  // Verify payment
  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const order = await client.execute(request);
      return order.result.status === 'COMPLETED';
    } catch (error) {
      console.error('PayPal verify error:', error);
      return false;
    }
  }
}

export const paypalService = new PayPalService();
```

---

## 🔗 Integration into HICv

### 1. Create Payment API Routes

**File:** `src/app/api/payment/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '@/lib/services/paymob';
import { paypalService } from '@/lib/services/paypal';

export async function POST(request: NextRequest) {
  try {
    const { provider, plan, userId, userEmail, userName } = await request.json();

    // Get plan details
    const planPrices = {
      premium: { amount: 999, currency: 'USD', description: 'Premium Plan - Monthly' },
      enterprise: { amount: 4999, currency: 'USD', description: 'Enterprise Plan - Monthly' },
      lifetime: { amount: 29900, currency: 'USD', description: 'Lifetime Plan - One-time' },
    };

    const planData = planPrices[plan as keyof typeof planPrices];
    if (!planData) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (provider === 'paymob') {
      const paymentUrl = await paymobService.createPaymentUrl({
        amount: planData.amount,
        currency: planData.currency,
        userEmail,
        userName,
        userId,
        planId: plan,
      });

      return NextResponse.json({ paymentUrl });
    } else if (provider === 'paypal') {
      const orderId = await paypalService.createOrder({
        amount: (planData.amount / 100).toFixed(2),
        currency: planData.currency,
        description: planData.description,
        userId,
        planId: plan,
      });

      return NextResponse.json({ orderId });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
```

**File:** `src/app/api/payment/webhook/paymob/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '@/lib/services/paymob';
import { serverDatabases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const hmac = request.headers.get('hmac');

    // Verify webhook
    if (!hmac || !paymobService.verifyWebhook(data.obj, hmac)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Check if payment successful
    if (data.obj.success === 'true') {
      // Extract user ID from order (you'll need to store this when creating the order)
      const userId = data.obj.order.shipping_data.extra_description; // Store userId here

      // Update user's plan in database
      await serverDatabases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          plan: 'premium', // Or extract from order data
          isLicensed: true,
        }
      );

      // TODO: Send confirmation email
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

### 2. Update Plans Page

Add payment buttons to `src/app/dashboard/plans/page.tsx`:

```typescript
const handleSelectPlan = async (planId: string) => {
  if (planId === 'free') {
    toast({
      title: "Already on Free Plan",
      description: "You're currently on the free plan.",
    });
    return;
  }

  try {
    // Show payment provider selection
    const provider = await showPaymentProviderDialog(); // 'paymob' or 'paypal'

    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        plan: planId,
        userId: user!.uid,
        userEmail: user!.email,
        userName: profile!.name,
      }),
    });

    const data = await response.json();

    if (provider === 'paymob') {
      // Redirect to Paymob payment page
      window.location.href = data.paymentUrl;
    } else if (provider === 'paypal') {
      // Open PayPal checkout
      // Use @paypal/react-paypal-js for better UX
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to initiate payment",
      variant: "destructive",
    });
  }
};
```

---

## ✅ Implementation Checklist

### Paymob
- [ ] Create Paymob merchant account
- [ ] Get API credentials
- [ ] Add environment variables
- [ ] Install dependencies
- [ ] Create Paymob service
- [ ] Create payment API routes
- [ ] Create webhook handler
- [ ] Test in sandbox
- [ ] Go live

### PayPal
- [ ] Create PayPal developer account
- [ ] Get API credentials
- [ ] Add environment variables
- [ ] Install dependencies
- [ ] Create PayPal service
- [ ] Integrate PayPal buttons
- [ ] Test in sandbox
- [ ] Go live

---

**Next Steps:** Choose your payment provider(s) and follow the setup steps above!

