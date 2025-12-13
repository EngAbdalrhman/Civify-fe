"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';
import { UserFormData } from '../types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<UserFormData>;
  mode: 'create' | 'edit';
}

export function UserDialog({ 
  open, 
  onOpenChange, 
  initialData,
  mode 
}: UserDialogProps) {
  const handleSubmit = async (data: UserFormData) => {
    // TODO: Implement API call to create/update user
    console.log('Submitting user data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close dialog on success
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new user to the platform. Fill in the required information below.'
              : 'Update user information. Changes will be saved immediately.'}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={mode === 'create' ? 'Create User' : 'Save Changes'}
        />
      </DialogContent>
    </Dialog>
  );
}
