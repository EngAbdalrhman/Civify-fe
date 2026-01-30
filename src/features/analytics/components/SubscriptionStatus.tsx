import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { UserSubscription } from "@/features/plans/types";

interface SubscriptionStatusProps {
  subscription: UserSubscription | null;
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>Your current plan details and status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                subscription?.status === "ACTIVE"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {subscription?.status ?? "INACTIVE"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Date</span>
            <span className="text-sm">
              {subscription
                ? new Date(subscription.startDate).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">End Date</span>
            <span className="text-sm">
              {subscription
                ? new Date(subscription.endDate).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Usage Resets</span>
            <span className="text-sm">
              {subscription?.usageResetDate
                ? new Date(subscription.usageResetDate).toLocaleDateString()
                : "Monthly"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
