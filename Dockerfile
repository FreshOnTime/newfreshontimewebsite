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
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Create uploads directories
RUN mkdir -p /app/public/uploads/supplier-uploads \
             /app/public/uploads/product-images \
             /app/public/uploads/banner-images && \
    chmod -R 755 /app/public/uploads

# Don't reinstall production deps if we copied node_modules from builder
# fallback to install only if needed, but copying is safer.
# RUN npm install --production 

EXPOSE 3000
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 nextjs -G nodejs
RUN chown -R nextjs:nodejs /app
USER nextjs
CMD ["npm", "start"]

# Usage:
# docker build -t fresh-pick-app .
# docker run -p 3000:3000 -e MONGODB_URI="mongodb+srv://..." fresh-pick-app