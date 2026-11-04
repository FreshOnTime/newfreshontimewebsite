# syntax=docker/dockerfile:1
# Web, scheduled jobs and Prisma migrations are separate deployment roles.
FROM node:20-alpine AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM deps AS builder
COPY . .
ENV FRESHPICK_STANDALONE=true
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# Run once per deployment against a backed-up, approved PostgreSQL database,
# before starting/promoting web or scheduled jobs. Never run migrations in each pod.
FROM deps AS migrate
COPY prisma ./prisma
ENV NODE_ENV=production
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

# Build the Node job runner from existing domain services, retaining Prisma's
# native runtime without shipping TypeScript transpilation tooling in production.
FROM deps AS jobs-builder
COPY tsconfig.json ./
COPY prisma ./prisma
RUN ./node_modules/.bin/prisma generate
COPY lib ./lib
COPY scripts/jobs ./scripts/jobs
RUN node scripts/jobs/build.cjs
RUN npm prune --omit=dev

FROM node:20-alpine AS jobs
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=jobs-builder --chown=node:node /app/node_modules ./node_modules
COPY --from=jobs-builder --chown=node:node /app/dist/jobs ./dist/jobs
USER node

# Each job has its own image target so the default OpenChoreo scheduled-task
# component can execute the correct command without a custom command override.
FROM jobs AS recurring
CMD ["node", "dist/jobs/run.cjs", "recurring"]

FROM jobs AS outbox
CMD ["node", "dist/jobs/run.cjs", "outbox"]

# Keep plain `docker build .` backward-compatible with the storefront image.
FROM runner AS production
