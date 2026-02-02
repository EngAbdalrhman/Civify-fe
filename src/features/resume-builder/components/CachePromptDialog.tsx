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
  return (
    <>
      <LoadingSpinner />
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume in Progress Found</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unsaved resume from a previous session. Would you like
              to continue editing it or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onStartFresh}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={onContinue}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
