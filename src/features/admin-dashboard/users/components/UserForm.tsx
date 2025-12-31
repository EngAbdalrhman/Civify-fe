"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserForm } from '../hooks/useUserForm';
import { UserFormData } from '../types';
import { useGroups } from '@/features/admin-dashboard/groups';

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function UserForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  submitLabel = 'Save User'
}: UserFormProps) {
  const { formData, errors, isSubmitting, handleSubmit, updateField } = useUserForm({
    initialData,
    onSubmit,
  });
  
  const { data: groups = [] } = useGroups();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Enter first name"
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="user@example.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Phone Number Field */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateField('phoneNumber', e.target.value)}
          placeholder="+1234567890"
        />
      </div>

      {/* Group Field */}
      <div className="space-y-2">
        <Label htmlFor="groupId">Permission Group</Label>
        <Select
          value={formData.groupId || 'none'}
          onValueChange={(value) => updateField('groupId', value === 'none' ? '' : value)}
        >
          <SelectTrigger id="groupId" className="w-full">
            <SelectValue placeholder="Select a group" />
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
          Assign user to a permission group
        </p>
      </div>

      {/* Limits Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cvLimit">CV Limit Override</Label>
          <Input
            id="cvLimit"
            type="number"
            min="0"
            value={formData.cvLimit}
            onChange={(e) => updateField('cvLimit', e.target.value)}
            placeholder="Leave empty for plan default"
          />
          <p className="text-xs text-muted-foreground">
            Overrides plan CV limit
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="extraTokens">Extra Tokens (Wallet)</Label>
          <Input
            id="extraTokens"
            type="number"
            min="0"
            value={formData.extraTokens}
            onChange={(e) => updateField('extraTokens', e.target.value)}
            placeholder="0"
            className={errors.extraTokens ? 'border-destructive' : ''}
          />
          {errors.extraTokens && (
            <p className="text-sm text-destructive">{errors.extraTokens}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Purchased tokens that never expire
          </p>
        </div>
      </div>

      {/* Account Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="accountLocked" className="text-base">
            Account Locked
          </Label>
          <p className="text-sm text-muted-foreground">
            Locked accounts cannot log in
          </p>
        </div>
        <Switch
          id="accountLocked"
          checked={formData.accountLocked}
          onCheckedChange={(checked) => updateField('accountLocked', checked)}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
