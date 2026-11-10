# Keep in sync with the pnpm version in mise.toml
ARG PNPM_IMAGE=ghcr.io/pnpm/pnpm:12.18.0-alpine

# Keep in sync with the node version in mise.toml
ARG NODE_IMAGE=node:26.12.1-alpine3.24

FROM ${PNPM_IMAGE} AS pnpm

FROM ${NODE_IMAGE} AS base

# Standalone pnpm binary, only needed to install dependencies
FROM base AS pnpm-base
COPY --from=pnpm /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm

# Build-platform variants: deps and build output is platform independent, so they never run under emulation
FROM --platform=$BUILDPLATFORM ${PNPM_IMAGE} AS build-pnpm

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS build-base

FROM build-base AS build-pnpm-base
COPY --from=build-pnpm /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm

# All deps stage
FROM build-pnpm-base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts

# Production only deps stage
FROM pnpm-base AS production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts --prod

# Build stage
FROM build-pnpm-base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN pnpm run build

# Production stage
FROM base

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3333

WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app

EXPOSE 3333

COPY scripts/entrypoint.sh /app/scripts/entrypoint.sh
RUN chmod +x /app/scripts/entrypoint.sh

CMD ["/app/scripts/entrypoint.sh"]
