'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  AlertCircle,
  Coins,
  CreditCard
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
import { tokenPackageService, type TokenPackage } from '@/services/token-package.service';
import apiClient from '@/api/client';

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

// Token Package Admin API
const tokenPackageAdminApi = {
  getAll: async (): Promise<TokenPackage[]> => {
    const response = await apiClient.get('/v1/tokens/packages/all');
    return response.data;
  },
  create: async (data: Partial<TokenPackage>): Promise<TokenPackage> => {
    const response = await apiClient.post('/v1/tokens/packages', data);
    return response.data;
  },
  update: async (id: number, data: Partial<TokenPackage>): Promise<TokenPackage> => {
    const response = await apiClient.put(`/v1/tokens/packages/${id}`, data);
    return response.data;
  },
  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/tokens/packages/${id}`);
  },
};

export default function BillingPage() {
  const t = useTranslations('admin.plans');
  const common = useTranslations('common');

  // Plans state
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Token packages state
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [tokensError, setTokensError] = useState<string | null>(null);
  const [editingTokenPackage, setEditingTokenPackage] = useState<TokenPackage | null>(null);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);

  // Plan form state
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    isFeatured: false,
  });

  // Token package form state
  const [tokenFormData, setTokenFormData] = useState({
    name: '',
    description: '',
    tokens: '',
    price: '',
    currency: 'EGP',
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

  // Fetch token packages
  const fetchTokenPackages = useCallback(async () => {
    setIsLoadingTokens(true);
    setTokensError(null);
    try {
      const data = await tokenPackageAdminApi.getAll();
      setTokenPackages(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch token packages';
      setTokensError(message);
    } finally {
      setIsLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchTokenPackages();
  }, [fetchPlans, fetchTokenPackages]);

  // Plan handlers
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormData({
      name: '',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      isFeatured: false,
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
      isFeatured: plan.isFeatured,
    });
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, {
          name: planFormData.name,
          description: planFormData.description,
          monthlyPrice: parseFloat(planFormData.monthlyPrice),
          annualPrice: parseFloat(planFormData.annualPrice),
          isFeatured: planFormData.isFeatured,
        });
        toast.success('Plan updated successfully');
      } else {
        await adminService.createPlan({
          name: planFormData.name,
          description: planFormData.description,
          monthlyPrice: parseFloat(planFormData.monthlyPrice),
          annualPrice: parseFloat(planFormData.annualPrice),
          features: [],
          isFeatured: planFormData.isFeatured,
        });
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

  // Token package handlers
  const handleCreateTokenPackage = () => {
    setEditingTokenPackage(null);
    setTokenFormData({
      name: '',
      description: '',
      tokens: '',
      price: '',
      currency: 'EGP',
    });
    setIsTokenDialogOpen(true);
  };

  const handleEditTokenPackage = (pkg: TokenPackage) => {
    setEditingTokenPackage(pkg);
    setTokenFormData({
      name: pkg.name,
      description: pkg.description || '',
      tokens: pkg.tokens.toString(),
      price: pkg.price.toString(),
      currency: pkg.currency,
    });
    setIsTokenDialogOpen(true);
  };

  const handleSaveTokenPackage = async () => {
    setIsSavingToken(true);
    try {
      const data = {
        name: tokenFormData.name,
        description: tokenFormData.description,
        tokens: parseInt(tokenFormData.tokens),
        price: parseFloat(tokenFormData.price),
        currency: tokenFormData.currency,
      };
      
      if (editingTokenPackage) {
        await tokenPackageAdminApi.update(editingTokenPackage.id, data);
        toast.success('Token package updated');
      } else {
        await tokenPackageAdminApi.create(data);
        toast.success('Token package created');
      }
      setIsTokenDialogOpen(false);
      fetchTokenPackages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save token package';
      toast.error(message);
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleDeactivateTokenPackage = async (pkg: TokenPackage) => {
    if (!confirm(`Are you sure you want to deactivate "${pkg.name}"?`)) return;
    
    try {
      await tokenPackageAdminApi.deactivate(pkg.id);
      toast.success('Token package deactivated');
      fetchTokenPackages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate token package';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Billing Management
        </h1>
        <p className="text-muted-foreground">Manage subscription plans and token packages</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Token Packages
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure subscription plans that users can purchase
            </p>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
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
                        <Badge variant="default" className="text-xs">Popular</Badge>
                      )}
                      <Badge variant={plan.active ? 'secondary' : 'destructive'} className="text-xs">
                        {plan.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold mb-4">
                    ${parseFloat(plan.monthlyPrice).toFixed(0)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTogglePlanActive(plan)}
                    >
                      {plan.active ? (
                        <><PowerOff className="h-3 w-3 mr-1" />Deactivate</>
                      ) : (
                        <><Power className="h-3 w-3 mr-1" />Activate</>
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Token Packages Tab */}
        <TabsContent value="tokens" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure token packages that users can purchase for additional usage
            </p>
            <Button onClick={handleCreateTokenPackage}>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>

          {isLoadingTokens ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tokensError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg text-muted-foreground">{tokensError}</p>
              <Button onClick={fetchTokenPackages}>Retry</Button>
            </div>
          ) : tokenPackages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold mb-2">No Token Packages</h2>
                <p className="text-muted-foreground mb-4">
                  Create your first token package to allow users to purchase extra tokens.
                </p>
                <Button onClick={handleCreateTokenPackage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {tokenPackages.map((pkg) => (
                <Card key={pkg.id} className={!pkg.active ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      </div>
                      <Badge variant={pkg.active ? 'secondary' : 'destructive'} className="text-xs">
                        {pkg.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {pkg.description && (
                      <CardDescription>{pkg.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {tokenPackageService.formatTokens(pkg.tokens)} tokens
                        </div>
                        <div className="text-xl font-semibold">
                          {pkg.price.toFixed(2)} {pkg.currency}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditTokenPackage(pkg)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {pkg.active && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeactivateTokenPackage(pkg)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Plan Edit/Create Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Name</Label>
              <Input
                id="planName"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planDescription">Description</Label>
              <Textarea
                id="planDescription"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={planFormData.monthlyPrice}
                  onChange={(e) => setPlanFormData({ ...planFormData, monthlyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualPrice">Annual Price ($)</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  value={planFormData.annualPrice}
                  onChange={(e) => setPlanFormData({ ...planFormData, annualPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={planFormData.isFeatured}
                onCheckedChange={(checked) => setPlanFormData({ ...planFormData, isFeatured: checked })}
              />
              <Label htmlFor="featured">Featured (Popular)</Label>
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

      {/* Token Package Edit/Create Dialog */}
      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTokenPackage ? 'Edit Token Package' : 'Create Token Package'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Package Name</Label>
              <Input
                id="tokenName"
                value={tokenFormData.name}
                onChange={(e) => setTokenFormData({ ...tokenFormData, name: e.target.value })}
                placeholder="e.g., Starter Pack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenDescription">Description</Label>
              <Input
                id="tokenDescription"
                value={tokenFormData.description}
                onChange={(e) => setTokenFormData({ ...tokenFormData, description: e.target.value })}
                placeholder="e.g., Perfect for occasional users"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Token Amount</Label>
                <Input
                  id="tokenAmount"
                  type="number"
                  value={tokenFormData.tokens}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, tokens: e.target.value })}
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenPrice">Price (EGP)</Label>
                <Input
                  id="tokenPrice"
                  type="number"
                  step="0.01"
                  value={tokenFormData.price}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, price: e.target.value })}
                  placeholder="e.g., 49.99"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTokenDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTokenPackage} disabled={isSavingToken}>
              {isSavingToken && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTokenPackage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
