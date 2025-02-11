FROM node:18.12-slim AS build-backend
COPY .npmrc /root/.npmrc
WORKDIR /app
COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/backend/*.json /app/packages/backend/
RUN npm ci && \
  npm ci --prefix=packages/shared && \
  wait

COPY packages/shared /app/packages/shared
RUN npm run build-shared

COPY packages/backend /app/packages/backend

RUN cd /app/packages/shared && npm prune --production && cd /app/packages/backend

RUN npm ci

ENV NODE_ENV=production
RUN npm run build:backend
RUN npm prune --production

FROM node:18.12-slim AS backend

EXPOSE 3000

COPY --from=build-backend /app/packages/backend/node_modules /app/node_modules
COPY --from=build-backend /app/packages/shared /app/node_modules/@paulislava/shared
COPY --from=build-backend /app/packages/backend/dist /app

ENV NODE_ENV=production
ENTRYPOINT [ "node" ]
CMD [ "/app/main.js" ]
