# wave-portfolio-v2 — built for RDK (remote build on the VPS).
#
# Referenced by .env.remote as APP_DOCKERFILE=./Dockerfile. RDK generates the
# compose file itself in this mode, so there is no docker-compose.*.yml here —
# unlike the wave-portfolio monorepo apps, which hand RDK a BASE_COMPOSE.
#
# This app is standalone: no workspace deps, so the build context is THIS
# folder and next.config.ts sets no outputFileTracingRoot. That means
# `.next/standalone` is rooted at the app itself and the entrypoint is plain
# `server.js`.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ── deps ────────────────────────────────────────────────────────────────────
# Manifest + lockfile only, so source edits don't bust the install cache.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── build ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next/font/google downloads and self-hosts Inter Tight + JetBrains Mono at
# build time, so this stage needs outbound network. RDK builds on the VPS,
# which has it.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# standalone server.js reads PORT and HOSTNAME. PORT defaults to APP_PORT from
# .env.remote so the container listens correctly even if RDK doesn't inject it;
# HOSTNAME must be 0.0.0.0 or it binds to localhost and the proxy can't reach it.
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8000
EXPOSE 8000

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# standalone already contains the pruned node_modules; static and public are
# not traced into it and must be copied alongside.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
CMD ["node", "server.js"]
