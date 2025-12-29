'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Plus, 
  Loader2, 
  Edit2, 
  Trash2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, type PromoCode } from '@/services/admin.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PromosPage() {
  const t = useTranslations('admin.promos');
  const common = useTranslations('common');

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '',
    maxUses: '',
    validUntil: '',
  });

  const fetchPromoCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllPromoCodes();
      setPromoCodes(data);
      setFilteredCodes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch promo codes';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  // Client-side filtering
  useEffect(() => {
    let result = promoCodes;

    if (searchTerm) {
      result = result.filter(p => 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => 
        statusFilter === 'active' ? p.isActive : !p.isActive
      );
    }

    setFilteredCodes(result);
  }, [promoCodes, searchTerm, statusFilter]);

  const handleCreatePromo = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxUses: '',
      validUntil: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      maxUses: promo.maxUses ? String(promo.maxUses) : '',
      validUntil: promo.validUntil ? promo.validUntil.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleSavePromo = async () => {
    setIsSaving(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        usageLimit: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        expiresAt: formData.validUntil ? `${formData.validUntil}T23:59:59` : undefined,
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
      fetchPromoCodes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save promo code';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    if (!confirm(`Delete promo code "${promo.code}"?`)) return;
    
    try {
      await adminService.deletePromoCode(promo.id);
      toast.success('Promo code deleted');
      fetchPromoCodes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete promo code';
      toast.error(message);
    }
  };

  const handleDeactivate = async (promo: PromoCode) => {
    try {
      await adminService.deactivatePromoCode(promo.id);
      toast.success('Promo code deactivated');
      fetchPromoCodes();
    } catch (err) {
      toast.error('Failed to deactivate promo code');
    }
  };

  const copyCode = (promo: PromoCode) => {
    navigator.clipboard.writeText(promo.code);
    setCopiedId(promo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={fetchPromoCodes}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleCreatePromo}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createPromo')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No promo codes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <code className="font-mono font-bold">{promo.code}</code>
                        <button 
                          onClick={() => copyCode(promo)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {copiedId === promo.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === 'PERCENTAGE' 
                        ? `${promo.discountValue}%` 
                        : `$${promo.discountValue}`}
                    </TableCell>
                    <TableCell>
                      {promo.currentUses}/{promo.maxUses || '∞'}
                    </TableCell>
                    <TableCell>
                      {promo.validUntil 
                        ? new Date(promo.validUntil).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPromo(promo)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {promo.isActive && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivate(promo)}>
                            Deactivate
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeletePromo(promo)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Promo Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(v) => setFormData({ ...formData, discountType: v as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
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
                <Label htmlFor="discountValue">
                  {formData.discountType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '10'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Expires On (optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePromo} disabled={isSaving || !formData.code || !formData.discountValue}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPromo ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
