# Sama persis pola Dockerfile backend Koperasi -- multi-stage supaya image
# akhir tidak bawa toolchain compile (python3/make/g++ buat bcrypt) atau
# source TypeScript, cuma hasil build + node_modules production saja.
FROM node:24-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/main"]
