"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';
import { Badge } from '@/components/ui/badge';

export default function ApiUsagePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
  });

  // Columns
  const columns: ColumnDef<any>[] = useMemo(() => [
      {
          key: 'apiKey',
          label: 'API Key',
          sortable: true,
          filterable: true,
          filterType: 'text',
          filterOperation: FilterOperation.MATCH
      },
      {
        key: 'method',
        label: 'Method',
        render: (_, item) => <Badge variant="outline">{item.method}</Badge>,
        filterable: true,
        filterType: 'dropdown',
        filterOptions: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' }
        ],
        filterOperation: FilterOperation.EQUAL
      },
      {
          key: 'path',
          label: 'Endpoint',
          sortable: true,
          filterable: true,
          filterType: 'text',
          filterOperation: FilterOperation.MATCH
      },
      {
          key: 'statusCode',
          label: 'Status',
          render: (_, item) => (
             <Badge variant={item.statusCode >= 200 && item.statusCode < 300 ? 'default' : 'destructive'}>
                 {item.statusCode}
             </Badge>
          ),
          sortable: true,
          filterable: true,
          filterType: 'number',
          filterOperation: FilterOperation.EQUAL
      },
      {
          key: 'responseTimeMs',
          label: 'Duration (ms)',
          sortable: true
      },
      {
          key: 'timestamp',
          label: 'Time',
          render: (_, item) => new Date(item.timestamp).toLocaleString(),
          sortable: true
      },
      {
          key: 'ipAddress',
          label: 'IP Address'
      }
  ], []);

  // State for GenericList interaction
  const [params, setParams] = useState({
      page: 0,
      size: 10,
      filters: {} as any,
      sort: null as any
  });

  // Effect to load data when params change
  useMemo(() => {
     const load = async () => {
         setLoading(true);
         try {
             const model = buildInputDataModel(params.filters, columns, params.sort, params.page, params.size);
             const res = await adminService.filterApiLogs(model);
             setData(res.content);
             setPagination({
                 page: res.page,
                 size: res.size,
                 totalElements: res.totalElements,
                 totalPages: res.totalPages
             });
         } catch(e) { console.error(e); }
         finally { setLoading(false); }
     };
     load();
  }, [params, columns]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Logs</h1>
          <p className="text-muted-foreground">Monitor system API usage</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={data}
            columns={columns}
            meta={pagination}
            isLoading={loading}
            onFilterChange={(filters) => setParams(prev => ({ ...prev, filters, page: 0 }))}
            onSortChange={(sort) => setParams(prev => ({ ...prev, sort }))}
            onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
            onRefresh={() => setParams(prev => ({ ...prev }))}
         />
      </div>
    </div>
  );
}
