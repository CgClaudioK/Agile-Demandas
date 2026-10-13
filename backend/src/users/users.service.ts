import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/app.module.js';
import type { AuthUser } from '../common/decorators.js';
import type { RoleValue } from './dtos/user.js';

const SELECT = { id: true, name: true, email: true, role: true } as const;

@Injectable()
export class UsersService {
    private logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.user.findMany({ select: SELECT, orderBy: { name: 'asc' } });
    }

    async updateRole(actor: AuthUser, id: number, role: RoleValue) {
        if (actor.id === id) throw new BadRequestException('Voce nao pode alterar o proprio papel.');
        const exists = await this.prisma.user.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Usuario nao encontrado.');
        const updated = await this.prisma.user.update({ where: { id }, data: { role }, select: SELECT });
        this.logger.log(JSON.stringify({ event: 'user.role', targetId: id, role, userId: actor.id }));
        return updated;
    }
}