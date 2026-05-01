"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
  showSaveAsNew?: boolean;
  onSaveAsNew?: (title: string) => void;
}

export function SaveDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onConfirm,
  disabled,
  showSaveAsNew,
  onSaveAsNew,
}: SaveDialogProps) {
  const t = useTranslations("builder");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    if (open) {
      setIsCreateMode(false);
      setLocalTitle(title);
    }
  }, [open, title]);

  const handleTitleChange = (val: string) => {
    setLocalTitle(val);
    if (!isCreateMode) onTitleChange(val);
  };

  const handleSaveAsNewClick = () => {
    setIsCreateMode(true);
    setLocalTitle(`${title} (Copy)`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? t("saveDialog.saveAsNewTitle") : t("saveDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode ? t("saveDialog.saveAsNewDescription") : t("saveDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="resume-title">{t("saveDialog.label")}</Label>
          <Input
            id="resume-title"
            value={localTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={t("saveDialog.placeholder")}
            className="mt-2"
            autoFocus
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          {isCreateMode ? (
            <>
              <Button variant="outline" onClick={() => { setIsCreateMode(false); setLocalTitle(title); }} className="w-full sm:w-auto">
                {t("saveDialog.back")}
              </Button>
              <Button onClick={() => onSaveAsNew?.(localTitle)} disabled={disabled || !localTitle.trim()} className="w-full sm:w-auto">
                {t("saveDialog.create")}
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                  {t("saveDialog.cancel")}
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {showSaveAsNew && (
                  <Button variant="secondary" onClick={handleSaveAsNewClick} className="flex-1 sm:flex-none">
                    {t("saveDialog.saveAsNew")}
                  </Button>
                )}
                <Button onClick={() => { onTitleChange(localTitle); onConfirm(); }} disabled={disabled || !localTitle.trim()} className="flex-1 sm:flex-none">
                  {t("saveDialog.confirm")}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
