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

export default function PlansPage() {
  const t = useTranslations('admin.plans');
  const common = useTranslations('common');

  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    isFeatured: false,
  });

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllPlans();
      setPlans(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      isFeatured: plan.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, {
          name: formData.name,
          description: formData.description,
          monthlyPrice: parseFloat(formData.monthlyPrice),
          annualPrice: parseFloat(formData.annualPrice),
          isFeatured: formData.isFeatured,
        });
        toast.success('Plan updated successfully');
      } else {
        await adminService.createPlan({
          name: formData.name,
          description: formData.description,
          monthlyPrice: parseFloat(formData.monthlyPrice),
          annualPrice: parseFloat(formData.annualPrice),
          features: [],
          isFeatured: formData.isFeatured,
        });
        toast.success('Plan created successfully');
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save plan';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: AdminPlan) => {
    try {
      if (plan.isActive) {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={fetchPlans}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage subscription plans and features</p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createPlan')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <Badge variant={plan.isActive ? 'secondary' : 'destructive'} className="text-xs">
                    {plan.isActive ? 'Active' : 'Inactive'}
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
                  {common('edit')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleActive(plan)}
                >
                  {plan.isActive ? (
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

      {/* Plan Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualPrice">Annual Price ($)</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  value={formData.annualPrice}
                  onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
              <Label htmlFor="featured">Featured (Popular)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
