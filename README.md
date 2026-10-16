# Civify Web Application & Rendering Service (`Civify-fe`)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-emerald)](https://www.gnu.org/licenses/agpl-3.0.html)

The modern web client and serverless PDF rendering microservice for [Civify](https://civify.cv).

For full ecosystem overview, see the [Unified Civify README](../README.md).

---

## 🌟 Features

- **Interactive Resume Builder**: Drag-and-drop section reordering (`@dnd-kit`) with live preview.
- **Rich Text Editing**: Powered by Tiptap editor for seamless experience refinement and bullet points.
- **Headless Chromium PDF Rendering**: Dedicated microservice endpoint (`/api/generate-pdf`) using `@sparticuz/chromium` and `puppeteer-core` for pixel-perfect, ATS-friendly PDF exports with watermark policy enforcement.
- **Internationalization (i18n)**: Full English and Arabic localization with Right-to-Left (RTL) layout switching via `next-intl`.
- **ATS Score Visualizer**: Interactive charts (`recharts`) and gap analysis displays.
- **MCP OAuth Consent UI**: First-party OAuth 2.0 PKCE consent screen (`/[locale]/mcp/connect`) for connecting ChatGPT and external AI agents securely to Civify accounts.
- **Modern UI Components**: Built on Radix UI primitives and styled with Tailwind CSS v4.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or 22.x
- npm / pnpm / yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Environment Variables

Create `.env.local` in this folder:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8077/apis
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Optional analytics & monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 🛠️ Scripts

- `npm run dev` — Launch development server
- `npm run build` — Build production bundle
- `npm run start` — Start production server
- `npm run lint` — Lint code with Biome (`biome check`)
- `npm run format` — Auto-format code with Biome

---

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 or later
(AGPL-3.0-or-later). See [LICENSE](LICENSE).

The Civify name and logo are not granted by this license. Commercial licensing
enquiries are available at [civify.cv](https://civify.cv).
