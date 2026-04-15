"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Ban,
  Eye,
  Users,
  UserCheck,
  Shield,
  Coins,
  FileText,
  Search,
  Check,
  AtSign,
  X as XIcon,
  Hash,
  User,
  Globe,
  CreditCard,
  Activity,
  Calendar,
  Settings,
} from "lucide-react";
import { UserDialog } from "@/features/admin-dashboard/users";
import { adminService } from "@/services/admin.service";
import { useAdminUsers } from "@/features/admin-dashboard/users/hooks/useAdminUsers";
import type { AdminUser } from "@/services/admin.service";
import { FilterOperation } from "@/components/generic-list/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGroups } from "@/features/admin-dashboard/groups";
import { usePermissions } from "@/hooks/use-permissions";
import { ADMIN_ACTION_PERMISSIONS } from "@/config/adminMenuConfig";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Helper to get user initials for avatar
function getInitials(user: AdminUser): string {
  const name =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (!name || name === "Unknown") {
    return user.email?.charAt(0)?.toUpperCase() || "?";
  }
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0]?.substring(0, 2)?.toUpperCase() || "?";
}

// Deterministic color from string
function getAvatarColor(str: string): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-lime-600",
    "bg-fuchsia-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getUserDisplayName(user: AdminUser): string {
  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unknown"
  );
}

const actionButtonStyles =
  "h-8 w-8 text-muted-foreground hover:text-white hover:bg-primary transition-colors";
const banButtonStyles =
  "h-8 w-8 text-red-500 hover:text-white hover:bg-red-600 transition-colors";
const unbanButtonStyles =
  "h-8 w-8 text-emerald-500 hover:text-white hover:bg-emerald-600 transition-colors";

