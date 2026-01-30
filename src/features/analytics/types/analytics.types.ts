import type { UserSubscription } from "@/features/plans/types";
import type { ApiUsageLog, ApiUsageStats } from "@/services/api-usage.service";
import type {
  TokenUsageLog,
  TokenUsageSummary,
} from "@/services/token-usage.service";

export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ChartDataPoint {
  name: string;
  generations: number;
}

export interface AnalyticsData {
  subscription: UserSubscription | null;
  apiLogs: ApiUsageLog[];
  apiStats: ApiUsageStats | null;
  tokenUsage: TokenUsageLog[];
  tokenUsageSummary: TokenUsageSummary | null;
  logsPagination: PaginationState;
  tokenPagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  canViewApiLogs: boolean;
  handleLogsPageChange: (page: number) => Promise<void>;
  handleTokenPageChange: (page: number) => Promise<void>;
  loadSubscriptionData: () => Promise<void>;
}
