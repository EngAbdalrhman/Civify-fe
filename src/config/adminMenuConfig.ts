import { 
  Users, 
  CreditCard, 
  Tag, 
  BarChart3, 
  Activity,
  Shield,
  Bell,
  TrendingUp,
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
    path: '/admin/plans', 
    icon: CreditCard, 
    labelKey: 'plans', 
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
    permission: 'STATS.VIEW' 
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
  STATS_VIEW: 'STATS.VIEW',
  
  // API Usage
  API_USAGE_VIEW: 'API_USAGE.VIEW',
} as const;

export type AdminActionPermission = typeof ADMIN_ACTION_PERMISSIONS[keyof typeof ADMIN_ACTION_PERMISSIONS];
