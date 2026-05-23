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
    <div className="fixed right-4 z-50 lg:hidden bottom-[max(1.5rem,env(safe-area-inset-bottom,0px)+0.5rem)]">
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
