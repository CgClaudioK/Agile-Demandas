import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateRoleDTO } from './dtos/user.js';
import { CurrentUser, Roles, type AuthUser } from '../common/decorators.js';

@ApiTags('Usuários (Admin)')
@ApiBearerAuth()
@Roles('ANALISTA')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({ summary: 'Listar todos os usuários (apenas ANALISTA)' })
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @ApiOperation({ summary: 'Alterar papel/permissão de um usuário (apenas ANALISTA)' })
    @ApiBody({
        type: UpdateRoleDTO,
        examples: {
            analista: {
                summary: 'Promover para Analista',
                value: {
                    role: 'ANALISTA',
                },
            },
            solicitante: {
                summary: 'Rebaixar para Solicitante',
                value: {
                    role: 'SOLICITANTE',
                },
            },
        },
    })
    @Patch(':id/role')
    updateRole(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateRoleDTO) {
        return this.usersService.updateRole(user, id, body.role);
    }
}