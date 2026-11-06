# AutoBAZ backend (NestJS + Prisma). Build context: ./backend
FROM node:24-slim

# Prisma's engines need OpenSSL.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies first: this layer is cached until package.json / the lockfile change.
COPY package.json package-lock.json ./
RUN npm ci

# `prisma generate` only reads the schema; it does not connect, but needs the variable to exist.
COPY prisma ./prisma
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

# Set only now: with NODE_ENV=production `npm ci` would skip the dev tools that the build
# (and the prisma CLI used for migrations / ts-node used by scripts) need.
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply pending migrations, then start the API. Uploaded files live in /app/uploads (mount a volume).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
