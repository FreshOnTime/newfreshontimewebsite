# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# Set dummy secret to bypass module-level check during build
ENV JWT_SECRET=build_time_dummy_secret
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Set permissions for nextjs user
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create uploads directories
RUN mkdir -p public/uploads/supplier-uploads \
             public/uploads/product-images \
             public/uploads/banner-images \
             public/uploads/products && \
    chmod -R 755 public/uploads && \
    chown -R nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Initialize uploads and start server
CMD ["sh", "-c", "node scripts/init-uploads.js && node server.js"]

# Usage:
# docker build -t fresh-pick-app .
# docker run -p 3000:3000 -e MONGODB_URI="..." -e JWT_SECRET="..." fresh-pick-app