'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Coins,
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react';
import { usePermissions } from '@/contexts/PermissionContext';
import { ADMIN_ACTION_PERMISSIONS } from '@/config/adminMenuConfig';
import { PlansManager } from '@/features/admin-dashboard/plans/components/PlansManager';
import { TokenPackagesManager } from '@/features/admin-dashboard/token-packages/components/TokenPackagesManager';

export default function BillingPage() {
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Permissions
  const canViewPlans = hasPermission(ADMIN_ACTION_PERMISSIONS.PLAN_VIEW);
  const canViewTokens = hasPermission(ADMIN_ACTION_PERMISSIONS.TOKEN_PACKAGE_VIEW);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('');

  // Set initial active tab based on permissions
  useEffect(() => {
    if (isLoadingPermissions) return;
    
    // Only set default tab if no tab is currently active
    if (!activeTab) {
      if (canViewPlans) {
        setActiveTab('plans');
      } else if (canViewTokens) {
        setActiveTab('tokens');
      }
    }
  }, [isLoadingPermissions, canViewPlans, canViewTokens, activeTab]);

  if (isLoadingPermissions) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canViewPlans && !canViewTokens) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view billing settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Billing Management
        </h1>
        <p className="text-muted-foreground">Manage subscription plans and token packages</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {canViewPlans && (
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Subscription Plans
            </TabsTrigger>
          )}
          {canViewTokens && (
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Token Packages
            </TabsTrigger>
          )}
        </TabsList>

        {/* Plans Tab */}
        {canViewPlans && (
          <TabsContent value="plans" className="space-y-6 mt-6">
            <PlansManager />
          </TabsContent>
        )}

        {/* Token Packages Tab */}
        {canViewTokens && (
          <TabsContent value="tokens" className="space-y-6 mt-6">
            <TokenPackagesManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
