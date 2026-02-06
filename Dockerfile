# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Base Environment
# ==============================================================================
FROM node:20-bookworm-slim AS base

# Install basic system tools needed for potential native module builds
# 'libc6' is the fundamental glibc library.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ==============================================================================
# Stage 2: Dependencies
# Install node_modules. This layer is cached unless package.json changes.
# ==============================================================================
FROM base AS deps

# Copy package manager locks
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
# We use a logic block to detect the package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==============================================================================
# Stage 3: Builder
# Build the Next.js application
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ARG NEXT_TELEMETRY_DISABLED

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Run the build script
# This generates the.next/standalone directory
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==============================================================================
# Stage 4: Production Runner
# The final image that runs in production
# ==============================================================================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install Chromium and required dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium \
       fonts-ipafont-gothic \
       fonts-wqy-zenhei \
       fonts-thai-tlwg \
       fonts-kacst \
       fonts-freefont-ttf \
       fonts-liberation \
       fonts-noto-color-emoji \
       libxss1 \
       libgbm1 \
       libnss3 \
       libatk-bridge2.0-0 \
       libgtk-3-0 \
       libasound2 \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------------------
# 4.2 Configure Environment for Puppeteer
# ------------------------------------------------------------------------------
# Tell Puppeteer to skip downloading Chromium (we use the installed Chrome)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Point Puppeteer to the executable we just installed
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# ------------------------------------------------------------------------------
# 4.3 User & Permissions Security
# ------------------------------------------------------------------------------
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Create writable directories for Chromium crash handler, user data, and XDG dirs
RUN mkdir -p /tmp/chromium-crashes /tmp/chromium-data /tmp/.chromium \
    && chown -R nextjs:nodejs /tmp/chromium-crashes /tmp/chromium-data /tmp/.chromium

# Set XDG directories so chrome_crashpad_handler can find a writable database path
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

# Copy built application
COPY --from=builder /app/public ./public
# Copy the standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# ------------------------------------------------------------------------------
# 4.5 Entrypoint
# Use dumb-init to handle PID 1 responsibilities (signals, zombies)
# ------------------------------------------------------------------------------
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the Next.js standalone server
CMD ["node", "server.js"]