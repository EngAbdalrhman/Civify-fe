/**
 * PayPal Webhook Handler
 *
 * Handles payment notifications from PayPal
 *
 * IMPORTANT: This is READY but DISABLED by default.
 * Enable by setting NEXT_PUBLIC_PAYPAL_ENABLED=true
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayPalService } from "@/lib/services/paypal";
import {
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { getEmailService } from "@/lib/services/email";
import { emailTemplates } from "@/lib/services/email-templates";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headers = {
      "paypal-transmission-id":
        request.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-time":
        request.headers.get("paypal-transmission-time") || "",
      "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
      "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
      "paypal-transmission-sig":
        request.headers.get("paypal-transmission-sig") || "",
    };

    console.log("PayPal webhook received:", {
      eventType: data.event_type,
      hasHeaders: !!headers["paypal-transmission-id"],
    });

    // Verify webhook signature (optional but recommended)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const paypalService = getPayPalService();
      const isValid = await paypalService.verifyWebhookSignature(
        webhookId,
        headers,
        data
      );

      if (!isValid) {
        console.error("Invalid PayPal webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Process webhook data
    const paypalService = getPayPalService();
    const webhookData = paypalService.processWebhook(data);

    console.log("PayPal webhook processed:", webhookData);

    // Check if payment was completed
    if (webhookData.success && webhookData.userId && webhookData.planId) {
      try {
        // Update user's plan in database
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          webhookData.userId,
          {
            plan: webhookData.planId,
            // Update limits based on plan
            uiCvLimit:
              webhookData.planId === "premium"
                ? 50
                : webhookData.planId === "enterprise" ||
                  webhookData.planId === "lifetime"
                ? 999999
                : 5,
            apiRateLimit:
              webhookData.planId === "enterprise"
                ? 500
                : webhookData.planId === "lifetime"
                ? 1000
                : 0,
          }
        );

        console.log("User plan updated:", {
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
            ...emailTemplates.planUpgrade(
              userDoc.name || "User",
              webhookData.planId,
              planFeatures
            ),
          });

          console.log("Confirmation email sent to:", userDoc.email);
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
        });
      } catch (dbError) {
        console.error("Database update error:", dbError);
        return NextResponse.json(
          { error: "Failed to update user plan" },
          { status: 500 }
        );
      }
    }

    // Payment not successful or missing data
    console.log("Payment not completed or missing data:", webhookData);

    return NextResponse.json({
      success: false,
      message: "Payment not completed",
    });
  } catch (error: any) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function to get plan features
function getPlanFeatures(planId: string): string[] {
  const features: Record<string, string[]> = {
    premium: [
      "50 CV generations per month",
      "AI-powered CV tailoring",
      "Personal information masking",
      "Priority support",
      "Advanced features",
    ],
    enterprise: [
      "Unlimited CV generations",
      "Full API access (500 calls/month)",
      "AI-powered CV tailoring",
      "Personal information masking",
      "Priority support",
      "Advanced features",
      "Dedicated account manager",
    ],
    lifetime: [
      "Unlimited CV generations",
      "Full API access (1000 calls/month)",
      "AI-powered CV tailoring",
      "Personal information masking",
      "Priority support",
      "Advanced features",
      "Lifetime updates",
      "No recurring fees",
    ],
  };

  return features[planId] || [];
}
