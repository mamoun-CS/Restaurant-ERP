FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /workspace

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY packages ./packages/
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run api:build

FROM base AS runner
WORKDIR /workspace
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME=0.0.0.0
COPY --from=builder /workspace/apps/api/.next/standalone ./
COPY --from=builder /workspace/apps/api/.next/static ./apps/api/.next/static
WORKDIR /workspace/apps/api
EXPOSE 3010
CMD ["node", "server.js"]
