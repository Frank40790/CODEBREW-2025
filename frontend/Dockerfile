FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install 

FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules/
COPY . .
RUN npm run build

FROM busybox:1.37 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./

EXPOSE 3006
CMD ["busybox", "httpd", "-f", "-v", "-p", "3006"]