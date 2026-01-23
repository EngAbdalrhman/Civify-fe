'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { billingService, Invoice } from '@/services/billing.service';
import { paymentService } from '@/services/payment.service';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>('paymob');
  const [selectedMethod, setSelectedMethod] = useState<string>('CARD');
  const [isPaying, setIsPaying] = useState(false);
  const [enabledGateways, setEnabledGateways] = useState<string[]>([]);

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
    fetchGateways();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await billingService.getInvoices();
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchGateways = async () => {
    try {
      const gateways = await paymentService.getEnabledGateways();
      setEnabledGateways(gateways);
      if (gateways.length > 0) {
        setSelectedGateway(gateways[0]);
      }
    } catch {
      // Use default
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInvoices();
  };

  const handlePayInvoice = async () => {
    if (!selectedInvoice) return;
    
    setIsPaying(true);
    try {
      const result = await billingService.payInvoice(
        selectedInvoice.uuid,
        selectedGateway,
        selectedMethod
      );
      
      if (result.paymentUrl) {
        // Redirect to payment page
        window.location.href = result.paymentUrl;
      } else {
        toast.error('No payment URL received');
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setIsPaying(false);
      setShowPayDialog(false);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EGP',
    }).format(amount);
  };

  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING');
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');

  return (
    <PermissionGuard requireAuth={true} permissions={[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
            <p className="text-muted-foreground">
              Manage your subscription, view invoices, and payment history.
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Due Invoices Alert */}
        {pendingInvoices.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                You have {pendingInvoices.length} pending invoice{pendingInvoices.length > 1 ? 's' : ''}
              </CardTitle>
              <CardDescription>
                Pay now to continue enjoying your subscription benefits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-background rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatAmount(invoice.finalAmount, invoice.currency)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowPayDialog(true);
                        }}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{paidInvoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingInvoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Invoice History
            </CardTitle>
            <CardDescription>
              A complete history of all your invoices and payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.planName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {invoice.billingType === 'INITIAL' ? 'New' : 'Renewal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatAmount(invoice.finalAmount, invoice.currency)}
                            </p>
                            {invoice.discountAmount && invoice.discountAmount > 0 && (
                              <p className="text-xs text-green-500">
                                -{formatAmount(invoice.discountAmount, invoice.currency)} discount
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div>
                            <p>{formatDate(invoice.createdAt)}</p>
                            {invoice.paidAt && (
                              <p className="text-xs text-muted-foreground">
                                Paid: {formatDate(invoice.paidAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowPayDialog(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay
                            </Button>
                          ) : invoice.paymentUrl ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(invoice.paymentUrl!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pay Invoice Dialog */}
        <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Invoice</DialogTitle>
              <DialogDescription>
                Choose your payment method to complete the payment.
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">{selectedInvoice.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">
                      {formatAmount(selectedInvoice.finalAmount, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Gateway</label>
                    <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {enabledGateways.map((gw) => (
                          <SelectItem key={gw} value={gw}>
                            {gw.charAt(0).toUpperCase() + gw.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                        <SelectItem value="WALLET">Mobile Wallet</SelectItem>
                        {selectedGateway === 'paymob' && (
                          <SelectItem value="FAWRY">Fawry</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayInvoice} disabled={isPaying}>
                {isPaying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Proceed to Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
