/**
 * Payment Creation API Route
 * 
 * Creates payment orders for Paymob or PayPal
 * 
 * IMPORTANT: This is READY but DISABLED by default.
 * Enable by setting NEXT_PUBLIC_PAYMOB_ENABLED=true or NEXT_PUBLIC_PAYPAL_ENABLED=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymobService, isPaymobEnabled } from '@/lib/services/paymob';
import { getPayPalService, isPayPalEnabled } from '@/lib/services/paypal';

// Plan pricing configuration
const PLAN_PRICES = {
  premium: {
    usd: { amount: 999, display: '$9.99' },
    egp: { amount: 30000, display: 'EGP 300' },
    description: 'Premium Plan - Monthly Subscription',
  },
  enterprise: {
    usd: { amount: 4999, display: '$49.99' },
    egp: { amount: 150000, display: 'EGP 1,500' },
    description: 'Enterprise Plan - Monthly Subscription',
  },
  lifetime: {
    usd: { amount: 29900, display: '$299' },
    egp: { amount: 900000, display: 'EGP 9,000' },
    description: 'Lifetime Plan - One-time Payment',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, plan, userId, userEmail, userName, currency = 'USD' } = body;

    // Validate input
    if (!provider || !plan || !userId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!['premium', 'enterprise', 'lifetime'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get plan pricing
    const planData = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    const currencyLower = currency.toLowerCase();
    const pricing = currencyLower === 'egp' ? planData.egp : planData.usd;

    // Handle Paymob payment
    if (provider === 'paymob') {
      if (!isPaymobEnabled()) {
        return NextResponse.json(
          { error: 'Paymob payment is currently disabled' },
          { status: 503 }
        );
      }

      try {
        const paymobService = getPaymobService();

        if (!paymobService.isConfigured()) {
          return NextResponse.json(
            { error: 'Paymob is not properly configured' },
            { status: 500 }
          );
        }

        const paymentUrl = await paymobService.createPaymentUrl({
          amount: pricing.amount,
          currency: currencyLower === 'egp' ? 'EGP' : 'USD',
          userEmail,
          userName,
          userId,
          planId: plan,
          planName: planData.description,
        });

        return NextResponse.json({
          success: true,
          provider: 'paymob',
          paymentUrl,
          amount: pricing.display,
        });
      } catch (error: any) {
        console.error('Paymob payment error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to create Paymob payment' },
          { status: 500 }
        );
      }
    }

    // Handle PayPal payment
    if (provider === 'paypal') {
      if (!isPayPalEnabled()) {
        return NextResponse.json(
          { error: 'PayPal payment is currently disabled' },
          { status: 503 }
        );
      }

      try {
        const paypalService = getPayPalService();

        if (!paypalService.isConfigured()) {
          return NextResponse.json(
            { error: 'PayPal is not properly configured' },
            { status: 500 }
          );
        }

        const orderId = await paypalService.createOrder({
          amount: (pricing.amount / 100).toFixed(2),
          currency: 'USD', // PayPal typically uses USD
          description: planData.description,
          userId,
          planId: plan,
          planName: planData.description,
        });

        return NextResponse.json({
          success: true,
          provider: 'paypal',
          orderId,
          amount: pricing.display,
        });
      } catch (error: any) {
        console.error('PayPal payment error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to create PayPal payment' },
          { status: 500 }
        );
      }
    }

    // Invalid provider
    return NextResponse.json(
      { error: 'Invalid payment provider. Use "paymob" or "paypal"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const paymobEnabled = isPaymobEnabled();
    const paypalEnabled = isPayPalEnabled();

    const paymobService = getPaymobService();
    const paypalService = getPayPalService();

    return NextResponse.json({
      paymob: {
        enabled: paymobEnabled,
        configured: paymobService.isConfigured(),
      },
      paypal: {
        enabled: paypalEnabled,
        configured: paypalService.isConfigured(),
      },
      plans: PLAN_PRICES,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}

