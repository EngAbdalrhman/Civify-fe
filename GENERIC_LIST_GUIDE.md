# Generic List Component Guide

## Overview
The `GenericList` component is a flexible, reusable table component built with shadcn/ui. It supports server-side filtering, sorting, pagination, configurable actions, and advanced column filtering with localization support.

## Usage

### Basic Example

```tsx
import { GenericList } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';

const columns: ColumnDef<User>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    type: 'text', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    filterOperation: FilterOperation.MATCH
  },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'status',
    filterable: true,
    filterType: 'dropdown',
    filterOperation: FilterOperation.EQUAL,
    filterOptions: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' }
    ]
  },
];

export default function UserList() {
  // ... state for data, filters, sort, page ...

  return (
    <GenericList
      data={data}
      columns={columns}
      meta={paginationMeta}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      locale="en" // or 'ar'
    />
  );
}
```

## Configuration

### Columns (`ColumnDef`)
| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Field key in the data object. |
| `label` | `string` | Header label. |
| `type` | `'text' \| 'date' \| 'status' \| 'number' \| 'avatar'` | Data type for formatting. |
| `sortable` | `boolean` | Enable sorting. |
| `filterable` | `boolean` | Enable filtering. |
| `filterType` | `'text' \| 'number' \| 'date' \| 'dropdown'` | Type of filter input to show. |
| `filterOperation` | `FilterOperation` | Default operation (e.g., `MATCH`, `EQUAL`). |
| `filterOptions` | `{ label: string, value: any }[]` | Options for `dropdown` filter type. |
| `render` | `(value, item) => ReactNode` | Custom render function. |

### Localization
The component supports smart localization. If you provide a `locale` prop (e.g., 'ar'), it will automatically look for localized fields.
- Example: If `key` is `name` and `locale` is `ar`, it tries to read `nameAr`. If not found, it falls back to `name`.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data items. |
| `columns` | `ColumnDef[]` | Column definitions. |
| `meta` | `PaginationState` | Pagination metadata. |
| `isLoading` | `boolean` | Show loading spinner. |
| `actions` | `ActionDef[]` | List of actions. |
| `locale` | `string` | Current locale code (default: 'en'). |
| `onFilterChange` | `(filters) => void` | Callback when filters change. |
| `onSortChange` | `(sort) => void` | Callback when sort changes. |
| `onPageChange` | `(page) => void` | Callback when page changes. |
| `onRefresh` | `() => void` | Callback for the refresh button. |
