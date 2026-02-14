"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminUser } from "@/services/admin.service";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          {/* <DialogDescription>
            View user information. Use actions menu to modify group, limits, or tokens.
          </DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {user.firstName || ""} {user.lastName || ""}
                {!user.firstName && !user.lastName && user.username}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={user.status === "ACTIVE" ? "default" : "destructive"}
              >
                {user.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          {user.phoneNumber && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phoneNumber}</p>
            </div>
          )}

          <Separator />

          {/* Subscription & Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <Badge variant="outline">{user.currentPlan || "Free"}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Group</p>
              <p className="font-medium">{user.groupName || "None"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">CV Limit Override</p>
              <p className="font-medium">{user.cvLimit ?? "Plan Default"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Extra Tokens</p>
              <p className="font-medium">{user.extraTokens || 0}</p>
            </div>
          </div>

          <Separator />

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Registered</p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {user.lastLoginAt && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Last Login</p>
                <p>{new Date(user.lastLoginAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
