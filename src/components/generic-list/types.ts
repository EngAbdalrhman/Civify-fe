import { ReactNode } from 'react';

export enum FilterOperation {
  // Comparison Operations
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN_EQUAL = 'lte',
  NOT_EQUAL = 'not_equal',
  EQUAL = 'equal',
  // String Operations
  MATCH = 'match',
  MATCH_START = 'match_start',
  MATCH_END = 'match_end',
  MATCH_EXACT = 'match_exact',
  MATCH_REGEX = 'match_regex',
  // Collection Operations
  IN_LONG_LIST = 'in_Long_List',
  NOT_IN_LONG_LIST = 'not_in_Long_List',
  IN_STRING_LIST = 'in_String_List',
  NOT_IN_STRING_LIST = 'not_in_String_List',
  IN_INTEGER_LIST = 'in_Integer_List',
  NOT_IN_INTEGER_LIST = 'not_in_Integer_List',
  // Null Operations
  IS_NOT_NULL = 'is_not_null',
  IS_NULL = 'is_null',
  // Date Operations
  DAY_EQUAL = 'day_equal',
  DATE_GREATER_THAN = 'date_gt',
  DATE_GREATER_THAN_EQUAL = 'date_gte',
  DATE_LESS_THAN = 'date_lt',
  DATE_LESS_THAN_EQUAL = 'date_lte',
  DATE_BETWEEN = 'date_between',
  DATE_RANGE = 'date_range',
  // Numeric Range Operations
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',
  // Special Operations
  FULL_TEXT_SEARCH = 'full_text_search',
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
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showInMenu?: boolean;
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
