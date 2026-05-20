FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_AI_SERVICE_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_SERVICE_URL=$VITE_AI_SERVICE_URL
RUN pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
