"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { apiKeyService } from "@/services/api-key.service";
import { toast } from "sonner";
import type { ApiKey } from "../types/api-keys.types";

export function useApiKeys() {
  const t = useTranslations("apiKeys");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiKeyService.getUserApiKeys();
      setKeys(data);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    setIsGenerating(true);

    try {
      const rawKey = await apiKeyService.createApiKey(newKeyName);
      setGeneratedKey(rawKey);
      // toast.success(t("generateSuccess"));
      await fetchApiKeys();
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to generate API key:", error);
      toast.error(t("generateError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("copied"));
  };

  const handleRevoke = async (id: number) => {
    if (!confirm(t("revokeConfirm"))) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(id);
      toast.success(t("revokeSuccess"));
      await fetchApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      toast.error(t("revokeError"));
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setGeneratedKey(null);
    setNewKeyName("");
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return {
    keys,
    isLoading,
    isGenerating,
    newKeyName,
    setNewKeyName,
    generatedKey,
    isDialogOpen,
    setIsDialogOpen,
    handleGenerateKey,
    handleCopy,
    handleRevoke,
    handleDialogClose,
    openDialog,
  };
}
