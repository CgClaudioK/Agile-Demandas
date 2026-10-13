# Arquitetura

## Visão geral

![Arquitetura](./img/Arquitetura.png)

## Módulos da API

| Módulo | Responsabilidade |
|---|---|
| `auth` | signup, signin, guard JWT, papéis |
| `users` | dados do usuário |
| `demands` | CRUD, filtros, busca, decisão (aprovar/rejeitar) |
| `dashboard` | totais e distribuição por prioridade |
| `prisma` | acesso ao banco |

Camadas: Controller (HTTP e DTOs validados) → Service (regras de negócio) → Prisma (persistência).

## Modelo de dados (planejado)

- `User`: id, email (único), name, password (hash), role (`SOLICITANTE` | `ANALISTA`)
- `Demand`: id, title, description, requester, area, priority (`BAIXA` | `MEDIA` | `ALTA`), status (`ABERTA` | `EM_ANALISE` | `APROVADA` | `REJEITADA`), decisionComment, createdAt, updatedAt, createdById

## Kanban de prioridades

Colunas por prioridade (Baixa, Média, Alta); mover um card entre colunas altera `priority` via `PATCH /demands/:id`. O status segue o fluxo Aberta → Em Análise → Aprovada/Rejeitada.

## Histórico e comentários

- `DemandEvent`: id, demandId, type (`CRIADA` | `EDITADA` | `STATUS` | `COMENTARIO`), authorId, authorName, message, toStatus, createdAt.
- `GET /demands/:id/history` lista a linha do tempo; `POST /demands/:id/comments` adiciona comentário (mesmas regras de acesso da demanda).
- Criação, edição e decisão registram eventos automaticamente.

## Observabilidade

- Cada requisição gera uma linha JSON (`method`, `path`, `status`, `ms`, `userId`) via `LoggingInterceptor`.
- Eventos de negócio (`demand.criada`, `demand.comentario`, ...) também são logados em JSON.

Logs estruturados em JSON na API, coletados pelo Loki e exibidos no Grafana, tudo via Docker Compose.

## Segurança

- Senhas com bcrypt; limite de 72 caracteres (limite do algoritmo)
- JWT com expiração de 1h; a API não inicia sem `JWT_SECRET_KEY`
- `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`
- Autorização por papel: somente analista aprova ou rejeita

## Evolução e integração com sistemas externos

Após a aprovação ou rejeição de uma demanda, a API pode publicar um evento (ex.: `demand.approved`) numa fila ou via webhook para ERP/ITSM, com retentativas e idempotência. Para escalar: cache de leituras do dashboard, paginação por cursor e separação de leitura e escrita se necessário.

## Gerenciamento de permissoes

O modulo `users` (somente ANALISTA) expoe `GET /users` e `PATCH /users/:id/role` (body `{ role }`). Na tela, o botao *Usuarios* abre um modal para promover/rebaixar. Um analista nao pode alterar o proprio papel (evita ficar sem admin). Alteracoes sao registradas em log JSON (`user.role`). Nao usei biblioteca de ACL pois ha apenas 2 papeis.
