"use client";

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { adminService, BillingTransaction } from '@/services/admin.service';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';
import { Badge } from '@/components/ui/badge';
import { Copy, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const tc = useTranslations('admin.common');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BillingTransaction[]>([]);
  const [pagination, setPagination] = useState({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
  });

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Columns
  const columns: ColumnDef<BillingTransaction>[] = useMemo(() => [
      {
          key: 'id',
          label: 'ID',
          sortable: true,
      },
      {
          key: 'userId',
          label: 'User ID',
          sortable: true,
          filterable: true,
          filterType: 'number',
          filterOperation: FilterOperation.EQUAL
      },
      {
          key: 'type',
          label: 'Type',
          sortable: true,
          filterable: true,
          filterType: 'dropdown',
          filterOptions: [
              { label: 'Subscription', value: 'SUBSCRIPTION' },
              { label: 'Token Top-up', value: 'TOKEN_TOPUP' },
              { label: 'Renewal', value: 'RENEWAL' },
              { label: 'Refund', value: 'REFUND' }
          ],
          filterOperation: FilterOperation.EQUAL,
          render: (_, item) => {
              const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                  SUBSCRIPTION: "default",
                  TOKEN_TOPUP: "secondary",
                  RENEWAL: "default",
                  REFUND: "destructive",
              };
              return <Badge variant={variants[item.type] || "outline"}>{item.type}</Badge>;
          }
      },
      {
          key: 'status',
          label: 'Status',
          sortable: true,
          filterable: true,
          filterType: 'dropdown',
          filterOptions: [
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Refunded', value: 'REFUNDED' }
          ],
          filterOperation: FilterOperation.EQUAL,
          render: (_, item) => {
              const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                  COMPLETED: "default",
                  PENDING: "secondary",
                  FAILED: "destructive",
                  REFUNDED: "destructive",
              };
              return <Badge variant={variants[item.status] || "outline"}>{item.status}</Badge>;
          }
      },
      {
          key: 'amount',
          label: 'Amount',
          sortable: true,
          render: (_, item) => `${item.amount} ${item.currency}`
      },
      {
          key: 'gateway',
          label: 'Gateway',
          sortable: true,
          filterable: true,
          filterType: 'text',
          filterOperation: FilterOperation.EQUAL
      },
      {
          key: 'orderId',
          label: 'Order ID',
          sortable: true,
          render: (_, item) => {
              if (!item.orderId) return "-";
              return (
                  <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs hover:bg-muted"
                      title="Click to copy full Order ID"
                      onClick={() => copyToClipboard(item.orderId)}
                  >
                      <span>{item.orderId.substring(0, 8)}...</span>
                      <Copy className="h-3 w-3" />
                  </button>
              );
          }
      },
      {
          key: 'createdAt',
          label: 'Date',
          sortable: true,
          render: (_, item) => new Date(item.createdAt).toLocaleString()
      }
  ], []);

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
          columns as any,
          params.sort,
          params.page,
          params.size,
        );
        const res = await adminService.filterBillingTransactions(model);
        setData(res.content);
        setPagination({
          page: res.page,
          size: res.size,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params, columns]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Billing Transactions</h1>
          <p className="text-muted-foreground">Manage subscriptions and token purchases</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={data}
            columns={columns as any}
            mobilePrimaryColumns={['userId', 'type', 'status', 'amount']}
            meta={pagination}
            isLoading={loading}
            onFilterChange={(filters) => setParams(prev => ({ ...prev, filters, page: 0 }))}
            onSortChange={(sort) => setParams(prev => ({ ...prev, sort }))}
            onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
            onRefresh={() => setParams(prev => ({ ...prev }))}
            emptyMessage="No billing transactions found"
         />
      </div>
    </div>
  );
}
