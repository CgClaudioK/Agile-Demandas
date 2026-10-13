import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export const PRIORITIES = ['BAIXA', 'MEDIA', 'ALTA'] as const;
export const STATUSES = ['ABERTA', 'EM_ANALISE', 'APROVADA', 'REJEITADA'] as const;
export type PriorityValue = (typeof PRIORITIES)[number];
export type StatusValue = (typeof STATUSES)[number];

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateDemandDTO {
    @ApiProperty({
        description: 'Título sucinto da solicitação/demanda',
        example: 'Automatização do relatório de fechamento mensal',
        minLength: 3,
        maxLength: 150,
    })
    @Transform(trim) @IsString() @MinLength(3) @MaxLength(150)
    title!: string;

    @ApiProperty({
        description: 'Descrição detalhada com contexto e objetivo da demanda',
        example: 'Desenvolvimento de rotina para consolidação automática de planilhas financeiras, visando reduzir o tempo operacional de fechamento da equipe.',
        minLength: 3,
        maxLength: 2000,
    })
    @Transform(trim) @IsString() @MinLength(3) @MaxLength(2000)
    description!: string;

    @ApiProperty({
        description: 'Área ou departamento solicitante',
        example: 'Controladoria',
        minLength: 2,
        maxLength: 100,
    })
    @Transform(trim) @IsString() @MinLength(2) @MaxLength(100)
    area!: string;

    @ApiProperty({
        description: 'Nível de prioridade da demanda',
        enum: PRIORITIES,
        example: 'ALTA',
    })
    @IsEnum(PRIORITIES)
    priority!: PriorityValue;
}

export class UpdateDemandDTO {
    @ApiPropertyOptional({
        description: 'Novo título da solicitação',
        example: 'Automatização do relatório de fechamento mensal - v2',
        minLength: 3,
        maxLength: 150,
    })
    @IsOptional() @Transform(trim) @IsString() @MinLength(3) @MaxLength(150)
    title?: string;

    @ApiPropertyOptional({
        description: 'Nova descrição detalhada da demanda',
        example: 'Atualização do escopo incluindo a integração com a nova API do ERP.',
        minLength: 3,
        maxLength: 2000,
    })
    @IsOptional() @Transform(trim) @IsString() @MinLength(3) @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({
        description: 'Nova área solicitante',
        example: 'Financeiro',
        minLength: 2,
        maxLength: 100,
    })
    @IsOptional() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100)
    area?: string;

    @ApiPropertyOptional({
        description: 'Nova prioridade da demanda',
        enum: PRIORITIES,
        example: 'MEDIA',
    })
    @IsOptional() @IsEnum(PRIORITIES)
    priority?: PriorityValue;
}

export class DecisionDTO {
    @ApiProperty({
        description: 'Status da decisão tomada pelo analista',
        enum: ['EM_ANALISE', 'APROVADA', 'REJEITADA'],
        example: 'APROVADA',
    })
    @IsIn(['EM_ANALISE', 'APROVADA', 'REJEITADA'])
    status!: 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';

    @ApiPropertyOptional({
        description: 'Justificativa da decisão (obrigatório para APROVADA ou REJEITADA)',
        example: 'Demanda alinhada com as metas do trimestre e aprovada pelo comitê de tecnologia.',
        minLength: 3,
        maxLength: 1000,
    })
    @ValidateIf((o: DecisionDTO) => o.status !== 'EM_ANALISE' || o.comment !== undefined)
    @Transform(trim) @IsString() @MinLength(3) @MaxLength(1000)
    comment?: string;
}

export class CommentDTO {
    @ApiProperty({
        description: 'Texto do comentário ou atualização da demanda',
        example: 'Reunião de alinhamento técnico agendada com a equipe solicitante.',
        minLength: 1,
        maxLength: 1000,
    })
    @Transform(trim) @IsString() @MinLength(1) @MaxLength(1000)
    message!: string;
}

export class QueryDemandsDTO {
    @ApiPropertyOptional({
        description: 'Termo para busca textual (título, descrição, solicitante ou área)',
        example: 'relatório',
        maxLength: 100,
    })
    @IsOptional() @Transform(trim) @IsString() @MaxLength(100)
    search?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por status da demanda',
        enum: STATUSES,
        example: 'ABERTA',
    })
    @IsOptional() @IsEnum(STATUSES)
    status?: StatusValue;

    @ApiPropertyOptional({
        description: 'Filtrar por prioridade da demanda',
        enum: PRIORITIES,
        example: 'ALTA',
    })
    @IsOptional() @IsEnum(PRIORITIES)
    priority?: PriorityValue;

    @ApiPropertyOptional({
        description: 'Ordenação cronológica de criação',
        enum: ['asc', 'desc'],
        example: 'desc',
    })
    @IsOptional() @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc';
}

export class IdParamDTO {
    @ApiProperty({
        description: 'Identificador numérico',
        example: 1,
    })
    @Type(() => Number) @IsInt()
    id!: number;
}