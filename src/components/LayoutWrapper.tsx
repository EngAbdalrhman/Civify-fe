"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/admin") || pathname.includes("/app");
  
  // For public pages (landing, etc), prevent horizontal scrolling
  // Dashboard pages manage their own overflow
  const overflowClass = isDashboard ? "" : "overflow-x-hidden";

  return (
    <div className={`flex flex-col min-h-screen w-full ${overflowClass}`}>
      {!isDashboard && <Navbar />}
      <main className="flex-1" translate={isDashboard ? undefined : "no"}>
        {children}
      </main>
      <Toaster />
      {!isDashboard && <Footer />}
    </div>
  );
}
