"use client";

import { useTranslations } from "next-intl";
import { ApiDocumentation } from "@/components/api-docs/ApiDocumentation";

export default function PublicApiDocsPage() {
  const t = useTranslations("common"); 
  
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete guide to integrating Civify CV API into your applications
          </p>
        </div>
        
        <ApiDocumentation />
      </div>
    </div>
  );
}
