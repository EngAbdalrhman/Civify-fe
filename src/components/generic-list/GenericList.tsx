import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ColumnDef, ActionDef, FilterState, SortState, PaginationState } from './types';
import { cn } from '@/lib/utils';
import { ColumnFilter } from './ColumnFilter';

interface GenericListProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  meta?: PaginationState;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: ActionDef<T>[];
  onFilterChange?: (filters: FilterState) => void;
  onSortChange?: (sort: SortState) => void;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  locale?: string; // e.g., 'en', 'ar'
  defaultSort?: SortState;
}

export function GenericList<T extends { id?: string | number } = any>({
  data,
  columns,
  meta,
  isLoading = false,
  emptyMessage = 'No data available',
  actions = [],
  onFilterChange,
  onSortChange,
  onPageChange,
  onRefresh,
  locale = 'en',
  defaultSort,
}: GenericListProps<T>) {
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState | null>(defaultSort || null);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value !== undefined && value !== '' && value !== null) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (key: string) => {
    let newSort: SortState | null = null;
    if (sort?.field === key) {
      if (sort.direction === 'ASC') {
        newSort = { field: key, direction: 'DESC' };
      } else {
        newSort = null; // Toggle off
      }
    } else {
      newSort = { field: key, direction: 'ASC' };
    }
    setSort(newSort);
    if (newSort) {
      onSortChange?.(newSort);
    } else {
      // If toggled off, revert to default sort if exists, or empty
      if (defaultSort) {
        setSort(defaultSort);
        onSortChange?.(defaultSort);
      } else {
        onSortChange?.({ field: '', direction: 'ASC' });
      }
    }
  };

  const handleReset = () => {
    setFilters({});
    if (defaultSort) {
      setSort(defaultSort);
      onFilterChange?.({});
      onSortChange?.(defaultSort);
    } else {
      setSort(null);
      onFilterChange?.({});
      onSortChange?.({ field: '', direction: 'ASC' });
    }
  };

  const getNestedValue = (obj: any, key: string) => {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  };

  const getLocalizedValue = (item: T, key: string) => {
    // Try to find localized key first
    // e.g., if key is 'name' and locale is 'ar', try 'nameAr'
    // if key is 'category.name', try 'category.nameAr'
    
    const parts = key.split('.');
    const lastPart = parts.pop();
    if (!lastPart) return getNestedValue(item, key);

    const localizedKey = `${lastPart}${locale.charAt(0).toUpperCase() + locale.slice(1)}`;
    const localizedPath = [...parts, localizedKey].join('.');
    
    const localizedValue = getNestedValue(item, localizedPath);
    
    if (localizedValue !== undefined && localizedValue !== null) {
      return localizedValue;
    }

    return getNestedValue(item, key);
  };

  const formatValue = (item: T, column: ColumnDef<T>) => {
    if (column.render) {
      return column.render(getLocalizedValue(item, column.key), item);
    }

    const value = getLocalizedValue(item, column.key);

    if (value === null || value === undefined) {
      return '-';
    }

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'status':
        return (
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-medium border',
              String(value).toLowerCase().includes('active') ||
                String(value).toLowerCase().includes('verified')
                ? 'bg-green-50 text-green-700 border-green-200'
                : String(value).toLowerCase().includes('inactive') ||
                  String(value).toLowerCase().includes('deleted')
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            )}
          >
            {String(value)}
          </span>
        );
      case 'avatar':
        return (
          <img
            src={String(value)}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        );
      default:
        return String(value);
    }
  };

  const directActions = actions.filter((a) => !a.showInMenu);
  const menuActions = actions.filter((a) => a.showInMenu);

  return (
    <div className="space-y-4 p-1">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleReset} className="h-8">
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Reset Filters
        </Button>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className="h-12">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={cn(
                        'flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors',
                        !column.sortable && 'cursor-default'
                      )}
                      onClick={() => column.sortable && handleSortChange(column.key)}
                    >
                      {column.label}
                      {column.sortable && (
                        <span className="text-muted-foreground/70">
                          {sort?.field === column.key ? (
                            sort.direction === 'ASC' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                    {column.filterable && (
                      <ColumnFilter
                        column={column}
                        value={filters[column.key]}
                        onChange={(val) => handleFilterChange(column.key, val)}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="w-[100px] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow 
                  key={item.id || index}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-3">
                      {formatValue(item, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {directActions
                          .filter(action => !action.condition || action.condition(item))
                          .map((action, i) => (
                          <Button
                            key={i}
                            variant={action.variant || 'ghost'}
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => action.onClick(item)}
                            title={action.label}
                          >
                            {typeof action.icon === 'function' ? action.icon(item) : action.icon}
                          </Button>
                        ))}
                        {menuActions.some(action => !action.condition || action.condition(item)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {menuActions
                                .filter(action => !action.condition || action.condition(item))
                                .map((action, i) => (
                                <DropdownMenuItem
                                  key={i}
                                  onClick={() => action.onClick(item)}
                                  className={cn(
                                    "cursor-pointer",
                                    action.variant === 'destructive' && "text-red-600 focus:text-red-600 focus:bg-red-50"
                                  )}
                                >
                                  {action.icon && (
                                    <span className="mr-2 w-4 h-4 flex items-center justify-center">
                                      {typeof action.icon === 'function' ? action.icon(item) : action.icon}
                                    </span>
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{meta.page * meta.size + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min((meta.page + 1) * meta.size, meta.totalElements)}</span> of{' '}
            <span className="font-medium text-foreground">{meta.totalElements}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(0)}
              disabled={meta.page === 0 || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-2">
              Page {meta.page + 1} of {meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages - 1 || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(meta.totalPages - 1)}
              disabled={meta.page >= meta.totalPages - 1 || isLoading}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
