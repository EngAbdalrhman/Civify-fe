import { 
  Users, 
  CreditCard, 
  Tag, 
  BarChart3, 
  Activity,
  Shield,
  Bell,
  TrendingUp,
  FileSearch,
  Clock,
  LucideIcon 
} from 'lucide-react';

export interface AdminMenuItem {
  path: string;
  icon: LucideIcon;
  labelKey: string;
  permission: string;
  /** Optional: require all of these permissions */
  allPermissions?: string[];
}

/**
 * Admin menu configuration with permission mappings
 * Each menu item is protected by one or more permissions
 */
export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { 
    path: '/admin/users', 
    icon: Users, 
    labelKey: 'users', 
    permission: 'USER.VIEW' 
  },
  { 
    path: '/admin/billing', 
    icon: CreditCard, 
    labelKey: 'billing', 
    permission: 'PLAN.VIEW' 
  },
  { 
    path: '/admin/promos', 
    icon: Tag, 
    labelKey: 'promos', 
    permission: 'PROMO.VIEW' 
  },
  { 
    path: '/admin/subscriptions', 
    icon: TrendingUp, 
    labelKey: 'subscriptions', 
    permission: 'SUBSCRIPTION.VIEW' 
  },
  { 
    path: '/admin/stats', 
    icon: BarChart3, 
    labelKey: 'stats', 
    permission: 'ADMIN_STATS.VIEW' 
  },
  { 
    path: '/admin/api-usage', 
    icon: Activity, 
    labelKey: 'apiUsage', 
    permission: 'API_USAGE.VIEW' 
  },
  { 
    path: '/admin/groups', 
    icon: Shield, 
    labelKey: 'groups', 
    permission: 'GROUP.VIEW' 
  },
  { 
    path: '/admin/notifications', 
    icon: Bell, 
    labelKey: 'notifications', 
    permission: 'NOTIF.SEND' 
  },
  { 
    path: '/admin/audit-monitor', 
    icon: FileSearch, 
    labelKey: 'auditMonitor', 
    permission: 'SYSTEM.LOGS.VIEW' 
  },
  { 
    path: '/admin/scheduler', 
    icon: Clock, 
    labelKey: 'scheduler', 
    permission: 'SCHEDULER_TRIGGER' 
  },
];

/**
 * Action-level permissions for admin lists
 * Use these to conditionally show/hide action buttons
 */
export const ADMIN_ACTION_PERMISSIONS = {
  // Admin Dashboard Access
  ADMIN_DASHBOARD_VIEW: 'ADMIN.DASHBOARD.VIEW',
  
  // Users
  USER_VIEW: 'USER.VIEW',
  USER_CREATE: 'USER.CREATE',
  USER_EDIT: 'USER.MODIFY',
  USER_DELETE: 'USER.DELETE',
  USER_MODIFY_GROUP: 'USER.MODIFY_GROUP',
  USER_MODIFY_LIMITS: 'USER.MODIFY_LIMITS',
  USER_MODIFY_TOKENS: 'USER.MODIFY_TOKENS',
  
  // Plans
  PLAN_VIEW: 'PLAN.VIEW',
  PLAN_CREATE: 'PLAN.CREATE',
  PLAN_EDIT: 'PLAN.MODIFY',
  PLAN_DELETE: 'PLAN.DELETE',
  
  // Promos
  PROMO_VIEW: 'PROMO.VIEW',
  PROMO_CREATE: 'PROMO.CREATE',
  PROMO_EDIT: 'PROMO.MODIFY',
  PROMO_DELETE: 'PROMO.DELETE',
  
  // Groups
  GROUP_VIEW: 'GROUP.VIEW',
  GROUP_CREATE: 'GROUP.MODIFY',
  GROUP_EDIT: 'GROUP.MODIFY',
  GROUP_DELETE: 'GROUP.MODIFY',
  
  // Stats
  STATS_VIEW: 'STATS.VIEW', // User analytics
  ADMIN_STATS_VIEW: 'ADMIN_STATS.VIEW', // Admin platform stats
  
  // API Usage
  API_USAGE_VIEW: 'API_USAGE.VIEW',

  // Token Packages
  TOKEN_PACKAGE_VIEW: 'TOKEN_PACKAGE.VIEW',
  TOKEN_PACKAGE_EDIT: 'TOKEN_PACKAGE.MODIFY',

  // Scheduler
  SCHEDULER_TRIGGER: 'SCHEDULER_TRIGGER',

  // Logs
  LOGS_CV: 'LOGS.CV',
} as const;

export type AdminActionPermission = typeof ADMIN_ACTION_PERMISSIONS[keyof typeof ADMIN_ACTION_PERMISSIONS];
