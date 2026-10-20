# Node and pnpm version aligned with the checked local environment.
FROM node:24-bookworm-slim AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV DATABASE_URL=file:./data/imonbuildweb.db
ENV PAYLOAD_SECRET=build-only-placeholder-secret-long-enough-to-not-be-used-at-runtime
RUN pnpm build

FROM node:24-bookworm-slim
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
WORKDIR /app
RUN corepack enable
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
