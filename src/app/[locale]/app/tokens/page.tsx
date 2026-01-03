'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Zap, Coins, ArrowLeft, CheckCircle, Sparkles, CreditCard, Wallet } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { tokenPackageService, type TokenPackage, type TokenBalanceResponse } from '@/services/token-package.service';
import { toast } from 'sonner';
import { TokenPurchaseDialog } from '@/components/tokens/TokenPurchaseDialog';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function AppTokensPage() {
  const router = useRouter();
  const t = useTranslations('tokens');
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [balance, setBalance] = useState<TokenBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [packagesData, balanceData] = await Promise.all([
        tokenPackageService.getPackages(),
        tokenPackageService.getBalance().catch(() => null),
      ]);
      setPackages(packagesData);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error loading token data:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const openPurchaseDialog = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  const getFeaturedIndex = (pkgs: TokenPackage[]): number => {
    if (pkgs.length <= 1) return 0;
    if (pkgs.length === 2) return 1;
    return Math.floor(pkgs.length / 2);
  };

  const formatTokens = (tokens: number | null | undefined): string => {
    if (tokens === null || tokens === undefined) return '0';
    if (tokens === 2147483647) return '∞';
    return tokenPackageService.formatTokens(tokens);
  };

  const featuredIndex = getFeaturedIndex(packages);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGuard requireAuth={true} permissions={[]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-500" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/app">
            <Button variant="outline" size="sm">
              <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </Link>
        </div>

        {/* Token Balance Card */}
        {balance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('totalAvailable')}</p>
                    <p className="text-2xl font-bold text-green-600">{formatTokens(balance.totalAvailable)}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('totalDesc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('usedThisMonth')}</p>
                    <p className="text-2xl font-bold">{formatTokens(balance.monthlyUsed)}</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                    <Coins className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('usedDesc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('monthlyLimit')}</p>
                    <p className="text-2xl font-bold">{formatTokens(balance.monthlyLimit)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('monthlyLimitDesc')}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('walletBalance')}</p>
                    <p className="text-2xl font-bold text-amber-600">{formatTokens(balance.walletTokens)}</p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('walletDesc')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {packages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">{t('noPackages')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('noPackagesDesc')}
              </p>
              <Link href="/plans">
                <Button>
                  <Sparkles className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t('upgradeYourPlan')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Benefits Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t('instantActivation')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{t('neverExpire')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{t('securePayment')}</span>
              </div>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => {
                const isFeatured = index === featuredIndex;
                const formattedTokens = tokenPackageService.formatTokens(pkg.tokens);
                
                return (
                  <Card 
                    key={pkg.id} 
                    className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                      isFeatured 
                        ? 'border-amber-500 shadow-lg ring-2 ring-amber-500/20' 
                        : 'hover:border-primary/50'
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md">
                          <Sparkles className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                          {t('bestValue')}
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription className="text-xs">{pkg.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col items-center pt-2">
                      {/* Token Amount */}
                      <div className="text-center mb-3">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-primary">{formattedTokens}</span>
                          <span className="text-sm text-muted-foreground">{t('tokens')}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl font-bold">{pkg.price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">{pkg.currency}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tokenPackageService.getPricePerToken(pkg.price, pkg.tokens)} {t('perToken')}
                        </p>
                      </div>

                      {/* Purchase Button */}
                      <Button
                        className={`w-full mt-auto ${
                          isFeatured 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                            : ''
                        }`}
                        onClick={() => openPurchaseDialog(pkg)}
                      >
                        <Zap className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                        {t('buyNow')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upgrade Prompt */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold">{t('lookingForMore')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('upgradePrompt')}
                  </p>
                </div>
                <Link href="/plans">
                  <Button variant="outline">
                    <Sparkles className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {t('viewPlans')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        <TokenPurchaseDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          tokenPackage={selectedPackage} 
        />
      </div>
    </PermissionGuard>
  );
}
