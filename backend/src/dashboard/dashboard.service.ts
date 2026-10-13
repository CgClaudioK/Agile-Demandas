import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/app.module.js';
import type { AuthUser } from '../common/decorators.js';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async summary(user: AuthUser) {
        const where = user.role === 'ANALISTA' ? {} : { createdById: user.id };
        const [byStatus, byPriority] = await Promise.all([
            this.prisma.demand.groupBy({ by: ['status'], where, _count: { _all: true } }),
            this.prisma.demand.groupBy({ by: ['priority'], where, _count: { _all: true } }),
        ]);

        const status = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
        const priority = (p: string) => byPriority.find((r) => r.priority === p)?._count._all ?? 0;

        return {
            total: byStatus.reduce((acc, r) => acc + r._count._all, 0),
            abertas: status('ABERTA'),
            emAnalise: status('EM_ANALISE'),
            aprovadas: status('APROVADA'),
            rejeitadas: status('REJEITADA'),
            porPrioridade: { baixa: priority('BAIXA'), media: priority('MEDIA'), alta: priority('ALTA') },
        };
    }
}