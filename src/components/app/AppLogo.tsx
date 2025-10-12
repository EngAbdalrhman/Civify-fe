import React from "react";

export function AppLogo({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="../src/assets/icons/icon.png"
      width="36px"
      height="36px"
      alt="Civify Logo"
    />
  );
}
