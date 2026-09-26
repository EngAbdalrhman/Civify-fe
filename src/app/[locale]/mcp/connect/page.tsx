import type { Metadata } from "next";
import { Suspense } from "react";
import ConnectAccount from "./ConnectAccount";

export const metadata: Metadata = {
  title: "Connect your Civify account", robots: { index: false, follow: false }, referrer: "no-referrer",
};

export default function ConnectPage() {
  return <Suspense fallback={<p className="p-8">Loading Civify…</p>}><ConnectAccount /></Suspense>;
}
