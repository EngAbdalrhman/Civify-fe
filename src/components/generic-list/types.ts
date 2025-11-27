import { ReactNode } from 'react';

export enum FilterOperation {
  // Comparison Operations
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  EQUAL = 'EQUAL',
  // String Operations
  MATCH = 'MATCH',
  MATCH_START = 'MATCH_START',
  MATCH_END = 'MATCH_END',
  MATCH_EXACT = 'MATCH_EXACT',
  MATCH_REGEX = 'MATCH_REGEX',
  // Collection Operations
  IN_LONG_LIST = 'IN_LONG_LIST',
  NOT_IN_LONG_LIST = 'NOT_IN_LONG_LIST',
  IN_STRING_LIST = 'IN_STRING_LIST',
  NOT_IN_STRING_LIST = 'NOT_IN_STRING_LIST',
  IN_INTEGER_LIST = 'IN_INTEGER_LIST',
  NOT_IN_INTEGER_LIST = 'NOT_IN_INTEGER_LIST',
  // Null Operations
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_NULL = 'IS_NULL',
  // Date Operations
  DAY_EQUAL = 'DAY_EQUAL',
  DATE_GREATER_THAN = 'DATE_GREATER_THAN',
  DATE_GREATER_THAN_EQUAL = 'DATE_GREATER_THAN_EQUAL',
  DATE_LESS_THAN = 'DATE_LESS_THAN',
  DATE_LESS_THAN_EQUAL = 'DATE_LESS_THAN_EQUAL',
  DATE_BETWEEN = 'DATE_BETWEEN',
  DATE_RANGE = 'DATE_RANGE',
  // Numeric Range Operations
  BETWEEN = 'BETWEEN',
  NOT_BETWEEN = 'NOT_BETWEEN',
  // Special Operations
  FULL_TEXT_SEARCH = 'FULL_TEXT_SEARCH',
}

export type ColumnType = 'text' | 'date' | 'status' | 'number' | 'avatar' | 'custom';
export type FilterType = 'text' | 'number' | 'date' | 'dropdown';

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOperation?: FilterOperation; // Default operation for this column
  filterOptions?: { label: string; value: any }[]; // For dropdown type
  render?: (value: any, item: T) => ReactNode;
}

export interface ActionDef<T = any> {
  label: string;
  icon?: ReactNode | ((item: T) => ReactNode);
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showInMenu?: boolean;
  condition?: (item: T) => boolean;
}

export interface FilterState {
  [key: string]: any; // Simple key-value pairs
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
