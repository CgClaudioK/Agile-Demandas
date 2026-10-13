import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const ROLES = ['SOLICITANTE', 'ANALISTA'] as const;
export type RoleValue = (typeof ROLES)[number];

export class UpdateRoleDTO {
    @ApiProperty({
        description: 'Papel/perfil atribuído ao usuário no sistema',
        enum: ROLES,
        example: 'ANALISTA',
    })
    @IsIn(ROLES)
    role!: RoleValue;
}