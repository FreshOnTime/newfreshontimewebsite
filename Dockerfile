# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Create uploads directories with proper permissions before switching to non-root user
RUN mkdir -p /app/public/uploads/supplier-uploads \
             /app/public/uploads/product-images \
             /app/public/uploads/banner-images && \
    chmod -R 755 /app/public/uploads

RUN npm install --production
EXPOSE 3000
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 nextjs -G nodejs

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs
CMD ["npm", "start"]


# docker build -t fotui:test .                    
# docker run -p 3000:3000 fotui:test npm run start