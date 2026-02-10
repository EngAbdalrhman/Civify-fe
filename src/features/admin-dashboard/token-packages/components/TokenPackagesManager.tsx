"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Edit2, Trash2, AlertCircle, Coins } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/contexts/PermissionContext";
import { ADMIN_ACTION_PERMISSIONS } from "@/config/adminMenuConfig";
import {
  tokenPackageService,
  type TokenPackage,
} from "@/services/token-package.service";
import apiClient from "@/api/client";

// Token Package Admin API
const tokenPackageAdminApi = {
  getAll: async (): Promise<TokenPackage[]> => {
    const response = await apiClient.get<TokenPackage[]>(
      "/v1/tokens/packages/all",
    );
    return response.data;
  },
  create: async (data: Partial<TokenPackage>): Promise<TokenPackage> => {
    const response = await apiClient.post<TokenPackage>(
      "/v1/tokens/packages",
      data as unknown as object,
    );
    return response.data;
  },
  update: async (
    id: number,
    data: Partial<TokenPackage>,
  ): Promise<TokenPackage> => {
    const response = await apiClient.put<TokenPackage>(
      `/v1/tokens/packages/${id}`,
      data as unknown as object,
    );
    return response.data;
  },
  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/tokens/packages/${id}`);
  },
};

export function TokenPackagesManager() {
  const t = useTranslations("admin.billing");
  const tc = useTranslations("admin.common");
  const { hasPermission } = usePermissions();
  const canModifyTokens = hasPermission(
    ADMIN_ACTION_PERMISSIONS.TOKEN_PACKAGE_EDIT,
  );

  // Token packages state
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);
  const [editingTokenPackage, setEditingTokenPackage] =
    useState<TokenPackage | null>(null);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);

  // Token package form state
  const [tokenFormData, setTokenFormData] = useState({
    name: "",
    description: "",
    tokens: "",
    price: "",
    currency: "EGP",
  });

  // Fetch token packages
  const fetchTokenPackages = useCallback(async () => {
    setIsLoadingTokens(true);
    setTokensError(null);
    try {
      const data = await tokenPackageAdminApi.getAll();
      setTokenPackages(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch token packages";
      setTokensError(message);
    } finally {
      setIsLoadingTokens(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTokenPackages();
  }, [fetchTokenPackages]);

  // Token package handlers
  const handleCreateTokenPackage = () => {
    setEditingTokenPackage(null);
    setTokenFormData({
      name: "",
      description: "",
      tokens: "",
      price: "",
      currency: "EGP",
    });
    setIsTokenDialogOpen(true);
  };

  const handleEditTokenPackage = (pkg: TokenPackage) => {
    setEditingTokenPackage(pkg);
    setTokenFormData({
      name: pkg.name,
      description: pkg.description || "",
      tokens: pkg.tokens.toString(),
      price: pkg.price.toString(),
      currency: pkg.currency,
    });
    setIsTokenDialogOpen(true);
  };

  const handleSaveTokenPackage = async () => {
    setIsSavingToken(true);
    try {
      const data = {
        name: tokenFormData.name,
        description: tokenFormData.description,
        tokens: parseInt(tokenFormData.tokens),
        price: parseFloat(tokenFormData.price),
        currency: tokenFormData.currency,
      };

      if (editingTokenPackage) {
        await tokenPackageAdminApi.update(editingTokenPackage.id, data);
        toast.success("Token package updated");
      } else {
        await tokenPackageAdminApi.create(data);
        toast.success("Token package created");
      }
      setIsTokenDialogOpen(false);
      fetchTokenPackages();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save token package";
      toast.error(message);
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleDeactivateTokenPackage = async (pkg: TokenPackage) => {
    if (!confirm(`Are you sure you want to deactivate "${pkg.name}"?`)) return;

    try {
      await tokenPackageAdminApi.deactivate(pkg.id);
      toast.success("Token package deactivated");
      fetchTokenPackages();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to deactivate token package";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{t("tokensDesc")}</p>
        {canModifyTokens && (
          <Button onClick={handleCreateTokenPackage}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("createPackage")}
          </Button>
        )}
      </div>

      {isLoadingTokens ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tokensError ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">{tokensError}</p>
          <Button onClick={fetchTokenPackages}>Retry</Button>
        </div>
      ) : tokenPackages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Token Packages</h2>
            <p className="text-muted-foreground mb-4">
              Create your first token package to allow users to purchase extra
              tokens.
            </p>
            {canModifyTokens && (
              <Button onClick={handleCreateTokenPackage}>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {tokenPackages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  </div>
                  <Badge
                    variant={pkg.active ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {pkg.active ? tc("active") : tc("inactive")}
                  </Badge>
                </div>
                {pkg.description && (
                  <CardDescription>{pkg.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {tokenPackageService.formatTokens(pkg.tokens)} tokens
                    </div>
                    <div className="text-xl font-semibold">
                      {pkg.price.toFixed(2)} {pkg.currency}
                    </div>
                  </div>
                  {canModifyTokens && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditTokenPackage(pkg)}
                      >
                        <Edit2 className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                        {tc("edit")}
                      </Button>
                      {pkg.active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeactivateTokenPackage(pkg)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Package Edit/Create Dialog */}
      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTokenPackage
                ? "Edit Token Package"
                : "Create Token Package"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Package Name</Label>
              <Input
                id="tokenName"
                value={tokenFormData.name}
                onChange={(e) =>
                  setTokenFormData({ ...tokenFormData, name: e.target.value })
                }
                placeholder="e.g., Starter Pack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenDescription">Description</Label>
              <Input
                id="tokenDescription"
                value={tokenFormData.description}
                onChange={(e) =>
                  setTokenFormData({
                    ...tokenFormData,
                    description: e.target.value,
                  })
                }
                placeholder="e.g., Perfect for occasional users"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Token Amount</Label>
                <Input
                  id="tokenAmount"
                  type="number"
                  value={tokenFormData.tokens}
                  onChange={(e) =>
                    setTokenFormData({
                      ...tokenFormData,
                      tokens: e.target.value,
                    })
                  }
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenPrice">Price (EGP)</Label>
                <Input
                  id="tokenPrice"
                  type="number"
                  step="0.01"
                  value={tokenFormData.price}
                  onChange={(e) =>
                    setTokenFormData({
                      ...tokenFormData,
                      price: e.target.value,
                    })
                  }
                  placeholder="e.g., 49.99"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTokenDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTokenPackage} disabled={isSavingToken}>
              {isSavingToken && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTokenPackage ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
