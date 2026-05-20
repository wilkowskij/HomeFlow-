FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /tmp/prod_node_modules
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /tmp/prod_node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/index.js"]
