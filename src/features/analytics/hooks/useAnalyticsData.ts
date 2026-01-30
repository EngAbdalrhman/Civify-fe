"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionService } from "@/services/subscription.service";
import {
  apiUsageService,
  type ApiUsageLog,
  type ApiUsageStats,
} from "@/services/api-usage.service";
import {
  tokenUsageService,
  type TokenUsageLog,
  type TokenUsageSummary,
} from "@/services/token-usage.service";
import type { UserSubscription } from "@/features/plans/types";
import type { PaginationState } from "../types/analytics.types";

export function useAnalyticsData() {
  const { isLoading: isAuthLoading, hasPermission } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageLog[]>([]);
  const [tokenUsageSummary, setTokenUsageSummary] =
    useState<TokenUsageSummary | null>(null);

  const [tokenPagination, setTokenPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [logsPagination, setLogsPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const canViewAnalytics = hasPermission("STATS.VIEW");
  const canViewApiLogs = hasPermission("API.ACCESS");

  const loadSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        const subData = await subscriptionService.getMyActiveSubscription();
        setSubscription(subData);
      } catch (err) {
        console.warn("No active subscription or error fetching it:", err);
      }

      const [logsData, statsData, tokenData, tokenSummaryData] =
        await Promise.all([
          canViewApiLogs
            ? apiUsageService.getMyLogs({ page: 0, size: 10 }).catch(() => ({
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                page: 0,
                number: 0,
              }))
            : Promise.resolve({
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                page: 0,
                number: 0,
              }),
          apiUsageService.getMyStats().catch(() => null),
          tokenUsageService.getMyUsageHistory(0, 10).catch(() => ({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
          })),
          tokenUsageService.getMySummary().catch(() => null),
        ]);

      setApiLogs(logsData.content || []);
      setLogsPagination({
        page: logsData.page || 0,
        size: logsData.size || 10,
        totalElements: logsData.totalElements || 0,
        totalPages: logsData.totalPages || 0,
      });

      setApiStats(statsData);

      setTokenUsage(tokenData.content || []);
      setTokenPagination({
        page: tokenData.number || 0,
        size: tokenData.size || 10,
        totalElements: tokenData.totalElements || 0,
        totalPages: tokenData.totalPages || 0,
      });
      setTokenUsageSummary(tokenSummaryData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [canViewApiLogs]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!canViewAnalytics) {
      setIsLoading(false);
      return;
    }
    loadSubscriptionData();
  }, [isAuthLoading, canViewAnalytics, loadSubscriptionData]);

  const handleLogsPageChange = async (newPage: number) => {
    try {
      const logsData = await apiUsageService.getMyLogs({
        page: newPage,
        size: logsPagination.size,
      });
      setApiLogs(logsData.content || []);
      setLogsPagination((prev) => ({
        ...prev,
        page: logsData.page || 0,
        totalElements: logsData.totalElements || 0,
        totalPages: logsData.totalPages || 0,
      }));
    } catch (e) {
      console.error("Failed to load page", e);
    }
  };

  const handleTokenPageChange = async (newPage: number) => {
    try {
      const tokenData = await tokenUsageService.getMyUsageHistory(
        newPage,
        tokenPagination.size,
      );
      setTokenUsage(tokenData.content || []);
      setTokenPagination((prev) => ({
        ...prev,
        page: tokenData.number || newPage,
        totalElements: tokenData.totalElements || 0,
        totalPages: tokenData.totalPages || 0,
      }));
    } catch (e) {
      console.error("Failed to load token usage page", e);
    }
  };

  return {
    subscription,
    apiLogs,
    apiStats,
    tokenUsage,
    tokenUsageSummary,
    logsPagination,
    tokenPagination,
    isLoading,
    error,
    canViewAnalytics,
    canViewApiLogs,
    handleLogsPageChange,
    handleTokenPageChange,
    loadSubscriptionData,
  };
}
