FROM node:20.18-slim AS build-frontend
COPY .npmrc /root/.npmrc
WORKDIR /app

COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/frontend/*.json /app/packages/frontend/
COPY packages/frontend/.env.production /app/packages/frontend/.env
COPY packages/shared/patches /app/packages/shared/patches

RUN npm ci && \
  npm ci --prefix=packages/shared && \
  npm ci --prefix=packages/frontend && \
  wait
COPY packages/shared /app/packages/shared
COPY packages/frontend /app/packages/frontend

ENV FRONTEND_PORT=80
RUN npm run build:frontend
# RUN npm run lint
RUN (cd /app/packages/shared; npm prune --production)
RUN (cd /app/packages/frontend; npm prune --production)

FROM node:20.18-slim AS frontend

EXPOSE 80

COPY --from=build-frontend /app/.env /app/.env
COPY --from=build-frontend /app/packages/frontend/node_modules /app/node_modules
COPY --from=build-frontend /app/packages/shared /app/node_modules/@paulislava/shared
COPY --from=build-frontend /app/packages/frontend/dist /app

WORKDIR /app

ENV NODE_ENV=production \
    PORT=80
ENTRYPOINT ["npx", "serve", "-s"]