export default function UsersPage() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("admin.common");
  const common = useTranslations("common");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Search & Filters
  // localSearchTerm = instant UI feedback; debouncedSearch = triggers API calls
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Action dialogs
  const [actionDialog, setActionDialog] = useState<{
    type: "group" | "limits" | "tokens" | null;
    user: AdminUser | null;
    value: string;
  }>({ type: null, user: null, value: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasPermission } = usePermissions();

  const canModifyGroup = hasPermission(
    ADMIN_ACTION_PERMISSIONS.USER_MODIFY_GROUP,
  );
  const { data: groups = [] } = useGroups({ enabled: canModifyGroup });

  const { users, isLoading, pagination, filterUsers, refresh, fetchUsers } =
    useAdminUsers({ pageSize: 10 });

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
  });

  const [planOptions, setPlanOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Fetch stats and plan lookup on mount only
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const shouldFetchStats = hasPermission(
          ADMIN_ACTION_PERMISSIONS.ADMIN_STATS_VIEW,
        );
        const shouldFetchPlans = hasPermission(
          ADMIN_ACTION_PERMISSIONS.PLAN_VIEW,
        );

        const [stats, plans] = (await Promise.all([
          shouldFetchStats
            ? adminService.getStats("MONTHLY").catch(() => null)
            : Promise.resolve(null),
          shouldFetchPlans
            ? adminService.getPlanLookup().catch(() => [])
            : Promise.resolve([]),
        ])) as [any, any[]];

        if (stats) {
          setMetrics({
            totalUsers: stats.totalUsers || 0,
            activeUsers: stats.subscribedUsers || 0,
            newUsers: 0,
          });
        }

        if (plans && Array.isArray(plans)) {
          setPlanOptions(
            plans.map((p: any) => {
              const exactValue = p.name
                ? p.name.charAt(0).toUpperCase() + p.name.slice(1).toLowerCase()
                : p.name;
              return { label: p.name, value: exactValue };
            }),
          );
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };
    loadInitialData();
  }, []);

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleBan = async (user: AdminUser) => {
    try {
      await adminService.toggleUserLock(user.id);
      toast.success(
        user.status === "DISABLED" ? t("enableSuccess") : t("disableSuccess"),
      );
      await refresh();
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error(t("toggleError"));
    }
  };

  const openActionDialog = (
    type: "group" | "limits" | "tokens",
    user: AdminUser,
  ) => {
    let initialValue = "";
    if (type === "group") {
      initialValue = user.groupId?.toString() || "";
    } else if (type === "limits") {
      initialValue = user.cvLimit?.toString() || "";
    } else if (type === "tokens") {
      initialValue = user.extraTokens?.toString() || "0";
    }
    setActionDialog({ type, user, value: initialValue });
  };

  const handleActionSubmit = async () => {
    if (!actionDialog.user || !actionDialog.type) return;

    setIsSubmitting(true);
    try {
      if (actionDialog.type === "group") {
        const groupId = parseInt(actionDialog.value);
        if (!isNaN(groupId)) {
          await adminService.updateUserGroup(actionDialog.user.id, groupId);
          toast.success("User group updated");
        }
      } else if (actionDialog.type === "limits") {
        const cvLimit = actionDialog.value
          ? parseInt(actionDialog.value)
          : undefined;
        await adminService.updateUserLimits(actionDialog.user.id, cvLimit);
        toast.success("User limits updated");
      } else if (actionDialog.type === "tokens") {
        const tokens = parseInt(actionDialog.value) || 0;
        await adminService.updateUserTokens(actionDialog.user.id, tokens);
        toast.success("User tokens updated");
      }
      await refresh();
      setActionDialog({ type: null, user: null, value: "" });
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply search and filters
  const applyFilters = useCallback(() => {
    const filters: any[] = [];

    if (searchTerm.trim()) {
      filters.push({
        fieldName: "email",
        operation: FilterOperation.MATCH,
        value: searchTerm.trim(),
      });
    }

    if (statusFilter !== "all") {
      filters.push({
        fieldName: "status",
        operation: FilterOperation.EQUAL,
        value: statusFilter,
      });
    }

    if (planFilter !== "all") {
      filters.push({
        fieldName: "plan",
        operation: FilterOperation.MATCH,
        value: planFilter,
      });
    }

    if (sourceFilter !== "all") {
      filters.push({
        fieldName: "oauthProvider",
        operation: FilterOperation.EQUAL,
        value: sourceFilter,
      });
    }

    filterUsers(filters);
  }, [searchTerm, statusFilter, planFilter, sourceFilter, filterUsers]);

  // Debounce search input → update the actual searchTerm after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Apply filters when the debounced searchTerm or dropdowns change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, planFilter, sourceFilter]);

  const handlePageChange = (page: number) => {
    if (fetchUsers) {
      fetchUsers(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t("totalUsers")}
            </h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.totalUsers || pagination?.totalElements || 0}
          </div>
        </div>
        {hasPermission(ADMIN_ACTION_PERMISSIONS.ADMIN_STATS_VIEW) && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {tc("subscribedUsers")}
              </h3>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border shadow-sm">
        {/* Filter Bar (Image 2 design) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b">
          <h2 className="text-lg font-semibold whitespace-nowrap">
            {t("title")}
          </h2>
          <div className="flex-1 w-full sm:w-auto sm:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-muted/30 border-muted"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t("statusFilter")}:
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[100px] border-muted bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="ACTIVE">{tc("active")}</SelectItem>
                  <SelectItem value="DISABLED">{tc("disabled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 min-w-[120px] flex-1 sm:flex-none">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t("planFilter")}:
              </span>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[100px] border-muted bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allPlans")}</SelectItem>
                  {planOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 min-w-[120px] flex-1 sm:flex-none">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t("sourceFilter")}:
              </span>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[110px] border-muted bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allSources")}</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 p-4 md:hidden">
          {isLoading ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              {tc("noData")}
            </div>
          ) : (
            users.map((user) => {
              const canModify = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_EDIT);
              return (
                <div key={user.id} className="rounded-xl border bg-card p-3 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        User
                      </span>
                      <span className="text-sm font-medium">{getUserDisplayName(user)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </span>
                      <span className="text-sm break-all">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Plan
                      </span>
                      <span className="text-sm">{user.plan || "Free"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </span>
                      <span className="text-sm">{user.status}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={actionButtonStyles}
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canModify && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={
                          user.status === "ACTIVE" ? banButtonStyles : unbanButtonStyles
                        }
                        onClick={() => handleToggleBan(user)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[70px] px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    {t("columns.id")}
                  </span>
                </TableHead>
                <TableHead className="min-w-[220px]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {t("columns.userDetails")}
                  </span>
                </TableHead>
                <TableHead className="w-[100px]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {t("columns.source")}
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    {t("columns.plan")}
                  </span>
                </TableHead>

                <TableHead>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    {t("columns.accountStatus")}
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("columns.registeredDate")}
                  </span>
                </TableHead>
                <TableHead className="w-[60px] text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Settings className="h-3.5 w-3.5" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <span className="text-sm">{tc("noData")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const displayName = getUserDisplayName(user);
                  const initials = getInitials(user);
                  const avatarColor = getAvatarColor(
                    user.email || user.id.toString(),
                  );
                  const canModify = hasPermission(
                    ADMIN_ACTION_PERMISSIONS.USER_EDIT,
                  );
                  const canModifyGroupPerm = hasPermission(
                    ADMIN_ACTION_PERMISSIONS.USER_MODIFY_GROUP,
                  );
                  const canModifyLimits = hasPermission(
                    ADMIN_ACTION_PERMISSIONS.USER_MODIFY_LIMITS,
                  );
                  const canModifyTokens = hasPermission(
                    ADMIN_ACTION_PERMISSIONS.USER_MODIFY_TOKENS,
                  );

                  const source = (user.oauthProvider || "EMAIL").toUpperCase();

                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors border-b last:border-b-0"
                    >
                      {/* ID */}
                      <TableCell className="py-3 px-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{user.id}
                        </span>
                      </TableCell>

                      {/* User Details */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                                avatarColor,
                              )}
                            >
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Source */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          {source === "GOOGLE" ? (
                            <svg
                              className="h-5 w-5 shrink-0"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          ) : source === "LINKEDIN" ? (
                            <svg
                              className="h-5 w-5 shrink-0 text-[#0A66C2]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          ) : (
                            <AtSign className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground capitalize">
                            {source === "EMAIL"
                              ? "Email"
                              : source === "GOOGLE"
                                ? "Google"
                                : source === "LINKEDIN"
                                  ? "LinkedIn"
                                  : source}
                          </span>
                        </div>
                      </TableCell>

                      {/* Plan */}
                      {/* Plan */}
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            !user.plan || user.plan === "Free"
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              : (user.plan || "")
                                    .toLowerCase()
                                    .includes("premium")
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : (user.plan || "")
                                      .toLowerCase()
                                      .includes("lifetime")
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                          )}
                        >
                          {user.plan || "Free"}
                        </span>
                      </TableCell>

                      {/* Account Status */}
                      {/* Account Status */}
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            user.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                          )}
                        >
                          {user.status === "ACTIVE"
                            ? tc("active")
                            : tc("inactive")}
                        </span>
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell className="py-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={actionButtonStyles}
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{common("view")}</TooltipContent>
                            </Tooltip>

                            {canModify && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={
                                      user.status === "ACTIVE"
                                        ? banButtonStyles
                                        : unbanButtonStyles
                                    }
                                    onClick={() => handleToggleBan(user)}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {user.status === "ACTIVE"
                                    ? "Ban User"
                                    : "Unban User"}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {canModifyGroupPerm && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={actionButtonStyles}
                                    onClick={() =>
                                      openActionDialog("group", user)
                                    }
                                  >
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Change Group</TooltipContent>
                              </Tooltip>
                            )}

                            {canModifyLimits && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={actionButtonStyles}
                                    onClick={() =>
                                      openActionDialog("limits", user)
                                    }
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Update CV Limit</TooltipContent>
                              </Tooltip>
                            )}

                            {canModifyTokens && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={actionButtonStyles}
                                    onClick={() =>
                                      openActionDialog("tokens", user)
                                    }
                                  >
                                    <Coins className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Update Tokens</TooltipContent>
                              </Tooltip>
                            )}
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {pagination.page * pagination.size + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  (pagination.page + 1) * pagination.size,
                  pagination.totalElements,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {pagination.totalElements}
              </span>{" "}
              entries
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(0)}
                disabled={pagination.page === 0 || isLoading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-2">
                Page {pagination.page + 1} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={
                  pagination.page >= pagination.totalPages - 1 || isLoading
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(pagination.totalPages - 1)}
                disabled={
                  pagination.page >= pagination.totalPages - 1 || isLoading
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
      />

      {/* Action Dialog */}
      <Dialog
        open={!!actionDialog.type}
        onOpenChange={() =>
          setActionDialog({ type: null, user: null, value: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "group" && "Change Permission Group"}
              {actionDialog.type === "limits" && "Update CV Limit"}
              {actionDialog.type === "tokens" && "Update Extra Tokens"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.user && `Updating: ${actionDialog.user.email}`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionDialog.type === "group" && (
              <div className="space-y-2">
                <Label>Permission Group</Label>
                <Select
                  value={actionDialog.value || "none"}
                  onValueChange={(value) =>
                    setActionDialog((prev) => ({
                      ...prev,
                      value: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {groups.map((group: any) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionDialog.type === "limits" && (
              <div className="space-y-2">
                <Label>CV Limit Override</Label>
                <Input
                  type="number"
                  min="0"
                  value={actionDialog.value}
                  onChange={(e) =>
                    setActionDialog((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  placeholder="Leave empty for plan default"
                />
              </div>
            )}

            {actionDialog.type === "tokens" && (
              <div className="space-y-2">
                <Label>Extra Tokens (Wallet)</Label>
                <Input
                  type="number"
                  min="0"
                  value={actionDialog.value}
                  onChange={(e) =>
                    setActionDialog((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionDialog({ type: null, user: null, value: "" })
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleActionSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
