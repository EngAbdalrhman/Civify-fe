export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  plan: string;
  role: string;
  credits: number;
  createdAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  plan: string;
  role: string;
  credits: number;
}
