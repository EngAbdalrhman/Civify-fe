"use client";

import { useState } from 'react';
import { UserFormData } from '../types';

interface UseUserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void | Promise<void>;
}

export function useUserForm({ initialData, onSubmit }: UseUserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    groupId: initialData?.groupId || '',
    cvLimit: initialData?.cvLimit || '',
    extraTokens: initialData?.extraTokens || '0',
    accountLocked: initialData?.accountLocked ?? false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const tokens = parseInt(formData.extraTokens);
    if (!isNaN(tokens) && tokens < 0) {
      newErrors.extraTokens = 'Tokens cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleSubmit,
    updateField,
  };
}
