FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=base /app/.next .next
COPY --from=base /app/public public
COPY --from=base /app/node_modules node_modules
COPY --from=base /app/next.config.ts .
COPY --from=base /app/tsconfig.json .
COPY --from=base /app/package.json .

ENV NODE_ENV production

EXPOSE 3000
CMD ["npm", "start"]