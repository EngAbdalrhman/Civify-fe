interface AnalyticsHeaderProps {
  daysUntilReset: number | null;
}

export function AnalyticsHeader({ daysUntilReset }: AnalyticsHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Analytics & Usage
      </h1>
      <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
        Track your CV generations and API usage. Usage resets{" "}
        {daysUntilReset !== null ? `in ${daysUntilReset} days` : "monthly"}.
      </p>
    </div>
  );
}
