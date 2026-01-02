"use client";

import * as React from 'react';
import type { ColumnDef, FilterType } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ColumnFilterProps {
  column: { 
    key: string; 
    label: string; 
    filterType?: FilterType;
    filterOptions?: { label: string; value: string | number | boolean }[];
  };
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null | undefined) => void;
}

export function ColumnFilter({ column, value, onChange }: ColumnFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localValue, setLocalValue] = React.useState<string | number | boolean | null | undefined>(value);

  // Sync local value when prop changes or popover opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
    }
  }, [isOpen, value]);

  const handleApply = () => {
    onChange(localValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalValue(undefined);
    onChange(undefined);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const isActive = value !== undefined && value !== '' && value !== null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0 hover:bg-muted',
            isActive && 'text-primary bg-primary/10 hover:bg-primary/20'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter {column.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filter {column.label}</h4>
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid gap-2">
            {(column.filterType === 'dropdown' || column.filterType === 'select') && column.filterOptions ? (
              <Select
                value={localValue ? String(localValue) : undefined}
                onValueChange={setLocalValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {column.filterOptions.map((option) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : column.filterType === 'date' ? (
              <div className="flex flex-col gap-2">
                <Calendar
                  mode="single"
                  selected={localValue ? new Date(String(localValue)) : undefined}
                  onSelect={(date) =>
                    setLocalValue(date ? format(date, 'yyyy-MM-dd') : undefined)
                  }
                />
              </div>
            ) : column.filterType === 'number' ? (
              <Input
                type="number"
                placeholder={`Filter ${column.label}...`}
                value={localValue !== undefined && localValue !== null ? String(localValue) : ''}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            ) : (
              // Default to text
              <Input
                placeholder={`Filter ${column.label}...`}
                value={localValue !== undefined && localValue !== null ? String(localValue) : ''}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
          
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleApply}>
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
