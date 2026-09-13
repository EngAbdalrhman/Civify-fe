"use client";

import { McpDocumentation } from "@/components/mcp-docs/McpDocumentation";

export default function McpDocsContent() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Model Context Protocol (MCP) Server
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect AI coding agents and LLMs directly to Civify&apos;s AI resume parsing, tailoring, ATS scoring, and job tracking platform.
          </p>
        </div>

        <McpDocumentation />
      </div>
    </div>
  );
}
