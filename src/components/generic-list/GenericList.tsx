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
import { Input } from '@/components/ui/input';
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
}: GenericListProps<T>) {
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value) {
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
      // If sort is cleared, you might want to notify with a default or empty sort
      // For now, we'll just pass a default or handle it in the parent
      onSortChange?.({ field: '', direction: 'ASC' }); // Or handle clearing differently
    }
  };

  const handleReset = () => {
    setFilters({});
    setSort(null);
    onFilterChange?.({});
    onSortChange?.({ field: '', direction: 'ASC' });
  };

  const getNestedValue = (obj: any, key: string) => {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  };

  const formatValue = (item: T, column: ColumnDef<T>) => {
    if (column.render) {
      return column.render(getNestedValue(item, column.key), item);
    }

    const value = getNestedValue(item, column.key);

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
              'px-2 py-1 rounded-full text-xs font-medium',
              String(value).toLowerCase().includes('active') ||
                String(value).toLowerCase().includes('verified')
                ? 'bg-green-100 text-green-800'
                : String(value).toLowerCase().includes('inactive') ||
                  String(value).toLowerCase().includes('deleted')
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
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
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      default:
        return String(value);
    }
  };

  const directActions = actions.filter((a) => !a.showInMenu);
  const menuActions = actions.filter((a) => a.showInMenu);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  <div className="flex flex-col gap-2 py-2">
                    <div
                      className={cn(
                        'flex items-center gap-1 cursor-pointer select-none',
                        column.sortable && 'hover:text-primary'
                      )}
                      onClick={() => column.sortable && handleSortChange(column.key)}
                    >
                      {column.label}
                      {column.sortable && (
                        <span className="text-muted-foreground">
                          {sort?.field === column.key ? (
                            sort.direction === 'ASC' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                    {column.filterable && (
                      <Input
                        placeholder={`Filter ${column.label}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) =>
                          handleFilterChange(column.key, e.target.value)
                        }
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {formatValue(item, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {directActions.map((action, i) => (
                          <Button
                            key={i}
                            variant={action.variant || 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => action.onClick(item)}
                            title={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))}
                        {menuActions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {menuActions.map((action, i) => (
                                <DropdownMenuItem
                                  key={i}
                                  onClick={() => action.onClick(item)}
                                >
                                  {action.icon && (
                                    <span className="mr-2 w-4 h-4 flex items-center justify-center">
                                      {action.icon}
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
            Showing {meta.page * meta.size + 1} to{' '}
            {Math.min((meta.page + 1) * meta.size, meta.totalElements)} of{' '}
            {meta.totalElements} entries
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
            <div className="text-sm font-medium">
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
