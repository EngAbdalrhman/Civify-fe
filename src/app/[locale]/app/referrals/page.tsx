"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function ReferralsPage() {
  const [referralStats, setReferralStats] = useState<{
    referralCode: string;
    referralCount: number;
    tokensEarnedFromReferrals: number;
  } | null>(null);
  const [isReferralLoading, setIsReferralLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await apiClient.get<typeof referralStats>("/v1/referrals/me");
        setReferralStats(res.data);
      } catch (error) {
        toast.error("Failed to load referral stats");
      } finally {
        setIsReferralLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const copyReferralLink = () => {
    if (referralStats) {
      const url = `${window.location.origin}/signup?ref=${referralStats.referralCode}`;
      navigator.clipboard.writeText(url);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const copyReferralCode = () => {
    if (referralStats) {
      navigator.clipboard.writeText(referralStats.referralCode);
      toast.success("Referral code copied to clipboard!");
    }
  };

  return (
    <PermissionGuard requireAuth={true} permissions={[]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">
            Invite your friends and earn tokens together.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Invite & Earn
            </CardTitle>
            <CardDescription>
              Share your referral code with friends. You both get bonus tokens
              when they sign up!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isReferralLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : referralStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Total Referrals</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {referralStats.referralCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Gift className="h-4 w-4" />
                      <span className="text-sm">Tokens Earned</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {referralStats.tokensEarnedFromReferrals}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Your Referral Code</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={referralStats.referralCode}
                        className="font-mono text-center tracking-wider max-w-[200px]"
                      />
                      <Button variant="outline" onClick={copyReferralCode}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Referral Link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${referralStats.referralCode}`}
                      />
                      <Button onClick={copyReferralLink}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Unable to load referral data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
