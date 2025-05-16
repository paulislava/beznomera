FROM node:20.18-slim AS build-web
COPY .npmrc /root/.npmrc
WORKDIR /app

COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/web/next.config.ts /app/packages/web/
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

ENV HOME=/app

WORKDIR ${HOME}

COPY --from=build-web ${HOME}/packages/web/next.config.ts ./
COPY --from=build-web ${HOME}/packages/web/public ./public
COPY --from=build-web ${HOME}/packages/web/package.json ./package.json
COPY --from=build-web ${HOME}/packages/web/.next/static ./.next/static
COPY --from=build-web ${HOME}/packages/web/.next/server ./.next/server
COPY --from=build-web ${HOME}/packages/web/.next/standalone ./

RUN chgrp -R 0 /app/.next && chmod -R g=u /app/.next

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    BACKEND_URL=https://beznomera.net/api

EXPOSE 3000
CMD [ "node", "server.js" ]
