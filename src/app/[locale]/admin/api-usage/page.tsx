"use client";

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';
import { Badge } from '@/components/ui/badge';

export default function ApiUsagePage() {
  const t = useTranslations('admin.apiUsage');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
  });

  // Columns
  const [metrics, setMetrics] = useState({
      totalApiCalls: 0,
      errors: 0
  });

  // Fetch stats on mount only
  useEffect(() => {
    const loadStats = async () => {
        try {
            const stats = await adminService.getStats('MONTHLY');
            setMetrics({
                totalApiCalls: stats.apiCallsThisMonth,
                errors: 0
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };
    loadStats();
  }, []); // Run once on mount

  const columns: ColumnDef<any>[] = useMemo(() => [
      {
          key: 'id',
          label: 'ID', // Keep ID
          sortable: true,
      },
      {
          key: 'user.email',
          label: 'User',
          render: (_, item) => (
             <div className="flex flex-col">
                 <span className="font-medium">{item.userEmail || 'System'}</span>
                 <span className="text-xs text-muted-foreground">{item.userId ? `#${item.userId}` : '-'}</span>
             </div>
          ),
          filterable: true,
          filterType: 'text',
          filterOperation: FilterOperation.MATCH
      },
      {
          key: 'apiKey.keyPreview',
          label: 'API Key',
          render: (_, item) => <span className="font-mono text-xs">{item.apiKey || '-'}</span>,
          sortable: true,
          filterable: true,
          filterType: 'text',
          filterOperation: FilterOperation.MATCH
      },
      {
          key: 'endpoint', // Changed from path to endpoint
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
          key: 'errorMessage',
          label: 'Error',
          render: (_, item) => (
            <span className="text-xs text-muted-foreground max-w-[200px] truncate block" title={item.errorMessage}>
                {item.errorMessage || '-'}
            </span>
          )
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

  // Load data when params change
  useEffect(() => {
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
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('monthlyApiCalls')}</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{metrics.totalApiCalls}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={data}
            columns={columns}
            mobilePrimaryColumns={['user.email', 'endpoint', 'statusCode', 'timestamp']}
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
