"use client";

import { Button } from "@/components/ui/button";
import { Eye, PenSquare } from "lucide-react";

interface MobileViewToggleProps {
  mobileView: "editor" | "preview";
  onToggle: () => void;
}

export function MobileViewToggle({
  mobileView,
  onToggle,
}: MobileViewToggleProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <Button
        onClick={onToggle}
        size="lg"
        className="rounded-full shadow-lg h-14 w-14"
      >
        {mobileView === "editor" ? (
          <Eye className="h-6 w-6" />
        ) : (
          <PenSquare className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
