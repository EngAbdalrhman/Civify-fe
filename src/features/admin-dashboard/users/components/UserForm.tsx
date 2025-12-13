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

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter user name"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
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

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-destructive">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="Enter password (min. 8 characters)"
          className={errors.password ? 'border-destructive' : ''}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: string) => updateField('role', value)}
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Field */}
      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Select
          value={formData.plan}
          onValueChange={(value: string) => updateField('plan', value)}
        >
          <SelectTrigger id="plan" className="w-full">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {PLANS.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Credits Field */}
      <div className="space-y-2">
        <Label htmlFor="credits">Credits</Label>
        <Input
          id="credits"
          type="number"
          min="0"
          value={formData.credits}
          onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
          placeholder="0"
          className={errors.credits ? 'border-destructive' : ''}
        />
        {errors.credits && (
          <p className="text-sm text-destructive">{errors.credits}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Set custom credits for this user
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-base">
            Active Status
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable or disable user access
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked: boolean) => updateField('isActive', checked)}
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
