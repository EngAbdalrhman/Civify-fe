import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Activity, FileText, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { UserSubscription } from "@/features/plans/types";
import { calculateCvUsagePercent } from "../utils/analytics.utils";

interface StatsCardsProps {
  subscription: UserSubscription | null;
}

export function StatsCards({ subscription }: StatsCardsProps) {
  const cvUsagePercent = calculateCvUsagePercent(
    subscription?.currentCvCount,
    subscription?.cvLimit ?? null,
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CV Generations</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription?.currentCvCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscription?.cvLimit
              ? `of ${subscription.cvLimit} this month`
              : subscription
                ? "Unlimited"
                : "No active plan"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining CVs</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription?.cvLimit
              ? Math.max(
                  0,
                  subscription.cvLimit - (subscription.currentCvCount ?? 0),
                )
              : "∞"}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscription?.cvLimit
              ? `${cvUsagePercent}% used`
              : "Unlimited plan"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription?.currentTokenUsage ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscription ? "Tokens used this month" : "No active plan"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription?.planName ?? "None"}
          </div>
          <Button
            variant="link"
            className="px-0 h-auto text-xs text-primary"
            asChild
          >
            <Link href="/plans">
              {subscription ? "Manage Subscription" : "Subscribe Now"}{" "}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
