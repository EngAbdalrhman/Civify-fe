'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Plus, 
  Loader2, 
  Edit2, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, type PromoCode, type PromoApplicabilityType } from '@/services/admin.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation, ActionDef } from '@/components/generic-list/types';

export default function PromosPage() {
  const t = useTranslations('admin.promos');
  const tc = useTranslations('admin.common');
  const common = useTranslations('common');

  // Dialog state
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // GenericList state
  const [data, setData] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState({
    page: 0,
    size: 10,
    filters: {} as Record<string, unknown>,
    sort: null as { field: string; direction: 'ASC' | 'DESC' } | null,
  });

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '',
    usageLimit: '',
    expiresAt: '',
    applicabilityType: 'ALL' as PromoApplicabilityType,
  });

  // Column definitions
  const columns: ColumnDef<PromoCode>[] = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'code',
      label: t('code'),
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH,
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <code className="font-mono font-bold">{item.code}</code>
        </div>
      ),
    },
    {
      key: 'discountValue',
      label: t('discount'),
      sortable: true,
      render: (_, item) => (
        <span className="font-semibold">
          {item.discountType === 'PERCENTAGE' 
            ? `${item.discountValue}%` 
            : `$${item.discountValue}`}
        </span>
      ),
    },
    {
      key: 'applicabilityType',
      label: t('appliesTo'),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'All', value: 'ALL' },
        { label: 'Plan', value: 'PLAN' },
        { label: 'Token', value: 'TOKEN' },
      ],
    },
    {
      key: 'usedCount',
      label: t('usage'),
      sortable: true,
      render: (_, item) => (
        <span className="text-muted-foreground">
          {item.usedCount}/{item.usageLimit || '∞'}
        </span>
      ),
    },
    {
      key: 'expiresAt',
      label: t('expires'),
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">{t('noExpiry')}</span>;
        return new Date(value as string).toLocaleDateString();
      },
    },
    {
      key: 'active',
      label: t('status'),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: tc('active'), value: 'true' },
        { label: tc('inactive'), value: 'false' },
      ],
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'} className={value ? 'bg-green-600' : ''}>
          {value ? tc('active') : tc('inactive')}
        </Badge>
      ),
    },
  ], [t, tc]);

  // Actions
  const actions: ActionDef<PromoCode>[] = useMemo(() => [
    {
      label: tc('edit'),
      icon: <Edit2 className="h-4 w-4" />,
      onClick: (promo) => handleEditPromo(promo),
    },
    {
      label: tc('deactivate'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (promo) => handleDeactivate(promo),
      variant: 'destructive' as const,
      condition: (promo) => promo.active,
    },
  ], [tc]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const model = buildInputDataModel(params.filters, columns, params.sort, params.page, params.size);
      const res = await adminService.filterPromoCodes(model);
      setData(res.content);
      setPagination({
        page: res.page,
        size: res.size,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, [params, columns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleCreate = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      usageLimit: '',
      expiresAt: '',
      applicabilityType: 'ALL',
    });
    setIsDialogOpen(true);
  };

  const handleEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      usageLimit: promo.usageLimit?.toString() || '',
      expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
      applicabilityType: promo.applicabilityType,
    });
    setIsDialogOpen(true);
  };

  const handleDeactivate = async (promo: PromoCode) => {
    if (!confirm(`Are you sure you want to deactivate "${promo.code}"?`)) return;
    
    try {
      await adminService.deactivatePromoCode(promo.id);
      toast.success('Promo code deactivated');
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate';
      toast.error(message);
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    if (!confirm(`Are you sure you want to delete "${promo.code}"?`)) return;
    
    try {
      await adminService.deletePromoCode(promo.id);
      toast.success('Promo code deleted');
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(message);
    }
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Code is required');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        applicabilityType: formData.applicabilityType,
        active: true,
      };

      if (editingPromo) {
        await adminService.updatePromoCode(editingPromo.id, payload);
        toast.success('Promo code updated');
      } else {
        await adminService.createPromoCode(payload);
        toast.success('Promo code created');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('createPromo')}
        </Button>
      </div>

      {/* GenericList Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <GenericList<PromoCode>
          data={data}
          columns={columns}
          meta={pagination}
          isLoading={loading}
          actions={actions}
          onFilterChange={(filters) => setParams(prev => ({ ...prev, filters, page: 0 }))}
          onSortChange={(sort) => setParams(prev => ({ ...prev, sort }))}
          onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
          onRefresh={loadData}
          emptyMessage={t('noPromos')}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? tc('edit') + ' ' + t('code') : t('createPromo')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t('code')} *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER20"
                disabled={!!editingPromo}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(v: 'PERCENTAGE' | 'FIXED_AMOUNT') => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">{t('discount')} *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 10.00'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">{t('usage')} Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">{t('expires')}</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('appliesTo')}</Label>
              <Select 
                value={formData.applicabilityType} 
                onValueChange={(v: PromoApplicabilityType) => setFormData({ ...formData, applicabilityType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Products</SelectItem>
                  <SelectItem value="PLAN">Subscription Plans Only</SelectItem>
                  <SelectItem value="TOKEN">Token Packages Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />}
              {editingPromo ? tc('save') : common('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
