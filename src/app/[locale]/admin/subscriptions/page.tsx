"use client";

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Shield } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const t = useTranslations('admin.subscriptions');
  const tc = useTranslations('admin.common');
  
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
          key: 'id',
          label: 'ID',
          sortable: true,
          filterable: true,
          filterType: 'number',
          filterOperation: FilterOperation.EQUAL
      },
      {
          key: 'userEmail', // Changed from user.email to userEmail based on flattened interface
          label: 'User',
          render: (_, item) => (
              <div className="flex flex-col">
                  <span className="font-medium">{item.userName}</span>
                  <span className="text-xs text-muted-foreground">{item.userEmail}</span>
              </div>
          )
      },
      {
          key: 'planName',
          label: t('plan'),
          render: (_, item) => <Badge variant="outline">{item.planName}</Badge>
      },
      {
          key: 'status',
          label: t('status'),
          filterable: true,
          filterType: 'dropdown',
          filterOptions: [
              { label: tc('active'), value: 'ACTIVE' },
              { label: 'Expired', value: 'EXPIRED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Pending', value: 'PENDING' }
          ],
          filterOperation: FilterOperation.EQUAL,
          render: (_, item) => (
              <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {item.status}
              </Badge>
          )
      },
      {
          key: 'startDate',
          label: t('startDate'),
          render: (_, item) => new Date(item.startDate).toLocaleDateString()
      },
      {
          key: 'endDate',
          label: t('endDate'),
           render: (_, item) => new Date(item.endDate).toLocaleDateString()
      }
  ], [t, tc]);

  // State for GenericList interaction
  const [params, setParams] = useState({
      page: 0,
      size: 10,
      filters: {} as any,
      sort: null as any
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const model = buildInputDataModel(
          params.filters,
          columns,
          params.sort,
          params.page,
          params.size,
        );
        const res = await adminService.filterSubscriptions(model);
        setData(res.content);
        setPagination({
          page: res.page,
          size: res.size,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params, columns]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Metrics Cards - Simplified or Loaded from Stats */}
      {/* Note: metrics was undefined. We removed the explicit metrics reference until we implement a proper stats fetch for this page or pass it in. 
          For now, we will hide the specific metrics card to prevent crashes, as the main Stats page handles this data better.
          If needed, we can re-introduce it by fetching adminService.getStats() in useEffect.
       */}

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={data}
            columns={columns}
            meta={pagination}
            isLoading={loading}
            onFilterChange={(filters) => setParams(prev => ({ ...prev, filters, page: 0 }))}
            onSortChange={(sort) => setParams(prev => ({ ...prev, sort }))}
            onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
            onRefresh={() => setParams(prev => ({ ...prev }))} // Trigger re-fetch
         />
      </div>
    </div>
  );
}
