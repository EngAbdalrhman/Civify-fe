import { ReactNode } from 'react';

export type ColumnType = 'text' | 'date' | 'status' | 'number' | 'avatar' | 'custom';

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => ReactNode;
}

export interface ActionDef<T = any> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showInMenu?: boolean; // If true, shows in the "..." dropdown menu. If false/undefined, shows as a direct button.
}

export interface FilterState {
  [key: string]: string;
}

export interface SortState {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
