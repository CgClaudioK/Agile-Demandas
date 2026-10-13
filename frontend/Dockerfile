# 1. Estágio de build da aplicação Next.js
FROM docker.io/library/node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Argumentos de build para injeção das variáveis públicas no bundle client-side do Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 2. Estágio de execução em produção
FROM docker.io/library/node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Execução com usuário não-root por boas práticas de segurança
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3001

CMD ["npm", "run", "start"]
