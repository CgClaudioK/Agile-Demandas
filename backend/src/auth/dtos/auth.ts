import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SignInDTO {
    @ApiProperty({
        description: 'E-mail do usuário cadastrado',
        example: 'analista@agile.com',
    })
    @Transform(normalizeEmail)
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Senha de acesso',
        example: 'Analista@123',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class SignUpDTO {
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João da Silva',
        maxLength: 120,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @ApiProperty({
        description: 'E-mail corporativo único',
        example: 'joao.silva@empresa.com',
    })
    @Transform(normalizeEmail)
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Senha de acesso (mínimo 8 e máximo 72 caracteres)',
        example: 'Senha@Forte123',
        minLength: 8,
        maxLength: 72,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}
