"use client";

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
}

export function SaveDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onConfirm,
  disabled,
}: SaveDialogProps) {
  const t = useTranslations("builder");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("saveDialog.title")}</DialogTitle>
          <DialogDescription>{t("saveDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="resume-title">{t("saveDialog.label")}</Label>
          <Input
            id="resume-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("saveDialog.placeholder")}
            className="mt-2"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("saveDialog.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={disabled || !title.trim()}>
            {t("saveDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
