import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/app.module.js';
import type { AuthUser } from '../common/decorators.js';
import { type CommentDTO, type CreateDemandDTO, type DecisionDTO, type QueryDemandsDTO, type UpdateDemandDTO } from './dtos/demand.js';

const PRIORITY_LABEL: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
};

function describeChanges(oldDemand: { title: string; description: string; area: string; priority: string }, data: UpdateDemandDTO): string | null {
    const changes: string[] = [];

    if (data.title !== undefined && data.title !== oldDemand.title) {
        changes.push(`Título: "${data.title}"`);
    }
    if (data.description !== undefined && data.description !== oldDemand.description) {
        changes.push('Descrição atualizada');
    }
    if (data.area !== undefined && data.area !== oldDemand.area) {
        changes.push(`Área: "${oldDemand.area}" → "${data.area}"`);
    }
    if (data.priority !== undefined && data.priority !== oldDemand.priority) {
        const oldP = PRIORITY_LABEL[oldDemand.priority] ?? oldDemand.priority;
        const newP = PRIORITY_LABEL[data.priority] ?? data.priority;
        changes.push(`Prioridade: ${oldP} → ${newP}`);
    }

    return changes.length > 0 ? changes.join('\n') : null;
}

@Injectable()
export class DemandsService {
    private readonly logger = new Logger(DemandsService.name);

    constructor(private prisma: PrismaService) {}

    private async record(demandId: number, user: AuthUser, type: 'CRIADA' | 'EDITADA' | 'STATUS' | 'COMENTARIO', message?: string | null, toStatus?: 'ABERTA' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA') {
        await this.prisma.demandEvent.create({
            data: { demandId, type, authorId: user.id, authorName: user.name ?? user.email, message: message ?? null, toStatus: toStatus ?? null },
        });
        this.logger.log(JSON.stringify({ event: 'demand.' + type.toLowerCase(), demandId, userId: user.id, toStatus }));
    }

    async create(user: AuthUser, data: CreateDemandDTO) {
        const demand = await this.prisma.demand.create({
            data: { ...data, requester: user.name ?? user.email, createdById: user.id },
        });
        await this.record(demand.id, user, 'CRIADA', null, demand.status);
        return demand;
    }

    findAll(user: AuthUser, query: QueryDemandsDTO) {
        const where: Record<string, unknown> = {};
        if (user.role !== 'ANALISTA') where.createdById = user.id;
        if (query.status) where.status = query.status;
        if (query.priority) where.priority = query.priority;
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { requester: { contains: query.search, mode: 'insensitive' } },
                { area: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.demand.findMany({ where, orderBy: { createdAt: query.order ?? 'desc' } });
    }

    async findOne(user: AuthUser, id: number) {
        const demand = await this.prisma.demand.findUnique({ where: { id } });
        if (!demand) throw new NotFoundException('Demand not found');
        if (user.role !== 'ANALISTA' && demand.createdById !== user.id) {
            throw new ForbiddenException('You cannot access this demand');
        }
        return demand;
    }

    async update(user: AuthUser, id: number, data: UpdateDemandDTO) {
        const demand = await this.findOne(user, id);
        if (user.role !== 'ANALISTA') {
            if (demand.status !== 'ABERTA') throw new ForbiddenException('Only open demands can be edited');
            delete data.priority;
        }

        const changes = describeChanges(demand, data);
        const updated = await this.prisma.demand.update({ where: { id }, data });

        if (changes) {
            await this.record(id, user, 'EDITADA', changes);
        }

        return updated;
    }

    async remove(user: AuthUser, id: number) {
        const demand = await this.findOne(user, id);
        if (user.role !== 'ANALISTA' && demand.status !== 'ABERTA') {
            throw new ForbiddenException('Only open demands can be deleted');
        }
        await this.prisma.demand.delete({ where: { id } });
    }

    async decide(user: AuthUser, id: number, data: DecisionDTO) {
        const exists = await this.prisma.demand.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Demand not found');
        const closing = data.status !== 'EM_ANALISE';
        const updated = await this.prisma.demand.update({
            where: { id },
            data: {
                status: data.status,
                decisionComment: data.comment ?? null,
                decidedAt: closing ? new Date() : null,
            },
        });
        await this.record(id, user, 'STATUS', data.comment, data.status);
        return updated;
    }

    async history(user: AuthUser, id: number) {
        await this.findOne(user, id);
        return this.prisma.demandEvent.findMany({ where: { demandId: id }, orderBy: { createdAt: 'asc' } });
    }

    async comment(user: AuthUser, id: number, data: CommentDTO) {
        await this.findOne(user, id);
        await this.record(id, user, 'COMENTARIO', data.message);
        return this.history(user, id);
    }
}