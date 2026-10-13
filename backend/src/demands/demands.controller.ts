import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DemandsService } from './demands.service.js';
import { CommentDTO, CreateDemandDTO, DecisionDTO, QueryDemandsDTO, UpdateDemandDTO } from './dtos/demand.js';
import { CurrentUser, Roles, type AuthUser } from '../common/decorators.js';

@ApiTags('Demandas')
@ApiBearerAuth()
@Controller('demands')
export class DemandsController {
    constructor(private demandsService: DemandsService) {}

    @ApiOperation({ summary: 'Criar nova solicitação/demanda' })
    @ApiBody({
        type: CreateDemandDTO,
        examples: {
            padrao: {
                summary: 'Exemplo de criação de demanda',
                value: {
                    title: 'Automatização do relatório da Régua de Cobrança',
                    description: 'Desenvolvimento de rotina para consolidação automática da Régua de Cobrança.',
                    area: 'Recuperação de Crédito',
                    priority: 'ALTA',
                },
            },
        },
    })
    @Post()
    create(@CurrentUser() user: AuthUser, @Body() body: CreateDemandDTO) {
        return this.demandsService.create(user, body);
    }

    @ApiOperation({ summary: 'Listar demandas (com busca, filtros de status/prioridade e ordenação)' })
    @Get()
    findAll(@CurrentUser() user: AuthUser, @Query() query: QueryDemandsDTO) {
        return this.demandsService.findAll(user, query);
    }

    @ApiOperation({ summary: 'Obter detalhes de uma demanda específica' })
    @Get(':id')
    findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
        return this.demandsService.findOne(user, id);
    }

    @ApiOperation({ summary: 'Editar demanda (solicitante só edita se ABERTA; analista edita tudo)' })
    @ApiBody({
        type: UpdateDemandDTO,
        examples: {
            padrao: {
                summary: 'Exemplo de atualização de demanda',
                value: {
                    title: 'Automatização do relatório da Régua de Cobrança - v2',
                    description: 'Atualização do escopo incluindo a integração com o GRRC',
                    area: 'Recuperação de Crédito',
                    priority: 'MEDIA',
                },
            },
        },
    })
    @Patch(':id')
    update(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateDemandDTO) {
        return this.demandsService.update(user, id, body);
    }

    @Roles('ANALISTA')
    @ApiOperation({ summary: 'Tomar decisão sobre a demanda (Aprovar/Rejeitar/Em Análise - apenas ANALISTA)' })
    @ApiBody({
        type: DecisionDTO,
        examples: {
            aprovada: {
                summary: 'Exemplo de aprovação com justificativa',
                value: {
                    status: 'APROVADA',
                    comment: 'Demanda alinhada com o planejamento do ano e aprovada pelo comitê.',
                },
            },
            rejeitada: {
                summary: 'Exemplo de rejeição com justificativa',
                value: {
                    status: 'REJEITADA',
                    comment: 'Escopo fora das prioridades do período atual.',
                },
            },
            emAnalise: {
                summary: 'Exemplo de envio para análise',
                value: {
                    status: 'EM_ANALISE',
                    comment: 'Iniciando levantamento técnico de viabilidade e arquitetura.',
                },
            },
        },
    })
    @Patch(':id/decision')
    decide(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() body: DecisionDTO) {
        return this.demandsService.decide(user, id, body);
    }

    @ApiOperation({ summary: 'Consultar histórico de eventos e linha do tempo da demanda' })
    @Get(':id/history')
    history(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
        return this.demandsService.history(user, id);
    }

    @ApiOperation({ summary: 'Adicionar comentário na demanda' })
    @ApiBody({
        type: CommentDTO,
        examples: {
            padrao: {
                summary: 'Exemplo de comentário',
                value: {
                    message: 'Reunião de alinhamento técnico agendada com a equipe solicitante.',
                },
            },
        },
    })
    @Post(':id/comments')
    comment(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() body: CommentDTO) {
        return this.demandsService.comment(user, id, body);
    }

    @ApiOperation({ summary: 'Excluir demanda (solicitante só exclui se ABERTA e de sua autoria)' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
        return this.demandsService.remove(user, id);
    }
}