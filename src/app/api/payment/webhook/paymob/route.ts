/**
 * Paymob Webhook Handler
 * 
 * Handles payment notifications from Paymob
 * 
 * IMPORTANT: This is READY but DISABLED by default.
 * Enable by setting NEXT_PUBLIC_PAYMOB_ENABLED=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymobService } from '@/lib/services/paymob';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite-server';
import { getEmailService } from '@/lib/services/email';
import { emailTemplates } from '@/lib/services/email-templates';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const hmac = request.headers.get('hmac');

    console.log('Paymob webhook received:', {
      hasData: !!data,
      hasHmac: !!hmac,
    });

    // Verify webhook signature
    const paymobService = getPaymobService();

    if (!hmac || !paymobService.verifyWebhook(data.obj || data, hmac)) {
      console.error('Invalid Paymob webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process webhook data
    const webhookData = paymobService.processWebhook(data);

    console.log('Paymob webhook processed:', webhookData);

    // Check if payment was successful
    if (webhookData.success && webhookData.userId && webhookData.planId) {
      try {
        // Update user's plan in database
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          webhookData.userId,
          {
            plan: webhookData.planId,
            isLicensed: webhookData.planId === 'enterprise' || webhookData.planId === 'lifetime',
            // Update limits based on plan
            uiCvLimit:
              webhookData.planId === 'premium'
                ? 50
                : webhookData.planId === 'enterprise' || webhookData.planId === 'lifetime'
                ? 999999
                : 5,
            apiRateLimit:
              webhookData.planId === 'enterprise'
                ? 500
                : webhookData.planId === 'lifetime'
                ? 1000
                : 0,
          }
        );

        console.log('User plan updated:', {
          userId: webhookData.userId,
          plan: webhookData.planId,
        });

        // Get user details for email
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            webhookData.userId
          );

          // Send confirmation email
          const emailService = getEmailService();
          const planFeatures = getPlanFeatures(webhookData.planId);

          await emailService.sendEmail({
            to: userDoc.email,
            ...emailTemplates.planUpgrade(userDoc.name || 'User', webhookData.planId, planFeatures),
          });

          console.log('Confirmation email sent to:', userDoc.email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }

        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        return NextResponse.json(
          { error: 'Failed to update user plan' },
          { status: 500 }
        );
      }
    }

    // Payment not successful or missing data
    console.log('Payment not successful or missing data:', webhookData);

    return NextResponse.json({
      success: false,
      message: 'Payment not completed',
    });
  } catch (error: any) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to get plan features
function getPlanFeatures(planId: string): string[] {
  const features: Record<string, string[]> = {
    premium: [
      '50 CV generations per month',
      'AI-powered CV tailoring',
      'Personal information masking',
      'Priority support',
      'Advanced features',
    ],
    enterprise: [
      'Unlimited CV generations',
      'Full API access (500 calls/month)',
      'AI-powered CV tailoring',
      'Personal information masking',
      'Priority support',
      'Advanced features',
      'Dedicated account manager',
    ],
    lifetime: [
      'Unlimited CV generations',
      'Full API access (1000 calls/month)',
      'AI-powered CV tailoring',
      'Personal information masking',
      'Priority support',
      'Advanced features',
      'Lifetime updates',
      'No recurring fees',
    ],
  };

  return features[planId] || [];
}

