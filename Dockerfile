# One image that runs a single Node.js process serving both the API (/api)
# and the built React client (everything else).

ARG NODE_VERSION=22

# ---- deps: install all dependencies (needed to build) ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared/package.json shared/
# `npm ci` runs the prepare script, which skips git hooks here (no .git).
COPY scripts/install-git-hooks.mjs scripts/
RUN npm ci

# ---- build: compile client and server ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY shared shared
COPY client client
COPY server server
RUN npm run build -w client && npm run build -w server

# ---- runtime: production dependencies + build output only ----
FROM node:${NODE_VERSION}-alpine AS runtime
ARG APP_VERSION=dev
ENV NODE_ENV=production \
    PORT=3000 \
    APP_VERSION=${APP_VERSION} \
    CLIENT_DIST=/app/client/dist
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared/package.json shared/
COPY scripts/install-git-hooks.mjs scripts/
RUN npm ci --omit=dev --workspace server --include-workspace-root=false \
    && npm cache clean --force

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

# Never run the app as root inside the container.
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/dist/index.js"]
