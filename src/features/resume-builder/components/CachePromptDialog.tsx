import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { useTranslations } from "next-intl";

interface CachePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onStartFresh: () => void;
}

export function CachePromptDialog({
  open,
  onOpenChange,
  onContinue,
  onStartFresh,
}: CachePromptDialogProps) {
  const t = useTranslations("builder.cachePrompt");

  return (
    <>
      <LoadingSpinner />
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onStartFresh}>
              {t("startFresh")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onContinue}>
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
