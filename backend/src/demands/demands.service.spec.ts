import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DemandsService } from './demands.service.js';

const solicitante = { id: 1, email: 'a@a.com', name: 'Ana', role: 'SOLICITANTE' as const };
const analista = { id: 2, email: 'b@b.com', name: 'Bia', role: 'ANALISTA' as const };

function setup(demand: unknown) {
    const prisma = {
        demand: {
            findUnique: vi.fn().mockResolvedValue(demand),
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockImplementation(({ data }) => data),
            update: vi.fn().mockImplementation(({ data }) => data),
            delete: vi.fn(),
        },
        demandEvent: { create: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([]) },
    };
    return { prisma, service: new DemandsService(prisma as never) };
}

describe('DemandsService', () => {
    it('cria demanda com solicitante do usuario logado', async () => {
        const { service } = setup(null);
        const r: any = await service.create(solicitante, { title: 't', description: 'd', area: 'TI', priority: 'ALTA' });
        expect(r.requester).toBe('Ana');
        expect(r.createdById).toBe(1);
    });

    it('solicitante lista apenas as proprias demandas', async () => {
        const { service, prisma } = setup(null);
        await service.findAll(solicitante, {});
        expect(prisma.demand.findMany.mock.calls[0][0].where.createdById).toBe(1);
    });

    it('analista lista todas e aplica filtros e ordenacao', async () => {
        const { service, prisma } = setup(null);
        await service.findAll(analista, { status: 'ABERTA', priority: 'ALTA', search: 'x', order: 'asc' });
        const arg = prisma.demand.findMany.mock.calls[0][0];
        expect(arg.where.createdById).toBeUndefined();
        expect(arg.where.status).toBe('ABERTA');
        expect(arg.orderBy).toEqual({ createdAt: 'asc' });
    });

    it('404 quando a demanda nao existe', async () => {
        const { service } = setup(null);
        await expect(service.findOne(analista, 9)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('403 ao acessar demanda de outro usuario', async () => {
        const { service } = setup({ id: 5, createdById: 99, status: 'ABERTA' });
        await expect(service.findOne(solicitante, 5)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('solicitante nao edita demanda ja em analise', async () => {
        const { service } = setup({ id: 5, createdById: 1, status: 'EM_ANALISE' });
        await expect(service.update(solicitante, 5, { title: 'novo' })).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('update registra evento com as alteracoes reais', async () => {
        const { service, prisma } = setup({ id: 5, createdById: 1, status: 'ABERTA', title: 'antigo', description: 'd', area: 'TI', priority: 'BAIXA' });
        await service.update(solicitante, 5, { title: 'novo', priority: 'ALTA' });
        // solicitante nao altera prioridade, entao apenas titulo deve ser registrado
        expect(prisma.demandEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: 'EDITADA',
                    message: 'Título: "novo"',
                    demandId: 5,
                }),
            }),
        );
    });

    it('update nao registra evento se nada foi alterado', async () => {
        const { service, prisma } = setup({ id: 5, createdById: 1, status: 'ABERTA', title: 'mesmo', description: 'd', area: 'TI', priority: 'BAIXA' });
        await service.update(solicitante, 5, { title: 'mesmo' });
        expect(prisma.demandEvent.create).not.toHaveBeenCalled();
    });

    it('decisao registra comentario e data', async () => {
        const { service } = setup({ id: 5 });
        const r: any = await service.decide(analista, 5, { status: 'APROVADA', comment: 'ok' });
        expect(r.status).toBe('APROVADA');
        expect(r.decisionComment).toBe('ok');
        expect(r.decidedAt).toBeInstanceOf(Date);
    });

    it('comentario registra evento e respeita acesso', async () => {
        const { service, prisma } = setup({ id: 9, createdById: 1, status: 'ABERTA' });
        await service.comment(solicitante, 9, { message: 'oi' });
        expect(prisma.demandEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ type: 'COMENTARIO', message: 'oi', demandId: 9 }) }));
        await expect(service.comment({ ...solicitante, id: 7 }, 9, { message: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
    });
});
