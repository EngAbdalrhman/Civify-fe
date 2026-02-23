export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  groupId?: number;
  groupName?: string;
  cvLimit?: number;
  extraTokens: number;
  accountLocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  plan?: string;
  cvCount?: number;
  apiUsageCount?: number;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  groupId: string;
  cvLimit: string;
  extraTokens: string;
  accountLocked: boolean;
}
