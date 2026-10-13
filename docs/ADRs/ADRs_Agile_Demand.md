# Architecture Decision Records (ADRs)

Este diretório documenta as principais decisões arquiteturais do **Agile Demand — Sistema de Gestão de Demandas**.

Os ADRs registram o contexto, a decisão adotada, as justificativas e as consequências esperadas. Eles descrevem as escolhas desta versão do protótipo; itens identificados como evolução futura não devem ser interpretados como funcionalidades já implementadas.

## Índice

- [ADR-001 — PostgreSQL como banco de dados](#adr-001--postgresql-como-banco-de-dados)
- [ADR-002 — NestJS como backend](#adr-002--nestjs-como-backend)
- [ADR-003 — Next.js como frontend](#adr-003--nextjs-como-frontend)
- [ADR-004 — Docker Compose para ambiente local](#adr-004--docker-compose-para-ambiente-local)
- [ADR-005 — Grafana para visualização de observabilidade](#adr-005--grafana-para-visualização-de-observabilidade)

---

## ADR-001 — PostgreSQL como banco de dados

- **Status:** Aceita
- **Data:** 2026-10-12

### Contexto

O Agile Demand precisa persistir usuários e demandas, incluindo seus atributos, prioridades, status e informações relacionadas ao acompanhamento do fluxo de solicitações. Os dados precisam manter consistência e integridade, além de permitir consultas e indicadores para o dashboard.

### Decisão

Utilizar **PostgreSQL** como banco de dados relacional da aplicação.

### Justificativa

- Oferece suporte a transações e restrições de integridade relacional.
- Permite representar entidades relacionadas, como usuários e demandas.
- Suporta consultas, filtros, ordenação e agregações necessárias para listagens e indicadores.
- É uma tecnologia madura, amplamente utilizada e adequada tanto ao protótipo quanto a uma possível evolução.
- Integra-se ao ambiente Docker Compose e ao backend NestJS.

### Consequências

**Benefícios**
- Persistência consistente e consultas relacionais.
- Possibilidade de evolução do modelo por meio de migrations versionadas.
- Suporte a índices e otimização de consultas conforme o volume de dados crescer.

**Trade-offs**
- Exige configuração, manutenção e estratégia de backup.
- A disponibilidade da aplicação depende da disponibilidade do banco, caso não sejam implementadas medidas adicionais de resiliência.

### Alternativas consideradas

- **MySQL:** também atende aos requisitos relacionais, mas PostgreSQL foi escolhido para esta implementação.
- **Banco NoSQL:** não foi priorizado, pois o domínio atual possui relações e consultas estruturadas que se beneficiam de um banco relacional.

---

## ADR-002 — NestJS como backend

- **Status:** Aceita
- **Data:** 2026-10-12

### Contexto

A aplicação precisa disponibilizar uma API para cadastro, consulta, atualização e exclusão de demandas, além de aplicar regras de negócio, validação de dados, autenticação e autorização.

### Decisão

Utilizar **NestJS** para implementar a API backend.

### Justificativa

- Organiza a aplicação em módulos e permite separar responsabilidades, como autenticação, usuários e demandas.
- Oferece uma estrutura consistente para controllers, services, guards e validação.
- Utiliza TypeScript, permitindo compartilhar familiaridade com o ecossistema JavaScript/TypeScript do frontend.
- Facilita a implementação e manutenção de regras de autorização no servidor.
- Possui estrutura adequada para testes e evolução gradual da aplicação.

### Consequências

**Benefícios**
- Organização clara entre endpoints, regras de negócio e acesso a dados.
- Facilita a manutenção e a adição de módulos conforme o sistema evolui.
- Permite centralizar validações, tratamento de exceções e políticas de acesso.

**Trade-offs**
- Introduz convenções e abstrações que exigem familiaridade com o framework.
- Para um protótipo pequeno, pode ter mais estrutura inicial do que um backend minimalista.

### Alternativas consideradas

- **PHP:** permitido pelo desafio e viável para a solução, mas NestJS foi escolhido para aproveitar TypeScript e uma arquitetura modular.
- **Express sem framework adicional:** oferece maior liberdade, mas exige definir manualmente mais convenções de organização.

---

## ADR-003 — Next.js como frontend

- **Status:** Aceita
- **Data:** 2026-10-12

### Contexto

O Agile Demand precisa de uma interface web para autenticação, criação e consulta de demandas, acompanhamento do status, visualização em Kanban e apresentação de indicadores em dashboard.

### Decisão

Utilizar **Next.js** para construir a aplicação frontend, consumindo a API disponibilizada pelo backend NestJS.

### Justificativa

- Atende à tecnologia de frontend exigida no desafio.
- Fornece estrutura para organizar páginas, layouts e componentes reutilizáveis.
- Integra-se ao ecossistema React e TypeScript.
- Permite desenvolver uma interface única para os diferentes perfis de usuário.
- Mantém a interface separada das regras de negócio e da persistência, que permanecem no backend.

### Consequências

**Benefícios**
- Organização e reutilização de componentes da interface.
- Separação entre apresentação e regras de negócio.
- Possibilidade de evoluir a experiência do usuário sem acoplar a interface diretamente ao banco de dados.

**Trade-offs**
- Requer configuração adequada de variáveis de ambiente e da URL da API.
- A autorização não pode depender apenas de elementos escondidos na interface; toda operação protegida precisa ser validada pelo backend.
- A estratégia de renderização deve ser escolhida conforme as necessidades reais da aplicação.

### Alternativas consideradas

- **React com Vite:** alternativa viável para uma SPA, mas Next.js foi selecionado por ser a tecnologia solicitada no desafio.
- **Renderização integral no backend:** não foi escolhida porque a solução adota uma API separada e um frontend dedicado.

---

## ADR-004 — Docker Compose para ambiente local

- **Status:** Aceita
- **Data:** 2026-10-12

### Contexto

A aplicação depende de múltiplos serviços — frontend, API, banco de dados e componentes de observabilidade. A configuração manual de cada dependência pode dificultar a execução e a avaliação do protótipo em diferentes ambientes.

### Decisão

Utilizar **Docker Compose** para definir e executar os serviços do ambiente por meio de um arquivo declarativo.

### Justificativa

- Permite iniciar os serviços com uma configuração reproduzível.
- Define dependências e configurações de ambiente em um único lugar.
- Facilita a avaliação do projeto sem exigir instalação local de todas as dependências de infraestrutura.
- Permite persistir dados importantes por meio de volumes nomeados.
- É proporcional ao porte e às necessidades atuais do protótipo.

### Consequências

**Benefícios**
- Inicialização e encerramento simplificados do ambiente.
- Menor diferença entre configurações de desenvolvimento.
- Serviços e dependências documentados como código.

**Trade-offs**
- O Compose não fornece, por si só, alta disponibilidade ou escalabilidade distribuída de um cluster.
- Os volumes persistem dados, mas não substituem uma estratégia de backup.
- Segredos e senhas usados localmente devem ser substituídos por valores seguros em ambientes compartilhados ou de produção.

### Alternativas consideradas

- **Instalação manual dos serviços:** possível, mas aumenta o esforço de configuração e o risco de diferenças entre ambientes.
- **Kubernetes:** não foi adotado nesta fase, pois adicionaria complexidade operacional desnecessária para executar e avaliar o protótipo. Poderá ser considerado se houver requisitos concretos de implantação distribuída, escalabilidade e disponibilidade.

---

## ADR-005 — Grafana para visualização de observabilidade

- **Status:** Aceita
- **Data:** 2026-10-12

### Contexto

Além de disponibilizar as funcionalidades de negócio, é útil conseguir investigar o comportamento dos serviços, consultar logs e acompanhar métricas do ambiente para facilitar a identificação de problemas.

### Decisão

Utilizar **Grafana** como camada de visualização da stack de observabilidade, com Loki para logs e Prometheus para métricas. Promtail é utilizado para coleta de logs dos containers; Node Exporter e cAdvisor fornecem métricas do host e dos containers, respectivamente, conforme a configuração do ambiente.

### Justificativa

- Centraliza a visualização de informações operacionais em dashboards.
- Permite consultar logs no Loki e métricas no Prometheus a partir de uma interface.
- Facilita a investigação de falhas e a compreensão do comportamento dos serviços.
- Pode ser executado no mesmo ambiente Docker Compose, facilitando a reprodução da configuração.

### Consequências

**Benefícios**
- Visibilidade operacional em um único ponto.
- Apoio ao diagnóstico de erros e à análise de recursos.
- Possibilidade de evoluir dashboards e alertas conforme as necessidades.

**Trade-offs**
- A stack adiciona consumo de recursos e componentes para configurar e manter.
- A utilidade depende da qualidade dos logs, da configuração das fontes de dados e das métricas efetivamente coletadas.
- A existência de dashboards não garante, isoladamente, monitoramento efetivo ou alertas operacionais; esses recursos precisam ser configurados e testados.

### Alternativas consideradas

- **Consultar logs diretamente nos containers:** mais simples, mas menos conveniente quando existem vários serviços.
- **Outra plataforma de observabilidade:** poderia atender aos mesmos objetivos, mas Grafana, Loki e Prometheus foram escolhidos por se integrarem ao ambiente adotado.

---

## Revisão dos registros

Estes ADRs descrevem as decisões arquiteturais e suas justificativas.
