// Groups feature - types
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
}

export interface Group {
  id: number;
  name: string;
  isSystemGroup: boolean;
  isDefault: boolean;
  isActive: boolean;
  permissions: Permission[];
}

export interface GroupCreateRequest {
  name: string;
  permissionIds: number[];
}

export interface GroupsApiResponse {
  success: boolean;
  message: string;
  data: Group[] | Group;
}
