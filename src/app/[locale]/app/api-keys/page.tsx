"use client";

import { useMemo } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useApiKeys } from "@/features/api-keys/hooks/useApiKeys";
import { ApiKeysHeader } from "@/features/api-keys/components/ApiKeysHeader";
import { ApiKeysToolbar } from "@/features/api-keys/components/ApiKeysToolbar";
import { CreateKeyDialog } from "@/features/api-keys/components/CreateKeyDialog";
import { ApiKeysListCard } from "@/features/api-keys/components/ApiKeysListCard";
import { TourWelcomePrompt, getApiKeysTourSteps } from "@/features/onboarding";
import { useTranslations } from "next-intl";

export default function ApiKeysPage() {
  const tTour = useTranslations("tour");
  const apiKeysTourSteps = useMemo(
    () => getApiKeysTourSteps(tTour),
    [tTour],
  );
  const {
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
  } = useApiKeys();

  return (
    <PermissionGuard permissions={["API.ACCESS", "API.KEY.CREATE"]}>
      <div className="space-y-6 md:space-y-8">
        <TourWelcomePrompt pageId="api-keys" steps={apiKeysTourSteps} />
        <div data-tour="api-header"><ApiKeysHeader /></div>

        <div data-tour="api-generate"><ApiKeysToolbar onGenerateClick={openDialog} /></div>

        <CreateKeyDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          newKeyName={newKeyName}
          onKeyNameChange={setNewKeyName}
          generatedKey={generatedKey}
          isGenerating={isGenerating}
          onGenerate={handleGenerateKey}
          onCopy={handleCopy}
          onClose={handleDialogClose}
        />

        <div data-tour="api-keys-list">
          <ApiKeysListCard
            keys={keys}
            isLoading={isLoading}
            onRevoke={handleRevoke}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
