'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Zap, 
  Briefcase, 
  Plus, 
  Loader2, 
  Edit2, 
  Trash2,
  Power,
  PowerOff,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, type AdminPlan } from '@/services/admin.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePermissions } from '@/contexts/PermissionContext';
import { ADMIN_ACTION_PERMISSIONS } from '@/config/adminMenuConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroups } from '@/features/admin-dashboard/groups';

function getPlanIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('enterprise') || lower.includes('business')) {
    return <Briefcase className="h-5 w-5 text-primary" />;
  }
  if (lower.includes('pro') || lower.includes('premium')) {
    return <Zap className="h-5 w-5 text-primary" />;
  }
  return <Package className="h-5 w-5 text-primary" />;
}

export function PlansManager() {
  const t = useTranslations('admin.billing');
  const tc = useTranslations('admin.common');
  const { hasPermission } = usePermissions();
  
  const canModifyPlans = hasPermission(ADMIN_ACTION_PERMISSIONS.PLAN_EDIT);
  
  // Plans state
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Groups for dropdown
  const { data: groups = [] } = useGroups();

  // Plan form state
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    cvLimit: '',
    tokenLimit: '',
    watermark: true,
    linkedGroupId: '',
    allowAnnualBilling: true,
    renewalAllowed: true,
    maxBillingCycles: '',
    isFeatured: false,
    sortOrder: '0',
  });

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      const data = await adminService.getAllPlans();
      setPlans(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setPlansError(message);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Plan handlers
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormData({
      name: '',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      cvLimit: '',
      tokenLimit: '',
      watermark: true,
      linkedGroupId: '',
      allowAnnualBilling: true,
      renewalAllowed: true,
      maxBillingCycles: '',
      isFeatured: false,
      sortOrder: '0',
    });
    setIsPlanDialogOpen(true);
  };

  const handleEditPlan = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      cvLimit: plan.cvLimit?.toString() || '',
      tokenLimit: plan.tokenLimit?.toString() || '',
      watermark: plan.watermark ?? true,
      linkedGroupId: plan.linkedGroupId?.toString() || '',
      allowAnnualBilling: plan.allowAnnualBilling ?? true,
      renewalAllowed: plan.renewalAllowed ?? true,
      maxBillingCycles: plan.maxBillingCycles?.toString() || '',
      isFeatured: plan.isFeatured ?? false,
      sortOrder: plan.sortOrder?.toString() || '0',
    });
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    try {
      const planPayload = {
        name: planFormData.name,
        description: planFormData.description,
        monthlyPrice: parseFloat(planFormData.monthlyPrice),
        annualPrice: parseFloat(planFormData.annualPrice),
        cvLimit: planFormData.cvLimit ? parseInt(planFormData.cvLimit) : undefined,
        tokenLimit: planFormData.tokenLimit ? parseInt(planFormData.tokenLimit) : undefined,
        watermark: planFormData.watermark,
        linkedGroupId: planFormData.linkedGroupId ? parseInt(planFormData.linkedGroupId) : undefined,
        allowAnnualBilling: planFormData.allowAnnualBilling,
        renewalAllowed: planFormData.renewalAllowed,
        maxBillingCycles: planFormData.maxBillingCycles ? parseInt(planFormData.maxBillingCycles) : undefined,
        isFeatured: planFormData.isFeatured,
        sortOrder: parseInt(planFormData.sortOrder) || 0,
      };
      
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, planPayload);
        toast.success('Plan updated successfully');
      } else {
        await adminService.createPlan(planPayload);
        toast.success('Plan created successfully');
      }
      setIsPlanDialogOpen(false);
      fetchPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save plan';
      toast.error(message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleTogglePlanActive = async (plan: AdminPlan) => {
    try {
      if (plan.active) {
        await adminService.deactivatePlan(plan.id);
        toast.success('Plan deactivated');
      } else {
        await adminService.activatePlan(plan.id);
        toast.success('Plan activated');
      }
      fetchPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle plan status';
      toast.error(message);
    }
  };

  const handleDeletePlan = async (plan: AdminPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) return;
    
    try {
      await adminService.deletePlan(plan.id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete plan';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t('plansDesc')}
        </p>
        {canModifyPlans && (
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t('createPlan')}
          </Button>
        )}
      </div>

      {isLoadingPlans ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plansError ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">{plansError}</p>
          <Button onClick={fetchPlans}>Retry</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-lg border p-6 shadow-sm ${
                plan.isFeatured ? 'border-primary/20 bg-primary/5' : 'bg-card'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.name)}
                  <div>
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {plan.isFeatured && (
                    <Badge variant="default" className="text-xs">{t('popular')}</Badge>
                  )}
                  <Badge variant={plan.active ? 'secondary' : 'destructive'} className="text-xs">
                    {plan.active ? tc('active') : tc('inactive')}
                  </Badge>
                </div>
              </div>
              
              <div className="text-2xl font-bold mb-4">
                ${parseFloat(plan.monthlyPrice).toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>

              {/* Limits */}
              <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">{plan.cvLimit ?? '∞'}</span> CVs
                </div>
                <div>
                  <span className="font-medium text-foreground">{plan.tokenLimit ?? '∞'}</span> Tokens
                </div>
              </div>

              {canModifyPlans && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                    <Edit2 className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                    {tc('edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleTogglePlanActive(plan)}
                  >
                    {plan.active ? (
                      <><PowerOff className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{tc('deactivate')}</>
                    ) : (
                      <><Power className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{tc('activate')}</>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeletePlan(plan)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan Edit/Create Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="planName">Name *</Label>
              <Input
                id="planName"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                placeholder="e.g., Pro Plan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planDescription">Description</Label>
              <Textarea
                id="planDescription"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                placeholder="Brief description of the plan"
              />
            </div>
            
            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($) *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={planFormData.monthlyPrice}
                  onChange={(e) => setPlanFormData({ ...planFormData, monthlyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualPrice">Annual Price ($) *</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  value={planFormData.annualPrice}
                  onChange={(e) => setPlanFormData({ ...planFormData, annualPrice: e.target.value })}
                />
              </div>
            </div>
            
            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cvLimit">CV Limit (empty = unlimited)</Label>
                <Input
                  id="cvLimit"
                  type="number"
                  value={planFormData.cvLimit}
                  onChange={(e) => setPlanFormData({ ...planFormData, cvLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenLimit">Token Limit (empty = unlimited)</Label>
                <Input
                  id="tokenLimit"
                  type="number"
                  value={planFormData.tokenLimit}
                  onChange={(e) => setPlanFormData({ ...planFormData, tokenLimit: e.target.value })}
                  placeholder="Monthly AI token allowance"
                />
              </div>
            </div>
            
            {/* Linked Group */}
            <div className="space-y-2">
              <Label htmlFor="linkedGroupId">Linked Permission Group</Label>
              <Select 
                value={planFormData.linkedGroupId || 'none'} 
                onValueChange={(value) => setPlanFormData({ ...planFormData, linkedGroupId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Users subscribing to this plan will inherit the group's permissions
              </p>
            </div>
            
            {/* Billing Restrictions */}
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <h4 className="text-sm font-medium">Billing Restrictions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowAnnual"
                    checked={planFormData.allowAnnualBilling}
                    onCheckedChange={(checked) => setPlanFormData({ ...planFormData, allowAnnualBilling: checked })}
                  />
                  <Label htmlFor="allowAnnual" className="text-sm">Allow Annual Billing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="renewal"
                    checked={planFormData.renewalAllowed}
                    onCheckedChange={(checked) => setPlanFormData({ ...planFormData, renewalAllowed: checked })}
                  />
                  <Label htmlFor="renewal" className="text-sm">Allow Renewal</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBillingCycles" className="text-sm">Max Billing Cycles (empty = unlimited)</Label>
                <Input
                  id="maxBillingCycles"
                  type="number"
                  value={planFormData.maxBillingCycles}
                  onChange={(e) => setPlanFormData({ ...planFormData, maxBillingCycles: e.target.value })}
                  placeholder="e.g., 1 for one-time purchase"
                  className="h-8"
                />
              </div>
            </div>
            
            {/* Display Settings */}
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <h4 className="text-sm font-medium">Display Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={planFormData.isFeatured}
                    onCheckedChange={(checked) => setPlanFormData({ ...planFormData, isFeatured: checked })}
                  />
                  <Label htmlFor="featured" className="text-sm">Featured (Popular)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="watermark"
                    checked={planFormData.watermark}
                    onCheckedChange={(checked) => setPlanFormData({ ...planFormData, watermark: checked })}
                  />
                  <Label htmlFor="watermark" className="text-sm">Show Watermark</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-sm">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={planFormData.sortOrder}
                  onChange={(e) => setPlanFormData({ ...planFormData, sortOrder: e.target.value })}
                  className="h-8 w-24"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={isSavingPlan}>
              {isSavingPlan && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
