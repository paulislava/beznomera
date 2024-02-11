FROM node:14.17-slim AS build
COPY .npmrc /root/.npmrc
WORKDIR /app
COPY .eslintignore /app
COPY .prettierignore /app
COPY *.json /app/
COPY packages/shared/*.json /app/packages/shared/
COPY packages/frontend/*.json /app/packages/frontend/
COPY packages/backend/*.json /app/packages/backend/
RUN npm ci & \
  npm ci --prefix=packages/shared & \
  npm ci --prefix=packages/frontend & \
  npm ci --prefix=packages/backend & \
  wait
COPY packages/shared /app/packages/shared
COPY packages/backend /app/packages/backend
COPY uploads /app/uploads
COPY packages/frontend /app/packages/frontend
ARG frontend_backend_url=/backend
ARG app_version
ARG app_source_branch
ARG app_source_commit
ARG app_build_time
ENV BACKEND_URL=$frontend_backend_url \
    APP_VERSION=$app_version \
    APP_SOURCE_BRANCH=$app_source_branch \
    APP_SOURCE_COMMIT=$app_source_commit \
    APP_BUILD_TIME=$app_build_time
RUN npm run build
RUN npm run lint
RUN (cd /app/packages/shared; npm prune --production)
RUN (cd /app/packages/backend; npm prune --production)


FROM node:14.17-slim AS backend
ARG app_version
ARG app_source_branch
ARG app_source_commit
ARG app_build_time
COPY --from=build /app/packages/backend/node_modules /app/node_modules
COPY --from=build /app/packages/shared /app/node_modules/@paulislava/shared
COPY --from=build /app/packages/backend/build /app/
ENV NODE_ENV=production \
    APP_VERSION=$app_version \
    APP_SOURCE_BRANCH=$app_source_branch \
    APP_SOURCE_COMMIT=$app_source_commit \
    APP_BUILD_TIME=$app_build_time
CMD node /app/main.js


FROM nginx:1.17.6-alpine AS frontend
COPY packages/frontend/nginx/default.conf /etc/nginx/conf.d/
COPY --from=build /app/packages/frontend/build/ /usr/share/nginx/html/