FROM node:20.18-slim AS build-web
COPY .npmrc /root/.npmrc
WORKDIR /app

COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/web/*.json /app/packages/web/
COPY packages/shared/patches /app/packages/shared/patches

RUN npm ci && \
    npm ci --prefix=packages/shared && \
    npm ci --legacy-peer-deps --prefix=packages/web && \
    wait

COPY packages/shared /app/packages/shared
COPY packages/web /app/packages/web

ENV NEXT_TELEMETRY_DISABLED=1 \
    BACKEND_URL=https://beznomera.net/api
RUN npm run build:web

FROM node:20.18-slim AS web

WORKDIR /app

COPY --from=build-web /app/packages/web/.next /app/.next
COPY --from=build-web /app/packages/web/public /app/public
COPY --from=build-web /app/packages/web/package.json /app/package.json
COPY --from=build-web /app/packages/web/node_modules /app/node_modules
COPY --from=build-web /app/packages/shared /app/node_modules/@paulislava/shared

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    BACKEND_URL=https://beznomera.net/api

EXPOSE 3000

CMD ["npm", "start"]
