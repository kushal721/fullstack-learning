# Production image for the Notes API.
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy only the package files first: Docker reuses this layer (and the
# installed packages) until the dependencies change.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Don't run as root inside the container.
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
