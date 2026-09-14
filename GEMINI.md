# Civify Frontend Project Rules

## Knowledge Base
A comprehensive knowledge base exists at `d:\Personal\work\odc\knowledge-base\` covering both Civify and the new ODC job platform. Check it before making architectural changes.

## Tech Stack & Architecture
- **Framework**: Next.js 16 (App Router) with React 19, TypeScript
- **Internationalization**: `next-intl` with English (`en`) and Arabic (`ar`, RTL support). Routing prefix: `localePrefix: "always"`.
- **UI & Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons, Framer Motion.
- **State & Data**: TanStack Query (React Query v5), React Hook Form with Zod resolvers.
- **Backend APIs**: Spring Boot 3.4 at `https://civify.cv/apis` (context path `/apis`).

## Public Documentation Screens
- **REST API Documentation**: `https://civify.cv/api-docs` (`src/app/[locale]/api-docs`, `src/features/api-docs`).
- **MCP Server Documentation**: `https://civify.cv/mcp-docs` (`src/app/[locale]/mcp-docs`, `src/features/mcp-docs`, `src/components/mcp-docs`) and alias `https://civify.cv/developers/mcp`.
- **Discoverability Checklist**: Any new public screen or documentation route MUST be registered in:
  1. `src/components/Footer.tsx` (product links in English and Arabic)
  2. `src/app/sitemap.ts` (SEO sitemap entries)
  3. `src/app/llms.txt/route.ts` (LLM crawlers and AI search index)
  4. `src/messages/en/metadata.json` and `src/messages/ar/metadata.json` (localized page titles and descriptions)
