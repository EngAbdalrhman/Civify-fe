import React from "react";

export function AppLogo({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="https://ik.imagekit.io/civify/icon.png?updatedAt=1761505214339"
      width="36px"
      height="36px"
      alt="Civify Logo"
    />
  );
}
