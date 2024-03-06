FROM node:18.12-slim AS build-frontend
COPY .npmrc /root/.npmrc
WORKDIR /app
COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/frontend/*.json /app/packages/frontend/
RUN npm ci & \
  npm ci --prefix=packages/shared & \
  npm ci --prefix=packages/frontend & \
  wait
COPY packages/shared /app/packages/shared
COPY packages/frontend /app/packages/frontend

ARG frontend_backend_url=/api
ARG telegram_bot_name=beznomera_bot

ENV FRONTEND_PORT=80 \
  EXPO_PUBLIC_BACKEND_URL=$frontend_backend_url \
  EXPO_PUBLIC_TELEGRAM_BOT_NAME=$telegram_bot_name 
RUN npm run build:frontend
# RUN npm run lint
RUN (cd /app/packages/shared; npm prune --production)

FROM node:18.12-slim AS build-backend
COPY .npmrc /root/.npmrc
WORKDIR /app
COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/backend/*.json /app/packages/backend/
RUN npm ci & \
  npm ci --prefix=packages/shared & \
  npm ci --prefix=packages/backend & \
  wait
COPY packages/shared /app/packages/shared
COPY packages/backend /app/packages/backend

ENV NODE_ENV=production
RUN npm run build:backend

RUN (cd /app/packages/shared; npm prune --production)
RUN (cd /app/packages/backend; npm prune --production)

FROM node:18.12-slim AS frontend

EXPOSE 80

ARG frontend_backend_url
ARG telegram_bot_name

COPY --from=build-frontend /app/packages/frontend /app
COPY --from=build-frontend /app/packages/shared /app/node_modules/@paulislava/shared
COPY --from=build-frontend /app/packages/frontend/dist /app

WORKDIR /app

ENV NODE_ENV=production \
  EXPO_PUBLIC_TELEGRAM_BOT_NAME=$telegram_bot_name\
  EXPO_PUBLIC_BACKEND_URL=$frontend_backend_url \
  PORT=80
ENTRYPOINT ["npx", "serve"]

FROM node:18.12-slim AS backend

EXPOSE 3000

ARG app_version
ARG app_source_branch
ARG app_source_commit
ARG app_build_time
COPY --from=build-backend /app/packages/backend/node_modules /app/node_modules
COPY --from=build-backend /app/packages/shared /app/node_modules/@paulislava/shared
COPY --from=build-backend /app/packages/backend/dist /app/

ENV NODE_ENV=production 
ENTRYPOINT [ "node",  "/app/main.js" ]


