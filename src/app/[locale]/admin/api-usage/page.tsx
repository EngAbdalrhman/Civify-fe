'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { adminService, AdminStats } from '@/services/admin.service';
import { apiUsageService, ApiUsageLog } from '@/services/api-usage.service';
import { format } from 'date-fns';

export default function ApiUsagePage() {
  const t = useTranslations('admin.apiUsage');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<ApiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, logsResponse] = await Promise.all([
        adminService.getStats('MONTHLY'),
        apiUsageService.getAdminLogs({ page, size: 20 })
      ]);
      setStats(statsData);
      setLogs(logsResponse.content);
      setTotalPages(logsResponse.totalPages);
    } catch (error) {
      console.error('Failed to fetch API usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">Monitor API consumption and system activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6 shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Total API Calls (All Time)</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalApiCalls?.toLocaleString() ?? '-'}</p>
        </div>
        <div className="rounded-lg border p-6 shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">API Calls (This Month)</h3>
          <p className="text-3xl font-bold mt-2">{stats?.apiCallsThisMonth?.toLocaleString() ?? '-'}</p>
        </div>
        <div className="rounded-lg border p-6 shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
          <p className="text-3xl font-bold mt-2">{stats?.activeSubscriptions?.toLocaleString() ?? '-'}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border shadow-sm bg-card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent API Access Logs</h3>
            <button 
              onClick={() => fetchData()} 
              className="text-sm text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="p-3 font-medium">
                      {log.userEmail || <span className="text-muted-foreground italic">Anonymous</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        log.method === 'POST' ? 'bg-green-100 text-green-700' :
                        log.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{log.endpoint}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages || 1}
            </span>
            <div className="space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
