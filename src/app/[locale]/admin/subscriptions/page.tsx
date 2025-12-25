"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const t = useTranslations('admin.subscriptions'); // You might need to add this namespace
  const common = useTranslations('common');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
  });

  const fetchData = async (page: number, size: number, filters: any = [], sorts: any = []) => {
      setLoading(true);
      try {
          const inputData = {
              page,
              size,
              filters,
              sorts // TODO: GenericList might pass filters as object, need conversion
          };
          // We need to use adminService.filterSubscriptions
          // But generically we need to build input model
           // Using helper if possible, or manual
           // GenericList's onFilterChange gives us FilterState
           // We need to convert FilterState to FilterCriteria[]
           
           // We'll rely on the handler to pass fully formed InputData if we use buildInputDataModel there.
           // But here we implement a simple loader.
           
           // Actually, let's implement the handler logic inside onFilterChange and just call service there
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };
  
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
          key: 'planName', // Changed from plan.name to flattened planName
          label: 'Plan',
          render: (_, item) => <Badge variant="outline">{item.planName}</Badge>
      },
      {
          key: 'status',
          label: 'Status',
          filterable: true,
          filterType: 'dropdown',
          filterOptions: [
              { label: 'Active', value: 'ACTIVE' },
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
          label: 'Start Date',
          render: (_, item) => new Date(item.startDate).toLocaleDateString()
      },
      {
          key: 'endDate',
          label: 'End Date',
           render: (_, item) => new Date(item.endDate).toLocaleDateString()
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
             // Use helper to build model
             // We need columns to know operations
             const model = buildInputDataModel(params.filters, columns, params.sort, params.page, params.size);
             const res = await adminService.filterSubscriptions(model);
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
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage user subscriptions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
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
            onRefresh={() => setParams(prev => ({ ...prev }))} // Trigger re-fetch
         />
      </div>
    </div>
  );
}
