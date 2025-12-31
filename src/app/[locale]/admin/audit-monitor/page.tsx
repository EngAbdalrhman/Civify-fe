'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileSearch, Users, CreditCard, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericList } from '@/components/generic-list/GenericList';
import type { ColumnDef, FilterState, SortState, InputDataModel, FilterOperation } from '@/components/generic-list/types';
import { adminService, type AuditLog } from '@/services/admin.service';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Define columns for audit logs
const auditColumns: ColumnDef<AuditLog>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
  },
  {
    key: 'entityType',
    label: 'Entity',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
  {
    key: 'entityId',
    label: 'Entity ID',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
  {
    key: 'action',
    label: 'Action',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Create', value: 'CREATE' },
      { label: 'Update', value: 'UPDATE' },
      { label: 'Delete', value: 'DELETE' },
    ],
    render: (value) => {
      const action = value as string;
      const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        CREATE: 'default',
        INSERT: 'default',
        UPDATE: 'secondary',
        DELETE: 'destructive',
      };
      return <Badge variant={variants[action] || 'outline'}>{action}</Badge>;
    },
  },
  {
    key: 'performedBy',
    label: 'By',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
  {
    key: 'performedAt',
    label: 'Date',
    sortable: true,
    render: (value) => {
      if (!value) return '-';
      return format(new Date(value as string), 'MMM dd, yyyy HH:mm');
    },
  },
  {
    key: 'comment',
    label: 'Comment',
    sortable: false,
    render: (value) => {
      const comment = value as string;
      if (!comment) return '-';
      return comment.length > 40 ? `${comment.substring(0, 40)}...` : comment;
    },
  },
];

// Helper to build InputDataModel
function buildInputDataModel(
  filters: FilterState,
  sort: SortState,
  page: number,
  size: number,
  columns: ColumnDef<AuditLog>[]
): InputDataModel {
  const filterItems = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const column = columns.find(c => c.key === key);
      return {
        fieldName: key,
        operation: (column?.filterOperation || 'LIKE') as FilterOperation,
        value: value as string | number | boolean | null,
      };
    });

  return {
    filters: filterItems,
    sorts: sort.field ? [{ fieldName: sort.field, direction: sort.direction }] : [{ fieldName: 'performedAt', direction: 'DESC' }],
    page,
    size,
  };
}

// Value viewer dialog
interface ValueViewerProps {
  title: string;
  value: Record<string, unknown> | null | undefined;
  open: boolean;
  onClose: () => void;
}

function ValueViewer({ title, value, open, onClose }: ValueViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
          {value ? JSON.stringify(value, null, 2) : 'No data'}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

// Tab content component
interface AuditTabContentProps {
  entityTypes: string[];
  useAllEndpoint?: boolean;
}

function AuditTabContent({ entityTypes, useAllEndpoint = false }: AuditTabContentProps) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentSort, setCurrentSort] = useState<SortState>({ field: 'performedAt', direction: 'DESC' });
  const [currentPage, setCurrentPage] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerValue, setViewerValue] = useState<Record<string, unknown> | null>(null);
  const pageSize = 10;

  const fetchData = useCallback(async (
    filters: FilterState,
    sort: SortState,
    page: number
  ) => {
    setIsLoading(true);
    try {
      const inputData = buildInputDataModel(filters, sort, page, pageSize, auditColumns);
      
      let response;
      if (useAllEndpoint) {
        response = await adminService.getAllAuditLogs(inputData);
      } else {
        // For specific entity types, use the search endpoint with entity type filter
        const entityType = entityTypes[0];
        response = await adminService.getAuditLogsByType(entityType, inputData);
      }
      
      setData(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [entityTypes, useAllEndpoint]);

  // Initial fetch
  useEffect(() => {
    fetchData(currentFilters, currentSort, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(0);
    fetchData(filters, currentSort, 0);
  }, [fetchData, currentSort]);

  const handleSortChange = useCallback((sort: SortState) => {
    setCurrentSort(sort);
    setCurrentPage(0);
    fetchData(currentFilters, sort, 0);
  }, [fetchData, currentFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(currentFilters, currentSort, page);
  }, [fetchData, currentSort, currentFilters]);

  const viewOldValue = (log: AuditLog) => {
    setViewerTitle(`Old Value - ${log.entityType} #${log.entityId}`);
    setViewerValue(log.oldValue || null);
    setViewerOpen(true);
  };

  const viewNewValue = (log: AuditLog) => {
    setViewerTitle(`New Value - ${log.entityType} #${log.entityId}`);
    setViewerValue(log.newValue || null);
    setViewerOpen(true);
  };

  const viewChanges = (log: AuditLog) => {
    setViewerTitle(`Changes - ${log.entityType} #${log.entityId}`);
    setViewerValue(log.changes || null);
    setViewerOpen(true);
  };

  // Extended columns with actions
  const columnsWithActions: ColumnDef<AuditLog>[] = [
    ...auditColumns,
    {
      key: 'values',
      label: 'Values',
      render: (_, item) => (
        <div className="flex gap-1">
          {item.oldValue && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => viewOldValue(item)}>
              Old
            </Button>
          )}
          {item.newValue && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => viewNewValue(item)}>
              New
            </Button>
          )}
          {item.changes && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary" onClick={() => viewChanges(item)}>
              Diff
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <GenericList<AuditLog>
        data={data}
        columns={columnsWithActions}
        isLoading={isLoading}
        meta={{
          page: currentPage,
          size: pageSize,
          totalElements,
          totalPages: Math.ceil(totalElements / pageSize),
        }}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        defaultSort={currentSort}
        emptyMessage="No audit logs found"
      />
      <ValueViewer
        title={viewerTitle}
        value={viewerValue}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

// CV Log Tab Content
interface CvLogTabContentProps {
  // empty props for now
}

const cvLogColumns: ColumnDef<any>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
  },
  {
    key: 'action',
    label: 'Action',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Upload', value: 'UPLOAD' },
      { label: 'Parse', value: 'PARSE' },
      { label: 'Tailor', value: 'TAILOR' },
      { label: 'Mask', value: 'MASK' },
    ],
    render: (value) => {
      const action = value as string;
      const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        UPLOAD: 'default',
        PARSE: 'secondary',
        TAILOR: 'default',
        MASK: 'outline',
      };
      return <Badge variant={variants[action] || 'outline'}>{action}</Badge>;
    },
  },
  {
    key: 'source',
    label: 'Source',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'UI', value: 'INTERNAL' },
      { label: 'API', value: 'EXTERNAL_API' },
    ],
  },
  {
    key: 'success',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Success', value: 'true' },
      { label: 'Failed', value: 'false' },
    ],
    render: (value) => (
      <Badge variant={value ? 'default' : 'destructive'}>
        {value ? 'Success' : 'Failed'}
      </Badge>
    ),
  },
  {
    key: 'user.email', // Dot notation for generic filter
    label: 'User',
    sortable: false,
    filterable: true,
    filterType: 'text',
    render: (_, item) => item.user?.email || 'Guest',
  },
  {
    key: 'processingTimeMs',
    label: 'Time (ms)',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    render: (value) => format(new Date(value as string), 'MMM dd, HH:mm:ss'),
  },
];

