"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useApiKeys } from "@/features/api-keys/hooks/useApiKeys";
import { ApiKeysHeader } from "@/features/api-keys/components/ApiKeysHeader";
import { ApiKeysToolbar } from "@/features/api-keys/components/ApiKeysToolbar";
import { CreateKeyDialog } from "@/features/api-keys/components/CreateKeyDialog";
import { ApiKeysListCard } from "@/features/api-keys/components/ApiKeysListCard";

export default function ApiKeysPage() {
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
        <ApiKeysHeader />

        <ApiKeysToolbar onGenerateClick={openDialog} />

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

        <ApiKeysListCard
          keys={keys}
          isLoading={isLoading}
          onRevoke={handleRevoke}
        />
      </div>
    </PermissionGuard>
  );
}
