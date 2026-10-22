# ── Stage 1: Base ──────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ── Stage 2: Dependencies ──────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

# ── Stage 3: Builder ───────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Generate Prisma Client (needed for generated types)
RUN npx prisma generate
# Build Next.js application with standalone output
RUN npm run build

# ── Stage 4: Production Runner ─────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# ── Stage 5: Database Migrator / CLI ───────────
FROM deps AS migrator
WORKDIR /app
COPY . .
ENTRYPOINT ["npx", "prisma"]
CMD ["migrate", "deploy"]

