# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

# Enable pnpm via corepack and set up environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Copy scripts folder needed for postinstall
COPY scripts ./scripts

# Fetch dependencies first (better caching), then install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile
# Use --ignore-scripts to skip postinstall here; we run it in builder stage
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline --ignore-scripts

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for Next.js public environment variables
# These MUST be provided at build time for NEXT_PUBLIC_* vars to work
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

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Run postinstall to create chromium-pack.tar in public folder
# This must run AFTER source files are copied so the public/ folder exists
RUN node scripts/postinstall.mjs

# Build the Next.js application
# This creates a standalone output for minimal runtime
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install minimal dependencies needed for chromium-min at runtime
RUN apk add --no-cache \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-arabic

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Extract chromium binary from tar and set executable path
# This avoids the need to download at runtime
RUN mkdir -p /app/chromium && \
    tar -xf ./public/chromium-pack.tar -C /app/chromium && \
    echo "=== Extracted contents ===" && \
    ls -la /app/chromium/ && \
    find /app/chromium -type f -name "*chromium*" -o -name "*chrome*" | head -10

# Set environment variable for the chromium executable path
ENV CHROMIUM_EXECUTABLE_PATH=/app/chromium/chromium

# Switch to non-root user
USER nextjs

# Expose the port Next.js runs on
EXPOSE 3000

# Set the port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js application
CMD ["node", "server.js"]
