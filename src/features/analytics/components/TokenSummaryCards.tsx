import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Activity, Zap } from "lucide-react";
import type { TokenUsageSummary } from "@/services/token-usage.service";

interface TokenSummaryCardsProps {
  tokenUsageSummary: TokenUsageSummary | null;
}

export function TokenSummaryCards({
  tokenUsageSummary,
}: TokenSummaryCardsProps) {
  if (!tokenUsageSummary) return null;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tokens Used
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tokenUsageSummary.totalTokensUsed}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            From Subscription
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tokenUsageSummary.fromSubscription}
          </div>
          <p className="text-xs text-muted-foreground">Tokens from plan</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">From Wallet</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tokenUsageSummary.fromWallet}
          </div>
          <p className="text-xs text-muted-foreground">Extra tokens used</p>
        </CardContent>
      </Card>
    </div>
  );
}
