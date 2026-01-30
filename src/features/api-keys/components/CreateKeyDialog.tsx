"use client";

import { useTranslations } from "next-intl";
import { Copy, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newKeyName: string;
  onKeyNameChange: (name: string) => void;
  generatedKey: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: (text: string) => void;
  onClose: () => void;
}

export function CreateKeyDialog({
  isOpen,
  onOpenChange,
  newKeyName,
  onKeyNameChange,
  generatedKey,
  isGenerating,
  onGenerate,
  onCopy,
  onClose,
}: CreateKeyDialogProps) {
  const t = useTranslations("apiKeys");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!generatedKey ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("createTitle")}</DialogTitle>
              <DialogDescription>{t("createDesc")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="name"
                  placeholder={t("namePlaceholder")}
                  className="col-span-4"
                  value={newKeyName}
                  onChange={(e) => onKeyNameChange(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={onGenerate}
                disabled={isGenerating || !newKeyName}
              >
                {isGenerating ? (
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("generateKey")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("keyGenerated")}</DialogTitle>
              <DialogDescription className="text-red-500 font-medium bg-red-50 dark:bg-red-950/20 p-2 rounded-md mt-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {t("copyWarning")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 my-4">
              <Input
                value={generatedKey}
                readOnly
                className="font-mono bg-muted"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => onCopy(generatedKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={onClose}>{t("done")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
