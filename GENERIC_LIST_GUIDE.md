# Generic List Component Guide

## Overview
The `GenericList` component is a flexible, reusable table component built with shadcn/ui. It supports server-side filtering, sorting, pagination, and configurable actions.

## Usage

### Basic Example

```tsx
import { GenericList } from '@/components/generic-list/GenericList';
import { ColumnDef } from '@/components/generic-list/types';

const columns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', type: 'text', sortable: true, filterable: true },
  { key: 'status', label: 'Status', type: 'status' },
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
    />
  );
}
```

## Configuration

### Columns (`ColumnDef`)
| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Field key in the data object (supports dot notation e.g., `user.name`). |
| `label` | `string` | Header label. |
| `type` | `'text' \| 'date' \| 'status' \| 'number' \| 'avatar'` | Data type for formatting. |
| `sortable` | `boolean` | Enable sorting for this column. |
| `filterable` | `boolean` | Enable text filtering for this column. |
| `render` | `(value, item) => ReactNode` | Custom render function. |

### Actions (`ActionDef`)
| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Button label or tooltip. |
| `icon` | `ReactNode` | Icon component. |
| `onClick` | `(item) => void` | Click handler. |
| `variant` | `string` | Button variant (default, destructive, ghost, etc.). |
| `showInMenu` | `boolean` | If `true`, moves the action to the "..." dropdown menu. |

### Props
| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data items. |
| `columns` | `ColumnDef[]` | Column definitions. |
| `meta` | `PaginationState` | Pagination metadata (page, size, totalElements, totalPages). |
| `isLoading` | `boolean` | Show loading spinner. |
| `actions` | `ActionDef[]` | List of actions. |
| `onFilterChange` | `(filters) => void` | Callback when filters change. |
| `onSortChange` | `(sort) => void` | Callback when sort changes. |
| `onPageChange` | `(page) => void` | Callback when page changes. |
| `onRefresh` | `() => void` | Callback for the refresh button. |