function CvLogTabContent() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentSort, setCurrentSort] = useState<SortState>({ field: 'createdAt', direction: 'DESC' });
  const [currentPage, setCurrentPage] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({});
  const pageSize = 10;

  const fetchData = useCallback(async (
    filters: FilterState,
    sort: SortState,
    page: number
  ) => {
    setIsLoading(true);
    try {
      const inputData = buildInputDataModel(filters, sort, page, pageSize, cvLogColumns);
      const response = await adminService.getCvLogs(inputData);
      
      setData(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch CV logs';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(currentFilters, currentSort, 0);
  }, []);

  const handleFilterChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(0);
    fetchData(filters, currentSort, 0);
  }, [fetchData, currentSort]);

  const handleSortChange = useCallback((sort: SortState) => {
    setCurrentSort(sort);
    setCurrentPage(0);
    fetchData(currentFilters, sort, 0);
  }, [fetchData, currentFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(currentFilters, currentSort, page);
  }, [fetchData, currentSort, currentFilters]);

  return (
    <GenericList
      data={data as any}
      columns={cvLogColumns}
      isLoading={isLoading}
      meta={{
        page: currentPage,
        size: pageSize,
        totalElements,
        totalPages: Math.ceil(totalElements / pageSize),
      }}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      defaultSort={currentSort}
      emptyMessage="No CV logs found"
    />
  );
}

export default function AuditMonitorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileSearch className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Audit Monitor</h1>
          <p className="text-muted-foreground">View and search system audit logs</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="promos" className="gap-2">
            <Settings className="h-4 w-4" />
            Promos
          </TabsTrigger>
          <TabsTrigger value="cv-logs" className="gap-2">
            <FileSearch className="h-4 w-4" />
            CV Logs
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileSearch className="h-4 w-4" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">Logs for User entity changes</p>
            <AuditTabContent entityTypes={['User']} />
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Management Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">Logs for SubscriptionPlan entity changes</p>
            <AuditTabContent entityTypes={['SubscriptionPlan']} />
          </div>
        </TabsContent>

        <TabsContent value="promos" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Promo Code Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">Logs for PromoCode entity changes</p>
            <AuditTabContent entityTypes={['PromoCode']} />
          </div>
        </TabsContent>

        <TabsContent value="cv-logs" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">CV Operation Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">Logs for CV parsing, tailoring, and masking</p>
            <CvLogTabContent />
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">All System Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">All audit logs from the system</p>
            <AuditTabContent entityTypes={[]} useAllEndpoint={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
